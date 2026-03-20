import { useState, useEffect, useRef, useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'

export const Route = createFileRoute('/p3hcl-reading-12')({
  component: P3HCLReading12Page,
})

interface WordDefinition {
  pinyin: string
  english: string
  explanation: string
  audio: string
}

interface AudioTimestamp {
  start: number
  end: number
  text: string
  english: string
}

interface ReadingText {
  title: string
  paragraphs: string[]
  audioTimestamps: AudioTimestamp[]
}

interface ReadingData {
  title: string
  titleChinese: string
  audioFile: string
  texts: ReadingText[]
}

function P3HCLReading12Page() {
  const [data, setData] = useState<ReadingData | null>(null)
  const [wordDefs, setWordDefs] = useState<Record<string, WordDefinition>>({})
  const [loading, setLoading] = useState(true)
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [selectedWord, setSelectedWord] = useState<{word: string; def: WordDefinition} | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const highlightRef = useRef<HTMLDivElement | null>(null)
  const { play } = useAudioPlayer()

  useEffect(() => {
    const loadData = async () => {
      try {
        const [textResponse, wordsResponse] = await Promise.all([
          fetch('/data/p3hcl_reading_12.json'),
          fetch('/data/p3hcl_reading_12_words.json')
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

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }, [])

  const handlePlay = useCallback(() => setIsPlaying(true), [])
  const handlePause = useCallback(() => setIsPlaying(false), [])
  const handleEnded = useCallback(() => {
    setIsPlaying(false)
    setCurrentTime(0)
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [data, handleTimeUpdate, handlePlay, handlePause, handleEnded])

  // Auto-switch text when audio moves to next section
  useEffect(() => {
    if (!data || !isPlaying) return
    for (let i = 0; i < data.texts.length; i++) {
      const ts = data.texts[i].audioTimestamps
      if (ts.length > 0 && currentTime >= ts[0].start && currentTime < ts[ts.length - 1].end) {
        if (i !== currentTextIndex) {
          setCurrentTextIndex(i)
        }
        break
      }
    }
  }, [currentTime, data, isPlaying, currentTextIndex])

  // Auto-scroll to highlighted sentence
  useEffect(() => {
    if (highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [currentTime])

  const seekToTimestamp = (start: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = start
      audioRef.current.play()
    }
  }

  const getHighlightIndex = () => {
    if (!data) return -1
    const timestamps = data.texts[currentTextIndex]?.audioTimestamps
    if (!timestamps) return -1
    for (let i = timestamps.length - 1; i >= 0; i--) {
      if (currentTime >= timestamps[i].start && currentTime < timestamps[i].end) {
        return i
      }
    }
    return -1
  }

  const segmentText = (text: string) => {
    const segments: Array<{text: string; isWord: boolean; def?: WordDefinition}> = []
    let i = 0

    while (i < text.length) {
      let matched = false

      for (let len = Math.min(7, text.length - i); len > 0; len--) {
        const substr = text.substr(i, len)
        if (wordDefs[substr]) {
          segments.push({text: substr, isWord: true, def: wordDefs[substr]})
          i += len
          matched = true
          break
        }
      }

      if (!matched) {
        segments.push({text: text[i], isWord: false})
        i++
      }
    }

    return segments
  }

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

  const currentText = data.texts[currentTextIndex]
  const highlightIndex = getHighlightIndex()

  return (
    <div>
      {/* Header */}
      <header className="header-row">
        <h1 className="page-title">{data.titleChinese}</h1>
      </header>

      {/* Main content */}
      <main className="vocabulary-main">
        <div style={{ padding: '20px' }}>
          {/* Audio player - sticky */}
          {data.audioFile && (
            <div style={{
              position: 'sticky',
              top: '0',
              zIndex: 50,
              marginBottom: '20px',
            }}>
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.98)',
                  borderRadius: '12px',
                  padding: '12px 15px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                }}
              >
                <audio ref={audioRef} controls preload="none" style={{ width: '100%', height: '36px' }}>
                  <source src={`/audio/${data.audioFile}`} type="audio/mp4" />
                </audio>
              </div>
            </div>
          )}

          {/* Text navigation */}
          {data.texts.length > 1 && (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              {data.texts.map((t, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentTextIndex(index)
                    const ts = data.texts[index].audioTimestamps
                    if (ts && ts.length > 0 && audioRef.current) {
                      audioRef.current.currentTime = ts[0].start
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor:
                      currentTextIndex === index
                        ? 'white'
                        : 'rgba(255, 255, 255, 0.2)',
                    color: currentTextIndex === index ? '#667eea' : 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    minHeight: '44px',
                  }}
                >
                  {t.title}
                </button>
              ))}
            </div>
          )}

          {/* Synced reading with word-level annotations */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '20px',
            }}
          >
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#667eea',
                marginBottom: '16px',
              }}
            >
              {currentText.title}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {currentText.audioTimestamps.map((ts, idx) => {
                const isActive = highlightIndex === idx
                const isTitle = ts.text === currentText.title || ts.text === '口试练习：做家务'
                if (isTitle) return null

                const segments = segmentText(ts.text)

                return (
                  <div
                    key={idx}
                    ref={isActive ? highlightRef : null}
                    onClick={() => seekToTimestamp(ts.start)}
                    style={{
                      padding: isActive ? '14px' : '8px 14px',
                      backgroundColor: isActive ? '#667eea' : 'transparent',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {/* Chinese text with word annotations */}
                    <div style={{
                      fontSize: isActive ? '20px' : '17px',
                      lineHeight: isActive ? '2.4' : '2',
                      color: isActive ? 'white' : '#333',
                      transition: 'all 0.3s ease',
                    }}>
                      {isActive ? (
                        // When active: show words with ruby annotations (pinyin on top)
                        segments.map((seg, sIdx) =>
                          seg.isWord && seg.def ? (
                            <ruby
                              key={sIdx}
                              onClick={(e) => {
                                e.stopPropagation()
                                if (audioRef.current && !audioRef.current.paused) {
                                  audioRef.current.pause()
                                }
                                setSelectedWord({word: seg.text, def: seg.def!})
                              }}
                              style={{
                                cursor: 'pointer',
                                borderBottom: '2px dotted rgba(255,255,255,0.5)',
                                rubyPosition: 'over',
                              }}
                            >
                              {seg.text}
                              <rp>(</rp>
                              <rt style={{
                                fontSize: '10px',
                                color: 'rgba(255,255,255,0.85)',
                                fontWeight: '400',
                                letterSpacing: '0.5px',
                              }}>
                                {seg.def.pinyin}
                              </rt>
                              <rp>)</rp>
                            </ruby>
                          ) : (
                            <span key={sIdx}>{seg.text}</span>
                          )
                        )
                      ) : (
                        // When inactive: plain text, words still clickable
                        segments.map((seg, sIdx) =>
                          seg.isWord && seg.def ? (
                            <span
                              key={sIdx}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedWord({word: seg.text, def: seg.def!})
                              }}
                              style={{
                                cursor: 'pointer',
                                borderBottom: '2px dotted #667eea',
                                color: '#667eea',
                              }}
                            >
                              {seg.text}
                            </span>
                          ) : (
                            <span key={sIdx}>{seg.text}</span>
                          )
                        )
                      )}
                    </div>

                    {/* English translation - only when active */}
                    {isActive && ts.english && (
                      <div style={{
                        fontSize: '13px',
                        color: 'rgba(255,255,255,0.8)',
                        marginTop: '6px',
                        fontStyle: 'italic',
                        lineHeight: '1.5',
                      }}>
                        {ts.english}
                      </div>
                    )}

                    {/* Word meanings bar - only when active */}
                    {isActive && (
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px',
                        marginTop: '8px',
                      }}>
                        {segments
                          .filter(seg => seg.isWord && seg.def)
                          .map((seg, mIdx) => (
                            <span
                              key={mIdx}
                              onClick={(e) => {
                                e.stopPropagation()
                                if (audioRef.current && !audioRef.current.paused) {
                                  audioRef.current.pause()
                                }
                                setSelectedWord({word: seg.text, def: seg.def!})
                              }}
                              style={{
                                fontSize: '11px',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                color: 'rgba(255,255,255,0.9)',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {seg.text} = {seg.def!.english}
                            </span>
                          ))
                        }
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div style={{
              marginTop: '15px',
              padding: '10px',
              backgroundColor: '#f0f0f0',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#666'
            }}>
              点击句子跳转播放 · 点击蓝色词语查看解释
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
              <div>
                <h3 style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea', marginBottom: '5px' }}>
                  {selectedWord.word}
                </h3>
                <p style={{ fontSize: '16px', color: '#999', marginBottom: '10px' }}>
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
              <p style={{ fontSize: '16px', color: '#333', marginBottom: '10px', fontWeight: '500' }}>
                {selectedWord.def.english}
              </p>
              <p style={{ fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
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
