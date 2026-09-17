// 练习 tab: the workbook exercises that have short answers — 连一连, 找词语,
// 错字小侦探, 写一写排一排, 找一找涂一涂, 球拍和拍球.
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Card, SpeakButton } from '@/components/shared/ui'
import { Seg } from '@/components/shared/words'
import type {
  ColourItem,
  ErrorItem,
  OrderItem,
  PinyinItem,
  RiddleItem,
  Section,
  TableRow,
} from '@/lib/keben/types'

type Speak = (t: string) => void

export function SectionHead({ section }: { section: Section }) {
  return (
    <>
      <h2 className="mb-1 text-lg font-bold text-white drop-shadow">
        {section.title}
        <span className="ml-2 text-sm font-normal opacity-90">（第 {section.page} 页）</span>
      </h2>
      {section.instruction && (
        <p className="mb-3 text-sm text-white/90">
          <Seg text={section.instruction} light />
        </p>
      )}
    </>
  )
}

/** Shows the answer only after a tap, so she can try first. */
function Reveal({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className="mt-3 min-h-11 w-full rounded-xl border-2 border-indigo-600 py-2 text-sm font-bold text-indigo-700 active:bg-indigo-50"
      onClick={onToggle}
    >
      {open ? '隐藏答案' : '看答案'}
    </button>
  )
}

function useReveal() {
  const [shown, setShown] = useState<Record<number | string, boolean>>({})
  const [all, setAll] = useState(false)
  const isOpen = (k: number | string) => all || !!shown[k]
  const toggle = (k: number | string) => setShown((s) => ({ ...s, [k]: !s[k] }))
  return { isOpen, toggle, all, setAll }
}

function AllButton({ all, setAll }: { all: boolean; setAll: (v: boolean) => void }) {
  return (
    <button
      className={cn(
        'min-h-11 shrink-0 rounded-full border-2 border-white px-3 py-1.5 text-sm font-bold',
        all ? 'bg-white text-indigo-700' : 'bg-indigo-600 text-white'
      )}
      onClick={() => setAll(!all)}
    >
      {all ? '自己再做一次' : '全部答案'}
    </button>
  )
}

function Qn({ n }: { n: number | string }) {
  return (
    <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-bold text-white">{n}</span>
  )
}

/** 一、连一连，写一写 */
function PinyinSection({ items, speak, speakEnabled }: { items: PinyinItem[]; speak: Speak; speakEnabled: boolean }) {
  const { isOpen, toggle, all, setAll } = useReveal()
  return (
    <>
      <div className="mb-3 flex justify-end">
        <AllButton all={all} setAll={setAll} />
      </div>
      {items.map((it) => {
        const open = isOpen(it.n)
        return (
          <Card key={it.n}>
            <div className="mb-2 flex items-center justify-between gap-2">
              <Qn n={it.n} />
              <span className="text-xs text-gray-500">{it.picture}</span>
            </div>
            <div className="flex items-center gap-2">
              <p className="flex-1 text-[19px] font-bold leading-8 text-gray-900">
                <Seg text={it.word} />
              </p>
              {speakEnabled && <SpeakButton text={it.word} speak={speak} />}
            </div>
            <p className="mt-1 text-[15px] text-gray-500">
              {it.given}{' '}
              {open ? (
                <span className="rounded bg-green-100 px-1.5 font-bold text-green-800">{it.answer}</span>
              ) : (
                <span className="inline-block w-20 border-b-2 border-gray-400">&nbsp;</span>
              )}
            </p>
            {open && (
              <div className="mt-2 rounded-xl bg-indigo-50 p-3 text-sm leading-6 text-gray-800">
                <p>
                  完整拼音：<span className="font-bold text-indigo-800">{it.full}</span>
                </p>
                <p className="mt-1 text-xs text-gray-500">{it.en}</p>
              </div>
            )}
            {!all && <Reveal open={open} onToggle={() => toggle(it.n)} />}
          </Card>
        )
      })}
    </>
  )
}

