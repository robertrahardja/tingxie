import { useState, useMemo, useCallback, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, queryOptions } from '@tanstack/react-query'
import { WordCard } from '@/components/word/WordCard'
import { SelfAssessButtons } from '@/components/word/SelfAssessButtons'
import { UI_LABELS } from '@/lib/constants'
import type { RevealState } from '@/types/vocabulary'
import { DEFAULT_REVEAL_STATE } from '@/types/vocabulary'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/curriculum')({
  component: CurriculumPage,
})

// Types for curriculum data
interface CurriculumWord {
  simplified: string
  traditional: string
  pinyin: string
  english: string
  audio: string
  exam_frequency: number
  hsk_level: number | null
}

interface CurriculumRow {
  row: number
  words: CurriculumWord[]
}

interface CurriculumLevel {
  word_count: number
  row_count: number
  rows: CurriculumRow[]
}

interface CurriculumData {
  title: string
  description: string
  levels: Record<string, CurriculumLevel>
}

type GradeLevel = 'P1' | 'P2' | 'P3'

const CURRICULUM_DATA_PATH = '/data/curriculum_p1_p3.json'

const curriculumQueryOptions = queryOptions({
  queryKey: ['curriculum-p1-p3'],
  queryFn: async (): Promise<CurriculumData> => {
    const response = await fetch(CURRICULUM_DATA_PATH)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  },
  staleTime: 1000 * 60 * 60, // 1 hour
  gcTime: 1000 * 60 * 60 * 24,
})

// Persist curriculum progress in localStorage
const STORAGE_KEY = 'curriculum_progress'

interface CurriculumProgress {
  knownWords: string[]
  unknownWords: string[]
}

function loadProgress(): CurriculumProgress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return { knownWords: [], unknownWords: [] }
}

