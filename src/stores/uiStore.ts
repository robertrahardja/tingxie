import { Store } from '@tanstack/store'
import type { RevealState, Word } from '@/types/vocabulary'
import { DEFAULT_REVEAL_STATE } from '@/types/vocabulary'

export interface UIState {
  // Menu state
  menuOpen: boolean

  // Filter states
  showImportantOnly: boolean
  showLatestOnly: boolean

  // Word navigation
  currentWordIndex: number
  revealState: RevealState

  // Handwriting practice
  handwritingVisible: boolean
  currentCharacterIndex: number

  // Progress tracking
  knownWords: Set<string>
  unknownWords: Set<string>
}

const DEFAULT_UI_STATE: UIState = {
  menuOpen: false,
  showImportantOnly: false,
  showLatestOnly: true,
  currentWordIndex: 0,
  revealState: { ...DEFAULT_REVEAL_STATE },
  handwritingVisible: false,
  currentCharacterIndex: 0,
  knownWords: new Set(),
  unknownWords: new Set(),
}

export const uiStore = new Store<UIState>(DEFAULT_UI_STATE)

// Actions
export function toggleMenu() {
  uiStore.setState((state) => ({
    ...state,
    menuOpen: !state.menuOpen,
  }))
}

export function closeMenu() {
  uiStore.setState((state) => ({
    ...state,
    menuOpen: false,
  }))
}

export function toggleImportantFilter() {
  uiStore.setState((state) => ({
    ...state,
    showImportantOnly: !state.showImportantOnly,
    currentWordIndex: 0, // Reset to first word when filter changes
    revealState: { ...DEFAULT_REVEAL_STATE },
  }))
}

export function toggleLatestFilter() {
  uiStore.setState((state) => ({
    ...state,
    showLatestOnly: !state.showLatestOnly,
    currentWordIndex: 0,
    revealState: { ...DEFAULT_REVEAL_STATE },
  }))
}

export function setCurrentWordIndex(index: number) {
  uiStore.setState((state) => ({
    ...state,
    currentWordIndex: index,
    revealState: { ...DEFAULT_REVEAL_STATE },
    handwritingVisible: false,
    currentCharacterIndex: 0,
  }))
}

export function goToNextWord(maxIndex: number) {
  uiStore.setState((state) => {
    if (state.currentWordIndex < maxIndex - 1) {
      return {
        ...state,
        currentWordIndex: state.currentWordIndex + 1,
        revealState: { ...DEFAULT_REVEAL_STATE },
        handwritingVisible: false,
        currentCharacterIndex: 0,
      }
    }
    return state
  })
}

export function goToPrevWord() {
  uiStore.setState((state) => {
    if (state.currentWordIndex > 0) {
      return {
        ...state,
        currentWordIndex: state.currentWordIndex - 1,
        revealState: { ...DEFAULT_REVEAL_STATE },
        handwritingVisible: false,
        currentCharacterIndex: 0,
      }
    }
    return state
  })
}

export function toggleReveal(field: keyof RevealState) {
  uiStore.setState((state) => ({
    ...state,
    revealState: {
      ...state.revealState,
      [field]: !state.revealState[field],
    },
  }))
}

export function revealField(field: keyof RevealState) {
  uiStore.setState((state) => ({
    ...state,
    revealState: {
      ...state.revealState,
      [field]: true,
    },
  }))
}

export function toggleHandwriting() {
  uiStore.setState((state) => ({
    ...state,
    handwritingVisible: !state.handwritingVisible,
    currentCharacterIndex: 0,
  }))
}

export function hideHandwriting() {
  uiStore.setState((state) => ({
    ...state,
    handwritingVisible: false,
    currentCharacterIndex: 0,
  }))
}

export function setCharacterIndex(index: number) {
  uiStore.setState((state) => ({
    ...state,
    currentCharacterIndex: index,
  }))
}

export function markWordAsKnown(word: Word) {
  uiStore.setState((state) => {
    const newKnownWords = new Set(state.knownWords)
    const newUnknownWords = new Set(state.unknownWords)

    newKnownWords.add(word.simplified)
    newUnknownWords.delete(word.simplified)

    return {
      ...state,
      knownWords: newKnownWords,
      unknownWords: newUnknownWords,
    }
  })
}

export function markWordAsUnknown(word: Word) {
  uiStore.setState((state) => {
    const newKnownWords = new Set(state.knownWords)
    const newUnknownWords = new Set(state.unknownWords)

    newUnknownWords.add(word.simplified)
    newKnownWords.delete(word.simplified)

    return {
      ...state,
      knownWords: newKnownWords,
      unknownWords: newUnknownWords,
    }
  })
}

export function setProgress(knownWords: string[], unknownWords: string[]) {
  uiStore.setState((state) => ({
    ...state,
    knownWords: new Set(knownWords),
    unknownWords: new Set(unknownWords),
  }))
}

export function resetUIState() {
  uiStore.setState(() => DEFAULT_UI_STATE)
}
