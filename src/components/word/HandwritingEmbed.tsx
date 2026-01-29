import { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface HandwritingEmbedProps {
  characters: string
  onClose: () => void
}

// HanziWriter types
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
    options: Record<string, unknown>
  ) => HanziWriter
}

export function HandwritingEmbed({ characters, onClose }: HandwritingEmbedProps) {
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [currentStroke, setCurrentStroke] = useState(0)
  const [status, setStatus] = useState('')
  const [statusError, setStatusError] = useState(false)

  const writerRef = useRef<HanziWriter | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hanziWriterModuleRef = useRef<HanziWriterStatic | null>(null)

  const currentChar = characters[currentCharIndex]
  const totalChars = characters.length

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
        setStatus('无法加载笔画库')
        setStatusError(true)
      }
    }
    loadHanziWriter()
  }, [])

  const loadCharacter = useCallback(() => {
    if (!containerRef.current || !hanziWriterModuleRef.current || !currentChar) return

    // Clear the container
    containerRef.current.innerHTML = ''
    setStatus('')
    setStatusError(false)
    setCurrentStroke(0)

    try {
      writerRef.current = hanziWriterModuleRef.current.create(
        containerRef.current,
        currentChar,
        {
          width: 280,
          height: 280,
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
          charDataLoader: (char: string) => {
            return fetch(
              `https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${char}.json`
            ).then((res) => {
              if (!res.ok) throw new Error('Character not found')
              return res.json()
            })
          },
        }
      )

      // Start quiz mode
      writerRef.current.quiz({
        onMistake: (strokeData) => {
          setStatus(`第 ${strokeData.strokeNum + 1} 笔: 再试一次！`)
          setStatusError(true)
        },
        onCorrectStroke: (strokeData) => {
          setCurrentStroke(strokeData.strokeNum + 1)
          setStatus(`第 ${strokeData.strokeNum + 1} 笔: 正确！`)
          setStatusError(false)
        },
        onComplete: (summaryData) => {
          const mistakes = summaryData.totalMistakes
          if (mistakes === 0) {
            setStatus('完美！没有错误！')
          } else {
            setStatus(`完成！${mistakes} 个错误`)
          }
          setStatusError(false)
        },
      })
    } catch (error) {
      console.error('Failed to create HanziWriter:', error)
      setStatus('无法加载该字符')
      setStatusError(true)
    }
  }, [currentChar])

  // Load character when module is ready or character changes
  useEffect(() => {
    if (hanziWriterModuleRef.current) {
      loadCharacter()
    }
  }, [loadCharacter, currentCharIndex])

  // Also load when module first becomes available
  useEffect(() => {
    const checkAndLoad = setInterval(() => {
      if (hanziWriterModuleRef.current && containerRef.current) {
        loadCharacter()
        clearInterval(checkAndLoad)
      }
    }, 100)

    return () => clearInterval(checkAndLoad)
  }, [loadCharacter])

  const handleHint = () => {
    if (writerRef.current) {
      writerRef.current.highlightStroke(currentStroke)
    }
  }

  const handleReset = () => {
    loadCharacter()
  }

  const handlePrevChar = () => {
    if (currentCharIndex > 0) {
      setCurrentCharIndex(currentCharIndex - 1)
    }
  }

  const handleNextChar = () => {
    if (currentCharIndex < totalChars - 1) {
      setCurrentCharIndex(currentCharIndex + 1)
    }
  }

  return (
    <div className="handwriting-embed">
      <div className="handwriting-embed-header">
        <h3>笔画练习</h3>
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="character-display-embed">
        <span>
          {characters}
          {totalChars > 1 && ` (${currentCharIndex + 1}/${totalChars})`}
        </span>
      </div>

      <div id="handwriting-writer-container">
        <div ref={containerRef} id="handwriting-target" />
      </div>

      <div className="handwriting-controls-embed">
        <button className="handwriting-action-btn" onClick={handleHint}>
          显示提示
        </button>
        <button className="handwriting-action-btn reset" onClick={handleReset}>
          重置
        </button>
      </div>

      {totalChars > 1 && (
        <div className="handwriting-char-nav">
          <button
            className="char-nav-btn"
            onClick={handlePrevChar}
            disabled={currentCharIndex === 0}
          >
            ← 上一个字
          </button>
          <button
            className="char-nav-btn"
            onClick={handleNextChar}
            disabled={currentCharIndex >= totalChars - 1}
          >
            下一个字 →
          </button>
        </div>
      )}

      <div className={cn('handwriting-status', statusError && 'error')}>
        {status}
      </div>
    </div>
  )
}
