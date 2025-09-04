class ProgressApp {
    constructor() {
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
}

document.addEventListener('DOMContentLoaded', () => {
    new ProgressApp();
});