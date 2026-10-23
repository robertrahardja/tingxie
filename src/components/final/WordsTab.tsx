// 词语 tab: the 随堂笔记 words of lessons 1–17. Browse a lesson, self-test
// (see the word, recall pinyin + meaning) or 听写 (hear it, write it on paper),
// marking each 会 / 不会. The 不会 list is its own filter for re-drilling.
import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { Card, SpeakButton } from '@/components/shared/ui'
import { wordKey } from '@/lib/final/types'
import type { VocabData, VocabLesson, VocabWord } from '@/lib/final/types'

type Mode = 'browse' | 'test' | 'dictation'
type Filter = 'all' | 'unknown' | number

interface Entry {
  lesson: VocabLesson
  w: VocabWord
  key: string
}

export function WordsTab({
  data,
  unknown,
  toggleUnknown,
  speak,
}: {
  data: VocabData
  unknown: Set<string>
  toggleUnknown: (k: string, on?: boolean) => void
  speak: (t: string) => void
}) {
  const [filter, setFilter] = useState<Filter>(data.lessons[0]?.lesson ?? 'all')
  const [starOnly, setStarOnly] = useState(false)
  // 重点优先: 不会 words first, then ★, then the newest lessons (test + 听写 only)
  const [priority, setPriority] = useState(true)
  const [mode, setMode] = useState<Mode>('browse')

  const entries = useMemo(() => {
    const out: Entry[] = []
    for (const lesson of data.lessons) {
      if (typeof filter === 'number' && lesson.lesson !== filter) continue
      for (const w of lesson.words) {
        const key = wordKey(lesson.lesson, w)
        if (filter === 'unknown' && !unknown.has(key)) continue
        if (starOnly && !w.star) continue
        out.push({ lesson, w, key })
      }
    }
    return out
    // a running TestRun keeps its own shuffled copy, so marking words mid-test is safe
  }, [data, filter, starOnly, unknown])

  const total = data.lessons.reduce((n, l) => n + l.words.length, 0)

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        <Chip active={filter === 'all'} onClick={() => setFilter('all')}>
          全部 {total}
        </Chip>
        <Chip active={filter === 'unknown'} onClick={() => setFilter('unknown')} warn>
          不会 {unknown.size}
        </Chip>
        {data.lessons.map((l) => (
          <Chip key={l.lesson} active={filter === l.lesson} onClick={() => setFilter(l.lesson)}>
            第{l.lesson}课
          </Chip>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(
          [
            ['browse', '📖 看'],
            ['test', '🧠 自测'],
            ['dictation', '✏️ 听写'],
          ] as [Mode, string][]
        ).map(([m, label]) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              'min-h-11 rounded-full px-4 text-[15px] font-semibold',
              mode === m ? 'bg-white text-indigo-700 shadow' : 'bg-white/20 text-white'
            )}
          >
            {label}
          </button>
        ))}
        <div className="ml-auto flex flex-wrap items-center gap-x-4">
          {mode !== 'browse' && (
            <label className="flex min-h-11 items-center gap-2 text-sm text-white">
              <input type="checkbox" checked={priority} onChange={(e) => setPriority(e.target.checked)} />
              重点优先
            </label>
          )}
          <label className="flex min-h-11 items-center gap-2 text-sm text-white">
            <input type="checkbox" checked={starOnly} onChange={(e) => setStarOnly(e.target.checked)} />
            只看 ★
          </label>
        </div>
      </div>

      {entries.length === 0 ? (
        <Card className="text-center text-gray-500">
          {filter === 'unknown' ? '还没有标记“不会”的词语 👍' : '没有词语'}
        </Card>
      ) : mode === 'browse' ? (
        <BrowseList entries={entries} unknown={unknown} toggleUnknown={toggleUnknown} speak={speak} />
      ) : (
        <TestRun
          key={`${mode}-${String(filter)}-${starOnly}-${priority}`}
          entries={entries}
          unknown={unknown}
          priority={priority}
          dictation={mode === 'dictation'}
          toggleUnknown={toggleUnknown}
          speak={speak}
        />
      )}
    </div>
  )
}

