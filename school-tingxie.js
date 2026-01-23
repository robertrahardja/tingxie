import { BaseApp } from './js/BaseApp.js';
import { CSS_CLASSES, ELEMENT_IDS } from './js/constants.js';
import { getAudioPlayer } from './js/AudioPlayer.js';
import HanziWriter from 'https://cdn.jsdelivr.net/npm/hanzi-writer@3.7.3/+esm';

const SCHOOL_DATA_PATH = 'data/tingxie/school_vocabulary.json';

class SchoolTingxieApp extends BaseApp {
    constructor() {
        super();
        this.currentSetIndex = 0;
        this.currentWordIndex = 0;
        this.sets = [];
        this.currentWords = [];
        this.knownWords = new Set();
        this.unknownWords = new Set();
        this.hanziWriter = null;
        this.currentStroke = 0;
        this.handwritingVisible = false;
        this.currentCharacterIndex = 0;
        this.currentCharacters = '';
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

        // Load progress from localStorage
        this.loadProgress();

        // Set up UI
        this.setupUI();
        this.renderSetSelector();
        this.selectSet(0);

        console.log('SchoolTingxieApp initialized successfully');
    }

    loadProgress() {
        try {
            const saved = localStorage.getItem('school_tingxie_progress');
            if (saved) {
                const data = JSON.parse(saved);
                this.knownWords = new Set(data.knownWords || []);
                this.unknownWords = new Set(data.unknownWords || []);
            }
        } catch (error) {
            console.log('Could not load progress:', error);
        }
    }

    saveProgress() {
        try {
            const data = {
                knownWords: Array.from(this.knownWords),
                unknownWords: Array.from(this.unknownWords),
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('school_tingxie_progress', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    }

    setupUI() {
        // Menu toggle
        const menuToggle = document.getElementById(ELEMENT_IDS.MENU_TOGGLE);
        const navMenu = document.getElementById(ELEMENT_IDS.NAV_MENU);
        if (menuToggle && navMenu) {
            menuToggle.addEventListener('click', () => {
                navMenu.classList.toggle(CSS_CLASSES.ACTIVE);
            });
            document.addEventListener('click', (e) => {
                if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                    navMenu.classList.remove(CSS_CLASSES.ACTIVE);
                }
            });
        }

        // Navigation buttons
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevWord());
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextWord());
        }

        // Self-assessment buttons
        const knowBtn = document.getElementById('know-btn');
        const dontKnowBtn = document.getElementById('dont-know-btn');
        if (knowBtn) {
            knowBtn.addEventListener('click', () => this.markAsKnown());
        }
        if (dontKnowBtn) {
            dontKnowBtn.addEventListener('click', () => this.markAsUnknown());
        }

        // Handwriting practice button
        const handwritingBtn = document.getElementById(ELEMENT_IDS.HANDWRITING_BTN);
        if (handwritingBtn) {
            handwritingBtn.addEventListener('click', () => this.toggleHandwritingPractice());
        }

        // Close handwriting button
        const closeHandwriting = document.getElementById('close-handwriting');
        if (closeHandwriting) {
            closeHandwriting.addEventListener('click', () => this.hideHandwritingPractice());
        }

