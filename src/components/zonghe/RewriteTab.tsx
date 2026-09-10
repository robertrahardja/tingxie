// 课后练习 tab: the sentence rewrites with hidden model answers, then any
// homework question sections (a 短文填空), which start in practice mode.
import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { RewriteItem, Section } from '@/lib/zonghe/types'
import { GroupView } from './AnswersTab'
import { Card, SpeakButton } from './shared'
import { Seg } from './words'

export function RewriteTab({
  section,
  homework,
  speak,
}: {
  section: Section
  homework: Section[]
  speak: (t: string) => void
}) {
  const items = (section.items ?? []) as RewriteItem[]
  const [shown, setShown] = useState<Record<number, boolean>>({})
  // Homework question sections start in practice mode: she fills the blanks first.
  const [practice, setPractice] = useState(true)
  return (
    <>
      <h2 className="mb-1 text-lg font-bold text-white drop-shadow">
        {section.title}
        {section.points && <span className="ml-2 text-sm font-normal opacity-90">（{section.points}）</span>}
      </h2>
      {section.instruction && (
        <p className="mb-3 text-sm text-white/90">
          <Seg text={section.instruction} light />
        </p>
      )}
      {items.map((it) => {
        const open = !!shown[it.n]
        return (
          <Card key={it.n}>
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-bold text-white">Q{it.n}</span>
              <span className="rounded-lg border border-gray-400 px-2 py-0.5 text-sm font-bold text-gray-700">
                {it.pattern}
              </span>
            </div>
            {it.original.map((o, i) => (
              <p key={i} className="flex items-center gap-2 text-[16px] leading-7 text-gray-800">
                {it.original.length > 1 && <span className="text-gray-400">({String.fromCharCode(65 + i)})</span>}
                <Seg text={o} />
                <SpeakButton text={o} speak={speak} small />
              </p>
            ))}
            <button
              type="button"
              className="mt-3 min-h-11 w-full rounded-xl border-2 border-indigo-600 py-2 text-sm font-bold text-indigo-700 active:bg-indigo-50"
              onClick={() => setShown((s) => ({ ...s, [it.n]: !open }))}
            >
              {open ? '隐藏答案' : '看答案'}
            </button>
            {open && (
              <div className="mt-3">
                <div className="flex items-start gap-2">
                  <p className="flex-1 text-[17px] font-bold leading-8 text-green-800">
                    <Seg text={it.answer} />
                  </p>
                  <SpeakButton text={it.answer} speak={speak} />
                </div>
                <div className="mt-2 rounded-xl bg-indigo-50 p-3 text-sm leading-6 text-gray-800">
                  <p>
                    <Seg text={it.why} />
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{it.en}</p>
                </div>
              </div>
            )}
          </Card>
        )
      })}

      {homework.map((s) => (
        <section key={s.id} className="mb-6 mt-8">
          <div className="mb-1 flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-white drop-shadow">
              {s.title}
              {s.points && <span className="ml-2 text-sm font-normal opacity-90">（{s.points}）</span>}
            </h2>
            <button
              className={cn(
                'min-h-11 shrink-0 rounded-full border-2 border-white px-3 py-1.5 text-sm font-bold',
                practice ? 'bg-white text-indigo-700' : 'bg-indigo-600 text-white'
              )}
              onClick={() => setPractice(!practice)}
            >
              {practice ? '显示答案' : '自己再做一次'}
            </button>
          </div>
          {s.instruction && (
            <p className="mb-3 text-sm text-white/90">
              <Seg text={s.instruction} light />
            </p>
          )}
          {(s.groups ?? []).map((g, gi) => (
            <GroupView key={gi} section={s} group={g} practice={practice} speak={speak} />
          ))}
        </section>
      ))}
    </>
  )
}
