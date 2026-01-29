import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import type { SchoolVocabularyData, SchoolVocabularyItem, SchoolWord } from '@/types/vocabulary'

export const Route = createFileRoute('/school-tingxie')({
  component: SchoolTingxiePage,
})

// Chinese number mapping
const CHINESE_NUMBERS = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十']

function SchoolTingxiePage() {
  const [data, setData] = useState<SchoolVocabularyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentSetIndex, setCurrentSetIndex] = useState(0)
  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  const [isRevealed, setIsRevealed] = useState(false)
  const [popupWord, setPopupWord] = useState<SchoolWord | null>(null)

  const { play } = useAudioPlayer()

  // Load data
  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/data/tingxie/school_vocabulary.json')
        if (!response.ok) {
          throw new Error('Failed to load data')
        }
        const json: SchoolVocabularyData = await response.json()
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Get current set and item
  const currentSet = data?.vocabulary[currentSetIndex]
  const currentItem = currentSet?.items[currentItemIndex]
  const totalItems = currentSet?.items.length || 0

  // Reset reveal state when changing items
  useEffect(() => {
    setIsRevealed(false)
  }, [currentSetIndex, currentItemIndex])

  // Handle set change
  const handleSetChange = useCallback((index: number) => {
    setCurrentSetIndex(index)
    setCurrentItemIndex(0)
    setIsRevealed(false)
  }, [])

  // Handle navigation
  const handlePrevItem = useCallback(() => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(currentItemIndex - 1)
    }
  }, [currentItemIndex])

  const handleNextItem = useCallback(() => {
    if (currentItemIndex < totalItems - 1) {
      setCurrentItemIndex(currentItemIndex + 1)
    }
  }, [currentItemIndex, totalItems])

  // Handle audio
  const handlePlayAudio = useCallback(async () => {
    if (currentItem?.audio) {
      await play(currentItem.audio)
    }
  }, [currentItem, play])

  // Handle word click
  const handleWordClick = useCallback((word: SchoolWord) => {
    setPopupWord(word)
  }, [])

  // Handle popup audio
  const handlePopupAudio = useCallback(async () => {
    if (popupWord) {
      // Try to play audio for the word
      const audioPath = `audio/${popupWord.simplified}.mp3`
      await play(audioPath)
    }
  }, [popupWord, play])

  // Close popup
  const closePopup = useCallback(() => {
    setPopupWord(null)
  }, [])

  // Render content based on item type
  const renderContent = (item: SchoolVocabularyItem) => {
    if (item.type === 'pinyin') {
      return (
        <div className="sentence-content-wrapper">
          <div className="pinyin-display">{item.pinyin}</div>
          <div
            className={`sentence-content ${isRevealed ? '' : 'covered'}`}
            onClick={() => !isRevealed && setIsRevealed(true)}
          >
            {renderWordsWithClick(item.characters || '', item.words)}
          </div>
        </div>
      )
    }

    if (item.type === 'moxie') {
      return (
        <div className="sentence-content-wrapper">
          {item.label && <div className="moxie-label">{item.label}</div>}
          <div
            className={`sentence-content ${isRevealed ? '' : 'covered'}`}
            onClick={() => !isRevealed && setIsRevealed(true)}
          >
            {renderWordsWithClick(item.sentence || '', item.words)}
          </div>
          {item.note && isRevealed && <div className="moxie-note">{item.note}</div>}
        </div>
      )
    }

    // sentence type (default)
    return (
      <div className="sentence-content-wrapper">
        <div
          className={`sentence-content ${isRevealed ? '' : 'covered'}`}
          onClick={() => !isRevealed && setIsRevealed(true)}
        >
          {renderWordsWithClick(item.sentence || '', item.words)}
        </div>
      </div>
    )
  }

  // Render words with clickable spans
  const renderWordsWithClick = (text: string, words: SchoolWord[]) => {
    if (!isRevealed || !words?.length) {
      return text
    }

    // Create a map of simplified characters to word info
    const wordMap = new Map<string, SchoolWord>()
    words.forEach((word) => {
      wordMap.set(word.simplified, word)
    })

    // Sort words by length (longer first) to match multi-character words first
    const sortedWords = [...words].sort((a, b) => b.simplified.length - a.simplified.length)

    // Build clickable segments
    const segments: { text: string; word?: SchoolWord }[] = []
    let remaining = text
    let pos = 0

    while (pos < remaining.length) {
      let matched = false
      for (const word of sortedWords) {
        if (remaining.slice(pos).startsWith(word.simplified)) {
          if (pos > 0) {
            // Add non-matched text before this word
            const beforeText = remaining.slice(0, pos)
            if (beforeText) {
              segments.push({ text: beforeText })
            }
          }
          segments.push({ text: word.simplified, word })
          remaining = remaining.slice(pos + word.simplified.length)
          pos = 0
          matched = true
          break
        }
      }
      if (!matched) {
        pos++
      }
    }

    // Add any remaining text
    if (remaining) {
      segments.push({ text: remaining })
    }

    return segments.map((segment, index) =>
      segment.word ? (
        <span
          key={index}
          className="word"
          onClick={(e) => {
            e.stopPropagation()
            handleWordClick(segment.word!)
          }}
        >
          {segment.text}
        </span>
      ) : (
        <span key={index}>{segment.text}</span>
      )
    )
  }

  // Get type badge
  const getTypeBadge = (item: SchoolVocabularyItem) => {
    const badges = []

    if (item.type === 'pinyin') {
      badges.push(
        <span key="pinyin" className="item-type-badge pinyin-type">
          拼音
        </span>
      )
    } else if (item.type === 'moxie') {
      badges.push(
        <span key="moxie" className="item-type-badge moxie-type">
          默写
        </span>
      )
    }

    if (item.difficult) {
      badges.push(
        <span key="difficult" className="item-type-badge difficult">
          难
        </span>
      )
    }

    return badges
  }

  if (loading) {
    return (
      <div>
        <header className="header-row">
          <h1 className="page-title">三年级听写</h1>
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
          <h1 className="page-title">三年级听写</h1>
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
        <h1 className="page-title">三年级听写</h1>
      </header>

      <main>
        {/* Set selector */}
        <div className="set-selector">
          {data.vocabulary.map((set, index) => (
            <button
              key={set.row}
              className={`set-btn ${index === currentSetIndex ? 'active' : ''}`}
              onClick={() => handleSetChange(index)}
            >
              {CHINESE_NUMBERS[index] || index + 1}
            </button>
          ))}
        </div>

        {/* Current set title */}
        <div className="set-title">{currentSet?.title}</div>

        {/* Sentence card */}
        {currentItem && (
          <div className="sentence-card">
            <div className="item-number">
              第 {currentItemIndex + 1} 题
              {getTypeBadge(currentItem)}
            </div>

            <button className="audio-play-btn" onClick={handlePlayAudio}>
              🔊
            </button>

            {renderContent(currentItem)}

            {!isRevealed && (
              <button className="reveal-btn" onClick={() => setIsRevealed(true)}>
                显示答案
              </button>
            )}

            {isRevealed && (
              <div className="answer-section">
                <div className="keyword-section">
                  <div className="keyword-label">重点词语</div>
                  <div className="keyword-text">{currentItem.keyword || currentItem.characters}</div>
                </div>
                <div className="english-translation">{currentItem.english}</div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="item-navigation">
          <button
            className="item-nav-btn prev"
            onClick={handlePrevItem}
            disabled={currentItemIndex === 0}
          >
            上一题
          </button>
          <button
            className="item-nav-btn next"
            onClick={handleNextItem}
            disabled={currentItemIndex >= totalItems - 1}
          >
            下一题
          </button>
        </div>

        <div className="progress-indicator">
          {currentItemIndex + 1} / {totalItems}
        </div>
      </main>

      {/* Word Popup */}
      <div
        className={`popup-overlay ${popupWord ? 'show' : ''}`}
        onClick={closePopup}
      />
      <div className={`word-popup ${popupWord ? 'show' : ''}`}>
        {popupWord && (
          <>
            <div className="popup-traditional">{popupWord.traditional}</div>
            <div className="popup-simplified">({popupWord.simplified})</div>
            <div className="popup-pinyin">{popupWord.pinyin}</div>
            <div className="popup-meaning">{popupWord.meaning}</div>
            <button className="popup-audio-btn" onClick={handlePopupAudio}>
              🔊 听发音
            </button>
            <br />
            <button className="popup-close" onClick={closePopup}>
              关闭
            </button>
          </>
        )}
      </div>
    </div>
  )
}
