import { useEffect, useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useStore } from '@tanstack/react-store'
import { WordCard } from '@/components/word/WordCard'
import { SelfAssessButtons } from '@/components/word/SelfAssessButtons'
import { vocabularyQueryOptions, getAllWords } from '@/queries/vocabularyQueries'
import { useProgressQuery, useSaveProgressMutation } from '@/queries/progressQueries'
import { UI_LABELS, ERRORS } from '@/lib/constants'
import {
  uiStore,
  goToNextWord,
  goToPrevWord,
  toggleReveal,
  markWordAsKnown,
  markWordAsUnknown,
  setProgress,
  setCurrentWordIndex,
} from '@/stores/uiStore'
import type { RevealState } from '@/types/vocabulary'

export const Route = createFileRoute('/review')({
  component: ReviewPage,
})

function ReviewPage() {
  // Fetch vocabulary data
  const { data: vocabularyData, isLoading: vocabLoading, error: vocabError } = useQuery(vocabularyQueryOptions)

  // Fetch progress from cloud
  const { data: progressData, isLoading: progressLoading } = useProgressQuery()

  // Save progress mutation
  const saveProgressMutation = useSaveProgressMutation()

  // UI state from store
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

  // Reset word index when entering review page
  useEffect(() => {
    setCurrentWordIndex(0)
  }, [])

  // Compute words that need review (unknown words only)
  const reviewWords = useMemo(() => {
    if (!vocabularyData || unknownWords.size === 0) return []

    const allWords = getAllWords(vocabularyData)

    // Filter to only unknown words
    return allWords.filter((word) => unknownWords.has(word.simplified))
  }, [vocabularyData, unknownWords])

  const totalWords = reviewWords.length

  // Reset index if out of bounds
  useEffect(() => {
    if (totalWords > 0 && currentWordIndex >= totalWords) {
      setCurrentWordIndex(0)
    }
  }, [totalWords, currentWordIndex])

  const currentWord = reviewWords[currentWordIndex]

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

    // Move to next word or stay at valid index
    if (currentWordIndex >= totalWords - 1) {
      // If we're at or past the last word after removing one, go back
      if (totalWords > 1) {
        setCurrentWordIndex(Math.max(0, currentWordIndex - 1))
      }
    } else {
      goToNextWord(totalWords)
    }
  }

  const handleDontKnow = () => {
    if (!currentWord) return

    markWordAsUnknown(currentWord)

    // Save to cloud (word stays in unknown)
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
  if (vocabLoading || progressLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  // Error state
  if (vocabError) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-white text-xl">{ERRORS.DATA_LOAD}</div>
      </div>
    )
  }

  // No words to review state or no current word
  if (totalWords === 0 || !currentWord) {
    return (
      <div>
        {/* Header */}
        <header className="header-row">
          <h1 className="page-title">复习词语</h1>
        </header>

        {/* Empty state */}
        <main className="empty-state-container">
          <div className="empty-state-card">
            <div className="empty-state-icon">🎉</div>
            <h2 className="empty-state-title">没有需要复习的词语</h2>
            <p className="empty-state-subtitle">
              太棒了！你已经掌握了所有词语
            </p>
            <p className="empty-state-hint">
              在最新词语页面标记不会的词语，这里就会出现需要复习的内容
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <header className="header-row">
        <h1 className="page-title">复习词语</h1>
        <div className="controls">
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
