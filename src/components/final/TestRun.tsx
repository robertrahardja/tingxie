// Self-test and 听写 runner for the 词语 tab: one card at a time, 会 / 不会
// updates the stored list, 上一个 / 跳过 move without marking.
import { useState } from 'react'
import { priorityOrder } from '@/lib/final/order'
import { FinishCard } from './FinishCard'
import { RunControls } from './RunControls'
import { TestCard } from './TestCard'
import type { Entry } from './WordParts'

export function TestRun({
  entries,
  unknown,
  priority,
  dictation,
  toggleUnknown,
  speak,
}: {
  entries: Entry[]
  unknown: Set<string>
  priority: boolean
  dictation: boolean
  toggleUnknown: (k: string, on?: boolean) => void
  speak: (t: string) => void
}) {
  // order fixed once per run (marking words mid-run doesn't reshuffle)
  const [order] = useState(() =>
    priority ? priorityOrder(entries, unknown) : [...entries].sort(() => Math.random() - 0.5)
  )
  const [i, setI] = useState(0)
  const [shown, setShown] = useState(false)
  // key -> true (会) / false (不会); a card with no entry was skipped or not reached
  const [results, setResults] = useState<Record<string, boolean>>({})
  const wrong = order.filter((e) => results[e.key] === false)
  const known = order.filter((e) => results[e.key] === true).length
  const skipped = order.length - known - wrong.length
  const go = (n: number) => {
    setShown(false)
    setI(n)
  }

  if (i >= order.length) {
    return (
      <FinishCard
        total={order.length}
        known={known}
        wrong={wrong}
        skipped={skipped}
        back={() => go(order.length - 1)}
        doSkipped={() => go(order.findIndex((e) => results[e.key] === undefined))}
        speak={speak}
      />
    )
  }

  const e = order[i]
  const answer = (isKnown: boolean) => {
    toggleUnknown(e.key, !isKnown)
    setResults((r) => ({ ...r, [e.key]: isKnown }))
    go(i + 1)
  }

  return (
    <div>
      <div className="mb-2 text-sm text-white/90">
        {i + 1} / {order.length} · 第{e.lesson.lesson}课
        {results[e.key] !== undefined && (
          <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
            {results[e.key] ? '之前：会' : '之前：不会'}
          </span>
        )}
      </div>
      <TestCard e={e} shown={shown} dictation={dictation} speak={speak} />
      <RunControls
        shown={shown}
        first={i === 0}
        reveal={() => setShown(true)}
        answer={answer}
        prev={() => go(i - 1)}
        skip={() => go(i + 1)}
      />
    </div>
  )
}
