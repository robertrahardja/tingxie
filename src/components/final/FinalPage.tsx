// /p3-final: P3 HCL year-end revision. Loads the vocabulary, sentence
// patterns and worksheet questions from public/data/p3hcl/final/ and hands
// each tab to its component. See docs/P3_FINAL_REVIEW.md.
import { useCallback, useEffect, useState } from 'react'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { ttsPath } from '@/lib/tts'
import { cn } from '@/lib/utils'
import type { QuestionsData, SentencesData, VocabData } from '@/lib/final/types'
import { PlanTab } from './PlanTab'
import { QuizTab } from './QuizTab'
import { SentencesTab } from './SentencesTab'
import { WordsTab } from './WordsTab'
import { useStoredSet } from './storage'

export type Tab = 'plan' | 'words' | 'sentences' | 'quiz'

const TABS: { id: Tab; label: string }[] = [
  { id: 'plan', label: '复习计划' },
  { id: 'words', label: '词语' },
  { id: 'sentences', label: '句子变变变' },
  { id: 'quiz', label: '练习' },
]

const BASE = '/data/p3hcl/final'

function useFinalData() {
  const [data, setData] = useState<{ vocab: VocabData; sentences: SentencesData; questions: QuestionsData } | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let alive = true
    const get = <T,>(f: string) =>
      fetch(`${BASE}/${f}`).then((r) => {
        if (!r.ok) throw new Error(`加载失败：${f}`)
        return r.json() as Promise<T>
      })
    Promise.all([get<VocabData>('vocab.json'), get<SentencesData>('sentences.json'), get<QuestionsData>('questions.json')])
      .then(([vocab, sentences, questions]) => alive && setData({ vocab, sentences, questions }))
      .catch((e: Error) => alive && setError(e.message))
    return () => {
      alive = false
    }
  }, [])
  return { data, error }
}

export function FinalPage() {
  const { data, error } = useFinalData()
  const [tab, setTab] = useState<Tab>('plan')
  const [unknown, toggleUnknown] = useStoredSet('p3final_unknown')
  const [done, toggleDone] = useStoredSet('p3final_plan')
  const { play } = useAudioPlayer()

  const speak = useCallback(
    async (text: string) => {
      await play(await ttsPath(text))
    },
    [play]
  )

  const go = useCallback((t: Tab) => {
    setTab(t)
    window.scrollTo({ top: 0 })
  }, [])

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

  return (
    <div className="page-container">
      <header className="mb-4 text-white">
        <h1 className="page-title text-2xl md:text-3xl">期末复习</h1>
        <p className="mt-1 text-sm opacity-90">三年级高级华文 · 第 1–17 课</p>
      </header>

      <nav className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button key={t.id} className={cn('filter-btn', tab === t.id && 'active')} onClick={() => go(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'plan' && <PlanTab done={done} toggle={toggleDone} go={go} />}
      {tab === 'words' && (
        <WordsTab data={data.vocab} unknown={unknown} toggleUnknown={toggleUnknown} speak={speak} />
      )}
      {tab === 'sentences' && <SentencesTab data={data.sentences} speak={speak} />}
      {tab === 'quiz' && <QuizTab data={data.questions} speak={speak} />}
    </div>
  )
}
