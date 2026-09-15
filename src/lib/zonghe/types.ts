// Data shapes for /zonghe/<week> (see docs/ZONGHE_ANSWER_KEYS.md) and the
// small pure helpers the tabs share.

export interface Question {
  n: number
  text: string
  options?: string[]
  answer: number
  student: number | null
  unsure?: string
  alt?: number
  why: string
  en: string
  // kind "open" (written answers): answer is always 1; student 1 = her answer
  // was accepted, 2 = needs correction, null = blank.
  model?: string
  written?: string | null
  points?: number
}

export interface Group {
  label?: string
  bank?: string[]
  passage?: string[]
  passageEn?: string
  questions: Question[]
  unused?: string
}

export interface RewriteItem {
  n: number
  original: string[]
  pattern: string
  answer: string
  why: string
  en: string
}

export interface OralItem {
  title: string
  sentences: { zh: string; en: string }[]
  vocab: { w: string; py: string; en: string }[]
  // The part of the booklet picture this passage describes (e.g. a crop of 图片4).
  image?: string
  imageCaption?: string
}

export interface Section {
  id: string
  kind: 'mcq' | 'match' | 'cloze' | 'complete' | 'reading' | 'open' | 'rewrite' | 'oral'
  title: string
  points?: string
  instruction?: string
  groups?: Group[]
  items?: (RewriteItem | OralItem)[]
  // "rewrite" puts a question section (e.g. a homework cloze) under the 课后练习 tab.
  tab?: 'answers' | 'rewrite'
  // kind "oral": the whole booklet picture, shown once above the passages.
  image?: string
  imageCaption?: string
  // kind "oral": the tuition centre's own recording of the passages.
  audio?: string
  audioCaption?: string
  // kind "oral": the numbered parts of the picture; `item` names the passage
  // card a part jumps to, `current` marks the parts this week's passages cover.
  parts?: { n: number; image: string; label: string; item?: string; current?: boolean }[]
}

export const ANSWER_KINDS: Section['kind'][] = ['mcq', 'match', 'cloze', 'complete', 'reading', 'open']

export interface ZongheData {
  week: number
  title: string
  dates: string
  source: string
  student: string
  note?: string
  sections: Section[]
}

export interface WordEntry {
  n: number
  w: string
  py: string
  en: string
  c: string
}

export interface WordWeek {
  week: number
  dates: string
  kind: string
  words: WordEntry[]
}

export interface WordsData {
  title: string
  weeks: WordWeek[]
}

// The word bank types now live in lib/shared/words.ts, shared with the Bible
// pages; re-exported here so ZonghePage keeps importing one module. HAN is not
// re-exported — everything that tests it imports it from the shared module.
export type { WordBank, WordInfo } from '@/lib/shared/words'

// A paired connector like 因为……所以…… fills two blanks; otherwise fill the first.
const answerParts = (text: string, answer: string) => {
  const parts = answer.includes('……') ? answer.split('……').filter(Boolean) : [answer]
  const blanks = text.split('____').length - 1
  return parts.length > 1 && blanks >= parts.length ? parts : [answer]
}

/** The blank-filled sentence plus where the answer words sit inside it. */
export function fillWithRanges(text: string, answer: string) {
  const parts = answerParts(text, answer)
  const segs = text.split('____')
  let filled = ''
  const ranges: [number, number][] = []
  segs.forEach((seg, i) => {
    filled += seg
    if (i < segs.length - 1) {
      const p = parts[i] ?? (i === 0 ? answer : '____')
      ranges.push([filled.length, filled.length + p.length])
      filled += p
    }
  })
  return { filled, ranges }
}
