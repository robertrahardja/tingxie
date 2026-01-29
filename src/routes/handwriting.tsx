
import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/handwriting')({
  component: HandwritingPage,
})

// Type definitions for HanziWriter
interface HanziWriter {
  quiz: (options: {
    onMistake?: (strokeData: { strokeNum: number }) => void
    onCorrectStroke?: (strokeData: { strokeNum: number }) => void
    onComplete?: (summaryData: { totalMistakes: number }) => void
  }) => void
  highlightStroke: (strokeNum: number) => void
  cancelQuiz: () => void
}

interface HanziWriterStatic {
  create: (
    element: HTMLElement,
    character: string,
    options: {
      width: number
      height: number
      padding: number
      showOutline: boolean
      showCharacter: boolean
      strokeAnimationSpeed: number
      delayBetweenStrokes: number
      strokeColor: string
      outlineColor: string
      drawingColor: string
      drawingWidth: number
      showHintAfterMisses: number
      highlightOnComplete: boolean
      highlightColor: string
      charDataLoader: (char: string) => Promise<unknown>
    }
  ) => HanziWriter
}

function isChinese(char: string): boolean {
  const code = char.charCodeAt(0)
  return (
    (code >= 0x4e00 && code <= 0x9fff) || // CJK Unified Ideographs
    (code >= 0x3400 && code <= 0x4dbf) || // CJK Unified Ideographs Extension A
    (code >= 0x20000 && code <= 0x2a6df) // CJK Unified Ideographs Extension B
  )
}

function filterChineseCharacters(input: string): string[] {
  return Array.from(input).filter(isChinese)
}

