// Photo picture cues for /p3-final. pics.json maps an item id (wordPicId for
// words, s-<pattern>-<item> and q-<set>-<section>-<n> otherwise) to an image
// path under public/; items without one render nothing. Only text-free
// images are listed, so they are safe above 听写.
import { createContext, useContext } from 'react'
import { cn } from '@/lib/utils'

export type PicMap = Record<string, string>

export const PicsContext = createContext<PicMap>({})

export function Pic({ id, className }: { id: string; className?: string }) {
  const src = useContext(PicsContext)[id]
  if (!src) return null
  return <img src={src} alt="" loading="lazy" className={cn('rounded-xl bg-gray-100 object-cover', className)} />
}
