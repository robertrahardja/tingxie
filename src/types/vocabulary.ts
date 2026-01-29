export interface Word {
  simplified: string
  traditional: string
  pinyin: string
  english: string
  audio: string
  important: boolean
}

export interface VocabularyRow {
  row: number
  words: Word[]
}

export interface VocabularyData {
  title: string
  lesson: string
  vocabulary: VocabularyRow[]
}

export type WordField = 'simplified' | 'traditional' | 'pinyin' | 'english'

export interface RevealState {
  simplified: boolean
  traditional: boolean
  pinyin: boolean
  english: boolean
  audio: boolean
}

export const DEFAULT_REVEAL_STATE: RevealState = {
  simplified: false,
  traditional: false,
  pinyin: false,
  english: false,
  audio: false,
}

// School vocabulary types
export interface SchoolWord {
  simplified: string
  traditional: string
  pinyin: string
  meaning: string
}

export interface SchoolVocabularyItem {
  type: 'pinyin' | 'sentence' | 'moxie'
  pinyin: string
  english: string
  audio: string
  words: SchoolWord[]
  // For pinyin type
  characters?: string
  // For sentence type
  sentence?: string
  keyword?: string
  difficult?: boolean
  // For moxie type
  label?: string
  note?: string
}

export interface SchoolVocabularyRow {
  row: number
  title: string
  items: SchoolVocabularyItem[]
}

export interface SchoolVocabularyData {
  title: string
  lesson: string
  vocabulary: SchoolVocabularyRow[]
}
