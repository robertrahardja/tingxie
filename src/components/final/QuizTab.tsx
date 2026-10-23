// 练习 tab: the school's 补充练习 and 总复习 sheets as a tap-to-answer quiz.
// Picking an option shows right/wrong plus the sheet's own 解释.
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Card, NUM, SpeakButton } from '@/components/shared/ui'
import type { QuestionsData, QuizItem, QuizSection } from '@/lib/final/types'

/** The stem with the right option in the blank, for the 🔊 button. */
export function filledStem(it: QuizItem): string {
  const stem = it.stem ?? it.prompt ?? ''
  const ans = it.options && it.answer ? it.options[it.answer - 1] : ''
  return ans && stem.includes('____') ? stem.replace('____', ans) : stem
}

export function QuizTab({ data, speak }: { data: QuestionsData; speak: (t: string) => void }) {
  const [setIdx, setSetIdx] = useState(0)
  const [round, setRound] = useState(0)
  const set = data.sets[setIdx]
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {data.sets.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSetIdx(i)}
            className={cn(
              'min-h-11 rounded-full px-3 text-sm font-medium',
              i === setIdx ? 'bg-white text-indigo-700 shadow' : 'bg-white/20 text-white'
            )}
          >
            {s.title.replace('三年级', '').replace('高级华文', '')}
          </button>
        ))}
      </div>
      {set && (
        <div key={`${set.id}-${round}`}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">{set.title}</h2>
            <button
              type="button"
              onClick={() => setRound((r) => r + 1)}
              className="min-h-11 rounded-full bg-white/20 px-3 text-sm text-white"
            >
              重做
            </button>
          </div>
          {set.sections.map((sec, i) => (
            <SectionCard key={i} sec={sec} speak={speak} />
          ))}
        </div>
      )}
    </div>
  )
}

function SectionCard({ sec, speak }: { sec: QuizSection; speak: (t: string) => void }) {
  const passage = Array.isArray(sec.passage) ? sec.passage.join('\n') : sec.passage
  return (
    <Card>
      <h3 className="text-lg font-bold text-gray-900">{sec.title}</h3>
      {sec.instructions && <p className="mb-2 mt-1 text-sm text-gray-600">{sec.instructions}</p>}
      {passage && (
        <div className="mb-3 whitespace-pre-line rounded-xl bg-amber-50 p-3 text-[16px] leading-8 text-gray-900">
          {passage}
        </div>
      )}
      <div className="space-y-4">
        {sec.items.map((it, i) =>
          sec.kind === 'mcq' && it.options?.length ? (
            <McqItem key={i} it={it} speak={speak} />
          ) : (
            <OpenItem key={i} it={it} speak={speak} />
          )
        )}
      </div>
    </Card>
  )
}

function McqItem({ it, speak }: { it: QuizItem; speak: (t: string) => void }) {
  const [picked, setPicked] = useState<number | null>(null)
  const done = picked !== null
  const right = done && picked === it.answer
  return (
    <div className="rounded-xl bg-gray-50 p-3">
      <div className="text-[16px] leading-7 text-gray-900">
        <span className="mr-1 font-semibold text-indigo-700">Q{it.n}</span>
        {it.stem ?? it.prompt}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {it.options!.map((o, i) => {
          const n = i + 1
          return (
            <button
              key={i}
              type="button"
              disabled={done}
              onClick={() => setPicked(n)}
              className={cn(
                'min-h-12 rounded-xl border-2 px-3 text-left text-[17px]',
                !done && 'border-gray-200 bg-white active:bg-indigo-50',
                done && n === it.answer && 'border-emerald-500 bg-emerald-50 font-bold text-emerald-800',
                done && n === picked && n !== it.answer && 'border-rose-400 bg-rose-50 text-rose-700',
                done && n !== it.answer && n !== picked && 'border-gray-100 bg-white text-gray-400'
              )}
            >
              {NUM[i]} {o}
            </button>
          )
        })}
      </div>
      {done && (
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <span className={cn('font-bold', right ? 'text-emerald-700' : 'text-rose-600')}>
              {right ? '✓ 对了！' : `✗ 答案是 ${NUM[(it.answer ?? 1) - 1]}`}
            </span>
            <SpeakButton text={filledStem(it)} speak={speak} small />
          </div>
          {it.explanation && (
            <div className="mt-1 whitespace-pre-line rounded-lg bg-white p-2 text-sm leading-6 text-gray-700">
              {it.explanation}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function OpenItem({ it, speak }: { it: QuizItem; speak: (t: string) => void }) {
  const [shown, setShown] = useState(false)
  return (
    <div className="rounded-xl bg-gray-50 p-3">
      <div className="whitespace-pre-line text-[16px] leading-7 text-gray-900">
        <span className="mr-1 font-semibold text-indigo-700">Q{it.n}</span>
        {it.prompt ?? it.stem}
      </div>
      {shown ? (
        it.model && (
          <div className="mt-2 flex items-start gap-2 rounded-lg bg-emerald-50 p-2">
            <span className="flex-1 whitespace-pre-line text-[16px] leading-7 font-semibold text-emerald-900">
              {it.model}
            </span>
            <SpeakButton text={it.model} speak={speak} small />
          </div>
        )
      ) : (
        <button
          type="button"
          onClick={() => setShown(true)}
          className="mt-2 min-h-11 rounded-full bg-indigo-600 px-4 text-sm font-semibold text-white"
        >
          看答案
        </button>
      )}
    </div>
  )
}
