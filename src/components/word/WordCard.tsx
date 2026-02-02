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

// Check if a video exists for this word
function getVideoPath(simplified: string): string {
  return `/video/${simplified}.mp4`
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
  const [showVideo, setShowVideo] = useState(false)
  const [videoExists, setVideoExists] = useState(false)

  const videoPath = getVideoPath(word.simplified)

  // Check if video exists when word changes
  useEffect(() => {
    setShowVideo(false)
    setVideoExists(false)

    // Use GET with Range header to check if video exists (more reliable than HEAD)
    fetch(videoPath, {
      method: 'GET',
      headers: { 'Range': 'bytes=0-0' }
    })
      .then((res) => setVideoExists(res.ok || res.status === 206))
      .catch(() => setVideoExists(false))
  }, [word.simplified, videoPath])

  const handleToggleHandwriting = () => {
    setShowHandwriting(!showHandwriting)
  }

  const handleToggleVideo = () => {
    setShowVideo(!showVideo)
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

        {/* Handwriting and Video buttons */}
        <div className="handwriting-controls">
          <button
            className={cn('handwriting-btn', showHandwriting && 'active')}
            onClick={handleToggleHandwriting}
          >
            ✍️ 笔画练习
          </button>
          {videoExists && (
            <button
              className={cn('handwriting-btn', showVideo && 'active')}
              onClick={handleToggleVideo}
            >
              🎬 动画
            </button>
          )}
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

      {/* Video player */}
      {showVideo && videoExists && (
        <div className="video-container">
          <video
            src={videoPath}
            controls
            autoPlay
            className="word-video"
            onEnded={() => setShowVideo(false)}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </>
  )
}
