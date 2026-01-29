import { useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useStore } from '@tanstack/react-store'
import { WordCard } from '@/components/word/WordCard'
import { SelfAssessButtons } from '@/components/word/SelfAssessButtons'
import { vocabularyQueryOptions, getLatestWords, getAllWords, filterImportantWords } from '@/queries/vocabularyQueries'
import { useProgressQuery, useSaveProgressMutation } from '@/queries/progressQueries'
import { UI_LABELS, ERRORS } from '@/lib/constants'
import {
  uiStore,
  toggleImportantFilter,
  toggleLatestFilter,
  goToNextWord,
  goToPrevWord,
  toggleReveal,
  markWordAsKnown,
  markWordAsUnknown,
  setProgress,
} from '@/stores/uiStore'
import type { RevealState } from '@/types/vocabulary'
import { cn } from '@/lib/utils'

export function LatestWordsPage() {
  // Fetch vocabulary data
  const { data: vocabularyData, isLoading, error } = useQuery(vocabularyQueryOptions)

  // Fetch progress from cloud
  const { data: progressData } = useProgressQuery()

  // Save progress mutation
  const saveProgressMutation = useSaveProgressMutation()

  // UI state from store
  const showImportantOnly = useStore(uiStore, (state) => state.showImportantOnly)
  const showLatestOnly = useStore(uiStore, (state) => state.showLatestOnly)
  const currentWordIndex = useStore(uiStore, (state) => state.currentWordIndex)
  const revealState = useStore(uiStore, (state) => state.revealState)
  const knownWords = useStore(uiStore, (state) => state.knownWords)
  const unknownWords = useStore(uiStore, (state) => state.unknownWords)

  // Load progress from cloud on mount
  useEffect(() => {
    if (progressData) {
      setProgress(progressData.knownWords || [], progressData.unknownWords || [])
    }
  }, [progressData])

  // Compute filtered words
  const filteredWords = useMemo(() => {
    if (!vocabularyData) return []

    const baseWords = showLatestOnly
      ? getLatestWords(vocabularyData)
      : getAllWords(vocabularyData)

    return showImportantOnly ? filterImportantWords(baseWords) : baseWords
  }, [vocabularyData, showLatestOnly, showImportantOnly])

  const currentWord = filteredWords[currentWordIndex]
  const totalWords = filteredWords.length

  // Handle assessment
  const handleKnow = () => {
    if (!currentWord) return

    markWordAsKnown(currentWord)

    // Save to cloud
    const newKnownWords = new Set(knownWords)
    newKnownWords.add(currentWord.simplified)
    const newUnknownWords = new Set(unknownWords)
    newUnknownWords.delete(currentWord.simplified)

    saveProgressMutation.mutate({
      knownWords: Array.from(newKnownWords),
      unknownWords: Array.from(newUnknownWords),
    })

    // Move to next word
    goToNextWord(totalWords)
  }

  const handleDontKnow = () => {
    if (!currentWord) return

    markWordAsUnknown(currentWord)

    // Save to cloud
    const newKnownWords = new Set(knownWords)
    newKnownWords.delete(currentWord.simplified)
    const newUnknownWords = new Set(unknownWords)
    newUnknownWords.add(currentWord.simplified)

    saveProgressMutation.mutate({
      knownWords: Array.from(newKnownWords),
      unknownWords: Array.from(newUnknownWords),
    })

    // Move to next word
    goToNextWord(totalWords)
  }

  const handleToggleReveal = (field: keyof RevealState) => {
    toggleReveal(field)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-white text-xl">{ERRORS.DATA_LOAD}</div>
      </div>
    )
  }

  // No words state
  if (!currentWord) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-white text-xl">No words available</div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <header className="header-row">
        <h1 className="page-title">最新词语</h1>
        <div className="controls">
          {/* Latest/All toggle */}
          <button
            className={cn('filter-btn', !showLatestOnly && 'active')}
            onClick={toggleLatestFilter}
          >
            {showLatestOnly ? UI_LABELS.ALL_WORDS : UI_LABELS.LATEST_WORDS}
          </button>

          {/* Important filter */}
          <button
            className={cn('filter-btn', showImportantOnly && 'active')}
            onClick={toggleImportantFilter}
          >
            {showImportantOnly ? UI_LABELS.ALL_WORDS : UI_LABELS.IMPORTANT_WORDS}
          </button>

          {/* Progress counter */}
          <div className="progress-display">
            {currentWordIndex + 1} / {totalWords}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Navigation buttons */}
        <div className="nav-buttons">
          <button
            className="nav-btn"
            onClick={goToPrevWord}
            disabled={currentWordIndex === 0}
          >
            {UI_LABELS.PREV_BTN}
          </button>
          <button
            className="nav-btn"
            onClick={() => goToNextWord(totalWords)}
            disabled={currentWordIndex >= totalWords - 1}
          >
            {UI_LABELS.NEXT_BTN}
          </button>
        </div>

        {/* Word card */}
        <WordCard
          key={currentWord.simplified}
          word={currentWord}
          currentIndex={currentWordIndex}
          totalWords={totalWords}
          revealState={revealState}
          onToggleReveal={handleToggleReveal}
        />

        {/* Self assessment buttons */}
        <SelfAssessButtons
          onKnow={handleKnow}
          onDontKnow={handleDontKnow}
        />
      </main>
    </div>
  )
}
