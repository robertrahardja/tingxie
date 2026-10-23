// 复习计划 tab: the one-day revision schedule as a tickable checklist.
import { cn } from '@/lib/utils'
import { Card } from '@/components/shared/ui'
import type { Tab } from './FinalPage'

interface Step {
  id: string
  time: string
  title: string
  detail: string
  tab?: Tab
}

const STEPS: Step[] = [
  {
    id: 'w1',
    time: '9:00 – 10:15',
    title: '词语自测：第 1–9 课',
    detail: '“词语”→ 选一课 →“自测”。不会的会自动记下来。每课做完休息一下。',
    tab: 'words',
  },
  {
    id: 'w2',
    time: '10:30 – 11:45',
    title: '词语自测：第 10–17 课',
    detail: '第 13–17 课是最新的，要特别认真。★ 的词语要会写。',
    tab: 'words',
  },
  {
    id: 's',
    time: '13:00 – 13:45',
    title: '句子变变变',
    detail: '每个句型先自己说一遍、写一遍，再看答案。',
    tab: 'sentences',
  },
  {
    id: 'p3',
    time: '14:00 – 15:20',
    title: '模拟考：语文理解与应用（60 分钟）',
    detail:
      '打印 2025 Nanyang 高级华文 Paper 2（PDF 第 3–14 页），计时 60 分钟做完。用第 15–16 页的答案改，错的题目要弄明白为什么。',
  },
  {
    id: 'q',
    time: '15:30 – 16:15',
    title: '学校练习：补充练习 + 总复习',
    detail: '在“练习”里点答案，看解释。错的再做一次。',
    tab: 'quiz',
  },
  {
    id: 'c',
    time: '16:30 – 17:20',
    title: '看图作文（40 分钟）',
    detail:
      '用 2025 Nanyang Paper 1（PDF 第 2 页）的四幅图写一篇，不少于 50 个字。先想好：时间、地点、人物、事情的经过、结果、感想。用上参考词语和学过的好词。',
  },
  {
    id: 'r',
    time: '19:30 – 20:00',
    title: '最后复习“不会”的词语',
    detail: '“词语”→“不会”→“听写”。写对的会自动拿掉。然后早点睡觉！',
    tab: 'words',
  },
]

export function PlanTab({
  done,
  toggle,
  go,
}: {
  done: Set<string>
  toggle: (k: string) => void
  go: (t: Tab) => void
}) {
  return (
    <div>
      <Card className="text-[15px] leading-7 text-gray-800">
        <div className="mb-1 font-bold text-gray-900">考试有三份试卷</div>
        <div>试卷一：看图作文（15 分，约 40–50 分钟）</div>
        <div>试卷二：语文理解与应用（45 分，约 60–80 分钟）——辨字、词语选择、短文填空、词语搭配、句子变变变、组句成段、阅读理解</div>
        <div>听力（10 分）</div>
      </Card>
      {STEPS.map((s) => (
        <Card key={s.id} className={cn(done.has(s.id) && 'opacity-60')}>
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => toggle(s.id)}
              aria-label="完成"
              className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 text-xl',
                done.has(s.id) ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-gray-300 text-transparent'
              )}
            >
              ✓
            </button>
            <div className="min-w-0 flex-1">
              <div className="text-sm text-indigo-700">{s.time}</div>
              <div className={cn('text-lg font-bold text-gray-900', done.has(s.id) && 'line-through')}>
                {s.title}
              </div>
              <div className="mt-1 text-[15px] leading-6 text-gray-700">{s.detail}</div>
              {s.tab && (
                <button
                  type="button"
                  onClick={() => go(s.tab!)}
                  className="mt-2 min-h-11 rounded-full bg-indigo-600 px-4 text-sm font-semibold text-white"
                >
                  开始 →
                </button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
