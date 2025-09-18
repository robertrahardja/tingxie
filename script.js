import { BaseApp } from './js/BaseApp.js';
import { getAudioPlayer } from './js/AudioPlayer.js';
import { CONSTANTS, CSS_CLASSES, ELEMENT_IDS } from './js/constants.js';

class TingxieApp extends BaseApp {
    constructor() {
        super();
        this.currentWordIndex = 0;
        this.currentSetIndex = 0;
        this.currentWords = [];
        this.revealedItems = new Set();
        this.audioPlayer = getAudioPlayer();
        this.wordLabels = this.createWordLabelsMap();

        this.init();
    }

    createWordLabelsMap() {
        return {
            simplified: CONSTANTS.UI_LABELS.SIMPLIFIED,
            traditional: CONSTANTS.UI_LABELS.TRADITIONAL,
            pinyin: CONSTANTS.UI_LABELS.PINYIN,
            english: CONSTANTS.UI_LABELS.ENGLISH
        };
    }

    async init() {
        const dataLoaded = await this.loadData();
        if (!dataLoaded) return;

        this.setupEventListeners();
        this.updateWordsList();
        this.displayCurrentWord();
        this.updateProgress();
        this.preloadAudioForCurrentWords();
    }

    setupEventListeners() {
        this.setupBaseEventListeners();
        this.setupNavigationListeners();
        this.setupWordItemListeners();
        this.setupTouchOptimization();
    }

