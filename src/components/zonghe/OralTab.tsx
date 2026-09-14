// 口试复习 tab: the booklet picture with its numbered parts, the centre's
// recording, and each passage with 读全篇, per-sentence sound and vocab chips.
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { ttsPath } from '@/lib/tts'
import { cn } from '@/lib/utils'
import type { OralItem, Section } from '@/lib/zonghe/types'
import { Card, SpeakButton } from '@/components/shared/ui'
import { Seg, WordsCtx } from '@/components/shared/words'

export function OralTab({
  section,
  speak,
  stopOther,
}: {
  section: Section
  speak: (t: string) => void
  stopOther: () => void
}) {
  const items = (section.items ?? []) as OralItem[]
  const { open } = useContext(WordsCtx)
  const [playingAll, setPlayingAll] = useState<string | null>(null)
  // "读全篇" plays sentence after sentence, waiting for each clip to end.
  const chain = useRef<{ audio: HTMLAudioElement | null; cancelled: boolean } | null>(null)

  const stopAll = useCallback(() => {
    if (chain.current) {
      chain.current.cancelled = true
      chain.current.audio?.pause()
      chain.current = null
    }
    setPlayingAll(null)
  }, [])

  useEffect(() => stopAll, [stopAll])

  const speakOne = useCallback(
    (t: string) => {
      stopAll()
      speak(t)
    },
    [speak, stopAll]
  )

  const playAll = useCallback(
    async (it: OralItem) => {
      if (playingAll === it.title) {
        stopAll()
        return
      }
      stopAll()
      stopOther()
      const run = { audio: null as HTMLAudioElement | null, cancelled: false }
      chain.current = run
      setPlayingAll(it.title)
      for (const s of it.sentences) {
        if (run.cancelled) break
        const audio = new Audio(await ttsPath(s.zh))
        run.audio = audio
        const finished = new Promise<void>((resolve) => {
          audio.onended = () => resolve()
          audio.onerror = () => resolve()
          audio.onpause = () => resolve()
        })
        try {
          await audio.play()
          await finished
        } catch {
          break
        }
        if (run.cancelled) break
        await new Promise((r) => setTimeout(r, 500))
      }
      if (chain.current === run) {
        chain.current = null
        setPlayingAll(null)
      }
    },
    [playingAll, stopAll, stopOther]
  )

  return (
    <>
      <h2 className="mb-1 text-lg font-bold text-white drop-shadow">{section.title}</h2>
      {section.instruction && (
        <p className="mb-3 text-sm text-white/90">
          <Seg text={section.instruction} light />
        </p>
      )}
      {section.image && (
        <Card className="p-2">
          <img src={section.image} alt={section.imageCaption ?? section.title} className="w-full rounded-xl" />
          {section.imageCaption && (
            <p className="mt-2 px-1 text-sm leading-6 text-gray-700">
              <Seg text={section.imageCaption} />
            </p>
          )}
          {section.parts && section.parts.length > 0 && <PartsStrip parts={section.parts} />}
        </Card>
      )}
      {section.audio && (
        <Card>
          <div className="mb-1 text-lg font-bold text-gray-900">🎧 老师朗读</div>
          {section.audioCaption && (
            <p className="mb-2 text-sm leading-6 text-gray-600">
              <Seg text={section.audioCaption} />
            </p>
          )}
          <audio
            controls
            preload="metadata"
            src={section.audio}
            className="w-full"
            onPlay={() => {
              stopAll()
              stopOther()
            }}
          />
        </Card>
      )}
      {items.map((it) => (
        <Card key={it.title} className="scroll-mt-4" id={`oral-${it.title}`}>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">《{it.title}》</h3>
            <button
              type="button"
              onClick={() => playAll(it)}
              className="min-h-11 rounded-full bg-indigo-600 px-3 py-1.5 text-sm font-bold text-white active:bg-indigo-700"
            >
              {playingAll === it.title ? '⏹ 停止' : '▶ 读全篇'}
            </button>
          </div>
          {it.image && (
            <figure className="mb-3">
              <img
                src={it.image}
                alt={it.imageCaption ?? it.title}
                className="mx-auto max-h-72 w-auto max-w-full rounded-xl border border-gray-200"
              />
              {it.imageCaption && (
                <figcaption className="mt-1 text-center text-xs text-gray-500">
                  <Seg text={it.imageCaption} />
                </figcaption>
              )}
            </figure>
          )}
          {it.sentences.map((s, i) => (
            <div key={i} className="mb-2 flex items-start gap-2">
              <SpeakButton text={s.zh} speak={speakOne} small />
              <div className="flex-1">
                <p className="text-[17px] leading-8 text-gray-900">
                  <Seg text={s.zh} bold={['我认为', '因为']} />
                </p>
                <p className="text-xs text-gray-500">{s.en}</p>
              </div>
            </div>
          ))}
          {it.vocab.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {it.vocab.map((v) => (
                <button
                  key={v.w}
                  type="button"
                  onClick={() => {
                    stopAll()
                    open(v.w, { py: v.py, en: v.en })
                  }}
                  className="rounded-lg bg-amber-50 px-2 py-1 text-left text-sm active:bg-amber-100"
                >
                  <span className="font-bold text-gray-900">{v.w}</span>
                  <span className="ml-1 text-xs text-indigo-600">{v.py}</span>
                  <span className="ml-1 text-xs text-gray-500">{v.en}</span>
                </button>
              ))}
            </div>
          )}
        </Card>
      ))}
    </>
  )
}

/** Numbered thumbnails of the picture's parts; this week's parts jump to their passage. */
function PartsStrip({ parts }: { parts: NonNullable<Section['parts']> }) {
  return (
    <div className="mt-3 grid grid-cols-3 gap-2 md:grid-cols-5">
      {parts.map((p) => (
        <button
          key={p.n}
          type="button"
          onClick={() =>
            p.item &&
            document.getElementById(`oral-${p.item}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
          className={cn(
            'overflow-hidden rounded-xl border-2 bg-white text-left',
            p.current ? 'border-indigo-500 shadow-md' : 'border-gray-200 opacity-75',
            p.item && 'active:bg-indigo-50'
          )}
        >
          <div className="relative aspect-[4/3] bg-gray-50">
            <img src={p.image} alt={`第${p.n}部分：${p.label}`} className="h-full w-full object-cover" />
            <span className="absolute left-1 top-1 rounded-full bg-white/90 px-1.5 text-xs font-bold text-gray-800 shadow">
              {p.n}
            </span>
            {p.current && (
              <span className="absolute right-1 top-1 rounded-full bg-indigo-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                本周
              </span>
            )}
          </div>
          <div className="px-1.5 py-1 text-xs leading-4 text-gray-700">{p.label}</div>
        </button>
      ))}
    </div>
  )
}
