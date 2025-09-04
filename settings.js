class SettingsApp {
    constructor() {
        this.settings = this.loadSettings();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateUI();
    }

    loadSettings() {
        const defaultSettings = {
            autoplay: true,
            traditional: true,
            pinyin: true,
            vibration: false,
            darkmode: false,
            largefont: false,
            simplified: false,
            reminders: true,
            analytics: true
        };

        const saved = localStorage.getItem('tingxie-settings');
        return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    }

    saveSettings() {
        localStorage.setItem('tingxie-settings', JSON.stringify(this.settings));
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

        // Setting toggles
        document.querySelectorAll('.setting-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                this.toggleSetting(e.target);
            });
        });

        // Setting buttons
        document.querySelectorAll('.setting-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleButtonClick(e.target);
            });
        });
    }

    updateUI() {
        document.querySelectorAll('.setting-toggle').forEach(toggle => {
            const setting = toggle.dataset.setting;
            if (this.settings[setting]) {
                toggle.classList.add('active');
            } else {
                toggle.classList.remove('active');
            }
        });
    }

    toggleSetting(toggle) {
        const setting = toggle.dataset.setting;
        this.settings[setting] = !this.settings[setting];
        this.saveSettings();
        this.updateUI();
        
        // Show feedback
        this.showFeedback(`${setting} ${this.settings[setting] ? '已开启' : '已关闭'}`);
    }

    handleButtonClick(button) {
        const text = button.textContent;
        
        switch(text) {
            case '导出学习数据':
                this.exportData();
                break;
            case '重置学习进度':
                this.resetProgress();
                break;
            case '清除所有数据':
                this.clearAllData();
                break;
        }
    }

    exportData() {
        // Simulate data export
        const data = {
            settings: this.settings,
            progress: {
                completed: 12,
                total: 35,
                lastAccessed: new Date().toISOString()
            }
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tingxie-data.json';
        a.click();
        URL.revokeObjectURL(url);
        
        this.showFeedback('学习数据已导出');
    }

    resetProgress() {
        if (confirm('确定要重置学习进度吗？此操作无法撤销。')) {
            localStorage.removeItem('tingxie-progress');
            this.showFeedback('学习进度已重置');
        }
    }

    clearAllData() {
        if (confirm('确定要清除所有数据吗？包括设置和学习进度，此操作无法撤销。')) {
            localStorage.clear();
            this.settings = this.loadSettings();
            this.updateUI();
            this.showFeedback('所有数据已清除');
        }
    }

    showFeedback(message) {
        // Create temporary feedback element
        const feedback = document.createElement('div');
        feedback.className = 'feedback-toast';
        feedback.textContent = message;
        feedback.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 20px;
            border-radius: 20px;
            font-size: 14px;
            z-index: 1000;
            animation: fadeInOut 2s ease-in-out;
        `;
        
        document.body.appendChild(feedback);
        setTimeout(() => {
            document.body.removeChild(feedback);
        }, 2000);
        
        // Add CSS animation
        if (!document.querySelector('#feedback-styles')) {
            const style = document.createElement('style');
            style.id = 'feedback-styles';
            style.textContent = `
                @keyframes fadeInOut {
                    0%, 100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
                    20%, 80% { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
            `;
            document.head.appendChild(style);
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
    new SettingsApp();
});