import { useState, useRef } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/p3hcl-reading-sync')({
  component: P3HCLReadingSyncPage,
})

interface Section {
  id: number
  title: string
  sequenceWords: string
  content: string
  pinyin?: { [key: string]: string }
}

const sections: Section[] = [
  {
    id: 1,
    title: '一、第一天、第二天、又过了一天、再过了一天、后来',
    sequenceWords: '第一天、第二天、又过了一天、再过了一天、后来',
    content: '**第一天**，我把绿豆放在湿的棉花上。**第二天**，绿豆变大了，它的外壳裂开了，开始发芽了，还长出了细细的根。**又过了一天**，绿豆的外壳脱落了，细芽长得更长了。**再过了一天**，绿豆的茎越来越长，叶子也越来越大。**后来**，幼苗一天天长大，变成了豆芽菜。',
    pinyin: {
      '湿': 'shī',
      '棉': 'mián',
      '外壳裂': 'wài ké liè',
      '发芽': 'fā yá',
      '长(grow)': 'zhǎng',
      '根': 'gēn',
      '外壳脱落': 'wài ké tuō luò',
      '更长(longer)': 'gèng cháng',
      '茎越': 'jīng yuè',
    },
  },
  {
    id: 2,
    title: '二、过了几天、又过了几天、再过了几天、后来',
    sequenceWords: '过了几天、又过了几天、再过了几天、后来',
    content: '池塘里有几只小蝌蚪。**过了几天**，小蝌蚪长出两条后腿。**又过了几天**，小蝌蚪长出了两条前腿。**再过了几天**，小蝌蚪的尾巴变短了。**后来**，小青蛙的尾巴不见了。',
    pinyin: {
      '池塘': 'chí táng',
      '蝌蚪': 'kē dǒu',
      '长出': 'zhǎng chū',
      '腿': 'tuǐ',
    },
  },
  {
    id: 3,
    title: '三、先、接着、然后、再、最后',
    sequenceWords: '先、接着、然后、再、最后',
    content: '当我放学回到家，我**先**放下书包去冲凉，**接着**拿出碗筷开始吃饭，**然后**拿出作业开始复习，**再**看一会儿电视，**最后**洗漱完毕就上床睡觉了。',
    pinyin: {
      '冲凉': 'chōng liáng',
      '碗筷': 'wǎn kuài',
      '复习': 'fù xí',
      '电视': 'diàn shì',
      '洗漱完毕': 'xǐ shù wán bì',
    },
  },
  {
    id: 4,
    title: '四、过了一个月、又过了几个月、后来',
    sequenceWords: '过了一个月、又过了几个月、后来',
    content: '我把树苗种在泥土里。**过了一个月**，树苗很快就长高了。**又过了几个月**，小树长得更高大了，树上长出很多树枝，还长满了绿色的叶子。**后来**，窗外的小树变成了一棵笔直的大树。',
    pinyin: {
      '树苗': 'shù miáo',
      '泥土': 'ní tǔ',
      '长高': 'zhǎng gāo',
    },
  },
]

function P3HCLReadingSyncPage() {
  const [currentSection, setCurrentSection] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleAudioEnded = () => {
    setIsPlaying(false)
  }

  const renderContent = (content: string) => {
    // Split by ** markers for bold/highlighted text
    const parts = content.split(/\*\*([^*]+)\*\*/)
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // This is a highlighted sequence word
        return (
          <span key={index} className="sequence-word">
            {part}
          </span>
        )
      }
      return <span key={index}>{part}</span>
    })
  }

  const section = sections[currentSection]

  return (
    <div className="reading-sync-page">
      <div className="lesson-header lesson-header-blue">
        <h1>《事物的变化》</h1>
        <div className="lesson-subtitle">Changes in Things - Reading Practice</div>
      </div>

      <div className="content-container">
        {/* Audio Player */}
        <div className="audio-player-card">
          <audio
            ref={audioRef}
            src="/audio/p3hcl_reading_5.mp4"
            onEnded={handleAudioEnded}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
          />
          <button
            className={cn('audio-play-btn-large', isPlaying && 'playing')}
            onClick={handlePlayPause}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          <p className="audio-hint">点击播放老师朗读</p>
        </div>

        {/* Section Selector */}
        <div className="section-selector">
          {sections.map((s, index) => (
            <button
              key={s.id}
              className={cn('section-btn', currentSection === index && 'active')}
              onClick={() => setCurrentSection(index)}
            >
              {s.id}
            </button>
          ))}
        </div>

        {/* Current Section */}
        <div className="reading-card">
          <h2 className="section-title-reading">{section.title}</h2>

          <div className="sequence-words-box">
            <span className="sequence-label">顺序词：</span>
            {section.sequenceWords}
          </div>

          <div className="reading-content">
            {renderContent(section.content)}
          </div>

          {section.pinyin && Object.keys(section.pinyin).length > 0 && (
            <div className="pinyin-hints">
              <span className="pinyin-label">拼音提示：</span>
              {Object.entries(section.pinyin).map(([char, py], index) => (
                <span key={index} className="pinyin-item">
                  {char}({py})
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="reading-nav">
          <button
            className="reading-nav-btn"
            onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
            disabled={currentSection === 0}
          >
            上一段
          </button>
          <span className="reading-progress">
            {currentSection + 1} / {sections.length}
          </span>
          <button
            className="reading-nav-btn"
            onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
            disabled={currentSection === sections.length - 1}
          >
            下一段
          </button>
        </div>

        {/* Tips */}
        <div className="reading-tips">
          <h3>学习提示</h3>
          <ul>
            <li>先听老师朗读整篇课文</li>
            <li>注意<span className="sequence-word-inline">顺序词</span>的使用</li>
            <li>跟着老师一起朗读练习</li>
            <li>尝试用顺序词造自己的句子</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
