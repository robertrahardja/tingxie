// Pieces of a 词语 card shared by the browse list and the self-test.
import { SpeakButton } from '@/components/shared/ui'
import { wordKey } from '@/lib/final/types'
import type { VocabData, VocabLesson, VocabWord } from '@/lib/final/types'

/** A word with its lesson, as listed on the 词语 tab. */
export interface Entry {
  lesson: VocabLesson
  w: VocabWord
  key: string
}

export function WordFace({ w, hideReading }: { w: VocabWord; hideReading?: boolean }) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-3">
        <span className="text-3xl font-bold text-gray-900">{w.word}</span>
        {w.star && <span className="text-amber-500">★</span>}
        {!hideReading && <span className="text-lg text-indigo-700">{w.pinyin}</span>}
      </div>
      {!hideReading && <div className="mt-0.5 text-[15px] text-gray-600">{w.english}</div>}
    </div>
  )
}


export function Details({ w, speak }: { w: VocabWord; speak: (t: string) => void }) {
  if (!w.extras?.length && !w.example) return null
  return (
    <div className="mt-2 space-y-1 text-[15px] leading-7 text-gray-800">
      {w.extras?.map((x, i) => (
        <div key={i}>
          <span className="mr-1 rounded bg-amber-50 px-1.5 text-sm text-amber-800">{x.label}</span>
          {x.text}
        </div>
      ))}
      {w.example && (
        <div className="flex items-start gap-2">
          <span className="mt-1 shrink-0 rounded bg-indigo-50 px-1.5 text-sm text-indigo-700">例句</span>
          <span className="flex-1">{w.example}</span>
          <SpeakButton text={w.example} speak={speak} small />
        </div>
      )}
    </div>
  )
}


export type Filter = 'all' | 'unknown' | number

/** The words the current chips select: one lesson / all / only 不会, optionally only ★. */
export function buildEntries(
  data: VocabData,
  filter: Filter,
  starOnly: boolean,
  unknown: Set<string>
): Entry[] {
  const lessons = data.lessons.filter((l) => typeof filter !== 'number' || l.lesson === filter)
  return lessons.flatMap((lesson) =>
    lesson.words
      .map((w) => ({ lesson, w, key: wordKey(lesson.lesson, w) }))
      .filter((e) => (filter !== 'unknown' || unknown.has(e.key)) && (!starOnly || e.w.star))
  )
}
