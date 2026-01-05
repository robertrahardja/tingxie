import { BaseApp } from './js/BaseApp.js';
import { CONSTANTS, CSS_CLASSES, ELEMENT_IDS } from './js/constants.js';
import { getAudioPlayer } from './js/AudioPlayer.js';
import { CloudSync } from './js/CloudSync.js';

class LatestApp extends BaseApp {
    constructor() {
        super();
        this.cloudSync = new CloudSync();
        this.filteredWords = [];
        this.currentIndex = 0;
        this.knownWords = new Set();
        this.unknownWords = new Set();
    }

    async init() {
        console.log('Initializing LatestApp...');

        // Load vocabulary data from API
        if (!await this.loadData()) {
            return;
        }

        // Extract only row 4 (the 12 new words)
        this.allWords = this.extractLatestWords();
        console.log(`Loaded ${this.allWords.length} latest words`);

        // Load student progress
        const studentId = this.cloudSync.getOrCreateStudentId();
        await this.loadProgress(studentId);

        // Set up UI
        this.setupUI();
        this.updateProgress();
        this.showWord();

        console.log('LatestApp initialized');
    }

    extractLatestWords() {
        // Return only row 4 (the last row with 12 new words)
        if (this.data && this.data.vocabulary && this.data.vocabulary.length > 0) {
            const lastRow = this.data.vocabulary[this.data.vocabulary.length - 1];
            return lastRow.words || [];
        }
        return [];
    }

    async loadProgress(studentId) {
        try {
            const progress = await this.cloudSync.fetchProgress();
            if (progress) {
                this.knownWords = progress.knownWords || new Set();
                this.unknownWords = progress.unknownWords || new Set();
            } else {
                this.knownWords = new Set();
                this.unknownWords = new Set();
            }
        } catch (error) {
            console.log('Could not load progress from cloud:', error.message);
            this.knownWords = new Set();
            this.unknownWords = new Set();
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

        // Filter toggle
        const filterBtn = document.getElementById('filter-toggle');
        if (filterBtn) {
            filterBtn.addEventListener('click', () => {
                this.showImportantOnly = !this.showImportantOnly;
                filterBtn.classList.toggle('active', this.showImportantOnly);
                this.currentIndex = 0;
                this.filteredWords = this.getFilteredWords();
                this.showWord();
                this.updateProgress();
            });
        }

        // Navigation buttons
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.currentIndex > 0) {
                    this.currentIndex--;
                    this.showWord();
                }
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (this.currentIndex < this.filteredWords.length - 1) {
                    this.currentIndex++;
                    this.showWord();
                }
            });
        }

        // Self-assessment buttons
        const knowBtn = document.getElementById('know-btn');
        const dontKnowBtn = document.getElementById('dont-know-btn');
        if (knowBtn) {
            knowBtn.addEventListener('click', () => {
                this.markAsKnown();
            });
        }
        if (dontKnowBtn) {
            dontKnowBtn.addEventListener('click', () => {
                this.markAsUnknown();
            });
        }

        // Initialize filtered words
        this.filteredWords = this.getFilteredWords();
    }

    getFilteredWords() {
        if (this.showImportantOnly) {
            return this.allWords.filter(w => w.important);
        }
        return this.allWords;
    }

    showWord() {
        if (this.filteredWords.length === 0) {
            console.log('No words to display');
            return;
        }

        const word = this.filteredWords[this.currentIndex];

        // Reset covered state
        Object.keys(ELEMENT_IDS).forEach(key => {
            const id = ELEMENT_IDS[key];
            const elem = document.getElementById(id);
            if (elem && id !== ELEMENT_IDS.MENU_TOGGLE && id !== ELEMENT_IDS.NAV_MENU) {
                const content = elem.querySelector('.content');
                if (content) {
                    content.classList.add(CSS_CLASSES.COVERED);
                } else if (elem.classList) {
                    elem.classList.add(CSS_CLASSES.COVERED);
                }
            }
        });

        // Show audio button
        const audioBtn = document.querySelector(`#${ELEMENT_IDS.AUDIO} .audio-btn`);
        if (audioBtn) {
            audioBtn.classList.add(CSS_CLASSES.COVERED);
            audioBtn.addEventListener('click', () => this.playAudio(word), { once: true });
        }

        // Add click handlers for reveal
        Object.entries(word).forEach(([key, value]) => {
            const elemId = key === 'simplified' ? 'simplified' : key === 'traditional' ? 'traditional' : key === 'pinyin' ? 'pinyin' : key === 'english' ? 'english' : null;
            if (elemId) {
                const elem = document.getElementById(elemId);
                if (elem) {
                    const content = elem.querySelector('.content');
                    if (content) {
                        content.textContent = value;
                        content.addEventListener('click', () => {
                            content.classList.remove(CSS_CLASSES.COVERED);
                        });
                    }
                }
            }
        });

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

    markAsKnown() {
        if (this.filteredWords.length === 0) return;
        const word = this.filteredWords[this.currentIndex];
        this.knownWords.add(word.simplified);
        this.unknownWords.delete(word.simplified);
        this.saveProgress();
        this.moveToNext();
    }

    markAsUnknown() {
        if (this.filteredWords.length === 0) return;
        const word = this.filteredWords[this.currentIndex];
        this.unknownWords.add(word.simplified);
        this.knownWords.delete(word.simplified);
        this.saveProgress();
        this.moveToNext();
    }

    moveToNext() {
        if (this.currentIndex < this.filteredWords.length - 1) {
            this.currentIndex++;
            this.showWord();
        }
    }

    async saveProgress() {
        try {
            await this.cloudSync.saveProgress(Array.from(this.knownWords), Array.from(this.unknownWords));
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    }

    updateProgress() {
        const currentSpan = document.getElementById('current-set');
        const totalSpan = document.getElementById('total-sets');
        const currentCardSpan = document.getElementById('current-set-card');
        const totalCardSpan = document.getElementById('total-sets-card');

        if (currentSpan) currentSpan.textContent = this.currentIndex + 1;
        if (totalSpan) totalSpan.textContent = this.filteredWords.length;
        if (currentCardSpan) currentCardSpan.textContent = this.currentIndex + 1;
        if (totalCardSpan) totalCardSpan.textContent = this.filteredWords.length;

        // Update button states
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        if (prevBtn) prevBtn.disabled = this.currentIndex === 0;
        if (nextBtn) nextBtn.disabled = this.currentIndex === this.filteredWords.length - 1;
    }
}

// Initialize the app
const app = new LatestApp();
app.init();
