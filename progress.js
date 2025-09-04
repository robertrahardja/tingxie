class ProgressApp {
    constructor() {
        this.lastScrollY = 0;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.animateProgress();
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

        // Scroll event for hiding menu
        this.setupScrollListener();
    }

    animateProgress() {
        // Animate the circular progress
        const progressFill = document.querySelector('.progress-fill');
        const progress = 34; // 34% completion
        const circumference = 314; // 2 * π * 50
        const offset = circumference - (progress / 100) * circumference;
        
        setTimeout(() => {
            progressFill.style.strokeDashoffset = offset;
        }, 500);

        // Animate the weekly bar chart
        const dayFills = document.querySelectorAll('.day-fill');
        dayFills.forEach((fill, index) => {
            setTimeout(() => {
                fill.style.transition = 'height 0.8s ease';
            }, 800 + index * 100);
        });
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

    setupScrollListener() {
        let ticking = false;
        
        const updateNavbar = () => {
            const currentScrollY = window.scrollY;
            const navbar = document.querySelector('.main-nav');
            
            // Only hide on mobile devices (screen width < 768px)
            if (window.innerWidth < 768) {
                if (currentScrollY > this.lastScrollY && currentScrollY > 60) {
                    // Scrolling down & past threshold
                    navbar.classList.add('hide-on-scroll');
                } else {
                    // Scrolling up or at top
                    navbar.classList.remove('hide-on-scroll');
                }
            } else {
                // Always show on desktop/tablet
                navbar.classList.remove('hide-on-scroll');
            }
            
            this.lastScrollY = currentScrollY;
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateNavbar);
                ticking = true;
            }
        });

        // Also handle window resize
        window.addEventListener('resize', () => {
            const navbar = document.querySelector('.main-nav');
            if (window.innerWidth >= 768) {
                navbar.classList.remove('hide-on-scroll');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ProgressApp();
});