import { CONSTANTS, CSS_CLASSES, ELEMENT_IDS } from './constants.js';

// Base class with shared functionality
export class BaseApp {
    constructor() {
        this.data = null;
        this.showImportantOnly = false;
        this.lastScrollY = 0;
        this.scrollManager = null;
    }

    async loadData() {
        try {
            // Try to load from localStorage cache first
            const CACHE_VERSION = 'v2'; // Increment this to bust cache
            const cacheKey = `vocabulary_cache_${CACHE_VERSION}`;
            const cacheTimestampKey = `vocabulary_cache_timestamp_${CACHE_VERSION}`;

            const cachedData = localStorage.getItem(cacheKey);
            const cacheTimestamp = localStorage.getItem(cacheTimestampKey);
            const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

            // Use cache if it's fresh
            if (cachedData && cacheTimestamp) {
                const age = Date.now() - parseInt(cacheTimestamp);
                if (age < CACHE_DURATION) {
                    console.log('Using cached vocabulary data');
                    this.data = JSON.parse(cachedData);
                    // Fetch new data in background to update cache
                    this.refreshCacheInBackground();
                    return true;
                }
            }

            // Fetch from API
            const response = await fetch('/api/vocabulary');
            if (!response.ok) {
                // If API fails and we have cache, use it
                if (cachedData) {
                    console.log('API failed, using stale cache');
                    this.data = JSON.parse(cachedData);
                    return true;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.data = await response.json();

            // Update cache with versioned keys
            localStorage.setItem(cacheKey, JSON.stringify(this.data));
            localStorage.setItem(cacheTimestampKey, Date.now().toString());

            return true;
        } catch (error) {
            console.error(CONSTANTS.ERRORS.DATA_LOAD, error);

            // Final fallback: try cached data even if stale (check both versioned and old keys)
            const CACHE_VERSION = 'v2';
            const cacheKey = `vocabulary_cache_${CACHE_VERSION}`;
            let cachedData = localStorage.getItem(cacheKey);

            // Also check old cache key as fallback
            if (!cachedData) {
                cachedData = localStorage.getItem('vocabulary_cache');
            }

            if (cachedData) {
                console.log('Using stale cache as fallback');
                this.data = JSON.parse(cachedData);
                return true;
            }

            this.handleDataLoadError(error);
            return false;
        }
    }

    async refreshCacheInBackground() {
        try {
            const CACHE_VERSION = 'v2';
            const cacheKey = `vocabulary_cache_${CACHE_VERSION}`;
            const cacheTimestampKey = `vocabulary_cache_timestamp_${CACHE_VERSION}`;

            const response = await fetch('/api/vocabulary');
            if (response.ok) {
                const newData = await response.json();
                localStorage.setItem(cacheKey, JSON.stringify(newData));
                localStorage.setItem(cacheTimestampKey, Date.now().toString());
                console.log('Cache refreshed in background');
            }
        } catch (error) {
            // Silent fail - we're already using cache
            console.log('Background cache refresh failed');
        }
    }

    handleDataLoadError(error) {
        // Override in subclasses for specific error handling
        alert(CONSTANTS.ERRORS.DATA_LOAD);
    }

    setupBaseEventListeners() {
        this.setupMenuListeners();
        this.setupFilterListener();
        this.setupScrollListener();
    }

    setupMenuListeners() {
        const menuToggle = document.getElementById(ELEMENT_IDS.MENU_TOGGLE);
        const navMenu = document.getElementById(ELEMENT_IDS.NAV_MENU);

        if (!menuToggle || !navMenu) return;

        // Menu toggle
        menuToggle.addEventListener('click', () => this.toggleMenu());

        // Close menu when clicking nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => this.closeMenu());
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                this.closeMenu();
            }
        });
    }

    setupFilterListener() {
        const filterToggle = document.getElementById(ELEMENT_IDS.FILTER_TOGGLE);
        if (!filterToggle) return;

        filterToggle.addEventListener('click', () => this.toggleFilter());
    }

    toggleFilter() {
        this.showImportantOnly = !this.showImportantOnly;
        const filterBtn = document.getElementById(ELEMENT_IDS.FILTER_TOGGLE);

        if (!filterBtn) return;

        if (this.showImportantOnly) {
            // Currently showing important words only, button should say "全部词语" (click to see all)
            filterBtn.textContent = CONSTANTS.UI_LABELS.ALL_WORDS;
            filterBtn.classList.add(CSS_CLASSES.ACTIVE);
        } else {
            // Currently showing all words, button should say "重要词语" (click to see important)
            filterBtn.textContent = CONSTANTS.UI_LABELS.IMPORTANT_WORDS;
            filterBtn.classList.remove(CSS_CLASSES.ACTIVE);
        }

        this.onFilterChange();
    }

    onFilterChange() {
        // Override in subclasses
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
        if (this.scrollManager) {
            this.scrollManager.destroy();
        }

        this.scrollManager = new ScrollManager(
            CONSTANTS.MOBILE_BREAKPOINT,
            CONSTANTS.SCROLL_HIDE_THRESHOLD
        );
    }

    destroy() {
        if (this.scrollManager) {
            this.scrollManager.destroy();
        }
    }
}

// Scroll Manager as a separate concern
class ScrollManager {
    constructor(mobileBreakpoint = 768, scrollThreshold = 60) {
        this.mobileBreakpoint = mobileBreakpoint;
        this.scrollThreshold = scrollThreshold;
        this.lastScrollY = 0;
        this.ticking = false;

        this.handleScroll = this.handleScroll.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.updateNavbar = this.updateNavbar.bind(this);

        this.init();
    }

    init() {
        window.addEventListener('scroll', this.handleScroll, { passive: true });
        window.addEventListener('resize', this.handleResize);
    }

    handleScroll() {
        if (!this.ticking) {
            requestAnimationFrame(this.updateNavbar);
            this.ticking = true;
        }
    }

    handleResize() {
        const navbar = document.querySelector('.main-nav');
        if (!navbar) return;

        if (window.innerWidth >= this.mobileBreakpoint) {
            navbar.classList.remove(CSS_CLASSES.HIDE_ON_SCROLL);
        }
    }

    updateNavbar() {
        const currentScrollY = window.scrollY;
        const navbar = document.querySelector('.main-nav');

        if (!navbar) {
            this.ticking = false;
            return;
        }

        // Only hide on mobile devices
        if (window.innerWidth < this.mobileBreakpoint) {
            if (currentScrollY > this.lastScrollY && currentScrollY > this.scrollThreshold) {
                navbar.classList.add(CSS_CLASSES.HIDE_ON_SCROLL);
            } else {
                navbar.classList.remove(CSS_CLASSES.HIDE_ON_SCROLL);
            }
        } else {
            navbar.classList.remove(CSS_CLASSES.HIDE_ON_SCROLL);
        }

        this.lastScrollY = currentScrollY;
        this.ticking = false;
    }

    destroy() {
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
    }
}