        // Handwriting controls
        const hintBtn = document.getElementById('handwriting-hint');
        const resetBtn = document.getElementById('handwriting-reset');
        if (hintBtn) {
            hintBtn.addEventListener('click', () => this.showHandwritingHint());
        }
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetHandwriting());
        }

        // Character navigation buttons
        const prevCharBtn = document.getElementById('prev-char');
        const nextCharBtn = document.getElementById('next-char');
        if (prevCharBtn) {
            prevCharBtn.addEventListener('click', () => this.previousCharacter());
        }
        if (nextCharBtn) {
            nextCharBtn.addEventListener('click', () => this.nextCharacter());
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

            // Create button content with progress bar
            const label = document.createElement('div');
            label.textContent = `听写${this.numberToChinese(index + 1)}`;
            btn.appendChild(label);

            // Add progress bar
            const progressBar = document.createElement('div');
            progressBar.className = 'set-progress-bar';
            const progressFill = document.createElement('div');
            progressFill.className = 'set-progress-fill';
            progressFill.style.width = this.getSetProgress(index) + '%';
            progressBar.appendChild(progressFill);
            btn.appendChild(progressBar);

            btn.addEventListener('click', () => this.selectSet(index));
            selector.appendChild(btn);
        });
    }

    numberToChinese(num) {
        const chinese = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
        return chinese[num - 1] || num;
    }

    getSetProgress(setIndex) {
        const set = this.sets[setIndex];
        if (!set || !set.words) return 0;

        let knownCount = 0;
        set.words.forEach(word => {
            if (this.knownWords.has(word.simplified)) {
                knownCount++;
            }
        });

        return Math.round((knownCount / set.words.length) * 100);
    }

    selectSet(index) {
        this.currentSetIndex = index;
        this.currentWordIndex = 0;
        this.currentWords = this.sets[index]?.words || [];

        // Update set selector buttons
        const buttons = document.querySelectorAll('.set-btn');
        buttons.forEach((btn, i) => {
            btn.classList.toggle('active', i === index);
        });

        // Update title
        const titleElement = document.getElementById('set-title');
        if (titleElement && this.sets[index]) {
            titleElement.textContent = this.sets[index].title || `听写${this.numberToChinese(index + 1)}`;
        }

        // Show first word
        this.showWord();
        this.updateProgress();
    }

    showWord() {
        if (this.currentWords.length === 0) {
            console.log('No words to display');
            return;
        }

        const word = this.currentWords[this.currentWordIndex];

        // Label map for placeholder text
        const labelMap = {
            simplified: '简体',
            traditional: '繁体',
            pinyin: '拼音',
            english: 'English'
        };

        // Reset covered state and set up click handlers
        ['simplified', 'traditional', 'pinyin', 'english'].forEach(key => {
            const elem = document.getElementById(key);
            if (elem) {
                const oldContent = elem.querySelector('.content');
                if (oldContent) {
                    const newContent = oldContent.cloneNode(false);
                    newContent.textContent = labelMap[key];
                    newContent.classList.add(CSS_CLASSES.COVERED);

                    const value = word[key];
                    newContent.addEventListener('click', () => {
                        if (newContent.classList.contains(CSS_CLASSES.COVERED)) {
                            newContent.textContent = value;
                            newContent.classList.remove(CSS_CLASSES.COVERED);
                        } else {
                            newContent.textContent = labelMap[key];
                            newContent.classList.add(CSS_CLASSES.COVERED);
                        }
                    });

                    oldContent.replaceWith(newContent);
                }
            }
        });

        // Reset audio button with toggle
        const audioBtn = document.querySelector(`#${ELEMENT_IDS.AUDIO} .audio-btn`);
        if (audioBtn) {
            const newAudioBtn = audioBtn.cloneNode(true);
            newAudioBtn.classList.add(CSS_CLASSES.COVERED);
            newAudioBtn.addEventListener('click', () => {
                this.playAudio(word);
                newAudioBtn.classList.toggle(CSS_CLASSES.COVERED);
            });
            audioBtn.replaceWith(newAudioBtn);
        }

        // Close handwriting component when navigating to next word
        if (this.handwritingVisible) {
            this.hideHandwritingPractice();
        }

        this.updateProgress();
    }

    async playAudio(word) {
        try {
            const audioPlayer = getAudioPlayer();
            await audioPlayer.play(word.audio);
            const audioBtn = document.querySelector(`#${ELEMENT_IDS.AUDIO} .audio-btn`);
            if (audioBtn) {
                audioBtn.classList.remove(CSS_CLASSES.COVERED);
            }
        } catch (error) {
            console.error('Error playing audio:', error);
        }
    }

    prevWord() {
        if (this.currentWordIndex > 0) {
            this.currentWordIndex--;
            this.showWord();
        }
    }

    nextWord() {
        if (this.currentWordIndex < this.currentWords.length - 1) {
            this.currentWordIndex++;
            this.showWord();
        }
    }

    markAsKnown() {
        if (this.currentWords.length === 0) return;
        const word = this.currentWords[this.currentWordIndex];
        this.knownWords.add(word.simplified);
        this.unknownWords.delete(word.simplified);
        this.saveProgress();
        this.updateSetSelectorProgress();
        this.nextWord();
    }

    markAsUnknown() {
        if (this.currentWords.length === 0) return;
        const word = this.currentWords[this.currentWordIndex];
        this.unknownWords.add(word.simplified);
        this.knownWords.delete(word.simplified);
        this.saveProgress();
        this.updateSetSelectorProgress();
        this.nextWord();
    }

    updateSetSelectorProgress() {
        // Update all progress bars in set selector
        const buttons = document.querySelectorAll('.set-btn');
        buttons.forEach((btn, index) => {
            const progressFill = btn.querySelector('.set-progress-fill');
            if (progressFill) {
                progressFill.style.width = this.getSetProgress(index) + '%';
            }
        });
    }

    updateProgress() {
        const currentSpan = document.getElementById('current-set');
        const totalSpan = document.getElementById('total-sets');
        const currentCardSpan = document.getElementById('current-set-card');
        const totalCardSpan = document.getElementById('total-sets-card');

        if (currentSpan) currentSpan.textContent = this.currentWordIndex + 1;
        if (totalSpan) totalSpan.textContent = this.currentWords.length;
        if (currentCardSpan) currentCardSpan.textContent = this.currentWordIndex + 1;
        if (totalCardSpan) totalCardSpan.textContent = this.currentWords.length;

        // Update button states
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        if (prevBtn) prevBtn.disabled = this.currentWordIndex === 0;
        if (nextBtn) nextBtn.disabled = this.currentWordIndex === this.currentWords.length - 1;
    }

    // Handwriting practice methods
    toggleHandwritingPractice() {
        if (this.handwritingVisible) {
            this.hideHandwritingPractice();
        } else {
            this.showHandwritingPractice();
        }
    }

    showHandwritingPractice() {
        if (this.currentWords.length === 0) return;

        const word = this.currentWords[this.currentWordIndex];
        const characters = word.simplified || word.traditional;

        const handwritingEmbed = document.getElementById('handwriting-embed');
        if (handwritingEmbed) {
            handwritingEmbed.style.display = 'block';
            this.handwritingVisible = true;
            this.loadHandwritingCharacter(characters);
        }
    }

    hideHandwritingPractice() {
        const handwritingEmbed = document.getElementById('handwriting-embed');
        if (handwritingEmbed) {
            handwritingEmbed.style.display = 'none';
            this.handwritingVisible = false;
            if (this.hanziWriter) {
                this.hanziWriter = null;
            }
        }
    }

    loadHandwritingCharacter(characters, charIndex = 0) {
        const charElement = document.getElementById('handwriting-char');
        const targetElement = document.getElementById('handwriting-target');
        const statusElement = document.getElementById('handwriting-status');

        if (!charElement || !targetElement) return;

        this.currentCharacters = characters;
        this.currentCharacterIndex = charIndex;

        const charCountText = characters.length > 1 ? ` (${charIndex + 1}/${characters.length})` : '';
        charElement.textContent = characters + charCountText;

        targetElement.innerHTML = '';
        if (statusElement) statusElement.textContent = '';

        const currentChar = characters[charIndex];
        this.currentStroke = 0;

        this.hanziWriter = HanziWriter.create(targetElement, currentChar, {
            width: 280,
            height: 280,
            padding: 20,
            showOutline: true,
            showCharacter: false,
            strokeAnimationSpeed: 1,
            delayBetweenStrokes: 100,
            strokeColor: '#333',
            outlineColor: '#ddd',
            drawingColor: '#4a90d9',
            drawingWidth: 20,
            showHintAfterMisses: 3,
            highlightOnComplete: true,
            highlightColor: '#27ae60',
            charDataLoader: (char) => {
                return fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${char}.json`)
                    .then(res => {
                        if (!res.ok) throw new Error('Character not found');
                        return res.json();
                    });
            },
        });

        this.hanziWriter.quiz({
            onMistake: (strokeData) => {
                if (statusElement) {
                    statusElement.textContent = `第 ${strokeData.strokeNum + 1} 笔: 再试一次！`;
                    statusElement.className = 'handwriting-status error';
                }
            },
            onCorrectStroke: (strokeData) => {
                this.currentStroke = strokeData.strokeNum + 1;
                if (statusElement) {
                    statusElement.textContent = `第 ${strokeData.strokeNum + 1} 笔: 正确！`;
                    statusElement.className = 'handwriting-status';
                }
            },
            onComplete: (summaryData) => {
                if (statusElement) {
                    const mistakes = summaryData.totalMistakes;
                    if (mistakes === 0) {
                        statusElement.textContent = '完美！没有错误！';
                    } else {
                        statusElement.textContent = `完成！${mistakes} 个错误`;
                    }
                    statusElement.className = 'handwriting-status';
                }
            },
        });

        this.updateCharacterNavButtons();
    }

    showHandwritingHint() {
        if (this.hanziWriter) {
            this.hanziWriter.highlightStroke(this.currentStroke);
        }
    }

    resetHandwriting() {
        if (this.hanziWriter && this.currentCharacters) {
            this.loadHandwritingCharacter(this.currentCharacters, this.currentCharacterIndex);
        }
    }

    previousCharacter() {
        if (this.currentCharacterIndex > 0) {
            this.loadHandwritingCharacter(this.currentCharacters, this.currentCharacterIndex - 1);
        }
    }

    nextCharacter() {
        if (this.currentCharacterIndex < this.currentCharacters.length - 1) {
            this.loadHandwritingCharacter(this.currentCharacters, this.currentCharacterIndex + 1);
        }
    }

    updateCharacterNavButtons() {
        const charNavContainer = document.getElementById('handwriting-char-nav');
        const prevCharBtn = document.getElementById('prev-char');
        const nextCharBtn = document.getElementById('next-char');

        if (!this.currentCharacters || this.currentCharacters.length <= 1) {
            if (charNavContainer) charNavContainer.style.display = 'none';
            return;
        }

        if (charNavContainer) charNavContainer.style.display = 'grid';

        if (prevCharBtn) {
            prevCharBtn.disabled = this.currentCharacterIndex === 0;
        }
        if (nextCharBtn) {
            nextCharBtn.disabled = this.currentCharacterIndex === this.currentCharacters.length - 1;
        }
    }
}

// Initialize the app
const app = new SchoolTingxieApp();
app.init();
