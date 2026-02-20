import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'

export const Route = createFileRoute('/p3hcl-reading-sync')({
  component: P3HCLReadingSyncPage,
})

interface WordDefinition {
  pinyin: string
  english: string
  explanation: string
  audio: string
}

interface ReadingText {
  title: string
  paragraphs: string[]
}

interface ReadingData {
  title: string
  titleChinese: string
  audioFile: string
  texts: ReadingText[]
}

function P3HCLReadingSyncPage() {
  const [data, setData] = useState<ReadingData | null>(null)
  const [wordDefs, setWordDefs] = useState<Record<string, WordDefinition>>({})
  const [loading, setLoading] = useState(true)
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [selectedWord, setSelectedWord] = useState<{word: string; def: WordDefinition} | null>(null)
  const { play } = useAudioPlayer()

  useEffect(() => {
    const loadData = async () => {
      try {
        const [textResponse, wordsResponse] = await Promise.all([
          fetch('/data/p3hcl_reading_7.json'),
          fetch('/data/p3hcl_reading_7_words.json')
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

  const segmentText = (text: string) => {
    const segments: Array<{text: string; isWord: boolean; def?: WordDefinition}> = []
    let i = 0

    while (i < text.length) {
      let matched = false

      // Try to match longest word first (up to 6 characters)
      for (let len = Math.min(6, text.length - i); len > 0; len--) {
        const substr = text.substr(i, len)
        if (wordDefs[substr]) {
          segments.push({text: substr, isWord: true, def: wordDefs[substr]})
          i += len
          matched = true
          break
        }
      }

      if (!matched) {
        // No match, add as plain text
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
                <audio controls style={{ width: '100%' }}>
                  <source src={`/audio/${data.audioFile}`} type="audio/mp4" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            </div>
          )}

          {/* Text navigation */}
          {data.texts.length > 1 && (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              {data.texts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTextIndex(index)}
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
                    minHeight: '40px',
                  }}
                >
                  短文{index + 1}
                </button>
              ))}
            </div>
          )}

          {/* Reading text with tappable words */}
          <div
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
              {currentText.title}
            </h2>
            {currentText.paragraphs.map((paragraph, pIndex) => (
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
                {segmentText(paragraph).map((segment, sIndex) =>
                  segment.isWord && segment.def ? (
                    <span
                      key={sIndex}
                      onClick={() => setSelectedWord({word: segment.text, def: segment.def!})}
                      style={{
                        cursor: 'pointer',
                        borderBottom: '2px dotted #667eea',
                        color: '#667eea',
                        fontWeight: '500',
                      }}
                    >
                      {segment.text}
                    </span>
                  ) : (
                    <span key={sIndex}>{segment.text}</span>
                  )
                )}
              </p>
            ))}

            <div style={{
              marginTop: '15px',
              padding: '10px',
              backgroundColor: '#f0f0f0',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#666'
            }}>
              💡 点击蓝色词语查看解释和发音
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
