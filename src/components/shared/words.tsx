// Tappable words: every Chinese text on /zonghe/<week> renders as word
// buttons; tapping one opens the WordSheet with pinyin, meaning and sound.
import { createContext, useContext, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { HAN } from '@/lib/shared/words'
import type { WordBank, WordInfo } from '@/lib/shared/words'

export const WordsCtx = createContext<{
  bank: WordBank | null
  open: (word: string, info?: WordInfo) => void
}>({ bank: null, open: () => {} })

/**
 * Renders a text as tappable words (when the word bank has it segmented).
 * `ranges` marks answer words (green); with `hide` they show as blanks.
 * `bold` names words to emphasise (我认为 / 因为 in oral passages).
 */
export function Seg({
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
    const answerCls =
      range && 'rounded bg-green-100 font-bold text-green-800 underline decoration-2 underline-offset-4'
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
      <span
        key={`a${i}`}
        className="mx-0.5 rounded bg-green-100 px-1.5 font-bold text-green-800 underline decoration-2 underline-offset-4"
      >
        {text.slice(s, e)}
      </span>
    )
    pos = e
  })
  nodes.push(<span key="end">{text.slice(pos)}</span>)
  return nodes
}

/** Bottom card with the tapped word: pinyin, meaning, sound; a phrase lists its words. */
export function WordSheet({
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
                  {bank?.dict[p]?.py && (
                    <span className="ml-1 text-xs text-indigo-600">{bank.dict[p].py}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
