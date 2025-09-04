class VocabularyApp {
    constructor() {
        this.data = null;
        this.showImportantOnly = false;
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.renderVocabulary();
    }

    async loadData() {
        try {
            const response = await fetch('tingxie_vocabulary.json');
            this.data = await response.json();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    setupEventListeners() {
        // Menu toggle
        document.getElementById('menu-toggle').addEventListener('click', () => {
            this.toggleMenu();
        });

        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                this.closeMenu();
            });
        });

        document.addEventListener('click', (e) => {
            const navMenu = document.getElementById('nav-menu');
            const menuToggle = document.getElementById('menu-toggle');
            
            if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                this.closeMenu();
            }
        });

        // Filter toggle
        document.getElementById('filter-toggle').addEventListener('click', () => {
            this.toggleFilter();
        });
    }

    toggleFilter() {
        this.showImportantOnly = !this.showImportantOnly;
        const filterBtn = document.getElementById('filter-toggle');
        
        if (this.showImportantOnly) {
            filterBtn.textContent = '重要词语';
        } else {
            filterBtn.textContent = '全部词语';
        }

        this.renderVocabulary();
    }

    renderVocabulary() {
        const grid = document.getElementById('vocab-grid');
        grid.innerHTML = '';

        if (!this.data || !this.data.vocabulary) return;

        this.data.vocabulary.forEach(row => {
            row.words.forEach(word => {
                if (!this.showImportantOnly || word.important) {
                    const wordCard = this.createWordCard(word);
                    grid.appendChild(wordCard);
                }
            });
        });
    }

    createWordCard(word) {
        const card = document.createElement('div');
        card.className = `vocab-card ${word.important ? 'important' : ''}`;
        
        card.innerHTML = `
            <div class="vocab-simplified">${word.simplified}</div>
            <div class="vocab-traditional">${word.traditional}</div>
            <div class="vocab-pinyin">${word.pinyin}</div>
            <button class="vocab-audio" data-audio="${word.audio}">🔊</button>
            ${word.important ? '<div class="important-badge">重点</div>' : ''}
        `;

        card.querySelector('.vocab-audio').addEventListener('click', (e) => {
            this.playAudio(e.target.dataset.audio);
        });

        return card;
    }

    async playAudio(audioPath) {
        try {
            const audio = new Audio(audioPath);
            await audio.play();
        } catch (error) {
            console.warn('Audio playback failed:', error);
        }
    }

    toggleMenu() {
        const menuToggle = document.getElementById('menu-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    }

    closeMenu() {
        const menuToggle = document.getElementById('menu-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new VocabularyApp();
});