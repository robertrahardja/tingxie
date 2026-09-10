import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { ttsPath } from '@/lib/tts'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/zonghe/$week')({
  component: ZonghePage,
})

// ---------- data types ----------

interface Question {
  n: number
  text: string
  options?: string[]
  answer: number
  student: number | null
  unsure?: string
  alt?: number
  why: string
  en: string
  // kind "open" (written answers): answer is always 1; student 1 = her answer
  // was accepted, 2 = needs correction, null = blank.
  model?: string
  written?: string | null
  points?: number
}

interface Group {
  label?: string
  bank?: string[]
  passage?: string[]
  passageEn?: string
  questions: Question[]
  unused?: string
}

interface RewriteItem {
  n: number
  original: string[]
  pattern: string
  answer: string
  why: string
  en: string
}

interface OralItem {
  title: string
  sentences: { zh: string; en: string }[]
  vocab: { w: string; py: string; en: string }[]
  // The part of the booklet picture this passage describes (e.g. a crop of 图片4).
  image?: string
  imageCaption?: string
}

interface Section {
  id: string
  kind: 'mcq' | 'match' | 'cloze' | 'complete' | 'reading' | 'open' | 'rewrite' | 'oral'
  title: string
  points?: string
  instruction?: string
  groups?: Group[]
  items?: (RewriteItem | OralItem)[]
  // "rewrite" puts a question section (e.g. a homework cloze) under the 课后练习 tab.
  tab?: 'answers' | 'rewrite'
  // kind "oral": the whole booklet picture, shown once above the passages.
  image?: string
  imageCaption?: string
  // kind "oral": the tuition centre's own recording of the passages.
  audio?: string
  audioCaption?: string
  // kind "oral": the numbered parts of the picture; `item` names the passage
  // card a part jumps to, `current` marks the parts this week's passages cover.
  parts?: { n: number; image: string; label: string; item?: string; current?: boolean }[]
}

const ANSWER_KINDS: Section['kind'][] = ['mcq', 'match', 'cloze', 'complete', 'reading', 'open']

interface ZongheData {
  week: number
  title: string
  dates: string
  source: string
  student: string
  note?: string
  sections: Section[]
}

interface WordEntry {
  n: number
  w: string
  py: string
  en: string
  c: string
}

interface WordWeek {
  week: number
  dates: string
  kind: string
  words: WordEntry[]
}

interface WordsData {
  title: string
  weeks: WordWeek[]
}

// zonghe_<week>_words.json (scripts/build_zonghe_words.py): every text on the
// page split into words, plus pinyin + meaning for every word.
interface WordBank {
  seg: Record<string, string[]>
  dict: Record<string, { py: string; en: string }>
}

interface WordInfo {
  py?: string
  en?: string
}

const HAN = /[一-鿿]/

const WordsCtx = createContext<{
  bank: WordBank | null
  open: (word: string, info?: WordInfo) => void
}>({ bank: null, open: () => {} })

type Tab = 'answers' | 'rewrite' | 'oral' | 'words'

const TABS: { id: Tab; label: string }[] = [
  { id: 'answers', label: '课堂练习' },
  { id: 'rewrite', label: '课后练习' },
  { id: 'oral', label: '口试复习' },
  { id: 'words', label: '字词表' },
]

const NUM = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧']

// A paired connector like 因为……所以…… fills two blanks; otherwise fill the first.
const answerParts = (text: string, answer: string) => {
  const parts = answer.includes('……') ? answer.split('……').filter(Boolean) : [answer]
  const blanks = text.split('____').length - 1
  return parts.length > 1 && blanks >= parts.length ? parts : [answer]
}

// ---------- page ----------

