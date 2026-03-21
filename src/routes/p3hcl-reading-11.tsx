import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'

export const Route = createFileRoute('/p3hcl-reading-11')({
  component: P3HCLReading11Page,
})

interface WordDefinition {
  pinyin: string
  english: string
  explanation: string
  audio: string
}

interface TimestampEntry {
  start: number
  end: number
  word: string
}

interface Section {
  title: string
  paragraphs: string[]
}

interface ReadingData {
  title: string
  titleChinese: string
  audioFile: string
  sections: Section[]
  timestamps: TimestampEntry[]
}

// Badge labels that should be styled as colored tags
const BADGE_LABELS: Record<string, { text: string; color: string }> = {
  'F=感受': { text: 'F=感受', color: '#e74c3c' },
  'O=看法': { text: 'O=看法', color: '#3498db' },
  'R=原因': { text: 'R=原因', color: '#2ecc71' },
  'IF=如果': { text: 'IF=如果', color: '#f39c12' },
}

/**
 * Build a mapping from character position in the full display text
 * to the timestamp index. This lets us highlight characters as audio plays.
 */
function buildCharTimestampMap(
  displayText: string,
  timestamps: TimestampEntry[]
): Map<number, number> {
  const map = new Map<number, number>()

  // The first 8 timestamps are the title being read aloud (口试练习,欺负弱小)
  // which is NOT in the display text. Skip them.
  const TITLE_TIMESTAMP_COUNT = 8

  let tsIndex = TITLE_TIMESTAMP_COUNT
  let tsCharOffset = 0

  for (let i = 0; i < displayText.length; i++) {
    const ch = displayText[i]

    if (isPunctuation(ch)) {
      continue
    }

    if (tsIndex >= timestamps.length) {
      break
    }

    const currentWord = timestamps[tsIndex].word
    const expectedChar = currentWord[tsCharOffset]

    if (ch === expectedChar) {
      map.set(i, tsIndex)
      tsCharOffset++
      if (tsCharOffset >= currentWord.length) {
        tsIndex++
        tsCharOffset = 0
      }
    }
  }

  return map
}

function isPunctuation(ch: string): boolean {
  return /[\s，。、！？；：""''（）《》\u3000\n\r]/.test(ch)
}

/**
 * Get the full display text by concatenating all section paragraphs,
 * in order, separated by newlines. This is used to build the char-to-timestamp mapping.
 */
function getFullDisplayText(sections: Section[]): string {
  const parts: string[] = []
  for (const section of sections) {
    for (const para of section.paragraphs) {
      // Strip badge annotations like （F=感受）
      const cleaned = para.replace(/（[A-Z]+=[\u4e00-\u9fff]+）/g, '')
      parts.push(cleaned)
    }
  }
  return parts.join('\n')
}

