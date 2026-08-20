import { useState, useMemo, useCallback, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, queryOptions } from '@tanstack/react-query'
import { AudioButton } from '@/components/audio/AudioButton'
import { HandwritingEmbed } from '@/components/word/HandwritingEmbed'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/curriculum-test')({
  component: CurriculumTestPage,
})

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
const LEVELS: GradeLevel[] = ['P1', 'P2', 'P3']

const CURRICULUM_DATA_PATH = '/data/curriculum_p1_p3.json'

const curriculumQueryOptions = queryOptions({
  queryKey: ['curriculum-p1-p3'],
  queryFn: async (): Promise<CurriculumData> => {
    const response = await fetch(CURRICULUM_DATA_PATH)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  },
  staleTime: 1000 * 60 * 60,
  gcTime: 1000 * 60 * 60 * 24,
})

// ---------------------------------------------------------------------------
// Image lookup — mirrors WordCard: /images/<simplified>.{png,jpg,gif}
// Missing images degrade silently, so the page works before any backfill.
// ---------------------------------------------------------------------------

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.gif']
const imageCache = new Map<string, string | null>()
const inflightLookups = new Map<string, Promise<string | null>>()

async function lookupImage(simplified: string): Promise<string | null> {
  if (imageCache.has(simplified)) return imageCache.get(simplified)!
  if (inflightLookups.has(simplified)) return inflightLookups.get(simplified)!

  const lookup = (async () => {
    for (const ext of IMAGE_EXTENSIONS) {
      const path = `/images/${encodeURIComponent(simplified)}${ext}`
      try {
        const res = await fetch(path, { method: 'HEAD' })
        const contentType = res.headers.get('content-type') || ''
        if (res.ok && contentType.startsWith('image/')) {
          imageCache.set(simplified, path)
          inflightLookups.delete(simplified)
          return path
        }
      } catch {
        // try next extension
      }
    }
    imageCache.set(simplified, null)
    inflightLookups.delete(simplified)
    return null
  })()

  inflightLookups.set(simplified, lookup)
  return lookup
}

function useWordImage(simplified: string | undefined): string | null {
  const [imagePath, setImagePath] = useState<string | null>(() =>
    simplified ? imageCache.get(simplified) ?? null : null
  )

  useEffect(() => {
    if (!simplified) {
      setImagePath(null)
      return
    }
    if (imageCache.has(simplified)) {
      setImagePath(imageCache.get(simplified)!)
      return
    }
    setImagePath(null)
    let cancelled = false
    lookupImage(simplified).then((path) => {
      if (!cancelled) setImagePath(path)
    })
    return () => {
      cancelled = true
    }
  }, [simplified])

  return imagePath
}

// ---------------------------------------------------------------------------
// Test state
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'curriculum_test_results'
const TEST_SIZE_OPTIONS = [10, 20, 30] as const

type TestSize = (typeof TEST_SIZE_OPTIONS)[number]
type Phase = 'setup' | 'testing' | 'results'
type Grade = 'correct' | 'wrong'

interface StoredResults {
  // simplified -> number of times marked wrong, so weak words resurface first
  wrongCounts: Record<string, number>
  correctCounts: Record<string, number>
}

function loadResults(): StoredResults {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        wrongCounts: parsed.wrongCounts ?? {},
        correctCounts: parsed.correctCounts ?? {},
      }
    }
  } catch {
    /* ignore malformed storage */
  }
  return { wrongCounts: {}, correctCounts: {} }
}

function saveResults(results: StoredResults) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results))
  } catch {
    /* quota or private mode — testing still works in-session */
  }
}

