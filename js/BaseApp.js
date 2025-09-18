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
            const response = await fetch(CONSTANTS.DATA_PATH);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.data = await response.json();
            return true;
        } catch (error) {
            console.error(CONSTANTS.ERRORS.DATA_LOAD, error);
            this.handleDataLoadError(error);
            return false;
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
            filterBtn.textContent = CONSTANTS.UI_LABELS.IMPORTANT_WORDS;
            filterBtn.classList.add(CSS_CLASSES.ACTIVE);
        } else {
            filterBtn.textContent = CONSTANTS.UI_LABELS.ALL_WORDS;
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