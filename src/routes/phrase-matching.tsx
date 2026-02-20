import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/phrase-matching')({
  component: PhraseMatchingPage,
})

interface WordCollocation {
  id: number
  simplified: string
  traditional: string
  english: string
  audio: string
  type: string
}

interface WordCollocationsData {
  title: string
  titleEnglish: string
  description: string
  vocabulary: WordCollocation[]
}

function PhraseMatchingPage() {
  const [data, setData] = useState<WordCollocationsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [playingId, setPlayingId] = useState<number | null>(null)
  const { play, stop } = useAudioPlayer()

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/data/tingxie/word_collocations.json')
        const json = await response.json()
        setData(json)
      } catch (error) {
        console.error('Failed to load word collocations:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handlePlayAudio = async (word: WordCollocation) => {
    if (playingId === word.id) {
      stop()
      setPlayingId(null)
      return
    }

    try {
      await play(word.audio)
      setPlayingId(word.id)
    } catch (error) {
      console.error('Failed to play audio:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <header className="header-row">
        <h1 className="page-title">词语搭配</h1>
      </header>

      {/* Main content */}
      <main className="vocabulary-main">
        {data && data.vocabulary.length > 0 ? (
          <div className="vocab-grid">
            {data.vocabulary.map((word) => (
              <div
                key={word.id}
                className={cn(
                  'vocab-card cursor-pointer transition-all duration-200',
                  playingId === word.id && 'ring-2 ring-white ring-offset-2'
                )}
                onClick={() => handlePlayAudio(word)}
              >
                <div className="vocab-simplified">{word.simplified}</div>
                <div className="vocab-traditional">{word.traditional}</div>
                <div className="vocab-pinyin text-xs" style={{ marginTop: '8px' }}>
                  {word.english}
                </div>
                <button
                  className="vocab-audio"
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePlayAudio(word)
                  }}
                  aria-label={`Play audio for ${word.simplified}`}
                >
                  {playingId === word.id ? '🔊' : '▶'}
                </button>
              </div>
            ))}
          </div>
        ) : (
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
