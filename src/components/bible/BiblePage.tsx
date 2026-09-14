// One Bible chapter to read along with: every verse is tappable word by word,
// each has its own sound, and 读全章 plays the chapter verse by verse.
// See docs/BIBLE_READING.md.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { ttsPath } from '@/lib/tts'
import { cn } from '@/lib/utils'
import { BOOKS } from '@/lib/bible/types'
import type { ChapterData, Verse } from '@/lib/bible/types'
import type { WordBank, WordInfo } from '@/lib/shared/words'
import { Card, SpeakButton } from '@/components/shared/ui'
import { Seg, WordSheet, WordsCtx } from '@/components/shared/words'

/** The chapter's text and its word bank; the bank is optional. */
function useChapter(book: string, chapter: string) {
  const [data, setData] = useState<ChapterData | null>(null)
  const [bank, setBank] = useState<WordBank | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    setData(null)
    setError(null)
    Promise.all([
      fetch(`/data/bible/${book}_${chapter}.json`).then((r) => {
        if (!r.ok) throw new Error(`没有这一章`)
        return r.json() as Promise<ChapterData>
      }),
      // optional; the SPA fallback answers unknown paths with HTML, which fails to parse
      fetch(`/data/bible/${book}_${chapter}_words.json`)
        .then((r) => r.json() as Promise<WordBank>)
        .catch(() => null),
    ])
      .then(([d, b]) => {
        if (!alive) return
        setData(d)
        setBank(b && b.seg && b.dict ? b : null)
      })
      .catch((e: Error) => alive && setError(e.message))
    return () => {
      alive = false
    }
  }, [book, chapter])

  return { data, bank, error }
}

export function BiblePage({ book, chapter }: { book: string; chapter: string }) {
  const { data, bank, error } = useChapter(book, chapter)
  const [sheet, setSheet] = useState<{ word: string; info?: WordInfo } | null>(null)
  const [showEn, setShowEn] = useState(true)
  const [playing, setPlaying] = useState<number | null>(null)
  const { play, stop } = useAudioPlayer()
  // 读全章 plays verse after verse, waiting for each clip to end.
  const chain = useRef<{ audio: HTMLAudioElement | null; cancelled: boolean } | null>(null)

  const stopAll = useCallback(() => {
    if (chain.current) {
      chain.current.cancelled = true
      chain.current.audio?.pause()
      chain.current = null
    }
    setPlaying(null)
  }, [])

  useEffect(() => stopAll, [stopAll])
  // leaving the chapter stops whatever is still reading
  useEffect(() => {
    stopAll()
    stop()
  }, [book, chapter, stopAll, stop])

  const speak = useCallback(
    async (text: string) => {
      stopAll()
      await play(await ttsPath(text))
    },
    [play, stopAll]
  )

  const readChapter = useCallback(async () => {
    if (playing !== null) {
      stopAll()
      return
    }
    stopAll()
    stop()
    const verses = data?.verses ?? []
    const run = { audio: null as HTMLAudioElement | null, cancelled: false }
    chain.current = run
    for (const v of verses) {
      if (run.cancelled) break
      setPlaying(v.n)
      const audio = new Audio(await ttsPath(v.zh))
      run.audio = audio
      const finished = new Promise<void>((resolve) => {
        audio.onended = () => resolve()
        audio.onerror = () => resolve()
        audio.onpause = () => resolve()
      })
      try {
        await audio.play()
        await finished
      } catch {
        break
      }
      if (run.cancelled) break
      await new Promise((r) => setTimeout(r, 400))
    }
    if (chain.current === run) {
      chain.current = null
      setPlaying(null)
    }
  }, [data, playing, stopAll, stop])

  const openWord = useCallback((word: string, info?: WordInfo) => {
    setSheet({ word, info })
  }, [])
  const closeWord = useCallback(() => setSheet(null), [])
  const ctx = useMemo(() => ({ bank, open: openWord }), [bank, openWord])

  const meta = BOOKS[book]

  if (error || !meta) {
    return (
      <div className="page-container">
        <div className="rounded-2xl bg-white p-6 text-center text-gray-700">
          {error ?? '没有这卷书'}
        </div>
      </div>
    )
  }
  if (!data) {
    return (
      <div className="page-container">
        <div className="text-center text-white">加载中…</div>
      </div>
    )
  }

  const ch = data.chapter

  return (
    <WordsCtx.Provider value={ctx}>
      <div className="page-container">
        <header className="mb-3 text-white">
          <h1 className="page-title text-2xl md:text-3xl">
            {data.book} 第{ch}章
          </h1>
          <p className="mt-1 text-sm opacity-90">
            {data.bookEn} {ch} · 圣经·和合本 · 点词语看意思
          </p>
        </header>

        <Card className="flex items-center justify-between gap-2 py-3">
          <button
            type="button"
            onClick={readChapter}
            className="min-h-11 rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-bold text-white active:bg-indigo-700"
          >
            {playing !== null ? '⏹ 停止' : '▶ 读全章'}
          </button>
          <button
            type="button"
            onClick={() => setShowEn((v) => !v)}
            className={cn(
              'min-h-11 rounded-full border-2 border-indigo-600 px-3 py-1.5 text-sm font-bold',
              showEn ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-700'
            )}
          >
            {showEn ? '隐藏英文' : '显示英文'}
          </button>
        </Card>

        {data.verses.map((v) => (
          <VerseRow
            key={v.n}
            verse={v}
            showEn={showEn}
            active={playing === v.n}
            speak={speak}
          />
        ))}

        <ChapterNav book={book} chapter={ch} chapters={meta.chapters} />

        <p className="mt-4 px-1 text-center text-[11px] leading-5 text-white/70">
          经文：和合本（1919，公有领域）· 词典：CC-CEDICT（CC BY-SA 4.0）· 朗读：语音合成
        </p>

        {sheet && (
          <WordSheet word={sheet.word} info={sheet.info} onClose={closeWord} speak={speak} />
        )}
      </div>
    </WordsCtx.Provider>
  )
}

