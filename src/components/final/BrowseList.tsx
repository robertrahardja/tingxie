// 📖 看 mode of the 词语 tab: every selected word with its 搭配 / 例句, a
// 🔊 button and a 不会 mark.
import { cn } from '@/lib/utils'
import { Card, SpeakButton } from '@/components/shared/ui'
import { wordPicId } from '@/lib/final/types'
import type { VocabLesson } from '@/lib/final/types'
import { Pic } from './Pic'
import { Details, WordFace } from './WordParts'
import type { Entry } from './WordParts'

function LessonHeading({ lesson }: { lesson: VocabLesson }) {
  return (
    <h2 className="mb-2 mt-4 text-lg font-bold text-white first:mt-0">
      第{lesson.lesson}课{lesson.title ? `《${lesson.title}》` : ''}
    </h2>
  )
}

export function BrowseList({
  entries,
  unknown,
  toggleUnknown,
  speak,
}: {
  entries: Entry[]
  unknown: Set<string>
  toggleUnknown: (k: string, on?: boolean) => void
  speak: (t: string) => void
}) {
  return (
    <div>
      {entries.map((e, i) => (
        <div key={e.key + i}>
          {(i === 0 || entries[i - 1].lesson !== e.lesson) && <LessonHeading lesson={e.lesson} />}
          <Card className={cn(e.w.sub && 'ml-4')}>
            <div className="flex items-start gap-3">
              <Pic id={wordPicId(e.lesson, e.w)} small className="h-16 w-20 shrink-0" />
              <div className="min-w-0 flex-1">
                <WordFace w={e.w} />
              </div>
              <div className="flex flex-col items-center gap-2">
                <SpeakButton text={e.w.word} speak={speak} />
                <button
                  type="button"
                  onClick={() => toggleUnknown(e.key)}
                  className={cn(
                    'min-h-11 rounded-full px-2 text-xs font-semibold',
                    unknown.has(e.key) ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-500'
                  )}
                >
                  {unknown.has(e.key) ? '不会' : '标记'}
                </button>
              </div>
            </div>
            <Details w={e.w} speak={speak} />
          </Card>
        </div>
      ))}
    </div>
  )
}
