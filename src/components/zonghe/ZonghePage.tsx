// One weekly 综合练习 booklet as a study page. Loads the week's data, word
// lists and word bank, then hands each tab to its component.
// See docs/ZONGHE_ANSWER_KEYS.md.
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { ttsPath } from '@/lib/tts'
import { cn } from '@/lib/utils'
import { ANSWER_KINDS } from '@/lib/zonghe/types'
import type { WordBank, WordInfo, WordsData, ZongheData } from '@/lib/zonghe/types'
import { AnswersTab } from './AnswersTab'
import { OralTab } from './OralTab'
import { RewriteTab } from './RewriteTab'
import { WordsTab } from './WordsTab'
import { WordSheet, WordsCtx } from '@/components/shared/words'

type Tab = 'answers' | 'rewrite' | 'oral' | 'words'

const TABS: { id: Tab; label: string }[] = [
  { id: 'answers', label: '课堂练习' },
  { id: 'rewrite', label: '课后练习' },
  { id: 'oral', label: '口试复习' },
  { id: 'words', label: '字词表' },
]

/** The week's three data files; the word bank is optional. */
function useZongheData(week: string) {
  const [data, setData] = useState<ZongheData | null>(null)
  const [words, setWords] = useState<WordsData | null>(null)
  const [bank, setBank] = useState<WordBank | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    Promise.all([
      fetch(`/data/p3hcl/zonghe_${week}.json`).then((r) => {
        if (!r.ok) throw new Error(`没有第 ${week} 周的练习`)
        return r.json() as Promise<ZongheData>
      }),
      fetch('/data/p3hcl/words_w34_w40.json').then((r) => r.json() as Promise<WordsData>),
      // optional; the SPA fallback answers unknown paths with HTML, which fails to parse
      fetch(`/data/p3hcl/zonghe_${week}_words.json`)
        .then((r) => r.json() as Promise<WordBank>)
        .catch(() => null),
    ])
      .then(([z, w, b]) => {
        if (!alive) return
        setData(z)
        setWords(w)
        setBank(b && b.seg && b.dict ? b : null)
      })
      .catch((e: Error) => alive && setError(e.message))
    return () => {
      alive = false
    }
  }, [week])

  return { data, words, bank, error }
}

export function ZonghePage({ week }: { week: string }) {
  const { data, words, bank, error } = useZongheData(week)
  const [sheet, setSheet] = useState<{ word: string; info?: WordInfo } | null>(null)
  const [tab, setTab] = useState<Tab>('answers')
  const [practice, setPractice] = useState(false)
  const { play, stop } = useAudioPlayer()

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
  if (!data || !words) {
    return (
      <div className="page-container">
        <div className="text-center text-white">加载中…</div>
      </div>
    )
  }

  const answerSections = data.sections.filter(
    (s) => ANSWER_KINDS.includes(s.kind) && s.tab !== 'rewrite'
  )
  // A week may carry more than one 课后练习 block (e.g. 37: 扩写句子 + 组句成段).
  const rewrites = data.sections.filter((s) => s.kind === 'rewrite')
  const homework = data.sections.filter((s) => ANSWER_KINDS.includes(s.kind) && s.tab === 'rewrite')
  const oral = data.sections.find((s) => s.kind === 'oral')

  return (
    <WordsCtx.Provider value={ctx}>
      <div className="page-container">
        <header className="mb-4 text-white">
          <h1 className="page-title text-2xl md:text-3xl">{data.title}</h1>
          <p className="mt-1 text-sm opacity-90">
            {data.dates} · {data.student}
          </p>
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

        {tab === 'answers' && (
          <AnswersTab
            sections={answerSections}
            practice={practice}
            setPractice={setPractice}
            speak={speak}
            note={data.note}
          />
        )}
        {tab === 'rewrite' &&
          rewrites.map((r, i) => (
            <RewriteTab
              key={r.id}
              section={r}
              // The homework question sections hang off the last block only.
              homework={i === rewrites.length - 1 ? homework : []}
              speak={speak}
            />
          ))}
        {tab === 'oral' && oral && <OralTab section={oral} speak={speak} stopOther={stop} />}
        {tab === 'words' && <WordsTab data={words} week={data.week} />}
        {sheet && <WordSheet word={sheet.word} info={sheet.info} onClose={closeWord} speak={speak} />}
      </div>
    </WordsCtx.Provider>
  )
}
