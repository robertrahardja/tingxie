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
        SIMPLIFIED: '简单',
        TRADITIONAL: '繁体',
        PINYIN: '拼音',
        ENGLISH: 'English',
        ALL_WORDS: '全部词语',
        IMPORTANT_WORDS: '重要词语',
        IMPORTANT_BADGE: '重点'
    },

    // Data paths
    DATA_PATH: 'data/tingxie/tingxie_vocabulary.json',

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
    CURRENT_SET: 'current-set',
    TOTAL_SETS: 'total-sets',
    SIMPLIFIED: 'simplified',
    TRADITIONAL: 'traditional',
    PINYIN: 'pinyin',
    ENGLISH: 'english',
    AUDIO: 'audio'
};