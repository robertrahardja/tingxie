class TingxieApp {
    constructor() {
        this.data = null;
        this.currentWordIndex = 0;
        this.currentSetIndex = 0;
        this.showImportantOnly = false;
        this.currentWords = [];
        this.revealedItems = new Set();
        this.lastScrollY = 0;
        
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.updateWordsList();
        this.displayCurrentWord();
        this.updateProgress();
    }

    async loadData() {
        try {
            const response = await fetch('data/tingxie/tingxie_vocabulary.json');
            this.data = await response.json();
        } catch (error) {
            console.error('Error loading data:', error);
            alert('无法加载词汇数据，请刷新页面重试');
        }
    }

    setupEventListeners() {
        // Menu toggle
        document.getElementById('menu-toggle').addEventListener('click', () => {
            this.toggleMenu();
        });

        // Close menu when clicking nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                this.closeMenu();
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            const navMenu = document.getElementById('nav-menu');
            const menuToggle = document.getElementById('menu-toggle');
            
            if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                this.closeMenu();
            }
        });

        // Filter toggle
        document.getElementById('filter-toggle').addEventListener('click', () => {
            this.toggleFilter();
        });

        // Navigation buttons
        document.getElementById('prev-btn').addEventListener('click', () => {
            this.previousWord();
        });

        document.getElementById('next-btn').addEventListener('click', () => {
            this.nextWord();
        });

        // Word item clicks
        document.getElementById('simplified').addEventListener('click', () => {
            this.revealItem('simplified');
        });

        document.getElementById('traditional').addEventListener('click', () => {
            this.revealItem('traditional');
        });

        document.getElementById('pinyin').addEventListener('click', () => {
            this.revealItem('pinyin');
        });

        document.getElementById('english').addEventListener('click', () => {
            this.revealItem('english');
        });

        document.getElementById('audio').addEventListener('click', () => {
            this.revealItem('audio');
        });

        // Next set button
        document.getElementById('next-set-btn').addEventListener('click', () => {
            this.nextSet();
        });

        // Touch event optimization for mobile
        this.addTouchEventListeners();
        
        // Scroll event for hiding menu
        this.setupScrollListener();
    }

    addTouchEventListeners() {
        const touchElements = [
            'simplified', 'traditional', 'pinyin', 'english', 'audio',
            'prev-btn', 'next-btn', 'filter-toggle', 'next-set-btn'
        ];

        touchElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('touchstart', (e) => {
                    // Add visual feedback for touch
                    element.style.opacity = '0.8';
                }, { passive: true });

                element.addEventListener('touchend', (e) => {
                    // Restore visual state
                    setTimeout(() => {
                        element.style.opacity = '';
                    }, 100);
                }, { passive: true });
            }
        });
    }

    updateWordsList() {
        this.currentWords = [];
        
        if (!this.data || !this.data.vocabulary) return;

        this.data.vocabulary.forEach((row, rowIndex) => {
            row.words.forEach((word, wordIndex) => {
                if (!this.showImportantOnly || word.important) {
                    this.currentWords.push({
                        ...word,
                        rowIndex,
                        wordIndex,
                        setNumber: this.currentWords.length + 1
                    });
                }
            });
        });
    }

    toggleFilter() {
        this.showImportantOnly = !this.showImportantOnly;
        const filterBtn = document.getElementById('filter-toggle');
        
        if (this.showImportantOnly) {
            filterBtn.textContent = '重要词语';
            filterBtn.classList.add('active');
        } else {
            filterBtn.textContent = '全部词语';
            filterBtn.classList.remove('active');
        }

        // Reset to first word and update list
        this.currentWordIndex = 0;
        this.currentSetIndex = 0;
        this.updateWordsList();
        this.displayCurrentWord();
        this.updateProgress();
        this.resetRevealedItems();
    }

    displayCurrentWord() {
        if (this.currentWords.length === 0) return;

        const word = this.currentWords[this.currentWordIndex];
        
        // Update word content
        document.querySelector('#simplified .content').textContent = word.simplified;
        document.querySelector('#traditional .content').textContent = word.traditional;
        document.querySelector('#pinyin .content').textContent = word.pinyin;
        document.querySelector('#english .content').textContent = word.english || 'English';

        // Reset all items to covered state
        this.resetItemStates();
        this.updateNavigationButtons();
    }

    resetItemStates() {
        const items = ['simplified', 'traditional', 'pinyin', 'english'];
        items.forEach(type => {
            const content = document.querySelector(`#${type} .content`);
            content.classList.add('covered');
            if (type === 'simplified') {
                content.textContent = '简单';
            } else if (type === 'traditional') {
                content.textContent = '繁体';
            } else if (type === 'pinyin') {
                content.textContent = '拼音';
            } else if (type === 'english') {
                content.textContent = 'English';
            }
        });

        const audioBtn = document.querySelector('#audio .audio-btn');
        audioBtn.classList.add('covered');

        // Clear revealed items for current word
        this.revealedItems.clear();
    }

    revealItem(type) {
        if (this.currentWords.length === 0) return;

        const word = this.currentWords[this.currentWordIndex];
        
        if (type === 'audio') {
            this.playAudio(word.audio);
            const audioBtn = document.querySelector('#audio .audio-btn');
            if (audioBtn.classList.contains('covered')) {
                audioBtn.classList.remove('covered');
                this.revealedItems.add(type);
            } else {
                audioBtn.classList.add('covered');
                this.revealedItems.delete(type);
            }
        } else {
            const content = document.querySelector(`#${type} .content`);
            if (content.classList.contains('covered')) {
                content.classList.remove('covered');
                content.textContent = word[type];
                this.revealedItems.add(type);
            } else {
                content.classList.add('covered');
                if (type === 'simplified') {
                    content.textContent = '简单';
                } else if (type === 'traditional') {
                    content.textContent = '繁体';
                } else if (type === 'pinyin') {
                    content.textContent = '拼音';
                } else if (type === 'english') {
                    content.textContent = 'English';
                }
                this.revealedItems.delete(type);
            }
        }

        this.checkSetComplete();
    }

    async playAudio(audioPath) {
        try {
            const audio = new Audio(audioPath);
            await audio.play();
        } catch (error) {
            console.warn('Audio playback failed:', error);
            // Fallback: show visual feedback even if audio fails
        }
    }

    checkSetComplete() {
        const requiredItems = ['simplified', 'traditional', 'pinyin', 'english', 'audio'];
        const allRevealed = requiredItems.every(item => this.revealedItems.has(item));
        
        if (allRevealed) {
            // Show completion message after a short delay
            setTimeout(() => {
                this.showSetComplete();
            }, 500);
        }
    }

    showSetComplete() {
        document.getElementById('set-complete').style.display = 'flex';
    }

    hideSetComplete() {
        document.getElementById('set-complete').style.display = 'none';
    }

    nextSet() {
        this.hideSetComplete();
        this.nextWord();
    }

    nextWord() {
        if (this.currentWordIndex < this.currentWords.length - 1) {
            this.currentWordIndex++;
            this.currentSetIndex++;
        } else {
            // Loop back to first word
            this.currentWordIndex = 0;
            this.currentSetIndex = 0;
        }
        
        this.displayCurrentWord();
        this.updateProgress();
    }

    previousWord() {
        if (this.currentWordIndex > 0) {
            this.currentWordIndex--;
            this.currentSetIndex--;
        } else {
            // Loop to last word
            this.currentWordIndex = this.currentWords.length - 1;
            this.currentSetIndex = this.currentWords.length - 1;
        }
        
        this.displayCurrentWord();
        this.updateProgress();
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        // Always enable navigation for looping
        prevBtn.disabled = false;
        nextBtn.disabled = false;
    }

    updateProgress() {
        document.getElementById('current-set').textContent = this.currentSetIndex + 1;
        document.getElementById('total-sets').textContent = this.currentWords.length;
    }

    resetRevealedItems() {
        this.revealedItems.clear();
    }

    toggleMenu() {
        const menuToggle = document.getElementById('menu-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    }

    closeMenu() {
        const menuToggle = document.getElementById('menu-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
    }

    setupScrollListener() {
        let ticking = false;
        
        const updateNavbar = () => {
            const currentScrollY = window.scrollY;
            const navbar = document.querySelector('.main-nav');
            
            // Only hide on mobile devices (screen width < 768px)
            if (window.innerWidth < 768) {
                if (currentScrollY > this.lastScrollY && currentScrollY > 60) {
                    // Scrolling down & past threshold
                    navbar.classList.add('hide-on-scroll');
                } else {
                    // Scrolling up or at top
                    navbar.classList.remove('hide-on-scroll');
                }
            } else {
                // Always show on desktop/tablet
                navbar.classList.remove('hide-on-scroll');
            }
            
            this.lastScrollY = currentScrollY;
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateNavbar);
                ticking = true;
            }
        });

        // Also handle window resize
        window.addEventListener('resize', () => {
            const navbar = document.querySelector('.main-nav');
            if (window.innerWidth >= 768) {
                navbar.classList.remove('hide-on-scroll');
            }
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TingxieApp();
});

// Add viewport height fix for mobile browsers
function setVH() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setVH();
window.addEventListener('resize', setVH);
window.addEventListener('orientationchange', setVH);