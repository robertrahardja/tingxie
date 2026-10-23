// Per-device state for /p3-final: the 不会 word list and the plan checklist.
// localStorage only — losing it just means re-marking, nothing breaks.
import { useCallback, useState } from 'react'

function load(key: string): string[] {
  try {
    const raw = localStorage.getItem(key)
    const v = raw ? JSON.parse(raw) : []
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

/** A persisted string set: [set, toggle(key, on?)] */
export function useStoredSet(key: string) {
  const [set, setSet] = useState<Set<string>>(() => new Set(load(key)))
  const toggle = useCallback(
    (k: string, on?: boolean) => {
      setSet((prev) => {
        const next = new Set(prev)
        const want = on ?? !next.has(k)
        if (want) next.add(k)
        else next.delete(k)
        try {
          localStorage.setItem(key, JSON.stringify([...next]))
        } catch {
          // private mode: keep in memory only
        }
        return next
      })
    },
    [key]
  )
  return [set, toggle] as const
}