/** 二、找词语 */
function RiddleSection({
  items,
  grid,
  gridNote,
  speak,
  speakEnabled,
}: {
  items: RiddleItem[]
  grid?: string[]
  gridNote?: string
  speak: Speak
  speakEnabled: boolean
}) {
  const { isOpen, toggle, all, setAll } = useReveal()
  const answers = new Set(items.flatMap((it) => it.answer.split('')))
  return (
    <>
      <div className="mb-3 flex justify-end">
        <AllButton all={all} setAll={setAll} />
      </div>
      {grid && (
        <Card>
          <p className="mb-2 text-xs font-bold text-gray-500">蜂窝里的字</p>
          <div className="flex flex-wrap gap-1.5">
            {grid.map((z, i) => (
              <span
                key={i}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg text-[17px]',
                  all && answers.has(z)
                    ? 'bg-green-100 font-bold text-green-800 ring-2 ring-green-500'
                    : 'bg-amber-50 text-amber-900'
                )}
              >
                {z}
              </span>
            ))}
          </div>
          {all && gridNote && <p className="mt-2 text-xs leading-5 text-gray-500">{gridNote}</p>}
        </Card>
      )}
      {items.map((it) => {
        const open = isOpen(it.n)
        return (
          <Card key={it.n}>
            <div className="mb-2 flex items-center justify-between gap-2">
              <Qn n={it.n} />
              <span className="rounded-lg border border-gray-400 px-2 py-0.5 text-xs font-bold text-gray-700">
                {it.hint}
              </span>
            </div>
            <p className="text-[16px] leading-7 text-gray-800">
              <Seg text={it.clue} />
            </p>
            {open ? (
              <div className="mt-3">
                <div className="flex items-center gap-2">
                  <p className="flex-1 text-[20px] font-bold leading-8 text-green-800">
                    <Seg text={it.answer} />
                    <span className="ml-2 text-base font-normal text-indigo-700">{it.py}</span>
                  </p>
                  {speakEnabled && <SpeakButton text={it.answer} speak={speak} />}
                </div>
                <div className="mt-2 rounded-xl bg-indigo-50 p-3 text-sm leading-6 text-gray-800">
                  <p>
                    <Seg text={it.why} />
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{it.en}</p>
                </div>
              </div>
            ) : null}
            {!all && <Reveal open={open} onToggle={() => toggle(it.n)} />}
          </Card>
        )
      })}
    </>
  )
}

/** 三、错字小侦探 — the wrong character is marked red inside the sentence. */
function ErrorSection({ items, speak, speakEnabled }: { items: ErrorItem[]; speak: Speak; speakEnabled: boolean }) {
  const { isOpen, toggle, all, setAll } = useReveal()
  return (
    <>
      <div className="mb-3 flex justify-end">
        <AllButton all={all} setAll={setAll} />
      </div>
      {items.map((it) => {
        const open = isOpen(it.n)
        const at = it.sentence.indexOf(it.wrong)
        return (
          <Card key={it.n}>
            <div className="mb-2">
              <Qn n={it.n} />
            </div>
            <p className="text-[17px] leading-8 text-gray-800">
              {at >= 0 ? (
                <>
                  {it.sentence.slice(0, at)}
                  <span
                    className={cn(
                      'mx-0.5 rounded px-1',
                      open
                        ? 'bg-red-100 font-bold text-red-700 line-through decoration-2'
                        : 'text-gray-800'
                    )}
                  >
                    {it.wrong}
                  </span>
                  {it.sentence.slice(at + it.wrong.length)}
                </>
              ) : (
                it.sentence
              )}
            </p>
            {open && (
              <div className="mt-3">
                <div className="flex items-center gap-2">
                  <span className="flex min-h-12 min-w-12 items-center justify-center rounded-xl bg-green-100 px-3 text-2xl font-bold text-green-800">
                    {it.right}
                  </span>
                  <span className="text-base text-indigo-700">{it.py}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <p className="flex-1 text-[16px] font-bold leading-7 text-green-800">
                    <Seg text={it.correct} />
                  </p>
                  {speakEnabled && <SpeakButton text={it.correct} speak={speak} small />}
                </div>
                <div className="mt-2 rounded-xl bg-indigo-50 p-3 text-sm leading-6 text-gray-800">
                  <p>
                    <Seg text={it.why} />
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{it.en}</p>
                </div>
              </div>
            )}
            {!all && <Reveal open={open} onToggle={() => toggle(it.n)} />}
          </Card>
        )
      })}
    </>
  )
}

