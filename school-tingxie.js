const SCHOOL_DATA_PATH = 'data/tingxie/school_vocabulary.json';

class SchoolTingxieApp {
    constructor() {
        this.currentSetIndex = 0;
        this.currentItemIndex = 0;
        this.sets = [];
        this.currentItems = [];
        this.isRevealed = false;
        this.audio = new Audio();
    }

    async init() {
        console.log('Initializing SchoolTingxieApp...');

        // Load vocabulary data
        try {
            const response = await fetch(SCHOOL_DATA_PATH);
            if (!response.ok) throw new Error('Failed to load data');
            this.data = await response.json();
        } catch (error) {
            console.error('Failed to load school vocabulary data:', error);
            return;
        }

        // Extract sets
        this.sets = this.data.vocabulary || [];
        if (this.sets.length === 0) {
            console.error('No vocabulary sets found');
            return;
        }

        // Set up UI
        this.setupUI();
        this.renderSetSelector();
        this.selectSet(0);

        console.log('SchoolTingxieApp initialized successfully');
    }

    setupUI() {
        // Menu toggle
        const menuToggle = document.getElementById('menu-toggle');
        const navMenu = document.getElementById('nav-menu');
        if (menuToggle && navMenu) {
            menuToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
            document.addEventListener('click', (e) => {
                if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                    navMenu.classList.remove('active');
                }
            });
        }

        // Navigation buttons
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevItem());
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextItem());
        }

        // Audio button
        const audioBtn = document.getElementById('audio-btn');
        if (audioBtn) {
            audioBtn.addEventListener('click', () => this.playAudio());
        }

        // Reveal button
        const revealBtn = document.getElementById('reveal-btn');
        if (revealBtn) {
            revealBtn.addEventListener('click', () => this.toggleReveal());
        }
    }

    renderSetSelector() {
        const selector = document.getElementById('set-selector');
        if (!selector) return;

        selector.innerHTML = '';

        this.sets.forEach((set, index) => {
            const btn = document.createElement('button');
            btn.className = 'set-btn';
            btn.dataset.index = index;
            btn.textContent = this.numberToChinese(index + 1);
            btn.addEventListener('click', () => this.selectSet(index));
            selector.appendChild(btn);
        });
    }

    numberToChinese(num) {
        const chinese = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
        return chinese[num - 1] || num;
    }

    selectSet(index) {
        this.currentSetIndex = index;
        this.currentItemIndex = 0;
        this.currentItems = this.sets[index]?.items || [];
        this.isRevealed = false;

        // Update set selector buttons
        const buttons = document.querySelectorAll('.set-btn');
        buttons.forEach((btn, i) => {
            btn.classList.toggle('active', i === index);
        });

        // Update title
        const titleElement = document.getElementById('set-title');
        if (titleElement && this.sets[index]) {
            titleElement.textContent = this.sets[index].title || `听写（${this.numberToChinese(index + 1)}）`;
        }

        // Show first item
        this.showItem();
    }

    showItem() {
        if (this.currentItems.length === 0) {
            console.log('No items to display');
            return;
        }

        const item = this.currentItems[this.currentItemIndex];
        this.isRevealed = false;

        // Update item number with badges
        const itemNumberEl = document.getElementById('item-number');
        if (itemNumberEl) {
            let badges = '';
            if (item.type === 'pinyin') {
                badges = '<span class="item-type-badge pinyin-type">拼音</span>';
            } else if (item.type === 'moxie') {
                badges = '<span class="item-type-badge moxie-type">默写</span>';
            }
            if (item.difficult) {
                badges += '<span class="item-type-badge difficult">*难</span>';
            }
            itemNumberEl.innerHTML = `第 ${this.currentItemIndex + 1} 题 ${badges}`;
        }

        // Update content based on type
        const contentEl = document.getElementById('sentence-content');
        const keywordSection = document.getElementById('keyword-section');
        const keywordText = document.getElementById('keyword-text');
        const englishEl = document.getElementById('english-translation');
        const revealBtn = document.getElementById('reveal-btn');

        if (contentEl) {
            contentEl.classList.add('covered');

            if (item.type === 'pinyin') {
                // For pinyin items, show pinyin first, characters are the answer
                contentEl.innerHTML = `
                    <div class="pinyin-display">${item.pinyin}</div>
                    <div class="characters-answer">${item.characters}</div>
                `;
            } else if (item.type === 'moxie') {
                // For moxie items, show the label and sentence
                contentEl.innerHTML = `
                    <div class="moxie-label">${item.label}</div>
                    <div>${item.sentence}</div>
                    ${item.note ? `<div class="moxie-note">${item.note}</div>` : ''}
                `;
            } else {
                // Regular sentence
                contentEl.textContent = item.sentence;
            }
        }

        // Update keyword section
        if (keywordSection && keywordText) {
            if (item.keyword) {
                keywordSection.style.display = 'block';
                const keywordLabel = keywordSection.querySelector('.keyword-label');
                if (keywordLabel) {
                    keywordLabel.textContent = `重点词语: ${item.pinyin}`;
                }
                keywordText.textContent = item.keyword;
            } else if (item.type === 'pinyin') {
                keywordSection.style.display = 'block';
                const keywordLabel = keywordSection.querySelector('.keyword-label');
                if (keywordLabel) {
                    keywordLabel.textContent = '答案';
                }
                keywordText.textContent = item.characters;
            } else {
                keywordSection.style.display = 'none';
            }
        }

        // Update English translation
        if (englishEl) {
            englishEl.textContent = item.english || '';
            englishEl.classList.add('covered');
        }

        // Reset reveal button
        if (revealBtn) {
            revealBtn.textContent = '点击显示答案';
            revealBtn.classList.remove('revealed');
        }

        // Update progress
        this.updateProgress();
    }

    toggleReveal() {
        this.isRevealed = !this.isRevealed;

        const contentEl = document.getElementById('sentence-content');
        const englishEl = document.getElementById('english-translation');
        const revealBtn = document.getElementById('reveal-btn');

        if (contentEl) {
            contentEl.classList.toggle('covered', !this.isRevealed);
        }

        if (englishEl) {
            englishEl.classList.toggle('covered', !this.isRevealed);
        }

        if (revealBtn) {
            revealBtn.textContent = this.isRevealed ? '隐藏答案' : '点击显示答案';
            revealBtn.classList.toggle('revealed', this.isRevealed);
        }
    }

    async playAudio() {
        const item = this.currentItems[this.currentItemIndex];
        if (!item || !item.audio) {
            console.log('No audio available for this item');
            return;
        }

        try {
            this.audio.src = item.audio;
            await this.audio.play();
        } catch (error) {
            console.error('Error playing audio:', error);
        }
    }

    prevItem() {
        if (this.currentItemIndex > 0) {
            this.currentItemIndex--;
            this.showItem();
        }
    }

    nextItem() {
        if (this.currentItemIndex < this.currentItems.length - 1) {
            this.currentItemIndex++;
            this.showItem();
        }
    }

    updateProgress() {
        const progressEl = document.getElementById('progress-indicator');
        if (progressEl) {
            progressEl.textContent = `${this.currentItemIndex + 1} / ${this.currentItems.length}`;
        }

        // Update button states
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        if (prevBtn) prevBtn.disabled = this.currentItemIndex === 0;
        if (nextBtn) nextBtn.disabled = this.currentItemIndex === this.currentItems.length - 1;
    }
}

// Initialize the app
const app = new SchoolTingxieApp();
app.init();
