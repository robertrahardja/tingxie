// 儿歌 tab: 七、阅读加油站《欢乐伙伴》— the verses, the three word patterns
// to collect, and the comprehension question.
import { useState } from 'react'
import { Card, SpeakButton } from '@/components/shared/ui'
import { Seg } from '@/components/shared/words'
import { SectionHead } from './ExerciseTab'
import type { Section } from '@/lib/keben/types'

type Speak = (t: string) => void

export function SongTab({
  section,
  speak,
  speakEnabled,
}: {
  section: Section
  speak: Speak
  speakEnabled: boolean
}) {
  const [showPatterns, setShowPatterns] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  return (
    <section className="mb-8">
      <SectionHead section={section} />

      <Card>
        <h3 className="mb-3 text-center text-lg font-bold text-gray-900">欢乐伙伴</h3>
        {(section.verses ?? []).map((verse, vi) => (
          <div key={vi} className="mb-4">
            {verse.map((line, li) => (
              <div key={li} className="flex items-start gap-2">
                <p className="flex-1 text-[16px] leading-8 text-gray-800">
                  <Seg text={line} />
                </p>
                {speakEnabled && <SpeakButton text={line} speak={speak} small />}
              </div>
            ))}
          </div>
        ))}
      </Card>

      <Card>
        <p className="mb-1 text-[16px] font-bold text-gray-900">
          1. 从儿歌中找一找和下面形式相同的词语，把它们写下来。
        </p>
        <button
          type="button"
          className="mt-2 min-h-11 w-full rounded-xl border-2 border-indigo-600 py-2 text-sm font-bold text-indigo-700 active:bg-indigo-50"
          onClick={() => setShowPatterns(!showPatterns)}
        >
          {showPatterns ? '隐藏答案' : '看答案'}
        </button>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {(section.patterns ?? []).map((p, i) => (
            <div key={i} className="rounded-xl bg-gray-50 p-3">
              <div className="mb-2 rounded-lg bg-pink-100 px-2 py-1 text-center text-sm font-bold text-pink-800">
                {p.label}
              </div>
              <p className="mb-1 text-[15px] text-gray-400">{p.given}（课本已给）</p>
              {showPatterns ? (
                <>
                  {p.answers.map((a, j) => (
                    <p key={j} className="text-[16px] leading-7 text-green-800">
                      <Seg text={a} />
                    </p>
                  ))}
                  {p.note && <p className="mt-2 text-xs leading-5 text-gray-500">{p.note}</p>}
                </>
              ) : (
                <div className="space-y-2 pt-1">
                  {[0, 1, 2, 3].map((j) => (
                    <div key={j} className="h-0 border-b border-dashed border-gray-300" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {section.question && (
        <Card>
          <p className="text-[16px] leading-7 text-gray-900">
            2. <Seg text={section.question.q} />
          </p>
          <button
            type="button"
            className="mt-3 min-h-11 w-full rounded-xl border-2 border-indigo-600 py-2 text-sm font-bold text-indigo-700 active:bg-indigo-50"
            onClick={() => setShowAnswer(!showAnswer)}
          >
            {showAnswer ? '隐藏答案' : '看答案'}
          </button>
          {showAnswer && (
            <div className="mt-3">
              <div className="flex items-start gap-2">
                <p className="flex-1 text-[16px] font-bold leading-8 text-green-800">
                  <Seg text={section.question.answer} />
                </p>
                {speakEnabled && <SpeakButton text={section.question.answer} speak={speak} />}
              </div>
              <p className="mt-2 text-xs leading-5 text-gray-500">{section.question.en}</p>
            </div>
          )}
        </Card>
      )}
    </section>
  )
}
