// One 活动本 lesson as a study page (see docs/KEBEN_ANSWER_KEYS.md).
// Loads the lesson data and its word bank, then hands each tab its sections.
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { ttsPath } from '@/lib/tts'
import { cn } from '@/lib/utils'
import type { KebenData } from '@/lib/keben/types'
import type { WordBank, WordInfo } from '@/lib/shared/words'
import { WordSheet, WordsCtx } from '@/components/shared/words'
import { Card, SpeakButton } from '@/components/shared/ui'
import { ExerciseTab } from './ExerciseTab'
import { ReadingTab } from './ReadingTab'
import { SongTab } from './SongTab'

type Tab = 'exercises' | 'reading' | 'song' | 'words'

const TABS: { id: Tab; label: string }[] = [
  { id: 'exercises', label: '练习' },
  { id: 'reading', label: '阅读' },
  { id: 'song', label: '儿歌' },
  { id: 'words', label: '字词表' },
]

const EXERCISE_KINDS = ['pinyin', 'riddle', 'error', 'order', 'colour', 'table']

function useKebenData(lesson: string) {
  const [data, setData] = useState<KebenData | null>(null)
  const [bank, setBank] = useState<WordBank | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    Promise.all([
      fetch(`/data/p3hcl/keben_${lesson}.json`).then((r) => {
        if (!r.ok) throw new Error(`没有第 ${lesson} 课的答案`)
        return r.json() as Promise<KebenData>
      }),
      // optional; the SPA fallback answers unknown paths with HTML, which fails to parse
      fetch(`/data/p3hcl/keben_${lesson}_words.json`)
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
  }, [lesson])

  return { data, bank, error }
}

function WordsTab({ data, speak, speakEnabled }: { data: KebenData; speak: (t: string) => void; speakEnabled: boolean }) {
  return (
    <section className="mb-8">
      <h2 className="mb-1 text-lg font-bold text-white drop-shadow">要复习的词语</h2>
      <p className="mb-3 text-sm text-white/90">这一课听写和考试最常考的字词。</p>
      {data.revise.map((w, i) => (
        <Card key={i} className="flex items-center gap-3 py-3">
          <div className="min-w-0 flex-1">
            <div className="text-[22px] font-bold leading-tight text-gray-900">{w.w}</div>
            <div className="text-sm text-indigo-700">{w.py}</div>
            <div className="text-sm text-gray-600">{w.en}</div>
          </div>
          {speakEnabled && <SpeakButton text={w.w} speak={speak} />}
        </Card>
      ))}
    </section>
  )
}

export function KebenPage({ lesson }: { lesson: string }) {
  const { data, bank, error } = useKebenData(lesson)
  const [sheet, setSheet] = useState<{ word: string; info?: WordInfo } | null>(null)
  const [tab, setTab] = useState<Tab>('exercises')
  const { play } = useAudioPlayer()

  // Audio is only useful once the clips exist; the bank is generated with them.
  const speakEnabled = !!bank

  const speak = useCallback(
    async (text: string) => {
      const path = await ttsPath(text)
      await play(path)
    },
    [play]
  )

  const openWord = useCallback((word: string, info?: WordInfo) => setSheet({ word, info }), [])
  const closeWord = useCallback(() => setSheet(null), [])
  const ctx = useMemo(() => ({ bank, open: openWord }), [bank, openWord])

  if (error) {
    return (
      <div className="page-container">
        <div className="rounded-2xl bg-white p-6 text-center text-gray-700">{error}</div>
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

  const exercises = data.sections.filter((s) => EXERCISE_KINDS.includes(s.kind))
  const reading = data.sections.find((s) => s.kind === 'reading')
  const song = data.sections.find((s) => s.kind === 'song')

  return (
    <WordsCtx.Provider value={ctx}>
      <div className="page-container">
        <header className="mb-4 text-white">
          <h1 className="page-title text-2xl md:text-3xl">{data.title}</h1>
          <p className="mt-1 text-sm opacity-90">
            {data.book} · 第 {data.pages} 页 · {data.student}
          </p>
          {data.note && <p className="mt-1 text-sm opacity-80">{data.note}</p>}
        </header>

        <nav className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={cn('filter-btn', tab === t.id && 'active')}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {tab === 'exercises' && (
          <ExerciseTab sections={exercises} speak={speak} speakEnabled={speakEnabled} />
        )}
        {tab === 'reading' && reading && (
          <ReadingTab section={reading} speak={speak} speakEnabled={speakEnabled} />
        )}
        {tab === 'song' && song && <SongTab section={song} speak={speak} speakEnabled={speakEnabled} />}
        {tab === 'words' && <WordsTab data={data} speak={speak} speakEnabled={speakEnabled} />}
        {sheet && (
          <WordSheet word={sheet.word} info={sheet.info} onClose={closeWord} speak={speak} />
        )}
      </div>
    </WordsCtx.Provider>
  )
}