function P3HCLReading11Page() {
  const [data, setData] = useState<ReadingData | null>(null)
  const [wordDefs, setWordDefs] = useState<Record<string, WordDefinition>>({})
  const [loading, setLoading] = useState(true)
  const [selectedWord, setSelectedWord] = useState<{
    word: string
    def: WordDefinition
  } | null>(null)
  const [activeTimestampIndex, setActiveTimestampIndex] = useState<number>(-1)
  const audioRef = useRef<HTMLAudioElement>(null)
  const { play } = useAudioPlayer()

  // Character position to timestamp index mapping
  const charTimestampMap = useMemo(() => {
    if (!data) return new Map<number, number>()
    const fullText = getFullDisplayText(data.sections)
    return buildCharTimestampMap(fullText, data.timestamps)
  }, [data])

  // Reverse map: timestamp index -> set of char positions (for highlighting)
  const timestampToChars = useMemo(() => {
    const map = new Map<number, Set<number>>()
    charTimestampMap.forEach((tsIdx, charPos) => {
      if (!map.has(tsIdx)) {
        map.set(tsIdx, new Set())
      }
      map.get(tsIdx)!.add(charPos)
    })
    return map
  }, [charTimestampMap])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [textResponse, wordsResponse] = await Promise.all([
          fetch('/data/p3hcl_reading_11.json'),
          fetch('/data/p3hcl_reading_11_words.json'),
        ])
        const textData = await textResponse.json()
        const wordsData = await wordsResponse.json()
        setData(textData)
        setWordDefs(wordsData.wordDefinitions)
      } catch (error) {
        console.error('Failed to load reading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Audio time tracking with requestAnimationFrame for smooth highlighting
  const activeIndexRef = useRef(-1)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !data) return

    let rafId: number
    const timestamps = data.timestamps

    const tick = () => {
      if (!audio.paused) {
        const currentTime = audio.currentTime
        let activeIdx = -1
        for (let i = 0; i < timestamps.length; i++) {
          if (currentTime >= timestamps[i].start && currentTime <= timestamps[i].end) {
            activeIdx = i
            break
          }
        }
        if (activeIdx !== activeIndexRef.current) {
          activeIndexRef.current = activeIdx
          setActiveTimestampIndex(activeIdx)
        }
      }
      rafId = requestAnimationFrame(tick)
    }

    const startTracking = () => { rafId = requestAnimationFrame(tick) }
    const stopTracking = () => {
      cancelAnimationFrame(rafId)
      activeIndexRef.current = -1
      setActiveTimestampIndex(-1)
    }

    audio.addEventListener('play', startTracking)
    audio.addEventListener('pause', stopTracking)
    audio.addEventListener('ended', stopTracking)

    // If already playing (e.g. after hot reload)
    if (!audio.paused) startTracking()

    return () => {
      cancelAnimationFrame(rafId)
      audio.removeEventListener('play', startTracking)
      audio.removeEventListener('pause', stopTracking)
      audio.removeEventListener('ended', stopTracking)
    }
  }, [data])

  const segmentText = useCallback(
    (text: string) => {
      const segments: Array<{
        text: string
        isWord: boolean
        def?: WordDefinition
      }> = []
      let i = 0

      while (i < text.length) {
        let matched = false

        // Try to match longest word first (up to 6 characters)
        for (let len = Math.min(6, text.length - i); len > 0; len--) {
          const substr = text.substr(i, len)
          if (wordDefs[substr]) {
            segments.push({ text: substr, isWord: true, def: wordDefs[substr] })
            i += len
            matched = true
            break
          }
        }

        if (!matched) {
          segments.push({ text: text[i], isWord: false })
          i++
        }
      }

      return segments
    },
    [wordDefs]
  )

  // Set of currently highlighted character positions
  const highlightedChars = useMemo(() => {
    if (activeTimestampIndex < 0) return new Set<number>()
    return timestampToChars.get(activeTimestampIndex) || new Set<number>()
  }, [activeTimestampIndex, timestampToChars])

  const renderParagraph = useCallback(
    (paragraph: string, pIndex: number, startOffset: number) => {
      // Check for badge annotations like （F=感受）
      const badgeMatch = paragraph.match(/（([A-Z]+=[\u4e00-\u9fff]+)）/)
      const badgeKey = badgeMatch ? badgeMatch[1] : null
      const badgeInfo = badgeKey ? BADGE_LABELS[badgeKey] : null

      // Text without badge annotation for display
      const cleanText = paragraph.replace(/（[A-Z]+=[\u4e00-\u9fff]+）/, '')

      const segments = segmentText(cleanText)

      let charPos = startOffset

      return (
        <p
          key={pIndex}
          style={{
            fontSize: '18px',
            lineHeight: '2',
            color: '#333',
            marginBottom: '20px',
            textIndent: '2em',
          }}
        >
          {segments.map((segment, sIndex) => {
            const chars = segment.text.split('')
            const renderedChars = chars.map((ch, ci) => {
              const pos = charPos
              charPos++
              const isHighlighted = highlightedChars.has(pos)
              return (
                <span
                  key={ci}
                  style={{
                    backgroundColor: isHighlighted ? '#fef08a' : 'transparent',
                    borderBottom: isHighlighted ? '3px solid #f59e0b' : 'none',
                    transition: 'background-color 0.1s ease, border-bottom 0.1s ease',
                    borderRadius: isHighlighted ? '2px' : undefined,
                    padding: isHighlighted ? '2px 0' : undefined,
                  }}
                >
                  {ch}
                </span>
              )
            })

            if (segment.isWord && segment.def) {
              return (
                <span
                  key={sIndex}
                  onClick={() =>
                    setSelectedWord({
                      word: segment.text,
                      def: segment.def!,
                    })
                  }
                  style={{
                    cursor: 'pointer',
                    borderBottom: '2px dotted #667eea',
                    color: '#667eea',
                    fontWeight: '500',
                  }}
                >
                  {renderedChars}
                </span>
              )
            }

            return <span key={sIndex}>{renderedChars}</span>
          })}
          {badgeInfo && (
            <span
              style={{
                display: 'inline-block',
                marginLeft: '8px',
                padding: '2px 8px',
                backgroundColor: badgeInfo.color,
                color: 'white',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600',
                verticalAlign: 'middle',
              }}
            >
              {badgeInfo.text}
            </span>
          )}
        </p>
      )
    },
    [segmentText, highlightedChars]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-white text-xl">Failed to load data</div>
      </div>
    )
  }

  // Calculate character offsets for each paragraph
  // We need to track cumulative character position across all sections/paragraphs
  let cumulativeOffset = 0
  const paragraphOffsets: number[] = []
  for (const section of data.sections) {
    for (const para of section.paragraphs) {
      paragraphOffsets.push(cumulativeOffset)
      const cleaned = para.replace(/（[A-Z]+=[\u4e00-\u9fff]+）/g, '')
      cumulativeOffset += cleaned.length
      cumulativeOffset += 1 // for the \n separator
    }
  }

  let paragraphIndex = 0

  return (
    <div>
      {/* Header */}
      <header className="header-row">
        <h1 className="page-title">{data.titleChinese}</h1>
      </header>

      {/* Main content */}
      <main className="vocabulary-main">
        <div style={{ padding: '20px' }}>
          {/* Audio player */}
          {data.audioFile && (
            <div style={{ marginBottom: '20px' }}>
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '12px',
                  padding: '15px',
                }}
              >
                <audio ref={audioRef} controls style={{ width: '100%' }}>
                  <source src={`/audio/${data.audioFile}`} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            </div>
          )}

          {/* Reading text with sections */}
          {data.sections.map((section, sectionIndex) => (
            <div
              key={sectionIndex}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '16px',
                padding: '25px',
                marginBottom: '20px',
                position: 'relative',
              }}
            >
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#667eea',
                  marginBottom: '15px',
                }}
              >
                {section.title}
              </h2>

              {section.paragraphs.map((paragraph, pIdx) => {
                const currentParagraphIndex = paragraphIndex
                paragraphIndex++
                const offset = paragraphOffsets[currentParagraphIndex]
                return renderParagraph(paragraph, pIdx, offset)
              })}
            </div>
          ))}

          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '16px',
              padding: '15px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                padding: '10px',
                backgroundColor: '#f0f0f0',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#666',
              }}
            >
              点击蓝色词语查看解释和发音 | 播放音频时文字会同步高亮
            </div>
          </div>
        </div>
      </main>

      {/* Word definition popup */}
      {selectedWord && (
        <div
          onClick={() => setSelectedWord(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '25px',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '15px',
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#667eea',
                    marginBottom: '5px',
                  }}
                >
                  {selectedWord.word}
                </h3>
                <p
                  style={{
                    fontSize: '16px',
                    color: '#999',
                    marginBottom: '10px',
                  }}
                >
                  {selectedWord.def.pinyin}
                </p>
              </div>
              <button
                onClick={async () => {
                  await play(selectedWord.def.audio)
                }}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                🔊
              </button>
            </div>
            <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
              <p
                style={{
                  fontSize: '16px',
                  color: '#333',
                  marginBottom: '10px',
                  fontWeight: '500',
                }}
              >
                {selectedWord.def.english}
              </p>
              <p
                style={{
                  fontSize: '14px',
                  color: '#666',
                  fontStyle: 'italic',
                }}
              >
                {selectedWord.def.explanation}
              </p>
            </div>
            <button
              onClick={() => setSelectedWord(null)}
              style={{
                marginTop: '20px',
                width: '100%',
                padding: '12px',
                backgroundColor: '#f5f5f5',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#666',
                cursor: 'pointer',
              }}
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