function HandwritingPage() {
  const [inputValue, setInputValue] = useState('你好')
  const [isPracticing, setIsPracticing] = useState(false)
  const [characters, setCharacters] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentStroke, setCurrentStroke] = useState(0)
  const [status, setStatus] = useState('')
  const [statusError, setStatusError] = useState(false)

  const writerRef = useRef<HanziWriter | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hanziWriterModuleRef = useRef<HanziWriterStatic | null>(null)

  // Touch swipe support
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const touchStartedInWriter = useRef(false)

  // Load HanziWriter module
  useEffect(() => {
    const loadHanziWriter = async () => {
      try {
        const module = await import(
          /* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/hanzi-writer@3.7.3/+esm'
        )
        hanziWriterModuleRef.current = module.default
      } catch (error) {
        console.error('Failed to load HanziWriter:', error)
        setStatus('Failed to load HanziWriter library')
        setStatusError(true)
      }
    }
    loadHanziWriter()
  }, [])

  const loadCharacter = useCallback(
    (char: string) => {
      if (!containerRef.current || !hanziWriterModuleRef.current) return

      // Clear the container
      containerRef.current.innerHTML = ''
      setStatus('')
      setStatusError(false)

      const HanziWriter = hanziWriterModuleRef.current

      writerRef.current = HanziWriter.create(containerRef.current, char, {
        width: 300,
        height: 300,
        padding: 20,
        showOutline: true,
        showCharacter: false,
        strokeAnimationSpeed: 1,
        delayBetweenStrokes: 100,
        strokeColor: '#333',
        outlineColor: '#ddd',
        drawingColor: '#4a90d9',
        drawingWidth: 20,
        showHintAfterMisses: 3,
        highlightOnComplete: true,
        highlightColor: '#27ae60',
        charDataLoader: (charToLoad: string) => {
          return fetch(
            `https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${charToLoad}.json`
          ).then((res) => {
            if (!res.ok) throw new Error('Character not found')
            return res.json()
          })
        },
      })

      setCurrentStroke(0)
      writerRef.current.quiz({
        onMistake: (strokeData) => {
          setStatus(
            `${strokeData.strokeNum + 1}: Try again!`
          )
          setStatusError(true)
        },
        onCorrectStroke: (strokeData) => {
          setCurrentStroke(strokeData.strokeNum + 1)
          setStatus(
            `${strokeData.strokeNum + 1}: Correct!`
          )
          setStatusError(false)
        },
        onComplete: (summaryData) => {
          const mistakes = summaryData.totalMistakes
          if (mistakes === 0) {
            setStatus('Perfect! No mistakes!')
          } else {
            setStatus(
              `Complete! ${mistakes} mistake${mistakes > 1 ? 's' : ''}.`
            )
          }
          setStatusError(false)
        },
      })
    },
    []
  )

  const startPractice = () => {
    const chars = filterChineseCharacters(inputValue.trim())

    if (chars.length === 0) {
      alert('Please enter at least one Chinese character.')
      return
    }

    setCharacters(chars)
    setCurrentIndex(0)
    setIsPracticing(true)
    setCurrentStroke(0)

    // Load the first character after state updates
    setTimeout(() => {
      loadCharacter(chars[0])
    }, 100)
  }

  const goToPrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1
      setCurrentIndex(newIndex)
      loadCharacter(characters[newIndex])
    }
  }

  const goToNext = () => {
    if (currentIndex < characters.length - 1) {
      const newIndex = currentIndex + 1
      setCurrentIndex(newIndex)
      loadCharacter(characters[newIndex])
    }
  }

  const showHint = () => {
    if (writerRef.current) {
      writerRef.current.highlightStroke(currentStroke)
    }
  }

  const resetCharacter = () => {
    if (characters[currentIndex]) {
      loadCharacter(characters[currentIndex])
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      startPractice()
    }
  }

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement
    touchStartedInWriter.current = containerRef.current?.contains(target) || false
    touchStartX.current = e.changedTouches[0].screenX
    touchStartY.current = e.changedTouches[0].screenY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartedInWriter.current) {
      touchStartedInWriter.current = false
      return
    }

    const touchEndX = e.changedTouches[0].screenX
    const touchEndY = e.changedTouches[0].screenY

    const diffX = touchStartX.current - touchEndX
    const diffY = Math.abs(touchStartY.current - touchEndY)

    // Only handle horizontal swipes
    if (Math.abs(diffX) > diffY) {
      const swipeThreshold = 80
      if (Math.abs(diffX) > swipeThreshold) {
        if (diffX > 0) {
          goToNext()
        } else {
          goToPrevious()
        }
      }
    }
  }

  return (
    <div className="handwriting-container">
      <header className="handwriting-header">
        <h1>Chinese Handwriting Practice</h1>
      </header>

      <div className="input-section">
        <input
          type="text"
          id="character-input"
          placeholder="Enter characters to practice"
          maxLength={50}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button id="start-btn" onClick={startPractice}>
          Start
        </button>
      </div>

      {isPracticing ? (
        <div
          className="practice-area"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="progress-bar">
            <span>{currentIndex + 1}</span> / <span>{characters.length}</span>
          </div>

          <div className="character-display">
            <span id="current-char">{characters[currentIndex]}</span>
          </div>

          <div id="writer-container">
            <div id="character-target" ref={containerRef}></div>
          </div>

          <div className="controls">
            <button
              className="hw-nav-btn"
              onClick={goToPrevious}
              disabled={currentIndex === 0}
            >
              Prev
            </button>
            <button className="action-btn" onClick={showHint}>
              Hint
            </button>
            <button className="action-btn reset-btn" onClick={resetCharacter}>
              Reset
            </button>
            <button
              className="hw-nav-btn"
              onClick={goToNext}
              disabled={currentIndex >= characters.length - 1}
            >
              Next
            </button>
          </div>

          <div className={cn('status', statusError && 'error')}>{status}</div>
        </div>
      ) : (
        <div className="instructions">
          <h2>How to Use</h2>
          <ul>
            <li>Enter Chinese characters you want to practice</li>
            <li>Write each stroke in the correct order</li>
            <li>Use "Hint" to see the next stroke</li>
            <li>Use "Reset" to clear and try again</li>
            <li>Navigate between characters with Previous/Next</li>
          </ul>
          <p>
            <strong>Sample characters:</strong> 你好世界学习中文
          </p>
        </div>
      )}
    </div>
  )
}
