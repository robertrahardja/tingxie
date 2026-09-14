// Shared by every page that renders tappable Chinese text (/zonghe/<week>,
// /bible/<book>/<chapter>): the word bank a build script produces, and the
// test for "is this token a word rather than punctuation".

// <name>_words.json (scripts/build_*_words.py): every text on the page split
// into words, plus pinyin + meaning for every word.
export interface WordBank {
  seg: Record<string, string[]>
  dict: Record<string, { py: string; en: string }>
}

/** A hand-written gloss that wins over the word bank for one tap. */
export interface WordInfo {
  py?: string
  en?: string
}

export const HAN = /[一-鿿]/
