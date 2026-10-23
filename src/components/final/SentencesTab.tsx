// 句子变变变 tab: the school's sentence-pattern table, one card per pattern.
// She tries each item first; 看答案 shows the model (and her own answer when
// it needs fixing).
import { useState } from 'react'
import { Card, SpeakButton } from '@/components/shared/ui'
import type { Pattern, SentencesData } from '@/lib/final/types'
import { Pic } from './Pic'

export function SentencesTab({ data, speak }: { data: SentencesData; speak: (t: string) => void }) {
  return (
    <div>
      <p className="mb-3 text-sm text-white/90">先自己说一说、写一写，再点“看答案”。</p>
      {data.patterns.map((p, i) => (
        <PatternCard key={i} pi={i} p={p} speak={speak} />
      ))}
    </div>
  )
}

function PatternCard({ pi, p, speak }: { pi: number; p: Pattern; speak: (t: string) => void }) {
  const [open, setOpen] = useState<Set<number>>(new Set())
  const toggle = (i: number) =>
    setOpen((s) => {
      const n = new Set(s)
      if (n.has(i)) n.delete(i)
      else n.add(i)
      return n
    })
  return (
    <Card>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-sm text-indigo-700">
          第{p.lesson}课{p.page ? ` · ${p.page}` : ''}
        </span>
        <span className="text-xl font-bold text-gray-900">{p.pattern}</span>
      </div>
      {p.instruction && <div className="mb-2 text-sm text-gray-600">{p.instruction}</div>}
      <div className="space-y-3">
        {p.items.map((it, i) => (
          <div key={i} className="rounded-xl bg-gray-50 p-3">
            <div className="mb-1 text-xs font-semibold text-gray-500">{it.practice ? '练一练' : '学校例句'}</div>
            <Pic id={`s-${pi}-${i}`} className="mb-2 h-20 w-full" />
            <div className="whitespace-pre-line text-[16px] leading-7 text-gray-900">{it.prompt}</div>
            {open.has(i) && (
              <div className="mt-2 space-y-2">
                <div className="flex items-start gap-2 rounded-lg bg-emerald-50 p-2">
                  <span className="flex-1 text-[16px] leading-7 font-semibold text-emerald-900">{it.model}</span>
                  <SpeakButton text={it.model} speak={speak} small />
                </div>
                {it.student && it.ok === false && (
                  <div className="rounded-lg bg-rose-50 p-2 text-sm leading-6 text-rose-800">
                    你之前写的：{it.student}
                  </div>
                )}
              </div>
            )}
            <button
              type="button"
              onClick={() => toggle(i)}
              className={
                open.has(i)
                  ? 'mt-2 min-h-11 rounded-full bg-gray-200 px-4 text-sm font-semibold text-gray-700'
                  : 'mt-2 min-h-11 rounded-full bg-indigo-600 px-4 text-sm font-semibold text-white'
              }
            >
              {open.has(i) ? '收起答案' : '看答案'}
            </button>
          </div>
        ))}
      </div>
    </Card>
  )
}