function saveProgress(progress: CurriculumProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

function CurriculumPage() {
  const { data, isLoading, error } = useQuery(curriculumQueryOptions)

  const [selectedLevel, setSelectedLevel] = useState<GradeLevel>('P1')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [revealState, setRevealState] = useState<RevealState>({ ...DEFAULT_REVEAL_STATE })
  const [showUnknownOnly, setShowUnknownOnly] = useState(false)

  // Progress state
  const [knownWords, setKnownWords] = useState<Set<string>>(() => new Set(loadProgress().knownWords))
  const [unknownWords, setUnknownWords] = useState<Set<string>>(() => new Set(loadProgress().unknownWords))

  // Get all words for the selected level
  const levelWords = useMemo(() => {
    if (!data) return []
    const level = data.levels[selectedLevel]
    if (!level) return []
    return level.rows.flatMap((r) => r.words)
  }, [data, selectedLevel])

  // Filter words
  const filteredWords = useMemo(() => {
    if (!showUnknownOnly) return levelWords
    return levelWords.filter((w) => unknownWords.has(w.simplified))
  }, [levelWords, showUnknownOnly, unknownWords])

  // Adapt curriculum word to the Word type expected by WordCard
  const currentWord = useMemo(() => {
    const w = filteredWords[currentIndex]
    if (!w) return null
    return {
      simplified: w.simplified,
      traditional: w.traditional,
      pinyin: w.pinyin,
      english: w.english,
      audio: w.audio,
      important: false,
    }
  }, [filteredWords, currentIndex])

  const totalWords = filteredWords.length

  // Reset index when level or filter changes
  useEffect(() => {
    setCurrentIndex(0)
    setRevealState({ ...DEFAULT_REVEAL_STATE })
  }, [selectedLevel, showUnknownOnly])

  const handleToggleReveal = useCallback((field: keyof RevealState) => {
    setRevealState((prev) => ({ ...prev, [field]: !prev[field] }))
  }, [])

  const goNext = useCallback(() => {
    if (currentIndex < totalWords - 1) {
      setCurrentIndex((i) => i + 1)
      setRevealState({ ...DEFAULT_REVEAL_STATE })
    }
  }, [currentIndex, totalWords])

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1)
      setRevealState({ ...DEFAULT_REVEAL_STATE })
    }
  }, [currentIndex])

  const handleKnow = useCallback(() => {
    if (!currentWord) return
    const word = currentWord.simplified
    setKnownWords((prev) => {
      const next = new Set(prev)
      next.add(word)
      return next
    })
    setUnknownWords((prev) => {
      const next = new Set(prev)
      next.delete(word)
      return next
    })
    // Save and advance
    setTimeout(() => {
      const prog = loadProgress()
      const kSet = new Set(prog.knownWords)
      const uSet = new Set(prog.unknownWords)
      kSet.add(word)
      uSet.delete(word)
      saveProgress({ knownWords: [...kSet], unknownWords: [...uSet] })
    }, 0)
    goNext()
  }, [currentWord, goNext])

  const handleDontKnow = useCallback(() => {
    if (!currentWord) return
    const word = currentWord.simplified
    setUnknownWords((prev) => {
      const next = new Set(prev)
      next.add(word)
      return next
    })
    setKnownWords((prev) => {
      const next = new Set(prev)
      next.delete(word)
      return next
    })
    setTimeout(() => {
      const prog = loadProgress()
      const kSet = new Set(prog.knownWords)
      const uSet = new Set(prog.unknownWords)
      uSet.add(word)
      kSet.delete(word)
      saveProgress({ knownWords: [...kSet], unknownWords: [...uSet] })
    }, 0)
    goNext()
  }, [currentWord, goNext])

  // Stats for current level
  const levelStats = useMemo(() => {
    const total = levelWords.length
    const known = levelWords.filter((w) => knownWords.has(w.simplified)).length
    const unknown = levelWords.filter((w) => unknownWords.has(w.simplified)).length
    const untested = total - known - unknown
    return { total, known, unknown, untested }
  }, [levelWords, knownWords, unknownWords])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-white text-xl">无法加载课程词语</div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <header className="header-row">
        <h1 className="page-title">课程词语</h1>
        <div className="controls">
          <div className="progress-display">
            {currentIndex + 1} / {totalWords}
          </div>
        </div>
      </header>

      {/* Level selector */}
      <div className="flex gap-2 px-4 pb-2 flex-wrap">
        {(['P1', 'P2', 'P3'] as GradeLevel[]).map((level) => {
          const lvlWords = data?.levels[level]
          const count = lvlWords?.word_count ?? 0
          const knownCount = lvlWords
            ? lvlWords.rows.flatMap((r) => r.words).filter((w) => knownWords.has(w.simplified)).length
            : 0
          return (
            <button
              key={level}
              className={cn(
                'px-5 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] min-w-[60px]',
                selectedLevel === level
                  ? 'bg-white/20 text-white border-2 border-white/40'
                  : 'bg-white/5 text-white/60 border-2 border-transparent'
              )}
              onClick={() => setSelectedLevel(level)}
            >
              {level}
              <span className="block text-xs opacity-70">
                {knownCount}/{count}
              </span>
            </button>
          )
        })}

        {/* Unknown filter */}
        <button
          className={cn(
            'px-5 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] min-w-[60px] ml-auto',
            showUnknownOnly
              ? 'bg-red-500/30 text-red-200 border-2 border-red-400/40'
              : 'bg-white/5 text-white/60 border-2 border-transparent'
          )}
          onClick={() => setShowUnknownOnly((v) => !v)}
        >
          {showUnknownOnly ? '全部' : '复习'}
          <span className="block text-xs opacity-70">
            {levelStats.unknown} 不会
          </span>
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-4 pb-3">
        <div className="flex h-2 rounded-full overflow-hidden bg-white/10">
          <div
            className="bg-green-400 transition-all"
            style={{ width: `${levelStats.total ? (levelStats.known / levelStats.total) * 100 : 0}%` }}
          />
          <div
            className="bg-red-400 transition-all"
            style={{ width: `${levelStats.total ? (levelStats.unknown / levelStats.total) * 100 : 0}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-white/50 mt-1 px-1">
          <span>会 {levelStats.known}</span>
          <span>不会 {levelStats.unknown}</span>
          <span>未测 {levelStats.untested}</span>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Navigation buttons */}
        <div className="nav-buttons">
          <button
            className="nav-btn"
            onClick={goPrev}
            disabled={currentIndex === 0}
          >
            {UI_LABELS.PREV_BTN}
          </button>
          <button
            className="nav-btn"
            onClick={goNext}
            disabled={currentIndex >= totalWords - 1}
          >
            {UI_LABELS.NEXT_BTN}
          </button>
        </div>

        {currentWord ? (
          <>
            <WordCard
              key={currentWord.simplified}
              word={currentWord}
              currentIndex={currentIndex}
              totalWords={totalWords}
              revealState={revealState}
              onToggleReveal={handleToggleReveal}
            />
            <SelfAssessButtons
              onKnow={handleKnow}
              onDontKnow={handleDontKnow}
            />
          </>
        ) : (
          <div className="flex items-center justify-center min-h-[30vh]">
            <div className="text-center">
              <div className="text-4xl mb-4">
                {showUnknownOnly ? '🎉' : '📚'}
              </div>
              <div className="text-white text-lg">
                {showUnknownOnly
                  ? '太棒了！没有需要复习的词语'
                  : '没有词语'}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
