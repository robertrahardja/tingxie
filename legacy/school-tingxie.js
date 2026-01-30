const SCHOOL_DATA_PATH = 'data/tingxie/school_vocabulary.json';

class SchoolTingxieApp {
    constructor() {
        this.currentSetIndex = 0;
        this.currentItemIndex = 0;
        this.sets = [];
        this.currentItems = [];
        this.isRevealed = false;
        this.audio = new Audio();
        this.currentPopupWord = null;
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

        // Word popup handlers
        const popupOverlay = document.getElementById('popup-overlay');
        const popupClose = document.getElementById('popup-close');
        const popupAudioBtn = document.getElementById('popup-audio-btn');

        if (popupOverlay) {
            popupOverlay.addEventListener('click', () => this.closeWordPopup());
        }
        if (popupClose) {
            popupClose.addEventListener('click', () => this.closeWordPopup());
        }
        if (popupAudioBtn) {
            popupAudioBtn.addEventListener('click', () => this.playPopupAudio());
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

            // Render word chips in answer section
            this.renderWordChips(item);
        }

        // Update keyword section (hidden by default)
        const answerSection = document.getElementById('answer-section');
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
        }

        // Hide answer section by default
        if (answerSection) {
            answerSection.style.display = 'none';
        }

        // Reset reveal button
        if (revealBtn) {
            revealBtn.textContent = '显示答案';
            revealBtn.classList.remove('revealed');
        }

        // Update progress
        this.updateProgress();
    }

    toggleReveal() {
        this.isRevealed = !this.isRevealed;

        const contentEl = document.getElementById('sentence-content');
        const answerSection = document.getElementById('answer-section');
        const revealBtn = document.getElementById('reveal-btn');

        if (contentEl) {
            contentEl.classList.toggle('covered', !this.isRevealed);
        }

        if (answerSection) {
            answerSection.style.display = this.isRevealed ? 'block' : 'none';
        }

        if (revealBtn) {
            revealBtn.textContent = this.isRevealed ? '隐藏答案' : '显示答案';
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

    renderWordChips(item) {
        const answerSection = document.getElementById('answer-section');
        if (!answerSection || !item.words || item.words.length === 0) return;

        // Check if words section already exists
        let wordsSection = answerSection.querySelector('.words-section');
        if (!wordsSection) {
            wordsSection = document.createElement('div');
            wordsSection.className = 'words-section';
            answerSection.appendChild(wordsSection);
        }

        wordsSection.innerHTML = `
            <div class="words-label">点击词语查看详情</div>
            <div class="words-list" id="words-list"></div>
        `;

        const wordsList = wordsSection.querySelector('#words-list');
        item.words.forEach(word => {
            const chip = document.createElement('span');
            chip.className = 'word-chip';
            chip.textContent = word.traditional;
            chip.addEventListener('click', () => this.showWordPopup(word));
            wordsList.appendChild(chip);
        });
    }

    showWordPopup(word) {
        this.currentPopupWord = word;

        const popup = document.getElementById('word-popup');
        const overlay = document.getElementById('popup-overlay');
        const traditionalEl = document.getElementById('popup-traditional');
        const simplifiedEl = document.getElementById('popup-simplified');
        const pinyinEl = document.getElementById('popup-pinyin');
        const meaningEl = document.getElementById('popup-meaning');

        if (traditionalEl) traditionalEl.textContent = word.traditional;
        if (simplifiedEl) {
            // Only show simplified if different from traditional
            if (word.simplified !== word.traditional) {
                simplifiedEl.textContent = `(${word.simplified})`;
                simplifiedEl.style.display = 'block';
            } else {
                simplifiedEl.style.display = 'none';
            }
        }
        if (pinyinEl) pinyinEl.textContent = word.pinyin;
        if (meaningEl) meaningEl.textContent = word.meaning;

        if (popup) popup.classList.add('show');
        if (overlay) overlay.classList.add('show');
    }

    closeWordPopup() {
        const popup = document.getElementById('word-popup');
        const overlay = document.getElementById('popup-overlay');

        if (popup) popup.classList.remove('show');
        if (overlay) overlay.classList.remove('show');
        this.currentPopupWord = null;
    }

    playPopupAudio() {
        if (this.currentPopupWord) {
            const utterance = new SpeechSynthesisUtterance(this.currentPopupWord.simplified);
            utterance.lang = 'zh-CN';
            utterance.rate = 0.7;
            speechSynthesis.speak(utterance);
        }
    }
}

// Initialize the app
const app = new SchoolTingxieApp();
app.init();