/** 四、写一写，排一排 — sentences shown in story order with the filled characters. */
function OrderSection({
  items,
  note,
  speak,
  speakEnabled,
}: {
  items: OrderItem[]
  note?: string
  speak: Speak
  speakEnabled: boolean
}) {
  const [all, setAll] = useState(false)
  const sorted = [...items].sort((a, b) => a.order - b.order)
  return (
    <>
      <div className="mb-3 flex justify-end">
        <AllButton all={all} setAll={setAll} />
      </div>
      {sorted.map((it) => (
        <Card key={it.order}>
          <div className="mb-2 flex items-center justify-between gap-2">
            <span
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
                it.given ? 'bg-gray-300 text-gray-700' : 'bg-indigo-600 text-white'
              )}
            >
              {it.order}
            </span>
            {it.given && <span className="text-xs text-gray-500">课本已给</span>}
          </div>
          <div className="flex items-start gap-2">
            <p className="flex-1 text-[17px] leading-8 text-gray-900">
              <Seg text={it.text} />
            </p>
            {speakEnabled && <SpeakButton text={it.text} speak={speak} small />}
          </div>
          {it.blanks.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {it.blanks.map((b, i) => (
                <span
                  key={i}
                  className="rounded-lg bg-green-100 px-2 py-1 text-[15px] text-green-800"
                >
                  <span className="mr-1 text-xs text-indigo-700">{b.py}</span>
                  <span className="text-lg font-bold">{all ? b.zi : '？'}</span>
                </span>
              ))}
            </div>
          )}
          <p className="mt-2 text-xs leading-5 text-gray-500">{it.en}</p>
        </Card>
      ))}
      {note && (
        <Card className="bg-amber-50">
          <p className="text-sm leading-6 text-amber-900">{note}</p>
        </Card>
      )}
    </>
  )
}

/** 六、找一找，涂一涂 */
function ColourSection({
  items,
  distractors,
  result,
  resultNote,
  speak,
  speakEnabled,
}: {
  items: ColourItem[]
  distractors?: ColourItem[]
  result?: string
  resultNote?: string
  speak: Speak
  speakEnabled: boolean
}) {
  const [all, setAll] = useState(false)
  return (
    <>
      <div className="mb-3 flex justify-end">
        <AllButton all={all} setAll={setAll} />
      </div>
      <Card>
        <p className="mb-2 text-xs font-bold text-gray-500">要涂颜色的拼音</p>
        <div className="grid grid-cols-2 gap-2">
          {items.map((it) => (
            <button
              key={it.n}
              type="button"
              onClick={() => speakEnabled && speak(it.w)}
              className="rounded-xl bg-green-100 p-2 text-left active:bg-green-200"
            >
              <div className="text-[15px] font-bold text-green-900">{it.py}</div>
              <div className="text-[17px] text-gray-900">
                {it.n}. {it.w}
              </div>
              <div className="text-xs text-gray-600">{it.en}</div>
            </button>
          ))}
        </div>
      </Card>
      {distractors && distractors.length > 0 && (
        <Card>
          <p className="mb-2 text-xs font-bold text-gray-500">不要涂的（干扰词）</p>
          <div className="flex flex-wrap gap-2">
            {distractors.map((d, i) => (
              <span key={i} className="rounded-lg bg-gray-100 px-2 py-1 text-sm text-gray-600">
                {d.py} <span className="text-gray-800">{d.w}</span>
              </span>
            ))}
          </div>
        </Card>
      )}
      {result && (
        <Card className="text-center">
          <p className="text-sm text-gray-600">我看到</p>
          <div className="my-2 inline-flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-dashed border-indigo-400 text-6xl font-bold text-indigo-700">
            {all ? result : '？'}
          </div>
          <p className="text-sm text-gray-600">字。</p>
          {all && resultNote && <p className="mt-2 text-sm leading-6 text-gray-700">{resultNote}</p>}
        </Card>
      )}
    </>
  )
}