function ZonghePage() {
  const { week } = Route.useParams()
  const [data, setData] = useState<ZongheData | null>(null)
  const [words, setWords] = useState<WordsData | null>(null)
  const [bank, setBank] = useState<WordBank | null>(null)
  const [sheet, setSheet] = useState<{ word: string; info?: WordInfo } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('answers')
  const [practice, setPractice] = useState(false)
  const { play, stop } = useAudioPlayer()

  useEffect(() => {
    let alive = true
    Promise.all([
      fetch(`/data/p3hcl/zonghe_${week}.json`).then((r) => {
        if (!r.ok) throw new Error(`没有第 ${week} 周的练习`)
        return r.json() as Promise<ZongheData>
      }),
      fetch('/data/p3hcl/words_w34_w40.json').then((r) => r.json() as Promise<WordsData>),
      // optional; the SPA fallback answers unknown paths with HTML, which fails to parse
      fetch(`/data/p3hcl/zonghe_${week}_words.json`)
        .then((r) => r.json() as Promise<WordBank>)
        .catch(() => null),
    ])
      .then(([z, w, b]) => {
        if (!alive) return
        setData(z)
        setWords(w)
        setBank(b && b.seg && b.dict ? b : null)
      })
      .catch((e: Error) => alive && setError(e.message))
    return () => {
      alive = false
    }
  }, [week])

  const speak = useCallback(
    async (text: string) => {
      const path = await ttsPath(text)
      await play(path)
    },
    [play]
  )

  const openWord = useCallback((word: string, info?: WordInfo) => setSheet({ word, info }), [])
  const closeWord = useCallback(() => setSheet(null), [])
  const ctx = useMemo(() => ({ bank, open: openWord }), [bank, openWord])

  if (error) {
    return (
      <div className="page-container">
        <div className="rounded-2xl bg-white p-6 text-center text-gray-700">{error}</div>
      </div>
    )
  }
  if (!data || !words) {
    return (
      <div className="page-container">
        <div className="text-center text-white">加载中…</div>
      </div>
    )
  }

  const answerSections = data.sections.filter(
    (s) => ANSWER_KINDS.includes(s.kind) && s.tab !== 'rewrite'
  )
  const rewrite = data.sections.find((s) => s.kind === 'rewrite')
  const homework = data.sections.filter((s) => ANSWER_KINDS.includes(s.kind) && s.tab === 'rewrite')
  const oral = data.sections.find((s) => s.kind === 'oral')

  return (
    <WordsCtx.Provider value={ctx}>
    <div className="page-container">
      <header className="mb-4 text-white">
        <h1 className="page-title text-2xl md:text-3xl">{data.title}</h1>
        <p className="mt-1 text-sm opacity-90">
          {data.dates} · {data.student}
        </p>
      </header>

      <nav className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={cn('filter-btn', tab === t.id && 'active')}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'answers' && (
        <AnswersTab
          sections={answerSections}
          practice={practice}
          setPractice={setPractice}
          speak={speak}
          note={data.note}
        />
      )}
      {tab === 'rewrite' && rewrite && (
        <RewriteTab section={rewrite} homework={homework} speak={speak} />
      )}
      {tab === 'oral' && oral && <OralTab section={oral} speak={speak} stopOther={stop} />}
      {tab === 'words' && <WordsTab data={words} week={data.week} speak={speak} />}
      {sheet && <WordSheet word={sheet.word} info={sheet.info} onClose={closeWord} speak={speak} />}
    </div>
    </WordsCtx.Provider>
  )
}

// ---------- shared bits ----------

function SpeakButton({ text, speak, small }: { text: string; speak: (t: string) => void; small?: boolean }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        speak(text)
      }}
      aria-label="播放"
      className={cn(
        'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-indigo-700 active:bg-indigo-200',
        small ? 'bg-indigo-50 text-base' : 'bg-indigo-100 text-lg'
      )}
    >
      🔊
    </button>
  )
}

function Card({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <div id={id} className={cn('mb-3 rounded-2xl bg-white p-4 shadow-md', className)}>
      {children}
    </div>
  )
}

// ---------- tappable words ----------

/** Where the answer words sit inside a blank-filled sentence. */
function fillWithRanges(text: string, answer: string) {
  const parts = answerParts(text, answer)
  const segs = text.split('____')
  let filled = ''
  const ranges: [number, number][] = []
  segs.forEach((seg, i) => {
    filled += seg
    if (i < segs.length - 1) {
      const p = parts[i] ?? (i === 0 ? answer : '____')
      ranges.push([filled.length, filled.length + p.length])
      filled += p
    }
  })
  return { filled, ranges }
}

/**
 * Renders a text as tappable words (when the word bank has it segmented).
 * `ranges` marks answer words (green); with `hide` they show as blanks.
 * `bold` names words to emphasise (我认为 / 因为 in oral passages).
 */
