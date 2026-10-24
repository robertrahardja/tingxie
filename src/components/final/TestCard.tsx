// The card face for one word in 自测 / 听写: picture, then either the 听写
// prompt (🔊 only, until 看答案) or the word with its details.
import { Card, SpeakButton } from '@/components/shared/ui'
import { wordPicId } from '@/lib/final/types'
import { Pic } from './Pic'
import { Details, WordFace } from './WordParts'
import type { Entry } from './WordParts'

export function TestCard({
  e,
  shown,
  dictation,
  speak,
}: {
  e: Entry
  shown: boolean
  dictation: boolean
  speak: (t: string) => void
}) {
  return (
    <Card className="min-h-56">
      <Pic id={wordPicId(e.lesson, e.w)} className="mb-3 h-44 w-full" />
      {dictation && !shown ? (
        <div className="flex flex-col items-center gap-3 py-6">
          <button
            type="button"
            onClick={() => speak(e.w.word)}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-4xl active:bg-indigo-200"
            aria-label="播放"
            ref={(el) => {
              // auto-play each new word once
              if (el && el.dataset.k !== e.key) {
                el.dataset.k = e.key
                speak(e.w.word)
              }
            }}
          >
            🔊
          </button>
          {e.w.example && (
            <button
              type="button"
              onClick={() => speak(e.w.example!)}
              className="min-h-11 rounded-full bg-gray-100 px-4 text-sm text-gray-700"
            >
              听例句
            </button>
          )}
          <div className="text-sm text-gray-500">在纸上写出来，再看答案</div>
        </div>
      ) : (
        <div>
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <WordFace w={e.w} hideReading={!shown} />
            </div>
            <SpeakButton text={e.w.word} speak={speak} />
          </div>
          {shown && <Details w={e.w} speak={speak} />}
        </div>
      )}
    </Card>
  )
}
