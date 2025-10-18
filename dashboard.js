import { BaseApp } from './js/BaseApp.js';
import { CloudSync } from './js/CloudSync.js';
import { CONSTANTS } from './js/constants.js';

class DashboardApp extends BaseApp {
    constructor() {
        super();
        this.cloudSync = new CloudSync();
        this.vocabularyData = null;
        this.init();
    }

    async init() {
        // Setup base event listeners (menu, etc)
        this.setupBaseEventListeners();

        // Load vocabulary data to map word IDs to actual words
        await this.loadVocabularyData();

        // Load and display progress
        await this.loadProgress();

        // Setup refresh button
        this.setupRefreshButton();

        // Auto-refresh every 30 seconds
        setInterval(() => this.loadProgress(), 30000);
    }

    async loadVocabularyData() {
        try {
            const response = await fetch(CONSTANTS.DATA_PATH);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.vocabularyData = this.buildVocabularyMap(data);
        } catch (error) {
            console.error('Failed to load vocabulary data:', error);
        }
    }

    buildVocabularyMap(data) {
        const map = new Map();

        if (data?.vocabulary) {
            data.vocabulary.forEach(row => {
                row.words.forEach(word => {
                    const wordId = `${word.simplified}_${word.traditional}`;
                    map.set(wordId, word);
                });
            });
        }

        return map;
    }

    async loadProgress() {
        const loading = document.getElementById('loading');
        const errorContainer = document.getElementById('error-container');
        const content = document.getElementById('dashboard-content');

        try {
            // Show loading
            loading.style.display = 'block';
            errorContainer.style.display = 'none';

            // Fetch progress from cloud ONLY (no localStorage fallback)
            let progress = await this.cloudSync.fetchProgress();

            // If no progress found, show empty state
            if (!progress || (!progress.knownWords && !progress.unknownWords)) {
                progress = {
                    knownWords: new Set(),
                    unknownWords: new Set(),
                    lastUpdated: null
                };
            }

            // Hide loading, show content
            loading.style.display = 'none';
            content.style.display = 'block';

            // Display statistics
            this.displayStatistics(progress);

            // Display word lists
            this.displayWordLists(progress);

            // Update last updated time
            this.updateLastUpdated(progress.lastUpdated);

        } catch (error) {
            console.error('Failed to load progress:', error);
            loading.style.display = 'none';
            errorContainer.style.display = 'block';
            errorContainer.innerHTML = `
                <div class="error-message">
                    无法连接到服务器。请确保：<br>
                    1. 网络连接正常<br>
                    2. 孩子已经开始使用听写练习<br>
                    3. 已经标记了一些词语（会/不会）<br>
                    <br>
                    Unable to connect to server. Please ensure:<br>
                    1. Internet connection is working<br>
                    2. Your child has started using the Tingxie app<br>
                    3. Some words have been marked (会/不会)
                </div>
            `;
        }
    }

    displayStatistics(progress) {
        const knownCount = progress.knownWords.size;
        const unknownCount = progress.unknownWords.size;
        const totalVocab = this.vocabularyData ? this.vocabularyData.size : 0;
        const practicedCount = knownCount + unknownCount;

        // Calculate percentage
        const percentage = totalVocab > 0
            ? Math.round((knownCount / totalVocab) * 100)
            : 0;

        // Update stats
        document.getElementById('known-count').textContent = knownCount;
        document.getElementById('unknown-count').textContent = unknownCount;
        document.getElementById('progress-percentage').textContent = `${percentage}%`;
        document.getElementById('practiced-count').textContent = practicedCount;
        document.getElementById('total-count').textContent = totalVocab;

        // Update progress bar
        const progressBar = document.getElementById('progress-bar');
        progressBar.style.width = `${percentage}%`;
    }

    displayWordLists(progress) {
        this.displayKnownWords(progress.knownWords);
        this.displayUnknownWords(progress.unknownWords);
    }

    displayKnownWords(knownWords) {
        const container = document.getElementById('known-words-grid');

        if (knownWords.size === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📚</div>
                    <p>还没有掌握的词语<br>No mastered words yet</p>
                </div>
            `;
            return;
        }

        const words = Array.from(knownWords)
            .map(wordId => this.vocabularyData.get(wordId))
            .filter(word => word !== undefined)
            .sort((a, b) => a.simplified.localeCompare(b.simplified, 'zh-CN'));

        container.innerHTML = words.map(word => `
            <div class="word-chip known" title="${word.pinyin} - ${word.english}">
                ${word.traditional}
            </div>
        `).join('');
    }

    displayUnknownWords(unknownWords) {
        const container = document.getElementById('unknown-words-grid');

        if (unknownWords.size === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🎉</div>
                    <p>太棒了！没有需要复习的词语<br>Great! No words need review</p>
                </div>
            `;
            return;
        }

        const words = Array.from(unknownWords)
            .map(wordId => this.vocabularyData.get(wordId))
            .filter(word => word !== undefined)
            .sort((a, b) => a.simplified.localeCompare(b.simplified, 'zh-CN'));

        container.innerHTML = words.map(word => `
            <div class="word-chip unknown" title="${word.pinyin} - ${word.english}">
                ${word.traditional}
            </div>
        `).join('');
    }

    updateLastUpdated(timestamp) {
        const lastUpdatedEl = document.getElementById('last-updated');

        if (timestamp) {
            const date = new Date(timestamp);
            const formattedDate = date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
            lastUpdatedEl.textContent = `最后更新 Last Updated: ${formattedDate}`;
        } else {
            lastUpdatedEl.textContent = '';
        }
    }

    setupRefreshButton() {
        const refreshBtn = document.getElementById('refresh-btn');

        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                refreshBtn.disabled = true;
                refreshBtn.textContent = '⏳ 正在刷新... Refreshing...';

                await this.loadProgress();

                refreshBtn.disabled = false;
                refreshBtn.textContent = '🔄 刷新数据 Refresh';
            });
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardApp = new DashboardApp();
});

// Viewport height fix for mobile browsers
function setViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setViewportHeight();
window.addEventListener('resize', setViewportHeight);
window.addEventListener('orientationchange', setViewportHeight);