function Seg({
  text,
  ranges,
  hide,
  bold,
  light,
  className,
}: {
  text: string
  ranges?: [number, number][]
  hide?: boolean
  bold?: string[]
  light?: boolean
  className?: string
}) {
  const { bank, open } = useContext(WordsCtx)
  const tokens = bank?.seg[text.trim()]
  if (!tokens) {
    if (ranges && hide) {
      // no segmentation: blank the answer spans
      let out = ''
      let pos = 0
      for (const [s, e] of ranges) {
        out += text.slice(pos, s) + '____'
        pos = e
      }
      return <span className={className}>{out + text.slice(pos)}</span>
    }
    if (ranges) return <span className={className}>{renderRanges(text, ranges)}</span>
    return <span className={className}>{text}</span>
  }
  let pos = 0
  const nodes: React.ReactNode[] = []
  tokens.forEach((tok, i) => {
    const start = pos
    const end = pos + tok.length
    pos = end
    const range = ranges?.find(([s, e]) => start >= s && end <= e)
    if (range && hide) {
      if (start === range[0]) {
        nodes.push(
          <span key={i} className="mx-0.5 inline-block w-14 border-b-2 border-gray-400 align-baseline">
            &nbsp;
          </span>
        )
      }
      return
    }
    const answerCls = range && 'rounded bg-green-100 font-bold text-green-800 underline decoration-2 underline-offset-4'
    if (!HAN.test(tok)) {
      nodes.push(
        <span key={i} className={cn(answerCls)}>
          {tok}
        </span>
      )
      return
    }
    nodes.push(
      <button
        key={i}
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          open(tok)
        }}
        className={cn(
          'inline rounded px-px py-1 align-baseline transition-colors',
          light ? 'active:bg-white/30' : 'active:bg-indigo-100',
          bold?.includes(tok) && (light ? 'font-bold' : 'font-bold text-indigo-700'),
          answerCls
        )}
      >
        {tok}
      </button>
    )
  })
  return <span className={className}>{nodes}</span>
}

function renderRanges(text: string, ranges: [number, number][]) {
  const nodes: React.ReactNode[] = []
  let pos = 0
  ranges.forEach(([s, e], i) => {
    nodes.push(<span key={`t${i}`}>{text.slice(pos, s)}</span>)
    nodes.push(
      <span key={`a${i}`} className="mx-0.5 rounded bg-green-100 px-1.5 font-bold text-green-800 underline decoration-2 underline-offset-4">
        {text.slice(s, e)}
      </span>
    )
    pos = e
  })
  nodes.push(<span key="end">{text.slice(pos)}</span>)
  return nodes
}

