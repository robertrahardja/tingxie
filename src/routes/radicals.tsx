
import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/radicals')({
  component: RadicalsPage,
})

// Radical data type
interface Radical {
  number: number
  radical: string
  traditional?: string
  pinyin: string
  meaning: string
  strokes: number
  examples: string[]
  audio: string
}

interface RadicalsData {
  title: string
  description: string
  radicals: Radical[]
}

// Query options for radicals data
const radicalsQueryOptions = {
  queryKey: ['radicals'],
  queryFn: async (): Promise<RadicalsData> => {
    const response = await fetch('/data/radicals/radicals.json')
    if (!response.ok) {
      throw new Error('Failed to load radicals data')
    }
    return response.json()
  },
  staleTime: 1000 * 60 * 60, // 1 hour
}

// Stroke filter options
const STROKE_FILTERS = [
  { label: 'All', value: 'all' },
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
  { label: '6', value: '6' },
  { label: '7', value: '7' },
  { label: '8+', value: '8+' },
]

function RadicalsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [strokeFilter, setStrokeFilter] = useState('all')
  const { play } = useAudioPlayer()

  // Fetch radicals data
  const {
    data: radicalsData,
    isLoading,
    error,
  } = useQuery(radicalsQueryOptions)

  // Filter radicals based on search and stroke count
  const filteredRadicals = useMemo(() => {
    if (!radicalsData?.radicals) return []

    let filtered = radicalsData.radicals

    // Apply stroke filter
    if (strokeFilter !== 'all') {
      if (strokeFilter === '8+') {
        filtered = filtered.filter((r) => r.strokes >= 8)
      } else {
        const strokeNum = parseInt(strokeFilter, 10)
        filtered = filtered.filter((r) => r.strokes === strokeNum)
      }
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(
        (r) =>
          r.radical.includes(query) ||
          (r.traditional && r.traditional.includes(query)) ||
          r.pinyin.toLowerCase().includes(query) ||
          r.meaning.toLowerCase().includes(query) ||
          r.examples.some((ex) => ex.includes(query))
      )
    }

    return filtered
  }, [radicalsData, strokeFilter, searchQuery])

  const handlePlayAudio = (audioPath: string, e: React.MouseEvent) => {
    e.stopPropagation()
    play(audioPath)
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
        <div className="text-white text-xl">Failed to load radicals data</div>
      </div>
    )
  }

  const totalCount = radicalsData?.radicals.length || 0

  return (
    <div>
      <header>
        <div className="header-row">
          <h1 className="page-title">Radicals</h1>
        </div>
      </header>

      <main className="vocabulary-main">
        {/* Search input */}
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search radical, pinyin, or meaning..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Stroke filters */}
        <div className="stroke-filters">
          {STROKE_FILTERS.map((filter) => (
            <button
              key={filter.value}
              className={cn('stroke-btn', strokeFilter === filter.value && 'active')}
              onClick={() => setStrokeFilter(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Stats bar */}
        <div className="stats-bar">
          <span>Showing: {filteredRadicals.length} radicals</span>
          <span>Total: {totalCount}</span>
        </div>

        {/* Radicals grid */}
        <div className="radicals-grid">
          {filteredRadicals.map((radical) => (
            <div key={radical.number} className="radical-card">
              <div className="radical-header">
                <div className="radical-characters">
                  <span className="radical-character">{radical.radical}</span>
                  {radical.traditional && radical.traditional !== radical.radical && (
                    <span className="radical-traditional">{radical.traditional}</span>
                  )}
                </div>
                <span className="radical-number">{radical.strokes} strokes</span>
              </div>

              <div className="radical-pinyin">{radical.pinyin}</div>
              <div className="radical-meaning">{radical.meaning}</div>

              <div className="radical-examples">
                {radical.examples.map((example, idx) => (
                  <span key={idx} className="example-char">
                    {example}
                  </span>
                ))}
              </div>

              <button
                className="radical-audio"
                onClick={(e) => handlePlayAudio(radical.audio, e)}
                aria-label={`Play audio for ${radical.radical}`}
              >
                <span role="img" aria-hidden="true">
                  🔊
                </span>
              </button>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredRadicals.length === 0 && (
          <div className="text-center text-white py-10">
            <p className="text-xl">No radicals found</p>
            <p className="text-sm opacity-70 mt-2">
              Try adjusting your search or filter
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
