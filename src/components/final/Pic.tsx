// Emoji picture cues for /p3-final. pics.json maps an item id (wordPicId for
// words, s-<pattern>-<item> and q-<set>-<section>-<n> otherwise) to 1–3 emoji;
// items without one render nothing. Emoji carry no text, so they are safe
// above 听写.
import { createContext, useContext } from 'react'
import { cn } from '@/lib/utils'

export type PicMap = Record<string, string>

export const PicsContext = createContext<PicMap>({})

export function Pic({ id, small, className }: { id: string; small?: boolean; className?: string }) {
  const emoji = useContext(PicsContext)[id]
  if (!emoji) return null
  return (
    <div
      aria-hidden
      className={cn(
        'flex items-center justify-center rounded-xl bg-indigo-50 leading-none',
        small ? 'text-2xl' : 'text-6xl',
        className
      )}
    >
      {emoji}
    </div>
  )
}