/** One verse: number, sound, tappable Chinese, and the English underneath. */
function VerseRow({
  verse,
  showEn,
  active,
  speak,
}: {
  verse: Verse
  showEn: boolean
  active: boolean
  speak: (t: string) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (active) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [active])
  return (
    <div
      ref={ref}
      className={cn(
        'mb-2 flex items-start gap-2 rounded-2xl p-3 shadow-md transition-colors',
        active ? 'bg-amber-50 ring-2 ring-amber-300' : 'bg-white'
      )}
    >
      <span className="w-6 shrink-0 pt-3 text-right text-xs font-bold text-gray-400">
        {verse.n}
      </span>
      <SpeakButton text={verse.zh} speak={speak} small />
      <div className="min-w-0 flex-1">
        {/* leading-9 keeps each word button 44px tall (36px line + py-1), the
            touch-target minimum; don't tighten it without adding padding. */}
        <p className="text-[17px] leading-9 text-gray-900">
          <Seg text={verse.zh} />
        </p>
        {showEn && verse.en && (
          <p className="mt-1 text-xs leading-5 text-gray-500">{verse.en}</p>
        )}
      </div>
    </div>
  )
}

/** Previous / next chapter, and a jump grid for the whole book. */
function ChapterNav({
  book,
  chapter,
  chapters,
}: {
  book: string
  chapter: number
  chapters: number
}) {
  return (
    <Card className="mt-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        {chapter > 1 ? (
          <Link
            to="/bible/$book/$chapter"
            params={{ book, chapter: String(chapter - 1) }}
            className="min-h-11 rounded-full bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700 active:bg-indigo-100"
          >
            ← 第{chapter - 1}章
          </Link>
        ) : (
          <span />
        )}
        {chapter < chapters ? (
          <Link
            to="/bible/$book/$chapter"
            params={{ book, chapter: String(chapter + 1) }}
            className="min-h-11 rounded-full bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700 active:bg-indigo-100"
          >
            第{chapter + 1}章 →
          </Link>
        ) : (
          <span />
        )}
      </div>
      <div className="grid grid-cols-8 gap-1.5">
        {Array.from({ length: chapters }, (_, i) => i + 1).map((n) => (
          <Link
            key={n}
            to="/bible/$book/$chapter"
            params={{ book, chapter: String(n) }}
            className={cn(
              'flex h-10 items-center justify-center rounded-lg text-sm font-bold',
              n === chapter ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 active:bg-indigo-50'
            )}
          >
            {n}
          </Link>
        ))}
      </div>
    </Card>
  )
}