/** 八、可以倒过来的词语 */
function TableSection({
  rows,
  more,
  speak,
  speakEnabled,
}: {
  rows: TableRow[]
  more?: { a: string; b: string; same: boolean; note: string }[]
  speak: Speak
  speakEnabled: boolean
}) {
  const [all, setAll] = useState(false)
  return (
    <>
      <div className="mb-3 flex justify-end">
        <AllButton all={all} setAll={setAll} />
      </div>
      {rows.map((r) => {
        const open = all || !!r.given
        return (
          <Card key={r.n}>
            <div className="mb-2 flex items-center justify-between gap-2">
              <Qn n={r.n} />
              {r.given && <span className="text-xs text-gray-500">课本已给</span>}
              {r.mine && <span className="text-xs text-gray-500">自己想的</span>}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-amber-50 p-2">
                <div className="flex items-center gap-1">
                  <span className="text-[19px] font-bold text-gray-900">
                    {open || !r.mine ? r.a : '？'}
                  </span>
                  {speakEnabled && open && <SpeakButton text={r.a} speak={speak} small />}
                </div>
                <div className="text-xs text-indigo-700">{open || !r.mine ? r.aPy : ''}</div>
                <div className="mt-1 text-sm leading-5 text-gray-700">{open ? r.aMean : '＿＿＿'}</div>
              </div>
              <div className="rounded-xl bg-sky-50 p-2">
                <div className="flex items-center gap-1">
                  <span className="text-[19px] font-bold text-gray-900">{open ? r.b : '？'}</span>
                  {speakEnabled && open && <SpeakButton text={r.b} speak={speak} small />}
                </div>
                <div className="text-xs text-indigo-700">{open ? r.bPy : ''}</div>
                <div className="mt-1 text-sm leading-5 text-gray-700">{open ? r.bMean : '＿＿＿'}</div>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-700">
              一样吗？{' '}
              <span
                className={cn(
                  'text-xl font-bold',
                  open ? (r.same ? 'text-green-700' : 'text-red-600') : 'text-gray-400'
                )}
              >
                {open ? (r.same ? '✓' : '✗') : '？'}
              </span>
            </p>
          </Card>
        )
      })}
      {all && more && more.length > 0 && (
        <Card className="bg-amber-50">
          <p className="mb-2 text-sm font-bold text-amber-900">还可以用这些</p>
          {more.map((m, i) => (
            <p key={i} className="text-sm leading-6 text-amber-900">
              {m.a} / {m.b} — {m.same ? '✓ 一样' : '✗ 不一样'}：{m.note}
            </p>
          ))}
        </Card>
      )}
    </>
  )
}

export function ExerciseTab({
  sections,
  speak,
  speakEnabled,
}: {
  sections: Section[]
  speak: Speak
  speakEnabled: boolean
}) {
  return (
    <>
      {sections.map((s) => (
        <section key={s.id} className="mb-8">
          <SectionHead section={s} />
          {s.kind === 'pinyin' && (
            <PinyinSection items={(s.items ?? []) as PinyinItem[]} speak={speak} speakEnabled={speakEnabled} />
          )}
          {s.kind === 'riddle' && (
            <RiddleSection
              items={(s.items ?? []) as RiddleItem[]}
              grid={s.grid}
              gridNote={s.gridNote}
              speak={speak}
              speakEnabled={speakEnabled}
            />
          )}
          {s.kind === 'error' && (
            <ErrorSection items={(s.items ?? []) as ErrorItem[]} speak={speak} speakEnabled={speakEnabled} />
          )}
          {s.kind === 'order' && (
            <OrderSection
              items={(s.items ?? []) as OrderItem[]}
              note={s.orderNote}
              speak={speak}
              speakEnabled={speakEnabled}
            />
          )}
          {s.kind === 'colour' && (
            <ColourSection
              items={(s.items ?? []) as ColourItem[]}
              distractors={s.distractors}
              result={s.result}
              resultNote={s.resultNote}
              speak={speak}
              speakEnabled={speakEnabled}
            />
          )}
          {s.kind === 'table' && (
            <TableSection rows={s.rows ?? []} more={s.more} speak={speak} speakEnabled={speakEnabled} />
          )}
        </section>
      ))}
    </>
  )
}