/** Fisher-Yates, seeded by nothing in particular — a fresh shuffle each test. */
function shuffle<T>(items: T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function CurriculumTestPage() {
  const { data, isLoading, error } = useQuery(curriculumQueryOptions)

  const [phase, setPhase] = useState<Phase>('setup')
  const [selectedLevels, setSelectedLevels] = useState<Set<GradeLevel>>(
    () => new Set<GradeLevel>(['P3'])
  )
  const [testSize, setTestSize] = useState<TestSize>(10)
  const [weakFirst, setWeakFirst] = useState(true)

  const [questions, setQuestions] = useState<CurriculumWord[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [grades, setGrades] = useState<Record<string, Grade>>({})
  const [showHandwriting, setShowHandwriting] = useState(false)

  const [results, setResults] = useState<StoredResults>(() => loadResults())

  const currentWord = questions[currentIndex]
  const imagePath = useWordImage(currentWord?.simplified)

  // Pool of words across every selected level
  const wordPool = useMemo(() => {
    if (!data) return []
    return LEVELS.filter((l) => selectedLevels.has(l)).flatMap(
      (l) => data.levels[l]?.rows.flatMap((r) => r.words) ?? []
    )
  }, [data, selectedLevels])

  const toggleLevel = useCallback((level: GradeLevel) => {
    setSelectedLevels((prev) => {
      const next = new Set(prev)
      if (next.has(level)) {
        // Never allow an empty selection — there'd be nothing to test.
        if (next.size === 1) return prev
        next.delete(level)
      } else {
        next.add(level)
      }
      return next
    })
  }, [])

  const startTest = useCallback(() => {
    if (wordPool.length === 0) return

    let picked: CurriculumWord[]
    if (weakFirst) {
      // Words previously marked wrong come first, most-missed leading, then
      // untested words, then words already known. Shuffle within each band so
      // repeat tests aren't identical.
      const wrong = shuffle(wordPool.filter((w) => (results.wrongCounts[w.simplified] ?? 0) > 0)).sort(
        (a, b) =>
          (results.wrongCounts[b.simplified] ?? 0) - (results.wrongCounts[a.simplified] ?? 0)
      )
      const untested = shuffle(
        wordPool.filter(
          (w) =>
            (results.wrongCounts[w.simplified] ?? 0) === 0 &&
            (results.correctCounts[w.simplified] ?? 0) === 0
        )
      )
      const known = shuffle(
        wordPool.filter(
          (w) =>
            (results.wrongCounts[w.simplified] ?? 0) === 0 &&
            (results.correctCounts[w.simplified] ?? 0) > 0
        )
      )
      picked = [...wrong, ...untested, ...known].slice(0, testSize)
    } else {
      picked = shuffle(wordPool).slice(0, testSize)
    }

    setQuestions(picked)
    setCurrentIndex(0)
    setRevealed(false)
    setGrades({})
    setShowHandwriting(false)
    setPhase('testing')
  }, [wordPool, weakFirst, testSize, results])

  const gradeAndAdvance = useCallback(
    (grade: Grade) => {
      if (!currentWord) return
      const word = currentWord.simplified

      setGrades((prev) => ({ ...prev, [word]: grade }))

      setResults((prev) => {
        const next: StoredResults = {
          wrongCounts: { ...prev.wrongCounts },
          correctCounts: { ...prev.correctCounts },
        }
        if (grade === 'wrong') {
          next.wrongCounts[word] = (next.wrongCounts[word] ?? 0) + 1
        } else {
          next.correctCounts[word] = (next.correctCounts[word] ?? 0) + 1
          // A correct answer clears the backlog so it stops leading future tests
          delete next.wrongCounts[word]
        }
        saveResults(next)
        return next
      })

      setShowHandwriting(false)

      if (currentIndex < questions.length - 1) {
        setCurrentIndex((i) => i + 1)
        setRevealed(false)
      } else {
        setPhase('results')
      }
    },
    [currentWord, currentIndex, questions.length]
  )

  const restart = useCallback(() => {
    setPhase('setup')
    setQuestions([])
    setCurrentIndex(0)
    setRevealed(false)
    setGrades({})
    setShowHandwriting(false)
  }, [])

  // Retest only the words missed in the run that just finished
  const retestWrong = useCallback(() => {
    const missed = questions.filter((w) => grades[w.simplified] === 'wrong')
    if (missed.length === 0) return
    setQuestions(shuffle(missed))
    setCurrentIndex(0)
    setRevealed(false)
    setGrades({})
    setShowHandwriting(false)
    setPhase('testing')
  }, [questions, grades])

  const score = useMemo(() => {
    const total = questions.length
    const correct = questions.filter((w) => grades[w.simplified] === 'correct').length
    return { total, correct, wrong: total - correct }
  }, [questions, grades])

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

  // -------------------------------------------------------------------------
  // Setup
  // -------------------------------------------------------------------------
  if (phase === 'setup') {
    const weakCount = wordPool.filter((w) => (results.wrongCounts[w.simplified] ?? 0) > 0).length

    return (
      <div>
        <header className="header-row">
          <h1 className="page-title">听写测验</h1>
        </header>

        <div className="px-4 pb-4 max-w-lg mx-auto w-full">
          <p className="text-white/70 text-sm mb-5">
            听录音，写词语，然后check答案。
          </p>

          {/* Level picker */}
          <div className="mb-5">
            <div className="text-white/80 text-sm font-medium mb-2">选择年级</div>
            <div className="flex gap-2 flex-wrap">
              {LEVELS.map((level) => {
                const count = data?.levels[level]?.word_count ?? 0
                const active = selectedLevels.has(level)
                return (
                  <button
                    key={level}
                    className={cn(
                      'px-5 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] flex-1',
                      active
                        ? 'bg-white/20 text-white border-2 border-white/40'
                        : 'bg-white/5 text-white/60 border-2 border-transparent'
                    )}
                    onClick={() => toggleLevel(level)}
                  >
                    {level}
                    <span className="block text-xs opacity-70">{count} 词</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Test length */}
          <div className="mb-5">
            <div className="text-white/80 text-sm font-medium mb-2">题目数量</div>
            <div className="flex gap-2">
              {TEST_SIZE_OPTIONS.map((size) => (
                <button
                  key={size}
                  className={cn(
                    'px-5 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] flex-1',
                    testSize === size
                      ? 'bg-white/20 text-white border-2 border-white/40'
                      : 'bg-white/5 text-white/60 border-2 border-transparent'
                  )}
                  onClick={() => setTestSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Weak-first toggle */}
          <button
            className={cn(
              'w-full px-4 py-3 rounded-lg text-sm font-medium transition-all min-h-[44px] mb-5 text-left',
              weakFirst
                ? 'bg-amber-500/25 text-amber-100 border-2 border-amber-400/40'
                : 'bg-white/5 text-white/60 border-2 border-transparent'
            )}
            onClick={() => setWeakFirst((v) => !v)}
          >
            <span className="flex items-center justify-between">
              <span>先测不会的词</span>
              <span className="text-xs opacity-80">
                {weakFirst ? '开' : '关'} · {weakCount} 个待复习
              </span>
            </span>
          </button>

          <button
            className="w-full px-6 py-4 rounded-xl text-lg font-semibold bg-green-500/85 text-white min-h-[56px] active:scale-[0.98] transition-transform disabled:opacity-40"
            onClick={startTest}
            disabled={wordPool.length === 0}
          >
            开始测验 ({Math.min(testSize, wordPool.length)} 题)
          </button>

          <div className="text-white/40 text-xs text-center mt-3">
            共 {wordPool.length} 个词语可测
          </div>
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Results
  // -------------------------------------------------------------------------
  if (phase === 'results') {
    const pct = score.total ? Math.round((score.correct / score.total) * 100) : 0
    const missed = questions.filter((w) => grades[w.simplified] === 'wrong')

    return (
      <div>
        <header className="header-row">
          <h1 className="page-title">测验结果</h1>
        </header>

        <div className="px-4 pb-6 max-w-lg mx-auto w-full">
          <div className="text-center py-6">
            <div className="text-6xl mb-3">
              {pct === 100 ? '🎉' : pct >= 70 ? '👍' : '💪'}
            </div>
            <div className="text-white text-4xl font-bold mb-1">
              {score.correct} / {score.total}
            </div>
            <div className="text-white/60 text-lg">{pct}% 正确</div>
          </div>

          <div className="flex h-2 rounded-full overflow-hidden bg-white/10 mb-6">
            <div className="bg-green-400 transition-all" style={{ width: `${pct}%` }} />
            <div className="bg-red-400 transition-all" style={{ width: `${100 - pct}%` }} />
          </div>

          {missed.length > 0 && (
            <div className="mb-6">
              <div className="text-white/80 text-sm font-medium mb-2">
                要复习的词语 ({missed.length})
              </div>
              <div className="flex flex-col gap-2">
                {missed.map((w) => (
                  <div
                    key={w.simplified}
                    className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2"
                  >
                    <AudioButton
                      audioPath={w.audio}
                      revealed
                      onReveal={() => {}}
                      className="shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-white text-lg leading-tight">{w.simplified}</div>
                      <div className="text-white/50 text-xs truncate">
                        {w.pinyin} · {w.english}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {missed.length > 0 && (
              <button
                className="w-full px-6 py-4 rounded-xl text-base font-semibold bg-amber-500/85 text-white min-h-[56px] active:scale-[0.98] transition-transform"
                onClick={retestWrong}
              >
                再测错的词 ({missed.length})
              </button>
            )}
            <button
              className="w-full px-6 py-4 rounded-xl text-base font-semibold bg-white/15 text-white min-h-[56px] active:scale-[0.98] transition-transform"
              onClick={restart}
            >
              新测验
            </button>
          </div>
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Testing
  // -------------------------------------------------------------------------
  if (!currentWord) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-white text-xl">没有词语</div>
      </div>
    )
  }

  return (
    <div>
      <header className="header-row">
        <h1 className="page-title">听写测验</h1>
        <div className="controls">
          <div className="progress-display">
            {currentIndex + 1} / {questions.length}
          </div>
        </div>
      </header>

      {/* Progress through this test */}
      <div className="px-4 pb-3">
        <div className="flex h-1.5 rounded-full overflow-hidden bg-white/10">
          <div
            className="bg-white/50 transition-all"
            style={{ width: `${(currentIndex / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <main className="flex-1 flex flex-col">
        <div className="word-card">
          {/* Prompt: audio is the question. Image shows only after reveal so it
              can't give the answer away. */}
          <div className="flex flex-col items-center gap-4 py-2">
            <AudioButton
              audioPath={currentWord.audio}
              revealed
              onReveal={() => {}}
            />
            <div className="text-slate-400 text-sm">点击听录音</div>
          </div>

          {!revealed ? (
            <div className="text-center py-6">
              <div className="text-slate-400 text-sm mb-1">听录音，写下词语</div>
              <div className="text-slate-200 text-6xl tracking-[0.3em] select-none">
                ？？
              </div>
            </div>
          ) : (
            <>
              {imagePath && (
                <div className="word-image-container">
                  <img src={imagePath} alt={currentWord.english} className="word-memory-image" />
                </div>
              )}
              <div className="text-center py-4">
                <div className="text-slate-800 text-5xl font-medium mb-2">
                  {currentWord.simplified}
                </div>
                {currentWord.traditional !== currentWord.simplified && (
                  <div className="text-slate-400 text-2xl mb-2">{currentWord.traditional}</div>
                )}
                <div className="text-[#667eea] text-xl font-medium mb-1">{currentWord.pinyin}</div>
                <div className="text-slate-500 text-base">{currentWord.english}</div>
              </div>
            </>
          )}

          {revealed && (
            <div className="handwriting-controls">
              <button
                className={cn('handwriting-btn', showHandwriting && 'active')}
                onClick={() => setShowHandwriting((v) => !v)}
              >
                ✍️ 笔画练习
              </button>
            </div>
          )}
        </div>

        {showHandwriting && revealed && (
          <HandwritingEmbed
            key={currentWord.simplified}
            characters={currentWord.simplified}
            onClose={() => setShowHandwriting(false)}
          />
        )}

        {/* Reveal, then self-grade */}
        <div className="px-4 pb-6 max-w-lg mx-auto w-full">
          {!revealed ? (
            <button
              className="w-full px-6 py-4 rounded-xl text-lg font-semibold bg-white/20 text-white min-h-[56px] active:scale-[0.98] transition-transform"
              onClick={() => setRevealed(true)}
            >
              看答案
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                className="flex-1 px-4 py-4 rounded-xl text-base font-semibold bg-red-500/80 text-white min-h-[56px] active:scale-[0.98] transition-transform"
                onClick={() => gradeAndAdvance('wrong')}
              >
                写错了 ✗
              </button>
              <button
                className="flex-1 px-4 py-4 rounded-xl text-base font-semibold bg-green-500/85 text-white min-h-[56px] active:scale-[0.98] transition-transform"
                onClick={() => gradeAndAdvance('correct')}
              >
                写对了 ✓
              </button>
            </div>
          )}

          <button
            className="w-full mt-3 px-4 py-2 rounded-lg text-sm text-white/40 min-h-[44px]"
            onClick={restart}
          >
            结束测验
          </button>
        </div>
      </main>
    </div>
  )
}
