// 字词表 tab: the booklet word lists (识写 / 识读) per week, with a 考一考 mode
// that hides the readings and meanings.
import { useContext, useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import type { WordEntry, WordsData } from '@/lib/zonghe/types'
import { Card } from '@/components/shared/ui'
import { WordsCtx } from '@/components/shared/words'

export function WordsTab({ data, week }: { data: WordsData; week: number }) {
  // Open on this week's list when there is one.
  const [wk, setWk] = useState(() => Math.max(0, data.weeks.findIndex((w) => w.week === week)))
  const [hideMeaning, setHideMeaning] = useState(false)
  const cur = data.weeks[wk]
  return (
    <>
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {data.weeks.map((w, i) => (
          <button
            key={i}
            className={cn('filter-btn !px-3 !py-1.5 !text-xs', wk === i && 'active')}
            onClick={() => setWk(i)}
          >
            W{w.week} {w.kind === '识读字词' ? '读' : '写'}
          </button>
        ))}
      </div>
      <Card className="py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-gray-900">
              Week {cur.week} · {cur.kind}
            </div>
            <div className="text-xs text-gray-500">
              {cur.dates} · {cur.words.length} 个词 · 点词语听读音
            </div>
          </div>
          <button
            className={cn(
              'min-h-11 rounded-full border-2 border-indigo-600 px-3 py-1.5 text-sm font-bold',
              hideMeaning ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-700'
            )}
            onClick={() => setHideMeaning((v) => !v)}
          >
            {hideMeaning ? '显示意思' : '考一考'}
          </button>
        </div>
        {cur.week === week && cur.kind === '识写字词' && (
          <p className="mt-2 text-xs text-gray-600">
            本周听写的 16 个词在{' '}
            <Link to="/" className="font-bold text-indigo-700 underline">
              最新词语
            </Link>{' '}
            里练习。
          </p>
        )}
      </Card>
      {cur.words.map((w) => (
        <WordRow key={`${cur.kind}-${w.n}`} w={w} hide={hideMeaning} />
      ))}
    </>
  )
}

function WordRow({ w, hide }: { w: WordEntry; hide: boolean }) {
  const { open: openWord } = useContext(WordsCtx)
  const [open, setOpen] = useState(false)
  useEffect(() => setOpen(false), [hide])
  const show = !hide || open
  const collocs = w.c ? w.c.split('/').map((s) => s.trim()) : []
  return (
    <div
      className="mb-2 flex items-center gap-3 rounded-xl bg-white px-3 py-2 shadow-sm"
      onClick={() => {
        if (hide) setOpen((v) => !v)
      }}
    >
      <span className="w-7 shrink-0 text-right text-xs text-gray-400">{w.n}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          openWord(w.w.replace('…', ''), { py: w.py, en: w.en })
        }}
        className="shrink-0 text-2xl font-bold text-gray-900"
      >
        {w.w}
      </button>
      <div className={cn('min-w-0 flex-1', !show && 'invisible')}>
        <div className="text-sm text-indigo-600">{w.py}</div>
        <div className="truncate text-xs text-gray-600">{w.en}</div>
      </div>
      {collocs.length > 0 && (
        <div className={cn('flex shrink-0 flex-col items-end gap-1', !show && 'invisible')}>
          {collocs.map((c) => (
            <button
              key={c}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                openWord(c)
              }}
              className="rounded-lg bg-amber-50 px-2 py-0.5 text-sm text-amber-800 active:bg-amber-100"
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
