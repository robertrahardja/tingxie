import { BaseApp } from './js/BaseApp.js';
import { CONSTANTS, CSS_CLASSES, ELEMENT_IDS } from './js/constants.js';
import { getAudioPlayer } from './js/AudioPlayer.js';
import { CloudSync } from './js/CloudSync.js';
import HanziWriter from 'https://cdn.jsdelivr.net/npm/hanzi-writer@3.7.3/+esm';

class LatestApp extends BaseApp {
    constructor() {
        super();
        this.cloudSync = new CloudSync();
        this.filteredWords = [];
        this.currentIndex = 0;
        this.knownWords = new Set();
        this.unknownWords = new Set();
        this.hanziWriter = null;
        this.currentStroke = 0;
        this.handwritingVisible = false;
        this.currentCharacterIndex = 0;
        this.currentCharacters = '';
        this.showLatestOnly = true; // Default to showing only latest 15 words
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
         * Loads words based on showLatestOnly toggle.
         * If showLatestOnly is true: load only the latest row (row 76)
         * If showLatestOnly is false: load ALL words from all rows
         */
        if (!this.data || !this.data.vocabulary) {
            console.warn('No vocabulary data available');
            return [];
        }

        if (this.showLatestOnly) {
            // Show only latest row
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
        } else {
            // Show all words from all rows
            const allWords = [];
            this.data.vocabulary.forEach(row => {
                if (row.words) {
                    allWords.push(...row.words);
                }
            });
            console.log(`Loaded ${allWords.length} words from all rows`);
            return allWords;
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

        // Latest/All toggle button
        const latestToggleBtn = document.createElement('button');
        latestToggleBtn.id = 'latest-toggle';
        latestToggleBtn.className = 'filter-btn active';
        latestToggleBtn.textContent = '最新15词';
        latestToggleBtn.style.marginRight = '8px';

        const filterBtn = document.getElementById('filter-toggle');
        if (filterBtn && filterBtn.parentNode) {
            filterBtn.parentNode.insertBefore(latestToggleBtn, filterBtn);
        }

        latestToggleBtn.addEventListener('click', () => {
            this.showLatestOnly = !this.showLatestOnly;
            latestToggleBtn.classList.toggle('active', this.showLatestOnly);
            latestToggleBtn.textContent = this.showLatestOnly ? '最新15词' : '全部词语';
            this.currentIndex = 0;
            this.allWords = this.extractLatestWords();
            this.filteredWords = this.getFilteredWords();
            this.showWord();
            this.updateProgress();
        });

        // Filter toggle
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
                this.toggleHandwritingPractice();
            });
        }

        // Close handwriting button
        const closeHandwriting = document.getElementById('close-handwriting');
        if (closeHandwriting) {
            closeHandwriting.addEventListener('click', () => {
                this.hideHandwritingPractice();
            });
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

        // Initialize filtered words
        this.filteredWords = this.getFilteredWords();
    }

    toggleHandwritingPractice() {
        if (this.handwritingVisible) {
            this.hideHandwritingPractice();
        } else {
            this.showHandwritingPractice();
        }
    }

    showHandwritingPractice() {
        if (this.filteredWords.length === 0) return;

        const word = this.filteredWords[this.currentIndex];
        const characters = word.simplified || word.traditional;

        // Show the handwriting component
        const handwritingEmbed = document.getElementById('handwriting-embed');
        if (handwritingEmbed) {
            handwritingEmbed.style.display = 'block';
            this.handwritingVisible = true;

            // Load each character into HanziWriter
            this.loadHandwritingCharacter(characters);
        }
    }

    hideHandwritingPractice() {
        const handwritingEmbed = document.getElementById('handwriting-embed');
        if (handwritingEmbed) {
            handwritingEmbed.style.display = 'none';
            this.handwritingVisible = false;

            // Clean up the writer
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

        // Store current characters and index
        this.currentCharacters = characters;
        this.currentCharacterIndex = charIndex;

        // Display which character we're practicing (e.g., "美丽 (1/2)")
        const charCountText = characters.length > 1 ? ` (${charIndex + 1}/${characters.length})` : '';
        charElement.textContent = characters + charCountText;

        // Clear previous writer
        targetElement.innerHTML = '';
        if (statusElement) statusElement.textContent = '';

        // Create HanziWriter instance for the current character
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

        // Start quiz mode
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

        // Update character navigation buttons
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
            this.updateCharacterNavButtons();
        }
    }

    nextCharacter() {
        if (this.currentCharacterIndex < this.currentCharacters.length - 1) {
            this.loadHandwritingCharacter(this.currentCharacters, this.currentCharacterIndex + 1);
            this.updateCharacterNavButtons();
        }
    }

    updateCharacterNavButtons() {
        const charNavContainer = document.getElementById('handwriting-char-nav');
        const prevCharBtn = document.getElementById('prev-char');
        const nextCharBtn = document.getElementById('next-char');

        if (!this.currentCharacters || this.currentCharacters.length <= 1) {
            // Hide nav buttons for single character words
            if (charNavContainer) charNavContainer.style.display = 'none';
            return;
        }

        // Show nav buttons for multi-character words
        if (charNavContainer) charNavContainer.style.display = 'grid';

        // Update button states
        if (prevCharBtn) {
            prevCharBtn.disabled = this.currentCharacterIndex === 0;
        }
        if (nextCharBtn) {
            nextCharBtn.disabled = this.currentCharacterIndex === this.currentCharacters.length - 1;
        }
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
