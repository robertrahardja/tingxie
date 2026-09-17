// 阅读 tab: 五、阅读放大镜《读字条》— the passage, the two readings of the
// note, and the three questions (词典, 对错, 事情的经过).
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Card, SpeakButton } from '@/components/shared/ui'
import { Seg } from '@/components/shared/words'
import { SectionHead } from './ExerciseTab'
import type { ReadingQuestion, Section } from '@/lib/keben/types'

type Speak = (t: string) => void

function QuestionCard({
  q,
  speak,
  speakEnabled,
}: {
  q: ReadingQuestion
  speak: Speak
  speakEnabled: boolean
}) {
  const [open, setOpen] = useState(false)
  return (
    <Card>
      <div className="mb-2 flex items-start gap-2">
        <span className="mt-0.5 rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-bold text-white">
          {q.n}
        </span>
        <p className="flex-1 text-[16px] leading-7 text-gray-900">
          <Seg text={q.q} />
        </p>
      </div>

      {q.type === 'tf' && (
        <div className="mt-2">
          {(q.sub ?? []).map((s) => (
            <div key={s.n} className="mb-2 rounded-xl bg-gray-50 p-3">
              <div className="flex items-start gap-2">
                <span className="text-sm text-gray-500">{s.n}</span>
                <p className="flex-1 text-[15px] leading-7 text-gray-800">
                  <Seg text={s.zh} />
                </p>
                <span
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl font-bold',
                    !open
                      ? 'bg-gray-200 text-gray-400'
                      : s.answer
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-600'
                  )}
                >
                  {!open ? '？' : s.answer ? '✓' : '✗'}
                </span>
              </div>
              {open && (
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  <Seg text={s.why} />
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {q.type === 'flow' && (
        <div className="mt-2">
          {(q.steps ?? []).map((st, i) => (
            <div key={i}>
              {i > 0 && <div className="py-1 text-center text-xl text-purple-400">↓</div>}
              <div className="rounded-xl bg-yellow-50 p-3">
                <div className="flex items-start gap-2">
                  <p className="flex-1 text-[15px] leading-7 text-gray-800">
                    {open ? <Seg text={st.full} /> : <Seg text={st.text} />}
                  </p>
                  {open && speakEnabled && <SpeakButton text={st.full} speak={speak} small />}
                </div>
                {open && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="rounded bg-green-100 px-2 py-0.5 text-sm font-bold text-green-800">
                      {st.blank}
                    </span>
                    {(st.extra ?? []).map((e, j) => (
                      <span
                        key={j}
                        className="rounded bg-green-100 px-2 py-0.5 text-sm font-bold text-green-800"
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {open && q.type === 'open' && q.answer && (
        <div className="mt-2">
          <div className="flex items-start gap-2">
            <p className="flex-1 text-[16px] font-bold leading-7 text-green-800">
              <Seg text={q.answer} />
            </p>
            {speakEnabled && <SpeakButton text={q.answer} speak={speak} small />}
          </div>
          {q.en && <p className="mt-1 text-xs text-gray-500">{q.en}</p>}
        </div>
      )}

      <button
        type="button"
        className="mt-3 min-h-11 w-full rounded-xl border-2 border-indigo-600 py-2 text-sm font-bold text-indigo-700 active:bg-indigo-50"
        onClick={() => setOpen(!open)}
      >
        {open ? '隐藏答案' : '看答案'}
      </button>
    </Card>
  )
}

export function ReadingTab({
  section,
  speak,
  speakEnabled,
}: {
  section: Section
  speak: Speak
  speakEnabled: boolean
}) {
  const [showKey, setShowKey] = useState(false)
  return (
    <section className="mb-8">
      <SectionHead section={section} />

      <Card>
        <h3 className="mb-2 text-center text-lg font-bold text-gray-900">读字条</h3>
        {(section.passage ?? []).map((p, i) => (
          <div key={i} className="mb-2 flex items-start gap-2">
            <p
              className={cn(
                'flex-1 text-[16px] leading-8 text-gray-800',
                p.startsWith('「') && 'rounded-lg bg-amber-50 px-2 py-1 font-bold'
              )}
            >
              <Seg text={p} />
            </p>
            {speakEnabled && <SpeakButton text={p} speak={speak} small />}
          </div>
        ))}
        {section.passageEn && (
          <p className="mt-2 border-t pt-2 text-xs leading-5 text-gray-500">{section.passageEn}</p>
        )}
      </Card>

      {section.key && (
        <Card className="bg-indigo-50">
          <button
            type="button"
            className="flex w-full items-center justify-between text-left"
            onClick={() => setShowKey(!showKey)}
          >
            <span className="text-base font-bold text-indigo-900">{section.key.title}</span>
            <span className="text-sm text-indigo-700">{showKey ? '收起' : '打开'}</span>
          </button>
          {showKey && (
            <div className="mt-3">
              {section.key.rows.map((r, i) => (
                <div key={i} className="mb-3 rounded-xl bg-white p-3">
                  <p className="text-xs font-bold text-indigo-700">{r.who}</p>
                  <div className="mt-1 flex items-start gap-2">
                    <p className="flex-1 text-[16px] leading-7 text-gray-900">
                      <Seg text={r.zh} />
                    </p>
                    {speakEnabled && <SpeakButton text={r.zh} speak={speak} small />}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-gray-500">{r.en}</p>
                </div>
              ))}
              <p className="text-sm leading-6 text-indigo-900">
                <Seg text={section.key.note} />
              </p>
            </div>
          )}
        </Card>
      )}

      {(section.questions ?? []).map((q) => (
        <QuestionCard key={q.n} q={q} speak={speak} speakEnabled={speakEnabled} />
      ))}
    </section>
  )
}
