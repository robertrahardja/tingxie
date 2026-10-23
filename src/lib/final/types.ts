// /p3-final: the P3 HCL year-end revision page. Data comes from the school's
// 随堂笔记, 句子变变变 table and revision worksheets, in
// public/data/p3hcl/final/ (see docs/P3_FINAL_REVIEW.md).

export interface VocabExtra {
  label: string
  text: string
}

export interface VocabWord {
  n: number
  part?: string
  word: string
  pinyin: string
  english: string
  star?: boolean
  sub?: boolean
  uncertain?: boolean
  extras?: VocabExtra[]
  example?: string | null
}

export interface VocabLesson {
  lesson: number
  title: string
  source?: string
  words: VocabWord[]
}

export interface VocabData {
  lessons: VocabLesson[]
}

export interface PatternItem {
  prompt: string
  student?: string | null
  model: string
  ok?: boolean | null
  /** extra drill item written for the app, not from the school's table */
  practice?: boolean
}

export interface Pattern {
  lesson: number
  page?: string
  pattern: string
  instruction?: string
  items: PatternItem[]
}

export interface SentencesData {
  patterns: Pattern[]
}

export interface QuizItem {
  n: number
  stem?: string
  prompt?: string
  options?: string[]
  answer?: number
  student?: number | string | null
  explanation?: string
  model?: string
}

export interface QuizSection {
  title: string
  instructions?: string
  kind: 'mcq' | 'open'
  passage?: string | string[]
  items: QuizItem[]
}

export interface QuizSet {
  id: string
  title: string
  source?: string
  sections: QuizSection[]
}

export interface QuestionsData {
  sets: QuizSet[]
}

/** Stable key for a word across sessions (the 不会 list lives in localStorage). */
export const wordKey = (lesson: number, w: VocabWord) => `${lesson}:${w.word}`
