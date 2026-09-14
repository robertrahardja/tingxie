// Data shapes for /bible/<book>/<chapter> (see docs/BIBLE_READING.md).

export interface Verse {
  n: number
  zh: string
  /** Kid-level English, hand-written in public/data/bible/proverbs_en.json. */
  en: string
}

export interface ChapterData {
  book: string
  bookEn: string
  chapter: number
  chapters: number
  verses: Verse[]
}

/** Books we have text for; the route only accepts these. */
export const BOOKS: Record<string, { zh: string; en: string; chapters: number }> = {
  proverbs: { zh: '箴言', en: 'Proverbs', chapters: 31 },
}
