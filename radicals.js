import { CSS_CLASSES, ELEMENT_IDS } from './js/constants.js';
import { getAudioPlayer } from './js/AudioPlayer.js';

class RadicalsApp {
    constructor() {
        this.data = null;
        this.filteredRadicals = [];
        this.currentStrokeFilter = 'all';
        this.searchQuery = '';
        this.audioPlayer = getAudioPlayer();
        this.lastScrollY = 0;
    }

    async init() {
        const loaded = await this.loadData();
        if (loaded) {
            this.setupEventListeners();
            this.filterAndRender();
        }
    }

    async loadData() {
        try {
            const response = await fetch('/data/radicals/radicals.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.data = await response.json();
            return true;
        } catch (error) {
            console.error('Failed to load radicals data:', error);
            this.showError('无法加载部首数据，请刷新页面重试');
            return false;
        }
    }

    showError(message) {
        const grid = document.getElementById('radicals-grid');
        if (grid) {
            grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: white; padding: 40px;">${message}</div>`;
        }
    }

    setupEventListeners() {
        this.setupMenuListeners();
        this.setupScrollListener();
        this.setupSearchListener();
        this.setupStrokeFilters();
    }

    setupMenuListeners() {
        const menuToggle = document.getElementById(ELEMENT_IDS.MENU_TOGGLE);
        const navMenu = document.getElementById(ELEMENT_IDS.NAV_MENU);

        if (!menuToggle || !navMenu) return;

        menuToggle.addEventListener('click', () => this.toggleMenu());

        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => this.closeMenu());
        });

        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        const menuToggle = document.getElementById(ELEMENT_IDS.MENU_TOGGLE);
        const navMenu = document.getElementById(ELEMENT_IDS.NAV_MENU);

        if (!menuToggle || !navMenu) return;

        menuToggle.classList.toggle(CSS_CLASSES.ACTIVE);
        navMenu.classList.toggle(CSS_CLASSES.ACTIVE);
    }

    closeMenu() {
        const menuToggle = document.getElementById(ELEMENT_IDS.MENU_TOGGLE);
        const navMenu = document.getElementById(ELEMENT_IDS.NAV_MENU);

        if (!menuToggle || !navMenu) return;

        menuToggle.classList.remove(CSS_CLASSES.ACTIVE);
        navMenu.classList.remove(CSS_CLASSES.ACTIVE);
    }

    setupScrollListener() {
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.updateNavbar();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    updateNavbar() {
        const currentScrollY = window.scrollY;
        const navbar = document.querySelector('.main-nav');

        if (!navbar) return;

        if (window.innerWidth < 768) {
            if (currentScrollY > this.lastScrollY && currentScrollY > 60) {
                navbar.classList.add(CSS_CLASSES.HIDE_ON_SCROLL);
            } else {
                navbar.classList.remove(CSS_CLASSES.HIDE_ON_SCROLL);
            }
        } else {
            navbar.classList.remove(CSS_CLASSES.HIDE_ON_SCROLL);
        }

        this.lastScrollY = currentScrollY;
    }

    setupSearchListener() {
        const searchInput = document.getElementById('search-input');
        if (!searchInput) return;

        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                this.searchQuery = e.target.value.toLowerCase().trim();
                this.filterAndRender();
            }, 200);
        });
    }

    setupStrokeFilters() {
        const filtersContainer = document.getElementById('stroke-filters');
        if (!filtersContainer) return;

        filtersContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.stroke-btn');
            if (!btn) return;

            // Update active state
            filtersContainer.querySelectorAll('.stroke-btn').forEach(b => {
                b.classList.remove('active');
            });
            btn.classList.add('active');

            // Update filter
            this.currentStrokeFilter = btn.dataset.strokes;
            this.filterAndRender();
        });
    }

    filterAndRender() {
        if (!this.data || !this.data.radicals) return;

        let filtered = this.data.radicals;

        // Apply stroke filter
        if (this.currentStrokeFilter !== 'all') {
            if (this.currentStrokeFilter === '8+') {
                filtered = filtered.filter(r => r.strokes >= 8);
            } else {
                const strokeCount = parseInt(this.currentStrokeFilter);
                filtered = filtered.filter(r => r.strokes === strokeCount);
            }
        }

        // Apply search filter
        if (this.searchQuery) {
            filtered = filtered.filter(r => {
                return r.radical.includes(this.searchQuery) ||
                       r.pinyin.toLowerCase().includes(this.searchQuery) ||
                       r.meaning.toLowerCase().includes(this.searchQuery) ||
                       r.examples.some(ex => ex.includes(this.searchQuery));
            });
        }

        this.filteredRadicals = filtered;
        this.render();
        this.updateStats();
    }

    updateStats() {
        const showingEl = document.getElementById('showing-count');
        const totalEl = document.getElementById('total-count');

        if (showingEl) {
            showingEl.textContent = `显示: ${this.filteredRadicals.length} 个部首`;
        }
        if (totalEl && this.data) {
            totalEl.textContent = `共 ${this.data.radicals.length} 个`;
        }
    }

    render() {
        const grid = document.getElementById('radicals-grid');
        if (!grid) return;

        if (this.filteredRadicals.length === 0) {
            grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: white; padding: 40px;">没有找到匹配的部首</div>`;
            return;
        }

        const fragment = document.createDocumentFragment();

        this.filteredRadicals.forEach(radical => {
            const card = this.createRadicalCard(radical);
            fragment.appendChild(card);
        });

        grid.innerHTML = '';
        grid.appendChild(fragment);

        // Setup audio buttons
        this.setupAudioButtons();

        // Preload audio for visible radicals
        this.preloadVisibleAudio();
    }

    createRadicalCard(radical) {
        const card = document.createElement('div');
        card.className = 'radical-card';
        card.dataset.audio = radical.audio;

        const examplesHtml = radical.examples
            .map(ex => `<span class="example-char">${ex}</span>`)
            .join('');

        card.innerHTML = `
            <div class="radical-header">
                <span class="radical-character">${radical.radical}</span>
                <span class="radical-number">#${radical.number}</span>
            </div>
            <div class="radical-pinyin">${radical.pinyin}</div>
            <div class="radical-meaning">${radical.meaning}</div>
            <div class="radical-strokes">${radical.strokes} 画</div>
            <div class="radical-examples">
                ${examplesHtml}
            </div>
            <button class="radical-audio" data-audio="${radical.audio}">
                🔊
            </button>
        `;

        // Make whole card clickable for audio
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.radical-audio')) {
                this.playAudio(radical.audio);
            }
        });

        return card;
    }

    setupAudioButtons() {
        document.querySelectorAll('.radical-audio').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const audioPath = btn.dataset.audio;
                this.playAudio(audioPath);
            });
        });
    }

    async playAudio(audioPath) {
        if (!audioPath) return;
        await this.audioPlayer.play(audioPath);
    }

    preloadVisibleAudio() {
        // Preload first few radicals' audio
        const audioPaths = this.filteredRadicals
            .slice(0, 10)
            .map(r => r.audio)
            .filter(Boolean);

        this.audioPlayer.preload(audioPaths);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new RadicalsApp();
    app.init();
});