    setupNavigationListeners() {
        const prevBtn = document.getElementById(ELEMENT_IDS.PREV_BTN);
        const nextBtn = document.getElementById(ELEMENT_IDS.NEXT_BTN);
        const nextSetBtn = document.getElementById(ELEMENT_IDS.NEXT_SET_BTN);

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousWord());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextWord());
        }

        if (nextSetBtn) {
            nextSetBtn.addEventListener('click', () => this.nextSet());
        }
    }

    setupWordItemListeners() {
        const wordTypes = ['simplified', 'traditional', 'pinyin', 'english', 'audio'];

        wordTypes.forEach(type => {
            const element = document.getElementById(type);
            if (element) {
                element.addEventListener('click', () => this.revealItem(type));
            }
        });
    }

    setupTouchOptimization() {
        const touchElements = [
            ELEMENT_IDS.SIMPLIFIED, ELEMENT_IDS.TRADITIONAL,
            ELEMENT_IDS.PINYIN, ELEMENT_IDS.ENGLISH, ELEMENT_IDS.AUDIO,
            ELEMENT_IDS.PREV_BTN, ELEMENT_IDS.NEXT_BTN,
            ELEMENT_IDS.FILTER_TOGGLE, ELEMENT_IDS.NEXT_SET_BTN
        ];

        touchElements.forEach(id => {
            const element = document.getElementById(id);
            if (!element) return;

            element.addEventListener('touchstart', () => {
                element.style.opacity = '0.8';
            }, { passive: true });

            element.addEventListener('touchend', () => {
                setTimeout(() => {
                    element.style.opacity = '';
                }, CONSTANTS.TOUCH_FEEDBACK_DELAY);
            }, { passive: true });
        });
    }

    onFilterChange() {
        this.currentWordIndex = 0;
        this.currentSetIndex = 0;
        this.updateWordsList();
        this.displayCurrentWord();
        this.updateProgress();
        this.resetRevealedItems();
        this.preloadAudioForCurrentWords();
    }

    updateWordsList() {
        this.currentWords = [];

        if (!this.data?.vocabulary) return;

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

    preloadAudioForCurrentWords() {
        if (this.currentWords.length === 0) return;

        // Preload audio for next few words for better performance
        const preloadCount = Math.min(5, this.currentWords.length);
        const audioPaths = [];

        for (let i = 0; i < preloadCount; i++) {
            const index = (this.currentWordIndex + i) % this.currentWords.length;
            const word = this.currentWords[index];
            if (word?.audio) {
                audioPaths.push(word.audio);
            }
        }

        this.audioPlayer.preload(audioPaths);
    }

    displayCurrentWord() {
        if (this.currentWords.length === 0) return;

        const word = this.currentWords[this.currentWordIndex];

        // Update word content
        this.updateWordContent(word);
        this.resetItemStates();
        this.updateNavigationButtons();
    }

    updateWordContent(word) {
        const elements = {
            simplified: document.querySelector('#simplified .content'),
            traditional: document.querySelector('#traditional .content'),
            pinyin: document.querySelector('#pinyin .content'),
            english: document.querySelector('#english .content')
        };

        Object.keys(elements).forEach(key => {
            if (elements[key]) {
                elements[key].textContent = word[key] || this.wordLabels[key];
            }
        });
    }

    resetItemStates() {
        Object.keys(this.wordLabels).forEach(type => {
            const content = document.querySelector(`#${type} .content`);
            if (content) {
                content.classList.add(CSS_CLASSES.COVERED);
                content.textContent = this.wordLabels[type];
            }
        });

        const audioBtn = document.querySelector('#audio .audio-btn');
        if (audioBtn) {
            audioBtn.classList.add(CSS_CLASSES.COVERED);
        }

        this.revealedItems.clear();
    }

    revealItem(type) {
        if (this.currentWords.length === 0) return;

        const word = this.currentWords[this.currentWordIndex];

        if (type === 'audio') {
            this.handleAudioReveal(word);
        } else {
            this.handleTextReveal(type, word);
        }

        this.checkSetComplete();
    }

    handleAudioReveal(word) {
        const audioBtn = document.querySelector('#audio .audio-btn');
        if (!audioBtn) return;

        this.audioPlayer.play(word.audio);

        if (audioBtn.classList.contains(CSS_CLASSES.COVERED)) {
            audioBtn.classList.remove(CSS_CLASSES.COVERED);
            this.revealedItems.add('audio');
        } else {
            audioBtn.classList.add(CSS_CLASSES.COVERED);
            this.revealedItems.delete('audio');
        }
    }

    handleTextReveal(type, word) {
        const content = document.querySelector(`#${type} .content`);
        if (!content) return;

        if (content.classList.contains(CSS_CLASSES.COVERED)) {
            content.classList.remove(CSS_CLASSES.COVERED);
            content.textContent = word[type];
            this.revealedItems.add(type);
        } else {
            content.classList.add(CSS_CLASSES.COVERED);
            content.textContent = this.wordLabels[type];
            this.revealedItems.delete(type);
        }
    }

    checkSetComplete() {
        const requiredItems = ['simplified', 'traditional', 'pinyin', 'english', 'audio'];
        const allRevealed = requiredItems.every(item => this.revealedItems.has(item));

        if (allRevealed) {
            setTimeout(() => this.showSetComplete(), CONSTANTS.SET_COMPLETE_DELAY);
        }
    }

    showSetComplete() {
        const element = document.getElementById(ELEMENT_IDS.SET_COMPLETE);
        if (element) {
            element.style.display = 'flex';
        }
    }

    hideSetComplete() {
        const element = document.getElementById(ELEMENT_IDS.SET_COMPLETE);
        if (element) {
            element.style.display = 'none';
        }
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
            this.currentWordIndex = 0;
            this.currentSetIndex = 0;
        }

        this.displayCurrentWord();
        this.updateProgress();
        this.preloadAudioForCurrentWords();
    }

    previousWord() {
        if (this.currentWordIndex > 0) {
            this.currentWordIndex--;
            this.currentSetIndex--;
        } else {
            this.currentWordIndex = this.currentWords.length - 1;
            this.currentSetIndex = this.currentWords.length - 1;
        }

        this.displayCurrentWord();
        this.updateProgress();
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById(ELEMENT_IDS.PREV_BTN);
        const nextBtn = document.getElementById(ELEMENT_IDS.NEXT_BTN);

        // Always enable navigation for looping
        if (prevBtn) prevBtn.disabled = false;
        if (nextBtn) nextBtn.disabled = false;
    }

    updateProgress() {
        const currentSet = document.getElementById(ELEMENT_IDS.CURRENT_SET);
        const totalSets = document.getElementById(ELEMENT_IDS.TOTAL_SETS);

        if (currentSet) {
            currentSet.textContent = this.currentSetIndex + 1;
        }
        if (totalSets) {
            totalSets.textContent = this.currentWords.length;
        }
    }

    resetRevealedItems() {
        this.revealedItems.clear();
    }

    destroy() {
        super.destroy();
        // Additional cleanup if needed
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tingxieApp = new TingxieApp();
});

// Viewport height fix for mobile browsers
function setViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setViewportHeight();
window.addEventListener('resize', setViewportHeight);
window.addEventListener('orientationchange', setViewportHeight);