// 词语 tab: the 随堂笔记 words of lessons 1–17. Browse a lesson, self-test
// (see the word, recall pinyin + meaning) or 听写 (hear it, write it on paper),
// marking each 会 / 不会. The 不会 list is its own filter for re-drilling.
import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/shared/ui'
import { BrowseList } from './BrowseList'
import { buildEntries } from './WordParts'
import type { Filter } from './WordParts'
import { ModeBar } from './ModeBar'
import type { Mode } from './ModeBar'
import { TestRun } from './TestRun'
import { wordKey } from '@/lib/final/types'
import type { VocabData } from '@/lib/final/types'

export function WordsTab({
  data,
  unknown,
  toggleUnknown,
  speak,
  scope,
}: {
  data: VocabData
  unknown: Set<string>
  toggleUnknown: (k: string, on?: boolean) => void
  speak: (t: string) => void
  /** Show only these word keys (the /p3-weak review list); starts on 不会. */
  scope?: Set<string>
}) {
  const [filter, setFilter] = useState<Filter>(scope ? 'unknown' : (data.lessons[0]?.lesson ?? 'all'))
  const [starOnly, setStarOnly] = useState(false)
  // 重点优先: 不会 words first, then ★, then the newest lessons (test + 听写 only)
  const [priority, setPriority] = useState(true)
  const [mode, setMode] = useState<Mode>('browse')

  // a running TestRun keeps its own ordered copy, so marking words mid-test is safe
  const entries = useMemo(
    () => buildEntries(data, filter, starOnly, unknown, scope),
    [data, filter, starOnly, unknown, scope]
  )

  const total = scope?.size ?? data.lessons.reduce((n, l) => n + l.words.length, 0)
  const lessons = scope
    ? data.lessons.filter((l) => l.words.some((w) => scope.has(wordKey(l.lesson, w))))
    : data.lessons

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        <Chip active={filter === 'all'} onClick={() => setFilter('all')}>
          全部 {total}
        </Chip>
        <Chip active={filter === 'unknown'} onClick={() => setFilter('unknown')} warn>
          不会 {unknown.size}
        </Chip>
        {lessons.map((l) => (
          <Chip key={l.lesson} active={filter === l.lesson} onClick={() => setFilter(l.lesson)}>
            第{l.lesson}课
          </Chip>
        ))}
      </div>

      <ModeBar
        mode={mode}
        setMode={setMode}
        priority={priority}
        setPriority={setPriority}
        starOnly={starOnly}
        setStarOnly={setStarOnly}
      />

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