/** Bottom card with the tapped word: pinyin, meaning, sound; a phrase lists its words. */
function WordSheet({
  word,
  info,
  onClose,
  speak,
}: {
  word: string
  info?: WordInfo
  onClose: () => void
  speak: (t: string) => void
}) {
  const { bank, open } = useContext(WordsCtx)
  const entry = bank?.dict[word]
  const py = info?.py ?? entry?.py ?? ''
  const en = info?.en ?? entry?.en ?? ''
  const parts = bank?.seg[word]?.filter((t) => HAN.test(t)) ?? []
  const showParts = parts.length > 1 ? parts : []
  useEffect(() => {
    speak(word)
  }, [word, speak])
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/25" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-lg rounded-t-3xl bg-white p-5 pb-8 shadow-2xl"
        role="dialog"
        aria-label={word}
      >
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-3xl font-bold leading-tight text-gray-900">{word}</div>
            {py && <div className="mt-1 text-lg text-indigo-700">{py}</div>}
            {en ? (
              <div className="mt-1 text-[15px] leading-6 text-gray-700">{en}</div>
            ) : showParts.length === 0 ? (
              <div className="mt-1 text-sm text-gray-400">（没有解释）</div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => speak(word)}
            aria-label="再听一次"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xl text-indigo-700 active:bg-indigo-200"
          >
            🔊
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100 text-lg text-gray-600 active:bg-gray-200"
          >
            ✕
          </button>
        </div>
        {showParts.length > 0 && (
          <div className="mt-3">
            <div className="mb-1 text-xs text-gray-500">点一个词看意思：</div>
            <div className="flex flex-wrap gap-2">
              {showParts.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => open(p)}
                  className="rounded-lg bg-amber-50 px-2 py-1 text-[15px] text-amber-900 active:bg-amber-100"
                >
                  {p}
                  {bank?.dict[p]?.py && <span className="ml-1 text-xs text-indigo-600">{bank.dict[p].py}</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// ---------- answers ----------

interface AnswersTabProps {
  sections: Section[]
  practice: boolean
  setPractice: (v: boolean) => void
  speak: (t: string) => void
  note?: string
}

function AnswersTab({ sections, practice, setPractice, speak, note }: AnswersTabProps) {
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
          {s.instruction && <p className="mb-3 text-sm text-white/90"><Seg text={s.instruction} light /></p>}
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

function GroupView({
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
            <p><Seg text={q.why} /></p>
            <p className="mt-1 text-xs text-gray-500">{q.en}</p>
          </div>
        </div>
      )}
    </Card>
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
        <div className={cn('mt-3 grid gap-2', options.length > 4 ? 'grid-cols-2 md:grid-cols-4' : options.length > 2 && kind !== 'reading' ? 'grid-cols-2' : 'grid-cols-1')}>
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
          答案：<span className="font-bold text-green-700">({q.answer}) <Seg text={answerText} /></span>
          {q.alt && <span className="text-gray-500">（({q.alt}) {options[q.alt - 1]} 也可以）</span>}
        </p>
      )}

      {reveal && (
        <div className="mt-3 rounded-xl bg-indigo-50 p-3 text-sm leading-6 text-gray-800">
          <div className="mb-1 font-bold text-indigo-700">为什么？</div>
          <p><Seg text={q.why} /></p>
          <p className="mt-1 text-xs text-gray-500">{q.en}</p>
        </div>
      )}
    </Card>
  )
}

// ---------- rewrite ----------

function RewriteTab({
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
      {section.instruction && <p className="mb-3 text-sm text-white/90"><Seg text={section.instruction} light /></p>}
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
                  <p><Seg text={it.why} /></p>
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
          {s.instruction && <p className="mb-3 text-sm text-white/90"><Seg text={s.instruction} light /></p>}
          {(s.groups ?? []).map((g, gi) => (
            <GroupView key={gi} section={s} group={g} practice={practice} speak={speak} />
          ))}
        </section>
      ))}
    </>
  )
}

// ---------- oral ----------

