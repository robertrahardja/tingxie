// End-of-run summary for the 词语 tab's 自测 / 听写: score, a way back, the
// skipped words and the 不会 list.
import { Card } from '@/components/shared/ui'
import type { Entry } from './WordParts'

export function FinishCard({
  total,
  known,
  wrong,
  skipped,
  back,
  doSkipped,
  speak,
}: {
  total: number
  known: number
  wrong: Entry[]
  skipped: number
  back: () => void
  doSkipped: () => void
  speak: (t: string) => void
}) {
  return (
    <Card className="text-center">
      <div className="text-2xl font-bold text-gray-900">完成！🎉</div>
      <div className="mt-2 text-gray-700">
        会 {known} / {total}
        {skipped > 0 && <span className="text-gray-500"> · 跳过 {skipped}</span>}
      </div>
      <div className="mt-3 flex justify-center gap-2">
        <button
          type="button"
          onClick={back}
          className="min-h-11 rounded-full bg-gray-200 px-4 text-sm font-semibold text-gray-700"
        >
          ← 回到上一个
        </button>
        {skipped > 0 && (
          <button
            type="button"
            onClick={doSkipped}
            className="min-h-11 rounded-full bg-indigo-600 px-4 text-sm font-semibold text-white"
          >
            做跳过的词
          </button>
        )}
      </div>
      {wrong.length > 0 && (
        <div className="mt-3 text-left">
          <div className="mb-1 text-sm text-gray-500">不会的（已加入“不会”列表）：</div>
          <div className="flex flex-wrap gap-2">
            {wrong.map((e) => (
              <button
                key={e.key}
                type="button"
                onClick={() => speak(e.w.word)}
                className="rounded-lg bg-rose-50 px-2 py-1 text-lg text-rose-800"
              >
                {e.w.word}
              </button>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
