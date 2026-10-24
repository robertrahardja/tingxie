// Buttons under a 自测 / 听写 card: 看答案 → 会 / 不会, plus 上一个 / 跳过
// which move without marking.
export function RunControls({
  shown,
  first,
  reveal,
  answer,
  prev,
  skip,
}: {
  shown: boolean
  first: boolean
  reveal: () => void
  answer: (isKnown: boolean) => void
  prev: () => void
  skip: () => void
}) {
  return (
    <>
      {!shown ? (
        <button
          type="button"
          onClick={reveal}
          className="min-h-12 w-full rounded-2xl bg-white text-lg font-semibold text-indigo-700 shadow"
        >
          看答案
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => answer(false)}
            className="min-h-12 rounded-2xl bg-rose-500 text-lg font-semibold text-white shadow"
          >
            ✗ 不会
          </button>
          <button
            type="button"
            onClick={() => answer(true)}
            className="min-h-12 rounded-2xl bg-emerald-500 text-lg font-semibold text-white shadow"
          >
            ✓ 会
          </button>
        </div>
      )}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={first}
          onClick={prev}
          className="min-h-11 rounded-2xl bg-white/20 text-[15px] font-semibold text-white disabled:opacity-40"
        >
          ← 上一个
        </button>
        <button
          type="button"
          onClick={skip}
          className="min-h-11 rounded-2xl bg-white/20 text-[15px] font-semibold text-white"
        >
          跳过 →
        </button>
      </div>
    </>
  )
}
