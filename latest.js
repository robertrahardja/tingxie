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
        console.log('Initializing LatestApp (Latest Words Practice)...');

        // Load vocabulary data from API
        if (!await this.loadData()) {
            console.error('Failed to load vocabulary data');
            return;
        }

        // Extract latest words from configured row
        // See constants.js VOCABULARY.LATEST_ROW_NUMBER to update which row is "latest"
        this.allWords = this.extractLatestWords();
        if (this.allWords.length === 0) {
            console.error('No latest words found to display');
            return;
        }

        // Load student progress from cloud
        const studentId = this.cloudSync.getOrCreateStudentId();
        await this.loadProgress(studentId);

        // Set up UI and display first word
        this.setupUI();
        this.updateProgress();
        this.showWord();

        console.log('LatestApp initialized successfully');
    }

    extractLatestWords() {
        /**
         * Loads the current set of "latest words" for students to practice.
         *
         * The latest words are stored in a specific row of the vocabulary data.
         * This row number is configured in CONSTANTS.VOCABULARY.LATEST_ROW_NUMBER
         *
         * When new words need to be added:
         * 1. Add a new row to data/tingxie/tingxie_vocabulary.json with incrementing row number
         * 2. Update CONSTANTS.VOCABULARY.LATEST_ROW_NUMBER to point to that row
         * 3. Deploy the changes
         *
         * This explicit approach prevents confusion about which words are "latest"
         * and makes it clear where to update the configuration.
         */
        if (!this.data || !this.data.vocabulary) {
            console.warn('No vocabulary data available');
            return [];
        }

        const latestRowNumber = CONSTANTS.VOCABULARY.LATEST_ROW_NUMBER;
        const latestRow = this.data.vocabulary.find(row => row.row === latestRowNumber);

        if (!latestRow) {
            console.error(
                `Latest words row not found. Expected row ${latestRowNumber} ` +
                `in tingxie_vocabulary.json. Available rows: ${this.data.vocabulary.map(r => r.row).join(', ')}`
            );
            return [];
        }

        console.log(`Loaded ${latestRow.words.length} words from row ${latestRowNumber}`);
        return latestRow.words || [];
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

        // Handwriting practice button
        const handwritingBtn = document.getElementById(ELEMENT_IDS.HANDWRITING_BTN);
        if (handwritingBtn) {
            handwritingBtn.addEventListener('click', () => {
                this.openHandwritingPractice();
            });
        }

        // Initialize filtered words
        this.filteredWords = this.getFilteredWords();
    }

    openHandwritingPractice() {
        if (this.filteredWords.length === 0) return;

        const word = this.filteredWords[this.currentIndex];
        // Get the traditional Chinese characters for the current word
        const characters = word.traditional || word.simplified;

        // Open handwriting practice page with the word
        const url = `https://tingxie.rr-startech-innovation.workers.dev/handwriting?word=${encodeURIComponent(characters)}`;
        window.open(url, '_blank');
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

        // Label map for placeholder text
        const labelMap = {
            simplified: CONSTANTS.UI_LABELS.SIMPLIFIED,
            traditional: CONSTANTS.UI_LABELS.TRADITIONAL,
            pinyin: CONSTANTS.UI_LABELS.PINYIN,
            english: CONSTANTS.UI_LABELS.ENGLISH
        };

        // Reset covered state and remove old event listeners by cloning
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
                            // Reveal: show answer
                            newContent.textContent = value;
                            newContent.classList.remove(CSS_CLASSES.COVERED);
                        } else {
                            // Cover: show title
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
