// Data shapes for /bible/<book>/<chapter> (see docs/BIBLE_READING.md).

export interface Verse {
  n: number
  zh: string
  /** King James Version — a real translation, public domain. */
  kjv: string
  /**
   * A plain-English paraphrase, hand-written at P2/P3 level. NOT a translation
   * and not authoritative: the page always labels it 简单说, never as scripture.
   */
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
