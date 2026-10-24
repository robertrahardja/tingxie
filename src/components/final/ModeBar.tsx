// Row under the 词语 chips: 看 / 自测 / 听写, plus 重点优先 and 只看 ★.
import { cn } from '@/lib/utils'

export type Mode = 'browse' | 'test' | 'dictation'

const MODES: [Mode, string][] = [
  ['browse', '📖 看'],
  ['test', '🧠 自测'],
  ['dictation', '✏️ 听写'],
]

export function ModeBar({
  mode,
  setMode,
  priority,
  setPriority,
  starOnly,
  setStarOnly,
}: {
  mode: Mode
  setMode: (m: Mode) => void
  priority: boolean
  setPriority: (v: boolean) => void
  starOnly: boolean
  setStarOnly: (v: boolean) => void
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {MODES.map(([m, label]) => (
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
  )
}
