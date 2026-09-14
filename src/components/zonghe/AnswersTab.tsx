// 课堂练习 tab: scoreboard, then every question section with her answer
// marked against the key. GroupView is shared with the homework part of the
// 课后练习 tab.
import { useContext, useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { fillWithRanges } from '@/lib/zonghe/types'
import type { Group, Question, Section } from '@/lib/zonghe/types'
import { Card, NUM, SpeakButton } from '@/components/shared/ui'
import { Seg, WordsCtx } from '@/components/shared/words'

interface AnswersTabProps {
  sections: Section[]
  practice: boolean
  setPractice: (v: boolean) => void
  speak: (t: string) => void
  note?: string
}

export function AnswersTab({ sections, practice, setPractice, speak, note }: AnswersTabProps) {
  const stats = useMemo(() => {
    let right = 0
    let wrong = 0
    let blank = 0
    let total = 0
    for (const s of sections)
      for (const g of s.groups ?? [])
        for (const q of g.questions) {
          total++
          if (q.student == null) blank++
          else if (q.student === q.answer || q.student === q.alt) right++
          else wrong++
        }
    return { right, wrong, blank, total }
  }, [sections])

  const wrongList = useMemo(
    () =>
      sections.flatMap((s) =>
        (s.groups ?? []).flatMap((g) =>
          g.questions.filter((q) => q.student != null && q.student !== q.answer && q.student !== q.alt)
        )
      ),
    [sections]
  )

  return (
    <>
      <Card className="bg-white/95">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">课堂练习 · 成绩单</h2>
          <button
            className={cn(
              'min-h-11 rounded-full border-2 px-3 py-1.5 text-sm font-bold',
              practice
                ? 'border-indigo-600 bg-indigo-600 text-white'
                : 'border-indigo-600 bg-white text-indigo-700'
            )}
            onClick={() => setPractice(!practice)}
          >
            {practice ? '显示答案' : '自己再做一次'}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <Stat label="答对" value={stats.right} color="text-green-600" />
          <Stat label="答错" value={stats.wrong} color="text-red-500" />
          <Stat label="没做" value={stats.blank} color="text-amber-500" />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          共 {stats.total} 题。答错的题目要特别看“为什么”。
          {note && <> <Seg text={note} /></>}
        </p>
        {wrongList.length > 0 && (
          <p className="mt-2 text-sm text-gray-700">
            <span className="font-bold text-red-500">要复习：</span>
            {wrongList.map((q) => `Q${q.n}`).join('、')}
          </p>
        )}
      </Card>

      {sections.map((s) => (
        <section key={s.id} className="mb-6">
          <h2 className="mb-1 text-lg font-bold text-white drop-shadow">
            {s.title}
            {s.points && <span className="ml-2 text-sm font-normal opacity-90">（{s.points}）</span>}
          </h2>
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

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl bg-gray-50 py-2">
      <div className={cn('text-2xl font-bold', color)}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  )
}

export function GroupView({
  section,
  group,
  practice,
  speak,
}: {
  section: Section
  group: Group
  practice: boolean
  speak: (t: string) => void
}) {
  const bank = group.bank
  const { open } = useContext(WordsCtx)
  // Passage lines are spoken with the answers filled in (same text the TTS script generates).
  const spokenLine = (line: string) =>
    line.replace(/【(\d+)】/g, (_, n) => {
      const q = group.questions.find((x) => x.n === Number(n))
      return (q && bank?.[q.answer - 1]) ?? ''
    })
  return (
    <div className="mb-4">
      {group.label && (
        <h3 className="mb-2 font-bold text-white/95">
          <Seg text={group.label} light />
        </h3>
      )}

      {group.passage && (
        <Card>
          {group.passage.map((line, i) => (
            <p key={i} className="mb-1 flex items-start gap-2 text-[15px] leading-7 text-gray-800">
              <SpeakButton text={spokenLine(line)} speak={speak} small />
              <span>{highlightBlanks(line)}</span>
            </p>
          ))}
          {group.passageEn && <p className="mt-2 text-xs text-gray-500">{group.passageEn}</p>}
        </Card>
      )}

      {bank && (
        <Card className="py-3">
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[15px] text-gray-800 md:grid-cols-4">
            {bank.map((w, i) => (
              <button
                key={i}
                type="button"
                onClick={() => open(w)}
                className="flex min-h-11 items-center gap-1 rounded-lg px-1 py-1 text-left active:bg-indigo-50"
              >
                <span className="text-indigo-600">{NUM[i]}</span>
                <span>{w}</span>
              </button>
            ))}
          </div>
          {group.unused && !practice && (
            <p className="mt-2 text-xs text-gray-500">
              用不到：<Seg text={group.unused} />
            </p>
          )}
        </Card>
      )}

      {group.questions.map((q) =>
        section.kind === 'open' ? (
          <OpenCard key={q.n} q={q} practice={practice} speak={speak} />
        ) : (
          <QuestionCard key={q.n} q={q} bank={bank} kind={section.kind} practice={practice} speak={speak} />
        )
      )}
    </div>
  )
}

function highlightBlanks(line: string) {
  const parts = line.split(/(【\d+】)/)
  return parts.map((p, i) =>
    /^【\d+】$/.test(p) ? (
      <span key={i} className="mx-0.5 rounded bg-amber-100 px-1 font-bold text-amber-700">
        Q{p.replace(/[【】]/g, '')}
      </span>
    ) : (
      <Seg key={i} text={p} />
    )
  )
}

// A written-answer question (阅读理解 问答): shows what she wrote, then the model answer.
function OpenCard({ q, practice, speak }: { q: Question; practice: boolean; speak: (t: string) => void }) {
  const [shown, setShown] = useState(false)
  useEffect(() => setShown(false), [practice])
  const reveal = !practice || shown
  const ok = q.student === 1
  return (
    <Card>
      <div className="flex items-start gap-2">
        <span className="mt-0.5 shrink-0 rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-bold text-white">
          Q{q.n}
        </span>
        <div className="flex-1">
          <p className="text-[17px] leading-8 text-gray-900">
            <Seg text={q.text} />
            {q.points != null && <span className="ml-1 text-xs text-gray-400">（{q.points}分）</span>}
          </p>
          {!practice && q.student != null && (
            <div className="mt-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-2 text-[15px] leading-7 text-gray-800">
              <div className="mb-1 flex flex-wrap items-center gap-2 text-sm">
                <span className="font-bold text-gray-500">你写的：</span>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 font-bold',
                    ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                  )}
                >
                  {ok ? '✓ 答对了' : '✗ 要改正'}
                </span>
                {q.unsure && <span className="text-xs text-gray-500">（{q.unsure}）</span>}
              </div>
              {q.written && <p>{q.written}</p>}
            </div>
          )}
          {!practice && q.student == null && (
            <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-sm font-bold text-amber-700">
              没做
            </span>
          )}
        </div>
        <SpeakButton text={q.text} speak={speak} />
      </div>

      {practice && !shown && (
        <button
          type="button"
          className="mt-3 min-h-11 w-full rounded-xl border-2 border-indigo-600 py-2 text-sm font-bold text-indigo-700 active:bg-indigo-50"
          onClick={() => setShown(true)}
        >
          看答案
        </button>
      )}

      {reveal && q.model && (
        <div className="mt-3">
          <div className="mb-1 text-xs font-bold text-green-700">参考答案</div>
          <div className="flex items-start gap-2">
            <p className="flex-1 text-[17px] font-bold leading-8 text-green-800">
              <Seg text={q.model} />
            </p>
            <SpeakButton text={q.model} speak={speak} />
          </div>
          <div className="mt-2 rounded-xl bg-indigo-50 p-3 text-sm leading-6 text-gray-800">
            <div className="mb-1 font-bold text-indigo-700">怎么找答案？</div>
            <p>
              <Seg text={q.why} />
            </p>
            <p className="mt-1 text-xs text-gray-500">{q.en}</p>
          </div>
        </div>
      )}
    </Card>
  )
}

function QuestionCard({
  q,
  bank,
  kind,
  practice,
  speak,
}: {
  q: Question
  bank?: string[]
  kind: Section['kind']
  practice: boolean
  speak: (t: string) => void
}) {
  const options = q.options ?? bank ?? []
  const { open } = useContext(WordsCtx)
  const [picked, setPicked] = useState<number | null>(null)
  useEffect(() => setPicked(null), [practice])
  const reveal = !practice || picked != null
  const answerText = options[q.answer - 1] ?? ''
  const hasBlank = q.text.includes('____')
  const { filled, ranges } = hasBlank
    ? fillWithRanges(q.text, answerText)
    : { filled: q.text, ranges: [] as [number, number][] }
  const studentOk = q.student != null && (q.student === q.answer || q.student === q.alt)
  const showOptionsInline = kind === 'mcq' || kind === 'reading'

  return (
    <Card>
      <div className="flex items-start gap-2">
        <span className="mt-0.5 shrink-0 rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-bold text-white">
          Q{q.n}
        </span>
        <div className="flex-1">
          <p className="text-[17px] leading-8 text-gray-900">
            <Seg text={filled} ranges={hasBlank ? ranges : undefined} hide={!reveal} />
          </p>
          {q.student != null && !practice && (
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 font-bold',
                  studentOk ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                )}
              >
                {studentOk ? '✓ 答对了' : `✗ 你选了 ${q.student}（${options[q.student - 1] ?? ''}）`}
              </span>
              {q.unsure && <span className="text-xs text-gray-500">（{q.unsure}）</span>}
            </div>
          )}
          {q.student == null && !practice && (
            <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-sm font-bold text-amber-700">
              没做 · 答案是 {q.answer}
            </span>
          )}
        </div>
        <SpeakButton text={hasBlank ? filled : q.text} speak={speak} />
      </div>

      {showOptionsInline || practice ? (
        <div
          className={cn(
            'mt-3 grid gap-2',
            options.length > 4
              ? 'grid-cols-2 md:grid-cols-4'
              : options.length > 2 && kind !== 'reading'
                ? 'grid-cols-2'
                : 'grid-cols-1'
          )}
        >
          {options.map((opt, i) => {
            const idx = i + 1
            const isAnswer = idx === q.answer || idx === q.alt
            const isPicked = picked === idx
            const isStudent = !practice && q.student === idx
            let cls = 'border-gray-200 bg-gray-50 text-gray-800'
            if (reveal && isAnswer) cls = 'border-green-500 bg-green-50 text-green-800 font-bold'
            else if (reveal && (isPicked || isStudent)) cls = 'border-red-400 bg-red-50 text-red-700'
            return (
              <button
                key={i}
                type="button"
                disabled={practice && picked != null}
                onClick={() => {
                  if (practice) {
                    setPicked(idx)
                    speak(opt)
                  } else {
                    open(opt)
                  }
                }}
                className={cn(
                  'min-h-11 rounded-xl border-2 px-3 py-2 text-left text-[15px] leading-6 transition-colors',
                  cls,
                  practice && picked == null && 'active:bg-indigo-50'
                )}
              >
                <span className="mr-1 text-indigo-600">({idx})</span>
                {opt}
                {reveal && isAnswer && <span className="ml-1">✓</span>}
              </button>
            )
          })}
        </div>
      ) : (
        <p className="mt-2 text-sm text-gray-700">
          答案：
          <span className="font-bold text-green-700">
            ({q.answer}) <Seg text={answerText} />
          </span>
          {q.alt && <span className="text-gray-500">（({q.alt}) {options[q.alt - 1]} 也可以）</span>}
        </p>
      )}

      {reveal && (
        <div className="mt-3 rounded-xl bg-indigo-50 p-3 text-sm leading-6 text-gray-800">
          <div className="mb-1 font-bold text-indigo-700">为什么？</div>
          <p>
            <Seg text={q.why} />
          </p>
          <p className="mt-1 text-xs text-gray-500">{q.en}</p>
        </div>
      )}
    </Card>
  )
}
