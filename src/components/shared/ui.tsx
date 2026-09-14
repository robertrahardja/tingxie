import { cn } from '@/lib/utils'

export const NUM = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧']

export function SpeakButton({
  text,
  speak,
  small,
}: {
  text: string
  speak: (t: string) => void
  small?: boolean
}) {
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

export function Card({
  children,
  className,
  id,
}: {
  children: React.ReactNode
  className?: string
  id?: string
}) {
  return (
    <div id={id} className={cn('mb-3 rounded-2xl bg-white p-4 shadow-md', className)}>
      {children}
    </div>
  )
}
