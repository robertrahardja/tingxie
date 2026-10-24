// Self-test and 听写 runner for the 词语 tab: one card at a time, 会 / 不会
// updates the stored list, 上一个 / 跳过 move without marking.
import { useState } from 'react'
import { Card, SpeakButton } from '@/components/shared/ui'
import { wordPicId } from '@/lib/final/types'
import { Pic } from './Pic'
import { Details, WordFace } from './WordParts'
import type { Entry } from './WordParts'

/** 重点优先: 不会 words, then ★ words, then the rest; newest lesson first within each. */
function priorityOrder(entries: Entry[], unknown: Set<string>): Entry[] {
  const tier = (e: Entry) => (unknown.has(e.key) ? 0 : e.w.star ? 1 : 2)
  return entries
    .map((e) => ({ e, r: Math.random() }))
    .sort((a, b) => tier(a.e) - tier(b.e) || b.e.lesson.lesson - a.e.lesson.lesson || a.r - b.r)
    .map((x) => x.e)
}

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
      <Card className="min-h-56">
        <Pic id={wordPicId(e.lesson, e.w)} className="mb-3 h-44 w-full" />
        {dictation && !shown ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <button
              type="button"
              onClick={() => speak(e.w.word)}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-4xl active:bg-indigo-200"
              aria-label="播放"
              ref={(el) => {
                // auto-play each new word once
                if (el && el.dataset.k !== e.key) {
                  el.dataset.k = e.key
                  speak(e.w.word)
                }
              }}
            >
              🔊
            </button>
            {e.w.example && (
              <button
                type="button"
                onClick={() => speak(e.w.example!)}
                className="min-h-11 rounded-full bg-gray-100 px-4 text-sm text-gray-700"
              >
                听例句
              </button>
            )}
            <div className="text-sm text-gray-500">在纸上写出来，再看答案</div>
          </div>
        ) : (
          <div>
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <WordFace w={e.w} hideReading={!shown} />
              </div>
              <SpeakButton text={e.w.word} speak={speak} />
            </div>
            {shown && <Details w={e.w} speak={speak} />}
          </div>
        )}
      </Card>
      {!shown ? (
        <button
          type="button"
          onClick={() => setShown(true)}
          className="min-h-12 w-full rounded-2xl bg-white text-lg font-semibold text-indigo-700 shadow"
        >
          看答案
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => answer(false)}
            className="min-h-12 rounded-2xl bg-rose-500 text-lg font-semibold text-white shadow"
          >
            ✗ 不会
          </button>
          <button
            type="button"
            onClick={() => answer(true)}
            className="min-h-12 rounded-2xl bg-emerald-500 text-lg font-semibold text-white shadow"
          >
            ✓ 会
          </button>
        </div>
      )}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={i === 0}
          onClick={() => go(i - 1)}
          className="min-h-11 rounded-2xl bg-white/20 text-[15px] font-semibold text-white disabled:opacity-40"
        >
          ← 上一个
        </button>
        <button
          type="button"
          onClick={() => go(i + 1)}
          className="min-h-11 rounded-2xl bg-white/20 text-[15px] font-semibold text-white"
        >
          跳过 →
        </button>
      </div>
    </div>
  )
}

function FinishCard({
  total,
  known,
  wrong,
  skipped,
  back,
  doSkipped,
  speak,
}: {
  total: number
  known: number
  wrong: Entry[]
  skipped: number
  back: () => void
  doSkipped: () => void
  speak: (t: string) => void
}) {
  return (
    <Card className="text-center">
      <div className="text-2xl font-bold text-gray-900">完成！🎉</div>
      <div className="mt-2 text-gray-700">
        会 {known} / {total}
        {skipped > 0 && <span className="text-gray-500"> · 跳过 {skipped}</span>}
      </div>
      <div className="mt-3 flex justify-center gap-2">
        <button
          type="button"
          onClick={back}
          className="min-h-11 rounded-full bg-gray-200 px-4 text-sm font-semibold text-gray-700"
        >
          ← 回到上一个
        </button>
        {skipped > 0 && (
          <button
            type="button"
            onClick={doSkipped}
            className="min-h-11 rounded-full bg-indigo-600 px-4 text-sm font-semibold text-white"
          >
            做跳过的词
          </button>
        )}
      </div>
      {wrong.length > 0 && (
        <div className="mt-3 text-left">
          <div className="mb-1 text-sm text-gray-500">不会的（已加入“不会”列表）：</div>
          <div className="flex flex-wrap gap-2">
            {wrong.map((e) => (
              <button
                key={e.key}
                type="button"
                onClick={() => speak(e.w.word)}
                className="rounded-lg bg-rose-50 px-2 py-1 text-lg text-rose-800"
              >
                {e.w.word}
              </button>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
