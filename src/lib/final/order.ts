import type { Entry } from '@/components/final/WordParts'

/** 重点优先: 不会 words, then ★ words, then the rest; newest lesson first within each. */
export function priorityOrder(entries: Entry[], unknown: Set<string>): Entry[] {
  const tier = (e: Entry) => (unknown.has(e.key) ? 0 : e.w.star ? 1 : 2)
  return entries
    .map((e) => ({ e, r: Math.random() }))
    .sort((a, b) => tier(a.e) - tier(b.e) || b.e.lesson.lesson - a.e.lesson.lesson || a.r - b.r)
    .map((x) => x.e)
}
