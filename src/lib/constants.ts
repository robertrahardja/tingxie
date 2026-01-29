// Constants for the application
export const CONSTANTS = {
  // Breakpoints
  MOBILE_BREAKPOINT: 768,
  SCROLL_HIDE_THRESHOLD: 60,

  // Animation delays
  SET_COMPLETE_DELAY: 500,
  TOUCH_FEEDBACK_DELAY: 100,

  // Audio
  AUDIO_PRELOAD_COUNT: 5,

  // Cache
  CACHE_VERSION: 'v2',
  CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours

  // Data paths
  DATA_PATH: '/data/tingxie/tingxie_vocabulary.json',
  API_VOCABULARY_PATH: '/api/vocabulary',
  API_PROGRESS_PATH: '/api/progress',

  // Vocabulary row configuration
  // IMPORTANT: Update these values when adding new word sets
  VOCABULARY: {
    LATEST_ROW_NUMBER: 77, // Current "latest words" set - update when adding new words
    REVIEW_MODE_NAME: 'UNKNOWN_WORDS' as const,
  },

  // Retry configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    INITIAL_DELAY: 1000, // 1 second
  },
} as const

// UI Text labels (Chinese)
export const UI_LABELS = {
  // Word fields
  SIMPLIFIED: '简体',
  TRADITIONAL: '繁体',
  PINYIN: '拼音',
  ENGLISH: 'English',

  // Filter buttons
  ALL_WORDS: '全部词语',
  IMPORTANT_WORDS: '重要词语',
  LATEST_WORDS: '最新15词',

  // Assessment
  SELF_ASSESS_TITLE: '你会这个词吗？',
  KNOW_BTN: '会 ✓',
  DONT_KNOW_BTN: '不会 ✗',

  // Navigation
  PREV_BTN: '上一个',
  NEXT_BTN: '下一个',

  // Modes
  REVIEW_MODE: '复习模式',
  ALL_MODE: '全部模式',

  // Badges
  IMPORTANT_BADGE: '重点',

  // Handwriting
  HANDWRITING_BTN: '笔画练习',
  HANDWRITING_HINT: '显示提示',
  HANDWRITING_RESET: '重置',
  PREV_CHAR: '← 上一个字',
  NEXT_CHAR: '下一个字 →',

  // Status messages
  STROKE_CORRECT: '正确！',
  STROKE_TRY_AGAIN: '再试一次！',
  PERFECT: '完美！没有错误！',
  COMPLETE_WITH_MISTAKES: '完成！{0} 个错误',
} as const

// Error messages
export const ERRORS = {
  DATA_LOAD: '无法加载词汇数据，请刷新页面重试',
  AUDIO_PLAYBACK: 'Audio playback failed:',
  PROGRESS_SAVE: '无法保存进度',
  NETWORK: '网络错误，请检查连接',
} as const

// Navigation items
export interface NavItem {
  href: string
  label: string
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: '最新词语' },
  { href: '/school-tingxie', label: '学校听写' },
  { href: '/review', label: '复习词语' },
  { href: '/vocabulary', label: '词汇浏览' },
  { href: '/phrase-matching', label: '词语搭配' },
  { href: '/handwriting', label: '笔画练习' },
  { href: '/radicals', label: '部首学习' },
  { href: '/family', label: '家庭称呼' },
  { href: '/instructions', label: '指示词汇' },
  { href: '/p3hcl-reading-sync', label: '阅读练习' },
  { href: '/p3hcl-wupin-interactive', label: '互动阅读' },
  { href: '/koushi-family-cohesion', label: '口试练习' },
  { href: '/dashboard', label: '家长看板' },
  { href: '/settings', label: '设置' },
]

// Local storage keys
export const STORAGE_KEYS = {
  STUDENT_ID: 'tingxie_student_id',
  VOCABULARY_CACHE: 'vocabulary_cache_v2',
  VOCABULARY_CACHE_TIMESTAMP: 'vocabulary_cache_timestamp_v2',
  SETTINGS: 'tingxie_settings',
} as const