function OralTab({
  section,
  speak,
  stopOther,
}: {
  section: Section
  speak: (t: string) => void
  stopOther: () => void
}) {
  const items = (section.items ?? []) as OralItem[]
  const { open } = useContext(WordsCtx)
  const [playingAll, setPlayingAll] = useState<string | null>(null)
  // "读全篇" plays sentence after sentence, waiting for each clip to end.
  const chain = useRef<{ audio: HTMLAudioElement | null; cancelled: boolean } | null>(null)

  const stopAll = useCallback(() => {
    if (chain.current) {
      chain.current.cancelled = true
      chain.current.audio?.pause()
      chain.current = null
    }
    setPlayingAll(null)
  }, [])

  useEffect(() => stopAll, [stopAll])

  const speakOne = useCallback(
    (t: string) => {
      stopAll()
      speak(t)
    },
    [speak, stopAll]
  )

  const playAll = useCallback(
    async (it: OralItem) => {
      if (playingAll === it.title) {
        stopAll()
        return
      }
      stopAll()
      stopOther()
      const run = { audio: null as HTMLAudioElement | null, cancelled: false }
      chain.current = run
      setPlayingAll(it.title)
      for (const s of it.sentences) {
        if (run.cancelled) break
        const audio = new Audio(await ttsPath(s.zh))
        run.audio = audio
        const finished = new Promise<void>((resolve) => {
          audio.onended = () => resolve()
          audio.onerror = () => resolve()
          audio.onpause = () => resolve()
        })
        try {
          await audio.play()
          await finished
        } catch {
          break
        }
        if (run.cancelled) break
        await new Promise((r) => setTimeout(r, 500))
      }
      if (chain.current === run) {
        chain.current = null
        setPlayingAll(null)
      }
    },
    [playingAll, stopAll, stopOther]
  )

  return (
    <>
      <h2 className="mb-1 text-lg font-bold text-white drop-shadow">{section.title}</h2>
      {section.instruction && <p className="mb-3 text-sm text-white/90"><Seg text={section.instruction} light /></p>}
      {section.image && (
        <Card className="p-2">
          <img
            src={section.image}
            alt={section.imageCaption ?? section.title}
            className="w-full rounded-xl"
          />
          {section.imageCaption && (
            <p className="mt-2 px-1 text-sm leading-6 text-gray-700">
              <Seg text={section.imageCaption} />
            </p>
          )}
          {section.parts && section.parts.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2 md:grid-cols-5">
              {section.parts.map((p) => (
                <button
                  key={p.n}
                  type="button"
                  onClick={() =>
                    p.item &&
                    document
                      .getElementById(`oral-${p.item}`)
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                  className={cn(
                    'overflow-hidden rounded-xl border-2 bg-white text-left',
                    p.current ? 'border-indigo-500 shadow-md' : 'border-gray-200 opacity-75',
                    p.item && 'active:bg-indigo-50'
                  )}
                >
                  <div className="relative aspect-[4/3] bg-gray-50">
                    <img src={p.image} alt={`第${p.n}部分：${p.label}`} className="h-full w-full object-cover" />
                    <span className="absolute left-1 top-1 rounded-full bg-white/90 px-1.5 text-xs font-bold text-gray-800 shadow">
                      {p.n}
                    </span>
                    {p.current && (
                      <span className="absolute right-1 top-1 rounded-full bg-indigo-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        本周
                      </span>
                    )}
                  </div>
                  <div className="px-1.5 py-1 text-xs leading-4 text-gray-700">{p.label}</div>
                </button>
              ))}
            </div>
          )}
        </Card>
      )}
      {section.audio && (
        <Card>
          <div className="mb-1 text-lg font-bold text-gray-900">🎧 老师朗读</div>
          {section.audioCaption && (
            <p className="mb-2 text-sm leading-6 text-gray-600">
              <Seg text={section.audioCaption} />
            </p>
          )}
          <audio
            controls
            preload="metadata"
            src={section.audio}
            className="w-full"
            onPlay={() => {
              stopAll()
              stopOther()
            }}
          />
        </Card>
      )}
      {items.map((it) => (
        <Card key={it.title} className="scroll-mt-4" id={`oral-${it.title}`}>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">《{it.title}》</h3>
            <button
              type="button"
              onClick={() => playAll(it)}
              className="min-h-11 rounded-full bg-indigo-600 px-3 py-1.5 text-sm font-bold text-white active:bg-indigo-700"
            >
              {playingAll === it.title ? '⏹ 停止' : '▶ 读全篇'}
            </button>
          </div>
          {it.image && (
            <figure className="mb-3">
              <img
                src={it.image}
                alt={it.imageCaption ?? it.title}
                className="mx-auto max-h-72 w-auto max-w-full rounded-xl border border-gray-200"
              />
              {it.imageCaption && (
                <figcaption className="mt-1 text-center text-xs text-gray-500">
                  <Seg text={it.imageCaption} />
                </figcaption>
              )}
            </figure>
          )}
          {it.sentences.map((s, i) => (
            <div key={i} className="mb-2 flex items-start gap-2">
              <SpeakButton text={s.zh} speak={speakOne} small />
              <div className="flex-1">
                <p className="text-[17px] leading-8 text-gray-900">
                  <Seg text={s.zh} bold={['我认为', '因为']} />
                </p>
                <p className="text-xs text-gray-500">{s.en}</p>
              </div>
            </div>
          ))}
          {it.vocab.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {it.vocab.map((v) => (
                <button
                  key={v.w}
                  type="button"
                  onClick={() => {
                    stopAll()
                    open(v.w, { py: v.py, en: v.en })
                  }}
                  className="rounded-lg bg-amber-50 px-2 py-1 text-left text-sm active:bg-amber-100"
                >
                  <span className="font-bold text-gray-900">{v.w}</span>
                  <span className="ml-1 text-xs text-indigo-600">{v.py}</span>
                  <span className="ml-1 text-xs text-gray-500">{v.en}</span>
                </button>
              ))}
            </div>
          )}
        </Card>
      ))}
    </>
  )
}

// ---------- words ----------

function WordsTab({ data, week, speak }: { data: WordsData; week: number; speak: (t: string) => void }) {
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
        <WordRow key={`${cur.kind}-${w.n}`} w={w} hide={hideMeaning} speak={speak} />
      ))}
    </>
  )
}

function WordRow({ w, hide }: { w: WordEntry; hide: boolean; speak: (t: string) => void }) {
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
