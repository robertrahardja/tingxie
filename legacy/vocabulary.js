import { BaseApp } from './js/BaseApp.js';
import { getAudioPlayer } from './js/AudioPlayer.js';
import { CONSTANTS, CSS_CLASSES, ELEMENT_IDS } from './js/constants.js';

class VocabularyApp extends BaseApp {
    constructor() {
        super();
        this.audioPlayer = getAudioPlayer();
        this.vocabGrid = null;
        this.init();
    }

    async init() {
        const dataLoaded = await this.loadData();
        if (!dataLoaded) return;

        this.cacheElements();
        this.setupEventListeners();
        this.renderVocabulary();
    }

    cacheElements() {
        this.vocabGrid = document.getElementById(ELEMENT_IDS.VOCAB_GRID);
    }

    setupEventListeners() {
        this.setupBaseEventListeners();
    }

    onFilterChange() {
        this.renderVocabulary();
    }

    renderVocabulary() {
        if (!this.vocabGrid) return;

        this.clearGrid();

        if (!this.data?.vocabulary) return;

        const fragment = document.createDocumentFragment();

        this.data.vocabulary.forEach(row => {
            row.words.forEach(word => {
                if (!this.showImportantOnly || word.important) {
                    const wordCard = this.createWordCard(word);
                    fragment.appendChild(wordCard);
                }
            });
        });

        this.vocabGrid.appendChild(fragment);
        this.preloadVisibleAudio();
    }

    clearGrid() {
        if (this.vocabGrid) {
            this.vocabGrid.innerHTML = '';
        }
    }

    createWordCard(word) {
        const card = document.createElement('div');
        card.className = this.getCardClassName(word);

        card.appendChild(this.createCardElement('vocab-simplified', word.simplified));
        card.appendChild(this.createCardElement('vocab-traditional', word.traditional));
        card.appendChild(this.createCardElement('vocab-pinyin', word.pinyin));
        card.appendChild(this.createAudioButton(word.audio));

        if (word.important) {
            card.appendChild(this.createImportantBadge());
        }

        return card;
    }

    getCardClassName(word) {
        const classes = [CSS_CLASSES.VOCAB_CARD];
        if (word.important) {
            classes.push(CSS_CLASSES.IMPORTANT);
        }
        return classes.join(' ');
    }

    createCardElement(className, text) {
        const element = document.createElement('div');
        element.className = className;
        element.textContent = text;
        return element;
    }

    createAudioButton(audioPath) {
        const button = document.createElement('button');
        button.className = 'vocab-audio';
        button.textContent = '🔊';
        button.setAttribute('data-audio', audioPath);
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            this.playAudio(audioPath);
        });
        return button;
    }

    createImportantBadge() {
        const badge = document.createElement('div');
        badge.className = CSS_CLASSES.IMPORTANT_BADGE;
        badge.textContent = CONSTANTS.UI_LABELS.IMPORTANT_BADGE;
        return badge;
    }

    playAudio(audioPath) {
        this.audioPlayer.play(audioPath);
    }

    preloadVisibleAudio() {
        if (!this.vocabGrid) return;

        // Use Intersection Observer to preload audio for visible cards
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const audioBtn = entry.target.querySelector('.vocab-audio');
                        if (audioBtn) {
                            const audioPath = audioBtn.getAttribute('data-audio');
                            if (audioPath) {
                                this.audioPlayer.preload([audioPath]);
                            }
                        }
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                root: null,
                rootMargin: '50px'
            }
        );

        const cards = this.vocabGrid.querySelectorAll(`.${CSS_CLASSES.VOCAB_CARD}`);
        cards.forEach(card => observer.observe(card));
    }

    destroy() {
        super.destroy();
        this.clearGrid();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.vocabularyApp = new VocabularyApp();
});