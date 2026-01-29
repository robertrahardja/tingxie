import { useState } from 'react'
import { AudioButton } from '@/components/audio/AudioButton'
import { WordRevealItem } from './WordRevealItem'
import { HandwritingEmbed } from './HandwritingEmbed'
import type { Word, RevealState } from '@/types/vocabulary'
import { cn } from '@/lib/utils'

interface WordCardProps {
  word: Word
  currentIndex: number
  totalWords: number
  revealState: RevealState
  onToggleReveal: (field: keyof RevealState) => void
  className?: string
}

export function WordCard({
  word,
  currentIndex,
  totalWords,
  revealState,
  onToggleReveal,
  className,
}: WordCardProps) {
  const [showHandwriting, setShowHandwriting] = useState(false)

  const handleToggleHandwriting = () => {
    setShowHandwriting(!showHandwriting)
  }

  return (
    <>
      <div className={cn('word-card', className)}>
        {/* Progress counter */}
        <div className="card-progress">
          {currentIndex + 1} / {totalWords}
        </div>

        {/* Word content grid */}
        <div className="word-section">
          {/* Audio button */}
          <div className="audio-item">
            <AudioButton
              audioPath={word.audio}
              revealed={revealState.audio}
              onReveal={() => onToggleReveal('audio')}
            />
          </div>

          {/* Simplified */}
          <WordRevealItem
            field="simplified"
            value={word.simplified}
            revealed={revealState.simplified}
            onToggle={() => onToggleReveal('simplified')}
          />

          {/* Traditional */}
          <WordRevealItem
            field="traditional"
            value={word.traditional}
            revealed={revealState.traditional}
            onToggle={() => onToggleReveal('traditional')}
          />

          {/* Pinyin */}
          <WordRevealItem
            field="pinyin"
            value={word.pinyin}
            revealed={revealState.pinyin}
            onToggle={() => onToggleReveal('pinyin')}
          />

          {/* English */}
          <WordRevealItem
            field="english"
            value={word.english}
            revealed={revealState.english}
            onToggle={() => onToggleReveal('english')}
          />
        </div>

        {/* Handwriting practice button */}
        <div className="handwriting-controls">
          <button
            className={cn('handwriting-btn', showHandwriting && 'active')}
            onClick={handleToggleHandwriting}
          >
            ✍️ 笔画练习
          </button>
        </div>
      </div>

      {/* Embedded handwriting practice */}
      {showHandwriting && (
        <HandwritingEmbed
          key={word.simplified}
          characters={word.simplified}
          onClose={() => setShowHandwriting(false)}
        />
      )}
    </>
  )
}
