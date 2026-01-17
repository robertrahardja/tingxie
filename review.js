import { BaseApp } from './js/BaseApp.js';
import { CONSTANTS, CSS_CLASSES, ELEMENT_IDS } from './js/constants.js';
import { getAudioPlayer } from './js/AudioPlayer.js';
import { CloudSync } from './js/CloudSync.js';

class ReviewApp extends BaseApp {
    constructor() {
        super();
        this.cloudSync = new CloudSync();
        this.filteredWords = [];
        this.currentIndex = 0;
        this.knownWords = new Set();
        this.unknownWords = new Set();
    }

    async init() {
        console.log('Initializing ReviewApp (Unknown Words Only)...');

        // Load vocabulary data from API
        if (!await this.loadData()) {
            return;
        }

        // Load student progress FIRST to get unknown words
        const studentId = this.cloudSync.getOrCreateStudentId();
        await this.loadProgress(studentId);

        // Extract only unknown words from all vocabulary
        this.allWords = this.extractReviewWords();
        console.log(`Loaded ${this.allWords.length} unknown words for review`);

        // Show message if no unknown words
        if (this.allWords.length === 0) {
            this.showNoWordsMessage();
            return;
        }

        // Set up UI
        this.setupUI();
        this.updateProgress();
        this.showWord();

        console.log('ReviewApp initialized');
    }

    extractReviewWords() {
        /**
         * Returns only words marked as "不会" (unknown) from the cloud progress.
         * This ensures review page shows ONLY words the student needs to practice.
         */
        if (!this.data || !this.data.vocabulary || this.unknownWords.size === 0) {
            return [];
        }

        const unknownWordsList = [];

        // Iterate through all vocabulary to find unknown words
        this.data.vocabulary.forEach(row => {
            if (row.words && Array.isArray(row.words)) {
                row.words.forEach(word => {
                    const wordId = `${word.simplified}_${word.traditional}`;
                    if (this.unknownWords.has(wordId)) {
                        unknownWordsList.push(word);
                    }
                });
            }
        });

        return unknownWordsList;
    }

    showNoWordsMessage() {
        const wordCard = document.getElementById('word-card');
        if (wordCard) {
            wordCard.innerHTML = `
                <div style="text-align: center; padding: 40px 20px;">
                    <h2 style="color: #4CAF50; margin-bottom: 10px;">🎉 太棒了！</h2>
                    <p style="color: #666; font-size: 16px;">没有需要复习的词语</p>
                    <p style="color: #999; font-size: 14px; margin-top: 10px;">
                        在主页面标记"不会"的词语会出现在这里
                    </p>
                </div>
            `;
        }
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
const app = new ReviewApp();
app.init();
