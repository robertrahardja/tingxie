// Data shapes for /keben/<lesson>: one 活动本 lesson as a study page.
// See docs/KEBEN_ANSWER_KEYS.md.

/** 一、连一连，写一写 — write the missing half of the pinyin. */
export interface PinyinItem {
  n: number
  word: string
  full: string
  given: string
  answer: string
  en: string
  picture: string
}

/** 二、找词语 — a clue, and the word to circle in the honeycomb. */
export interface RiddleItem {
  n: number
  clue: string
  hint: string
  answer: string
  py: string
  en: string
  why: string
}

/** 三、错字小侦探 — one wrong character per sentence. */
export interface ErrorItem {
  n: number
  sentence: string
  wrong: string
  right: string
  py: string
  correct: string
  why: string
  en: string
}

/** 四、写一写，排一排 — fill the characters, then order the story. */
export interface OrderItem {
  order: number
  given?: boolean
  text: string
  blanks: { py: string; zi: string }[]
  en: string
}

/** 六、找一找，涂一涂 — the pinyin blocks to colour, and the decoys. */
export interface ColourItem {
  n?: number
  w: string
  py: string
  en: string
}

/** 八、可以倒过来的词语. */
export interface TableRow {
  n: number
  given?: boolean
  /** Rows 5-6 are the child's own answers, not printed in the book. */
  mine?: boolean
  a: string
  aMean: string
  aPy: string
  b: string
  bMean: string
  bPy: string
  same: boolean
}

export interface ReadingQuestion {
  n: number
  q: string
  type: 'open' | 'tf' | 'flow'
  answer?: string
  en?: string
  sub?: { n: string; zh: string; answer: boolean; why: string }[]
  steps?: { blank: string; text: string; full: string; extra?: string[] }[]
}

export interface Section {
  id: string
  kind: 'pinyin' | 'riddle' | 'error' | 'order' | 'reading' | 'colour' | 'song' | 'table'
  title: string
  page: string | number
  instruction?: string

  // kind "pinyin" | "riddle" | "error" | "order" | "colour" | "table"
  items?: (PinyinItem | RiddleItem | ErrorItem | OrderItem | ColourItem)[]

  // kind "riddle"
  grid?: string[]
  gridNote?: string

  // kind "order"
  orderNote?: string

  // kind "reading"
  passage?: string[]
  passageEn?: string
  key?: { title: string; rows: { who: string; zh: string; en: string }[]; note: string }
  questions?: ReadingQuestion[]

  // kind "colour"
  distractors?: ColourItem[]
  result?: string
  resultNote?: string

  // kind "song"
  verses?: string[][]
  patterns?: { label: string; given: string; answers: string[]; note?: string }[]
  question?: { q: string; answer: string; en: string }

  // kind "table"
  columns?: string[]
  rows?: TableRow[]
  more?: { a: string; b: string; same: boolean; note: string }[]
}

export interface KebenData {
  lesson: number
  title: string
  book: string
  pages: string
  source: string
  student: string
  note?: string
  sections: Section[]
  revise: { w: string; py: string; en: string }[]
}
