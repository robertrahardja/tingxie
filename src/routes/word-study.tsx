import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/word-study')({
  component: WordStudyPage,
})

interface RelatedChar {
  char: string
  pinyin: string
  word: string
  wordPinyin: string
}

interface WordDistinction {
  word1: string
  sentence1: string
  word2: string
  sentence2: string
}

interface StudyWord {
  id: number
  simplified: string
  traditional: string
  pinyin: string
  english: string
  explanation: string
  collocations: string[]
  exampleSentence: string
  exampleHighlight: string
  audio: string
  relatedChars: RelatedChar[]
  wordDistinction?: WordDistinction
}

interface Section {
  title: string
  description: string
  words: StudyWord[]
}

interface WordStudyData {
  title: string
  lesson: string
  sections: Section[]
}

function WordStudyPage() {
  const [data, setData] = useState<WordStudyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState(0)
  const [expandedWordId, setExpandedWordId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const { play } = useAudioPlayer()

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/data/tingxie/word_study.json')
        if (!response.ok) throw new Error('Failed to load data')
        const json: WordStudyData = await response.json()
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handlePlayAudio = useCallback(
    async (audioPath: string, e: React.MouseEvent) => {
      e.stopPropagation()
      await play(audioPath)
    },
    [play]
  )

  const toggleWord = useCallback((wordId: number) => {
    setExpandedWordId((prev) => (prev === wordId ? null : wordId))
  }, [])

  const currentSection = data?.sections[activeSection]

  const filteredWords = useMemo(() => {
    if (!currentSection) return []
    if (!searchQuery.trim()) return currentSection.words

    const q = searchQuery.toLowerCase().trim()
    return currentSection.words.filter(
      (w) =>
        w.simplified.includes(q) ||
        w.traditional.includes(q) ||
        w.pinyin.toLowerCase().includes(q) ||
        w.english.toLowerCase().includes(q)
    )
  }, [currentSection, searchQuery])

  // Highlight the target word in the example sentence
  const renderHighlightedSentence = (sentence: string, highlight: string) => {
    if (!highlight) return sentence
    const parts = sentence.split(highlight)
    if (parts.length === 1) return sentence

    return parts.map((part, i) => (
      <span key={i}>
        {part}
        {i < parts.length - 1 && (
          <span className="font-bold" style={{ color: '#667eea' }}>
            {highlight}
          </span>
        )}
      </span>
    ))
  }

  if (loading) {
    return (
      <div>
        <header className="header-row">
          <h1 className="page-title">字词学习</h1>
        </header>
        <main className="text-white text-center p-8">
          <p>加载中...</p>
        </main>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div>
        <header className="header-row">
          <h1 className="page-title">字词学习</h1>
        </header>
        <main className="text-white text-center p-8">
          <p>加载失败: {error}</p>
        </main>
      </div>
    )
  }

  return (
    <div>
      <header className="header-row">
        <h1 className="page-title">字词学习</h1>
      </header>

      <main>
        {/* Section tabs */}
        <div className="set-selector" style={{ marginBottom: 12 }}>
          {data.sections.map((section, idx) => (
            <button
              key={idx}
              className={cn('set-btn', activeSection === idx && 'active')}
              onClick={() => {
                setActiveSection(idx)
                setExpandedWordId(null)
                setSearchQuery('')
              }}
              style={{ fontSize: 14, padding: '8px 16px' }}
            >
              {section.title}
            </button>
          ))}
        </div>

        {/* Section description */}
        <div
          style={{
            textAlign: 'center',
            color: 'rgba(255,255,255,0.8)',
            fontSize: 14,
            marginBottom: 12,
          }}
        >
          {currentSection?.description}
        </div>

        {/* Search */}
        <div className="search-container" style={{ marginBottom: 16 }}>
          <input
            type="text"
            className="search-input"
            placeholder="搜索词语、拼音或英文..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Word count */}
        <div
          style={{
            textAlign: 'center',
            color: 'rgba(255,255,255,0.7)',
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          共 {filteredWords.length} 个词语
        </div>

        {/* Word cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredWords.map((word) => {
            const isExpanded = expandedWordId === word.id
            return (
              <div
                key={word.id}
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  borderRadius: 16,
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Collapsed header - always visible */}
                <button
                  onClick={() => toggleWord(word.id)}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    textAlign: 'left',
                    fontFamily: 'inherit',
                  }}
                >
                  {/* Number badge */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      color: 'white',
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 'bold',
                      flexShrink: 0,
                    }}
                  >
                    {word.id}
                  </div>

                  {/* Word info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 24, fontWeight: 'bold', color: '#333' }}>
                        {word.simplified}
                      </span>
                      {word.traditional !== word.simplified && (
                        <span style={{ fontSize: 16, color: '#888' }}>
                          ({word.traditional})
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 14, color: '#667eea', fontWeight: 500 }}>
                      {word.pinyin}
                    </div>
                    <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>
                      {word.english}
                    </div>
                  </div>

                  {/* Audio button */}
                  <div
                    onClick={(e) => handlePlayAudio(word.audio, e)}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                      flexShrink: 0,
                      cursor: 'pointer',
                    }}
                    role="button"
                    aria-label={`Play audio for ${word.simplified}`}
                  >
                    <span role="img" aria-hidden="true">🔊</span>
                  </div>

                  {/* Expand arrow */}
                  <div
                    style={{
                      fontSize: 18,
                      color: '#999',
                      transition: 'transform 0.3s ease',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      flexShrink: 0,
                    }}
                  >
                    ▼
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div
                    style={{
                      padding: '0 16px 16px 16px',
                      borderTop: '1px solid #eee',
                    }}
                  >
                    {/* Explanation */}
                    <div style={{ marginTop: 12 }}>
                      <div style={sectionLabelStyle}>解释</div>
                      <div style={{ fontSize: 15, color: '#444', lineHeight: 1.6 }}>
                        {word.explanation}
                      </div>
                    </div>

                    {/* Collocations */}
                    {word.collocations.length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <div style={sectionLabelStyle}>搭配 / 构词</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {word.collocations.map((c, i) => (
                            <span
                              key={i}
                              style={{
                                background: 'linear-gradient(135deg, #667eea20, #764ba220)',
                                border: '1px solid #667eea40',
                                padding: '4px 12px',
                                borderRadius: 20,
                                fontSize: 14,
                                color: '#555',
                              }}
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Example sentence */}
                    <div style={{ marginTop: 12 }}>
                      <div style={sectionLabelStyle}>例句</div>
                      <div
                        style={{
                          background: '#f8f9ff',
                          padding: 12,
                          borderRadius: 12,
                          fontSize: 16,
                          lineHeight: 1.8,
                          color: '#333',
                          borderLeft: '3px solid #667eea',
                        }}
                      >
                        {renderHighlightedSentence(word.exampleSentence, word.exampleHighlight)}
                      </div>
                    </div>

                    {/* Word distinction */}
                    {word.wordDistinction && (
                      <div style={{ marginTop: 12 }}>
                        <div style={sectionLabelStyle}>词辨</div>
                        <div
                          style={{
                            background: '#fff8f0',
                            padding: 12,
                            borderRadius: 12,
                            fontSize: 14,
                            lineHeight: 1.8,
                            borderLeft: '3px solid #f59e0b',
                          }}
                        >
                          <div>
                            <strong style={{ color: '#667eea' }}>{word.wordDistinction.word1}：</strong>
                            {word.wordDistinction.sentence1}
                          </div>
                          <div style={{ marginTop: 4 }}>
                            <strong style={{ color: '#f59e0b' }}>{word.wordDistinction.word2}：</strong>
                            {word.wordDistinction.sentence2}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Related characters */}
                    {word.relatedChars.length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <div style={sectionLabelStyle}>形近字</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {word.relatedChars.map((rc, i) => (
                            <div
                              key={i}
                              style={{
                                background: '#f0f9ff',
                                border: '1px solid #bae6fd',
                                borderRadius: 12,
                                padding: '8px 14px',
                                textAlign: 'center',
                                minWidth: 80,
                              }}
                            >
                              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#0369a1' }}>
                                {rc.char}
                              </div>
                              <div style={{ fontSize: 12, color: '#0369a1' }}>{rc.pinyin}</div>
                              <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>
                                {rc.word}
                              </div>
                              <div style={{ fontSize: 11, color: '#888' }}>{rc.wordPinyin}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Traditional character info */}
                    {word.traditional !== word.simplified && (
                      <div style={{ marginTop: 12 }}>
                        <div style={sectionLabelStyle}>繁体</div>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            background: '#fdf4ff',
                            border: '1px solid #e9d5ff',
                            padding: '6px 14px',
                            borderRadius: 12,
                          }}
                        >
                          <span style={{ fontSize: 22, color: '#7c3aed' }}>{word.traditional}</span>
                          <span style={{ fontSize: 13, color: '#888' }}>繁体字</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {filteredWords.length === 0 && (
          <div className="text-center text-white py-10">
            <p className="text-xl">没有找到词语</p>
            <p className="text-sm opacity-70 mt-2">试试其他搜索词</p>
          </div>
        )}
      </main>
    </div>
  )
}

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 'bold',
  color: '#999',
  textTransform: 'uppercase',
  letterSpacing: 1,
  marginBottom: 6,
}
