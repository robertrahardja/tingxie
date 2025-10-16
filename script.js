import { BaseApp } from './js/BaseApp.js';
import { getAudioPlayer } from './js/AudioPlayer.js';
import { CONSTANTS, CSS_CLASSES, ELEMENT_IDS } from './js/constants.js';
import { CloudSync } from './js/CloudSync.js';

class TingxieApp extends BaseApp {
    constructor() {
        super();
        this.currentWordIndex = 0;
        this.currentSetIndex = 0;
        this.currentWords = [];
        this.revealedItems = new Set();
        this.audioPlayer = getAudioPlayer();
        this.wordLabels = this.createWordLabelsMap();
        this.reviewMode = false;
        this.knownWords = this.loadKnownWords();
        this.unknownWords = this.loadUnknownWords();
        this.cloudSync = new CloudSync();
        this.syncInProgress = false;

        this.init();
    }

    loadKnownWords() {
        const stored = localStorage.getItem('tingxie_known_words');
        return stored ? new Set(JSON.parse(stored)) : new Set();
    }

    loadUnknownWords() {
        const stored = localStorage.getItem('tingxie_unknown_words');
        return stored ? new Set(JSON.parse(stored)) : new Set();
    }

    saveKnownWords() {
        localStorage.setItem('tingxie_known_words', JSON.stringify([...this.knownWords]));
    }

    saveUnknownWords() {
        localStorage.setItem('tingxie_unknown_words', JSON.stringify([...this.unknownWords]));
    }

    /**
     * Save progress both locally and to cloud
     */
    async saveProgressToCloud() {
        await this.cloudSync.saveProgress(this.knownWords, this.unknownWords);
    }

    getWordId(word) {
        return `${word.simplified}_${word.traditional}`;
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

        // Sync with cloud on startup
        await this.syncWithCloud();

        this.setupEventListeners();
        this.updateWordsList();
        this.displayCurrentWord();
        this.updateProgress();
        this.preloadAudioForCurrentWords();
    }

    /**
     * Sync progress with Cloudflare KV
     * Merges local and cloud data, then saves back to cloud
     */
    async syncWithCloud() {
        if (this.syncInProgress) return;

        this.syncInProgress = true;
        try {
            const cloudProgress = await this.cloudSync.fetchProgress();

            if (cloudProgress) {
                // Merge local and cloud progress
                const local = {
                    knownWords: this.knownWords,
                    unknownWords: this.unknownWords
                };

                const merged = this.cloudSync.mergeProgress(local, cloudProgress);

                // Update local state
                this.knownWords = merged.knownWords;
                this.unknownWords = merged.unknownWords;

                // Save merged data back to localStorage and cloud
                this.saveKnownWords();
                this.saveUnknownWords();

                console.log('✓ Synced with cloud:', {
                    known: this.knownWords.size,
                    unknown: this.unknownWords.size
                });
            }
        } catch (error) {
            console.error('Cloud sync failed:', error);
        } finally {
            this.syncInProgress = false;
        }
    }

    setupEventListeners() {
        this.setupBaseEventListeners();
        this.setupNavigationListeners();
        this.setupWordItemListeners();
        this.setupSelfAssessListeners();
        this.setupReviewModeListener();
        this.setupTouchOptimization();
    }

    setupNavigationListeners() {
        const prevBtn = document.getElementById(ELEMENT_IDS.PREV_BTN);
        const nextBtn = document.getElementById(ELEMENT_IDS.NEXT_BTN);

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousWord());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextWord());
        }
    }

    setupSelfAssessListeners() {
        const knowBtn = document.getElementById(ELEMENT_IDS.KNOW_BTN);
        const dontKnowBtn = document.getElementById(ELEMENT_IDS.DONT_KNOW_BTN);

        if (knowBtn) {
            knowBtn.addEventListener('click', () => this.markWordAsKnown());
        }

        if (dontKnowBtn) {
            dontKnowBtn.addEventListener('click', () => this.markWordAsUnknown());
        }
    }

    setupReviewModeListener() {
        const reviewToggle = document.getElementById(ELEMENT_IDS.REVIEW_TOGGLE);

        if (reviewToggle) {
            reviewToggle.addEventListener('click', () => this.toggleReviewMode());
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
            ELEMENT_IDS.FILTER_TOGGLE, ELEMENT_IDS.REVIEW_TOGGLE,
            ELEMENT_IDS.KNOW_BTN, ELEMENT_IDS.DONT_KNOW_BTN
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
                const matchesFilter = !this.showImportantOnly || word.important;
                const wordId = this.getWordId(word);

                // In review mode, only show unknown words
                const matchesReviewMode = !this.reviewMode || this.unknownWords.has(wordId);

                if (matchesFilter && matchesReviewMode) {
                    this.currentWords.push({
                        ...word,
                        rowIndex,
                        wordIndex,
                        setNumber: this.currentWords.length + 1
                    });
                }
            });
        });

        // Show/hide review button based on whether there are unknown words
        this.updateReviewButtonVisibility();
    }

    updateReviewButtonVisibility() {
        const reviewToggle = document.getElementById(ELEMENT_IDS.REVIEW_TOGGLE);
        if (reviewToggle) {
            reviewToggle.style.display = this.unknownWords.size > 0 ? '' : 'none';
        }
    }

    toggleReviewMode() {
        this.reviewMode = !this.reviewMode;
        const reviewToggle = document.getElementById(ELEMENT_IDS.REVIEW_TOGGLE);

        if (reviewToggle) {
            if (this.reviewMode) {
                reviewToggle.classList.add(CSS_CLASSES.ACTIVE);
                reviewToggle.textContent = CONSTANTS.UI_LABELS.ALL_MODE;
            } else {
                reviewToggle.classList.remove(CSS_CLASSES.ACTIVE);
                reviewToggle.textContent = CONSTANTS.UI_LABELS.REVIEW_MODE;
            }
        }

        this.currentWordIndex = 0;
        this.currentSetIndex = 0;
        this.updateWordsList();
        this.displayCurrentWord();
        this.updateProgress();
        this.resetRevealedItems();
        this.preloadAudioForCurrentWords();
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

    markWordAsKnown() {
        if (this.currentWords.length === 0) return;

        const word = this.currentWords[this.currentWordIndex];
        const wordId = this.getWordId(word);

        this.knownWords.add(wordId);
        this.unknownWords.delete(wordId);

        this.saveKnownWords();
        this.saveUnknownWords();
        this.saveProgressToCloud(); // Sync to cloud

        this.updateReviewButtonVisibility();
        this.nextWord();
    }

    markWordAsUnknown() {
        if (this.currentWords.length === 0) return;

        const word = this.currentWords[this.currentWordIndex];
        const wordId = this.getWordId(word);

        this.unknownWords.add(wordId);
        this.knownWords.delete(wordId);

        this.saveKnownWords();
        this.saveUnknownWords();
        this.saveProgressToCloud(); // Sync to cloud

        this.updateReviewButtonVisibility();
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