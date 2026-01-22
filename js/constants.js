// Constants for the application
export const CONSTANTS = {
    // Breakpoints
    MOBILE_BREAKPOINT: 768,
    SCROLL_HIDE_THRESHOLD: 60,

    // Animation delays
    SET_COMPLETE_DELAY: 500,
    TOUCH_FEEDBACK_DELAY: 100,

    // UI Text labels
    UI_LABELS: {
        SIMPLIFIED: '简体',
        TRADITIONAL: '繁体',
        PINYIN: '拼音',
        ENGLISH: 'English',
        ALL_WORDS: '全部词语',
        IMPORTANT_WORDS: '重要词语',
        IMPORTANT_BADGE: '重点',
        SELF_ASSESS_TITLE: '你会这个词吗？',
        KNOW_BTN: '会 ✓',
        DONT_KNOW_BTN: '不会 ✗',
        REVIEW_MODE: '复习模式',
        ALL_MODE: '全部模式'
    },

    // Data paths
    DATA_PATH: 'data/tingxie/tingxie_vocabulary.json',

    // Vocabulary row configuration
    // IMPORTANT: Update these values when adding new word sets
    // To add new words:
    // 1. Add new row to tingxie_vocabulary.json with incrementing row number
    // 2. Update LATEST_ROW_NUMBER to point to the new row
    VOCABULARY: {
        LATEST_ROW_NUMBER: 77,  // Current "latest words" set - update when adding new words
        REVIEW_MODE_NAME: 'UNKNOWN_WORDS'  // Filter mode for review
    },

    // Error messages
    ERRORS: {
        DATA_LOAD: '无法加载词汇数据，请刷新页面重试',
        AUDIO_PLAYBACK: 'Audio playback failed:'
    }
};

// CSS Classes
export const CSS_CLASSES = {
    ACTIVE: 'active',
    COVERED: 'covered',
    IMPORTANT: 'important',
    HIDE_ON_SCROLL: 'hide-on-scroll',
    VOCAB_CARD: 'vocab-card',
    IMPORTANT_BADGE: 'important-badge'
};

// Element IDs
export const ELEMENT_IDS = {
    MENU_TOGGLE: 'menu-toggle',
    NAV_MENU: 'nav-menu',
    FILTER_TOGGLE: 'filter-toggle',
    VOCAB_GRID: 'vocab-grid',
    PREV_BTN: 'prev-btn',
    NEXT_BTN: 'next-btn',
    NEXT_SET_BTN: 'next-set-btn',
    SET_COMPLETE: 'set-complete',
    SELF_ASSESS: 'self-assess',
    KNOW_BTN: 'know-btn',
    DONT_KNOW_BTN: 'dont-know-btn',
    REVIEW_TOGGLE: 'review-toggle',
    HANDWRITING_BTN: 'handwriting-btn',
    CURRENT_SET: 'current-set',
    TOTAL_SETS: 'total-sets',
    SIMPLIFIED: 'simplified',
    TRADITIONAL: 'traditional',
    PINYIN: 'pinyin',
    ENGLISH: 'english',
    AUDIO: 'audio'
};