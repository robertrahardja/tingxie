import { useMemo, useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useStore } from '@tanstack/react-store'
import { vocabularyQueryOptions, getAllWords, filterImportantWords } from '@/queries/vocabularyQueries'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { UI_LABELS, ERRORS } from '@/lib/constants'
import { uiStore, toggleImportantFilter } from '@/stores/uiStore'
import { cn } from '@/lib/utils'
import type { Word } from '@/types/vocabulary'

export const Route = createFileRoute('/vocabulary')({
  component: VocabularyPage,
})

interface VocabCardProps {
  word: Word
  onPlayAudio: (audioPath: string) => void
}

function VocabCard({ word, onPlayAudio }: VocabCardProps) {
  const handleAudioClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onPlayAudio(word.audio)
    },
    [word.audio, onPlayAudio]
  )

  return (
    <div className={cn('vocab-card', word.important && 'important')}>
      <div className="vocab-simplified">{word.simplified}</div>
      <div className="vocab-traditional">{word.traditional}</div>
      <div className="vocab-pinyin">{word.pinyin}</div>
      <button
        className="vocab-audio"
        onClick={handleAudioClick}
        aria-label={`Play audio for ${word.simplified}`}
      >
        🔊
      </button>
      {word.important && (
        <div className="important-badge">{UI_LABELS.IMPORTANT_BADGE}</div>
      )}
    </div>
  )
}

function VocabularyPage() {
  // Fetch vocabulary data
  const { data: vocabularyData, isLoading, error } = useQuery(vocabularyQueryOptions)

  // UI state
  const showImportantOnly = useStore(uiStore, (state) => state.showImportantOnly)

  // Audio player
  const { play } = useAudioPlayer()

  // Compute filtered words
  const filteredWords = useMemo(() => {
    if (!vocabularyData) return []

    const allWords = getAllWords(vocabularyData)
    return showImportantOnly ? filterImportantWords(allWords) : allWords
  }, [vocabularyData, showImportantOnly])

  const handlePlayAudio = useCallback(
    (audioPath: string) => {
      play(audioPath)
    },
    [play]
  )

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

  return (
    <div>
      {/* Header */}
      <header className="header-row">
        <h1 className="page-title">词汇浏览</h1>
        <div className="controls">
          {/* Important filter */}
          <button
            className={cn('filter-btn', showImportantOnly && 'active')}
            onClick={toggleImportantFilter}
          >
            {showImportantOnly ? UI_LABELS.ALL_WORDS : UI_LABELS.IMPORTANT_WORDS}
          </button>
          {/* Word count */}
          <div className="vocab-count">{filteredWords.length} 个词语</div>
        </div>
      </header>

      {/* Vocabulary grid */}
      <main className="vocabulary-main">
        <div className="vocab-grid">
          {filteredWords.map((word, index) => (
            <VocabCard
              key={`${word.simplified}-${index}`}
              word={word}
              onPlayAudio={handlePlayAudio}
            />
          ))}
        </div>

        {filteredWords.length === 0 && (
          <div className="empty-state-container">
            <div className="empty-state-card">
              <div className="empty-state-icon">📚</div>
              <h2 className="empty-state-title">没有词语</h2>
              <p className="empty-state-subtitle">暂时没有符合条件的词语</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