function Chip({
  active,
  onClick,
  warn,
  children,
}: {
  active: boolean
  onClick: () => void
  warn?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'min-h-11 rounded-full px-3 text-sm font-medium',
        active ? (warn ? 'bg-rose-500 text-white' : 'bg-white text-indigo-700 shadow') : 'bg-white/20 text-white'
      )}
    >
      {children}
    </button>
  )
}

function LessonHeading({ lesson }: { lesson: VocabLesson }) {
  return (
    <h2 className="mb-2 mt-4 text-lg font-bold text-white first:mt-0">
      第{lesson.lesson}课{lesson.title ? `《${lesson.title}》` : ''}
    </h2>
  )
}

function BrowseList({
  entries,
  unknown,
  toggleUnknown,
  speak,
}: {
  entries: Entry[]
  unknown: Set<string>
  toggleUnknown: (k: string, on?: boolean) => void
  speak: (t: string) => void
}) {
  return (
    <div>
      {entries.map((e, i) => (
        <div key={e.key + i}>
          {(i === 0 || entries[i - 1].lesson !== e.lesson) && <LessonHeading lesson={e.lesson} />}
          <Card className={cn(e.w.sub && 'ml-4')}>
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <WordFace w={e.w} />
                <Details w={e.w} speak={speak} />
              </div>
              <div className="flex flex-col items-center gap-2">
                <SpeakButton text={e.w.word} speak={speak} />
                <button
                  type="button"
                  onClick={() => toggleUnknown(e.key)}
                  className={cn(
                    'min-h-11 rounded-full px-2 text-xs font-semibold',
                    unknown.has(e.key) ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-500'
                  )}
                >
                  {unknown.has(e.key) ? '不会' : '标记'}
                </button>
              </div>
            </div>
          </Card>
        </div>
      ))}
    </div>
  )
}

function WordFace({ w, hideReading }: { w: VocabWord; hideReading?: boolean }) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-3">
        <span className="text-3xl font-bold text-gray-900">{w.word}</span>
        {w.star && <span className="text-amber-500">★</span>}
        {!hideReading && <span className="text-lg text-indigo-700">{w.pinyin}</span>}
      </div>
      {!hideReading && <div className="mt-0.5 text-[15px] text-gray-600">{w.english}</div>}
    </div>
  )
}

function Details({ w, speak }: { w: VocabWord; speak: (t: string) => void }) {
  if (!w.extras?.length && !w.example) return null
  return (
    <div className="mt-2 space-y-1 text-[15px] leading-7 text-gray-800">
      {w.extras?.map((x, i) => (
        <div key={i}>
          <span className="mr-1 rounded bg-amber-50 px-1.5 text-sm text-amber-800">{x.label}</span>
          {x.text}
        </div>
      ))}
      {w.example && (
        <div className="flex items-start gap-2">
          <span className="mt-1 shrink-0 rounded bg-indigo-50 px-1.5 text-sm text-indigo-700">例句</span>
          <span className="flex-1">{w.example}</span>
          <SpeakButton text={w.example} speak={speak} small />
        </div>
      )}
    </div>
  )
}

/** One card at a time; 会 / 不会 updates the stored list and moves on. */
/** 重点优先: 不会 words, then ★ words, then the rest; newest lesson first within each. */
function priorityOrder(entries: Entry[], unknown: Set<string>): Entry[] {
  const tier = (e: Entry) => (unknown.has(e.key) ? 0 : e.w.star ? 1 : 2)
  return entries
    .map((e) => ({ e, r: Math.random() }))
    .sort((a, b) => tier(a.e) - tier(b.e) || b.e.lesson.lesson - a.e.lesson.lesson || a.r - b.r)
    .map((x) => x.e)
}

function TestRun({
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
      <Card className="text-center">
        <div className="text-2xl font-bold text-gray-900">完成！🎉</div>
        <div className="mt-2 text-gray-700">
          会 {known} / {order.length}
          {skipped > 0 && <span className="text-gray-500"> · 跳过 {skipped}</span>}
        </div>
        <div className="mt-3 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => go(order.length - 1)}
            className="min-h-11 rounded-full bg-gray-200 px-4 text-sm font-semibold text-gray-700"
          >
            ← 回到上一个
          </button>
          {skipped > 0 && (
            <button
              type="button"
              onClick={() => go(order.findIndex((e) => results[e.key] === undefined))}
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
