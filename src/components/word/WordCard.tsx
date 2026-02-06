import { useState, useEffect } from 'react'
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

// Check if an image exists for this word
function getImagePath(simplified: string): string {
  return `/images/${simplified}.png`
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
  const [imageExists, setImageExists] = useState(false)

  const imagePath = getImagePath(word.simplified)

  // Check if image exists when word changes
  useEffect(() => {
    setImageExists(false)

    // Check if image exists
    fetch(imagePath, {
      method: 'GET',
      headers: { 'Range': 'bytes=0-0' }
    })
      .then((res) => setImageExists(res.ok || res.status === 206))
      .catch(() => setImageExists(false))
  }, [word.simplified, imagePath])

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

        {/* Memory Image - displayed prominently at top */}
        {imageExists && (
          <div className="word-image-container">
            <img
              src={imagePath}
              alt={word.english}
              className="word-memory-image"
            />
          </div>
        )}

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

        {/* Handwriting button */}
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
