// 词语 tab: the 随堂笔记 words of lessons 1–17. Browse a lesson, self-test
// (see the word, recall pinyin + meaning) or 听写 (hear it, write it on paper),
// marking each 会 / 不会. The 不会 list is its own filter for re-drilling.
import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/shared/ui'
import { BrowseList } from './BrowseList'
import { buildEntries } from './WordParts'
import type { Filter } from './WordParts'
import { TestRun } from './TestRun'
import type { VocabData } from '@/lib/final/types'

type Mode = 'browse' | 'test' | 'dictation'

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

  // a running TestRun keeps its own ordered copy, so marking words mid-test is safe
  const entries = useMemo(
    () => buildEntries(data, filter, starOnly, unknown),
    [data, filter, starOnly, unknown]
  )

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
