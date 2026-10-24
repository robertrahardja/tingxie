// /p3-weak: Hannah's own 不会 list (public/data/p3hcl/final/weak.json, copied
// from her device) as a fixed review set. Same 看 / 自测 / 听写 tools as the
// 词语 tab; 会 marks are kept per device, separate from /p3-final.
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { ttsPath } from '@/lib/tts'
import type { VocabData } from '@/lib/final/types'
import { PicsContext } from './Pic'
import type { PicMap } from './Pic'
import { WordsTab } from './WordsTab'
import { useStoredSet } from './storage'

const BASE = '/data/p3hcl/final'

const getJson = <T,>(f: string) =>
  fetch(`${BASE}/${f}`).then((r) => {
    if (!r.ok) throw new Error(`加载失败：${f}`)
    return r.json() as Promise<T>
  })

export function WeakPage() {
  const [data, setData] = useState<{ vocab: VocabData; weak: string[]; pics: PicMap } | null>(null)
  const [error, setError] = useState<string | null>(null)
  // words marked 会 on this page; the rest of the list is still 不会
  const [known, toggleKnown] = useStoredSet('p3weak_known')
  const { play } = useAudioPlayer()

  useEffect(() => {
    let alive = true
    Promise.all([
      getJson<VocabData>('vocab.json'),
      getJson<string[]>('weak.json'),
      getJson<PicMap>('pics.json').catch(() => ({}) as PicMap),
    ])
      .then(([vocab, weak, pics]) => alive && setData({ vocab, weak, pics }))
      .catch((e: Error) => alive && setError(e.message))
    return () => {
      alive = false
    }
  }, [])

  const speak = useCallback(
    async (text: string) => {
      await play(await ttsPath(text))
    },
    [play]
  )
  // toggleUnknown(k, on): on = 不会, so it is the opposite of 会
  const toggleUnknown = useCallback(
    (k: string, on?: boolean) => toggleKnown(k, on === undefined ? undefined : !on),
    [toggleKnown]
  )
  const scope = useMemo(() => new Set(data?.weak ?? []), [data])
  const unknown = useMemo(() => new Set([...scope].filter((k) => !known.has(k))), [scope, known])

  if (error || !data) {
    return (
      <div className="page-container">
        <div className="rounded-2xl bg-white p-6 text-center text-gray-700">{error ?? '加载中…'}</div>
      </div>
    )
  }

  return (
    <PicsContext.Provider value={data.pics}>
      <div className="page-container">
        <header className="mb-4 text-white">
          <h1 className="page-title text-2xl md:text-3xl">不会的词语</h1>
          <p className="mt-1 text-sm opacity-90">
            共 {scope.size} 个 · 还不会 {unknown.size} 个 · 会了就点 ✓ 会
          </p>
        </header>
        <WordsTab data={data.vocab} unknown={unknown} toggleUnknown={toggleUnknown} speak={speak} scope={scope} />
      </div>
    </PicsContext.Provider>
  )
}
