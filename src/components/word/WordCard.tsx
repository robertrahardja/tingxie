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

// Check for image in multiple formats
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.gif']

// Cache resolved image paths to avoid redundant fetches
const imageCache = new Map<string, string | null>()

// Shared in-flight lookups so StrictMode double-mounts reuse the same fetch
const inflightLookups = new Map<string, Promise<string | null>>()

async function lookupImage(simplified: string): Promise<string | null> {
  if (imageCache.has(simplified)) return imageCache.get(simplified)!
  if (inflightLookups.has(simplified)) return inflightLookups.get(simplified)!

  const lookup = (async () => {
    for (const ext of IMAGE_EXTENSIONS) {
      const path = `/images/${encodeURIComponent(simplified)}${ext}`
      try {
        const res = await fetch(path, { method: 'HEAD' })
        const contentType = res.headers.get('content-type') || ''
        if (res.ok && contentType.startsWith('image/')) {
          imageCache.set(simplified, path)
          inflightLookups.delete(simplified)
          return path
        }
      } catch {
        // continue to next extension
      }
    }
    imageCache.set(simplified, null)
    inflightLookups.delete(simplified)
    return null
  })()

  inflightLookups.set(simplified, lookup)
  return lookup
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
  const [imagePath, setImagePath] = useState<string | null>(
    () => imageCache.get(word.simplified) ?? null
  )

  useEffect(() => {
    if (imageCache.has(word.simplified)) {
      setImagePath(imageCache.get(word.simplified)!)
      return
    }

    setImagePath(null)
    let cancelled = false

    lookupImage(word.simplified).then((path) => {
      if (!cancelled) setImagePath(path)
    })

    return () => { cancelled = true }
  }, [word.simplified])

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
        {imagePath && (
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
