import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef, useCallback } from 'react'

export const Route = createFileRoute('/koushi-family-cohesion')({
  component: KoushiFamilyCohesionPage,
})

// Vocabulary data
const vocabulary = [
  { chinese: '记得', pinyin: 'jì de', english: 'remember' },
  { chinese: '地点', pinyin: 'dì diǎn', english: 'location' },
  { chinese: '海边', pinyin: 'hǎi biān', english: 'seaside' },
  { chinese: '起因', pinyin: 'qǐ yīn', english: 'reason/cause' },
  { chinese: '度假', pinyin: 'dù jià', english: 'vacation' },
  { chinese: '人物', pinyin: 'rén wù', english: 'people/characters' },
  { chinese: '立刻', pinyin: 'lì kè', english: 'immediately' },
  { chinese: '拍手', pinyin: 'pāi shǒu', english: 'clap hands' },
  { chinese: '欢呼', pinyin: 'huān hū', english: 'cheer' },
  { chinese: '准备', pinyin: 'zhǔn bèi', english: 'prepare' },
  { chinese: '就绪', pinyin: 'jiù xù', english: 'ready' },
  { chinese: '兴致勃勃', pinyin: 'xìng zhì bó bó', english: 'enthusiastic' },
  { chinese: '经过', pinyin: 'jīng guò', english: 'experience/process' },
  { chinese: '赶紧', pinyin: 'gǎn jǐn', english: 'hurry' },
  { chinese: '换上', pinyin: 'huàn shang', english: 'change into' },
  { chinese: '呼着', pinyin: 'hū zhe', english: 'singing/humming' },
  { chinese: '欢快', pinyin: 'huān kuài', english: 'cheerful' },
  { chinese: '歌儿', pinyin: 'gē r', english: 'song' },
]

// Story sentences with audio timing
const storySentences = [
  {
    start: 9.15,
    end: 17.59,
    chinese: [
      { word: '在', pinyin: 'zài', meaning: 'at/in' },
      { word: '图片', pinyin: 'tú piàn', meaning: 'picture' },
      { word: '中', pinyin: 'zhōng', meaning: 'middle/in' },
      { text: '，' },
      { word: '我', pinyin: 'wǒ', meaning: 'I' },
      { word: '看到', pinyin: 'kàn dào', meaning: 'see' },
      { word: '一个', pinyin: 'yī gè', meaning: 'one' },
      { word: '阳光普照', pinyin: 'yáng guāng pǔ zhào', meaning: 'sunny' },
      { word: '的', pinyin: 'de', meaning: '(particle)' },
      { word: '上午', pinyin: 'shàng wǔ', meaning: 'morning' },
      { text: '，' },
      { word: '爸爸', pinyin: 'bà ba', meaning: 'dad' },
      { word: '驾车', pinyin: 'jià chē', meaning: 'drive' },
      { word: '带着', pinyin: 'dài zhe', meaning: 'bringing' },
      { word: '全家人', pinyin: 'quán jiā rén', meaning: 'whole family' },
      { word: '去', pinyin: 'qù', meaning: 'go' },
      { word: '海边', pinyin: 'hǎi biān', meaning: 'seaside' },
      { word: '野餐', pinyin: 'yě cān', meaning: 'picnic' },
      { text: '。' },
    ],
    english:
      'In the picture, I see a sunny morning where Dad drives the whole family to the beach for a picnic.',
  },
  {
    start: 18.63,
    end: 27.59,
    chinese: [
      { word: '海边', pinyin: 'hǎi biān', meaning: 'seaside' },
      { word: '有', pinyin: 'yǒu', meaning: 'have/there is' },
      { word: '很多', pinyin: 'hěn duō', meaning: 'many' },
      { word: '人', pinyin: 'rén', meaning: 'people' },
      { text: '，' },
      { word: '有的', pinyin: 'yǒu de', meaning: 'some' },
      { word: '在', pinyin: 'zài', meaning: 'at' },
      { word: '游泳', pinyin: 'yóu yǒng', meaning: 'swim' },
      { text: '，' },
      { word: '有的', pinyin: 'yǒu de', meaning: 'some' },
      { word: '在', pinyin: 'zài', meaning: 'at' },
      { word: '晒太阳', pinyin: 'shài tài yáng', meaning: 'sunbathe' },
      { text: '，' },
      { word: '有的', pinyin: 'yǒu de', meaning: 'some' },
      { word: '在', pinyin: 'zài', meaning: 'at' },
      { word: '玩游戏', pinyin: 'wán yóu xì', meaning: 'play games' },
      { text: '，' },
      { word: '十分', pinyin: 'shí fēn', meaning: 'very' },
      { word: '热闹', pinyin: 'rè nao', meaning: 'lively' },
      { text: '。' },
    ],
    english:
      "There are many people at the beach - some swimming, some sunbathing, some playing games - it's very lively.",
  },
  {
    start: 28.25,
    end: 38.85,
    chinese: [
      { word: '爸爸妈妈', pinyin: 'bà ba mā ma', meaning: 'parents' },
      { word: '先', pinyin: 'xiān', meaning: 'first' },
      { word: '铺好', pinyin: 'pū hǎo', meaning: 'lay out' },
      { word: '席子', pinyin: 'xí zi', meaning: 'mat' },
      { text: '，' },
      { word: '再', pinyin: 'zài', meaning: 'then' },
      { word: '摆上', pinyin: 'bǎi shang', meaning: 'arrange' },
      { word: '食物', pinyin: 'shí wù', meaning: 'food' },
      { text: '，' },
      { word: '最后', pinyin: 'zuì hòu', meaning: 'finally' },
      { word: '他们', pinyin: 'tā men', meaning: 'they' },
      { word: '便', pinyin: 'biàn', meaning: 'then' },
      { word: '坐在', pinyin: 'zuò zài', meaning: 'sit on' },
      { word: '席子上', pinyin: 'xí zi shàng', meaning: 'on the mat' },
      { word: '一边', pinyin: 'yī biān', meaning: 'while' },
      { word: '拍照', pinyin: 'pāi zhào', meaning: 'take photos' },
      { word: '一边', pinyin: 'yī biān', meaning: 'while' },
      { word: '谈天', pinyin: 'tán tiān', meaning: 'chat' },
      { text: '。' },
    ],
    english:
      'Mom and Dad first lay out the mat, then arrange the food, and finally they sit on the mat chatting while taking photos.',
  },
  {
    start: 39.37,
    end: 47.69,
    chinese: [
      { word: '哥哥', pinyin: 'gē ge', meaning: 'older brother' },
      { word: '和', pinyin: 'hé', meaning: 'and' },
      { word: '妹妹', pinyin: 'mèi mei', meaning: 'younger sister' },
      { word: '则', pinyin: 'zé', meaning: 'then/while' },
      { word: '跑到', pinyin: 'pǎo dào', meaning: 'run to' },
      { word: '沙滩上', pinyin: 'shā tān shàng', meaning: 'on the beach' },
      { word: '玩', pinyin: 'wán', meaning: 'play' },
      { word: '扔飞盘', pinyin: 'rēng fēi pán', meaning: 'frisbee' },
      { word: '的', pinyin: 'de', meaning: '(particle)' },
      { word: '游戏', pinyin: 'yóu xì', meaning: 'game' },
      { text: '，' },
      { word: '玩得', pinyin: 'wán de', meaning: 'having fun' },
      { word: '很开心', pinyin: 'hěn kāi xīn', meaning: 'very happy' },
      { text: '。' },
    ],
    english:
      'The older brother and younger sister run to the beach to play frisbee, having a lot of fun.',
  },
  {
    start: 48.58,
    end: 57.99,
    chinese: [
      { word: '到了', pinyin: 'dào le', meaning: 'arrived/reached' },
      { word: '下午', pinyin: 'xià wǔ', meaning: 'afternoon' },
      { text: '，' },
      { word: '天气', pinyin: 'tiān qì', meaning: 'weather' },
      { word: '变得', pinyin: 'biàn de', meaning: 'become' },
      { word: '十分', pinyin: 'shí fēn', meaning: 'very' },
      { word: '炎热', pinyin: 'yán rè', meaning: 'hot' },
      { text: '，' },
      { word: '大家', pinyin: 'dà jiā', meaning: 'everyone' },
      { word: '便', pinyin: 'biàn', meaning: 'then' },
      { word: '一起', pinyin: 'yī qǐ', meaning: 'together' },
      { word: '收拾东西', pinyin: 'shōu shi dōng xi', meaning: 'pack up' },
      { text: '，' },
      { word: '依依不舍', pinyin: 'yī yī bù shě', meaning: 'reluctantly' },
      { word: '地', pinyin: 'de', meaning: '(adverb marker)' },
      { word: '回家了', pinyin: 'huí jiā le', meaning: 'went home' },
      { text: '。' },
    ],
    english:
      'In the afternoon, the weather became very hot, so everyone packed up and reluctantly went home.',
  },
]

// Word component for clickable words
interface WordProps {
  word: string
  pinyin: string
  meaning: string
  onClick: (word: string, pinyin: string, meaning: string) => void
}

function Word({ word, pinyin, meaning, onClick }: WordProps) {
  return (
    <span
      className="koushi-word"
      onClick={() => onClick(word, pinyin, meaning)}
    >
      {word}
    </span>
  )
}

// Type for sentence items
type WordItem = { word: string; pinyin: string; meaning: string }
type TextItem = { text: string }
type SentenceItem = WordItem | TextItem

function isWordItem(item: SentenceItem): item is WordItem {
  return 'word' in item
}

// Sentence component
interface SentenceProps {
  sentence: (typeof storySentences)[0]
  isHighlighted: boolean
  onWordClick: (word: string, pinyin: string, meaning: string) => void
}

function Sentence({ sentence, isHighlighted, onWordClick }: SentenceProps) {
  return (
    <div className={`koushi-sentence ${isHighlighted ? 'highlighted' : ''}`}>
      <span className="chinese">
        {sentence.chinese.map((item, index) =>
          isWordItem(item) ? (
            <Word
              key={index}
              word={item.word}
              pinyin={item.pinyin}
              meaning={item.meaning}
              onClick={onWordClick}
            />
          ) : (
            <span key={index}>{item.text}</span>
          )
        )}
      </span>
      <span className="english-translation">{sentence.english}</span>
    </div>
  )
}

// Vocabulary card component
interface VocabCardProps {
  word: (typeof vocabulary)[0]
  isLearned: boolean
  onClick: () => void
}

function VocabCard({ word, isLearned, onClick }: VocabCardProps) {
  return (
    <div
      className={`koushi-vocab-card ${isLearned ? 'learned' : ''}`}
      onClick={onClick}
    >
      <div className="vocab-chinese">{word.chinese}</div>
      <div className="vocab-pinyin">{word.pinyin}</div>
    </div>
  )
}

// Word popup component
interface WordPopupProps {
  word: string
  pinyin: string
  meaning: string
  onClose: () => void
  onPlayAudio: () => void
}

function WordPopup({
  word,
  pinyin,
  meaning,
  onClose,
  onPlayAudio,
}: WordPopupProps) {
  return (
    <>
      <div className="popup-overlay show" onClick={onClose} />
      <div className="koushi-word-popup show">
        <div className="popup-word">{word}</div>
        <div className="popup-pinyin">{pinyin}</div>
        <div className="popup-meaning">{meaning}</div>
        <button className="popup-audio-btn" onClick={onPlayAudio}>
          听发音
        </button>
        <br />
        <button className="popup-close" onClick={onClose}>
          关闭
        </button>
      </div>
    </>
  )
}

// Practice modal component
interface PracticeModalProps {
  word: (typeof vocabulary)[0] | null
  isLearned: boolean
  onClose: () => void
  onPlayAudio: () => void
  onToggleLearned: () => void
}

function PracticeModal({
  word,
  isLearned,
  onClose,
  onPlayAudio,
  onToggleLearned,
}: PracticeModalProps) {
  if (!word) return null

  return (
    <div className="practice-modal show">
      <div className="practice-content">
        <button className="close-modal" onClick={onClose}>
          X
        </button>
        <div className="practice-word">{word.chinese}</div>
        <div className="practice-pinyin">{word.pinyin}</div>
        <div className="practice-actions">
          <button className="practice-btn primary" onClick={onPlayAudio}>
            发音
          </button>
          <button
            className="practice-btn primary"
            style={isLearned ? { background: '#ff6b6b' } : {}}
            onClick={onToggleLearned}
          >
            {isLearned ? 'X 标记未学会' : '✓ 标记已学会'}
          </button>
          <button className="practice-btn secondary" onClick={onClose}>
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}

const STORAGE_KEY = 'koushi_family_cohesion_learned'

function KoushiFamilyCohesionPage() {
  const [learnedWords, setLearnedWords] = useState<Set<string>>(new Set())
  const [currentPopup, setCurrentPopup] = useState<{
    word: string
    pinyin: string
    meaning: string
  } | null>(null)
  const [currentPracticeWord, setCurrentPracticeWord] = useState<
    (typeof vocabulary)[0] | null
  >(null)
  const [highlightedSentenceIndex, setHighlightedSentenceIndex] = useState<
    number | null
  >(null)

  const audioRef = useRef<HTMLAudioElement>(null)

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      setLearnedWords(new Set(JSON.parse(saved)))
    }
  }, [])

  // Save progress to localStorage
  const saveProgress = useCallback((words: Set<string>) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(words)))
  }, [])

  // Handle audio time update for sentence highlighting
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      const currentTime = audio.currentTime

      let foundIndex: number | null = null
      for (let i = 0; i < storySentences.length; i++) {
        const sentence = storySentences[i]
        if (currentTime >= sentence.start && currentTime < sentence.end) {
          foundIndex = i
          break
        }
      }
      setHighlightedSentenceIndex(foundIndex)
    }

    const handleEnded = () => {
      setHighlightedSentenceIndex(null)
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  // Play story audio
  const playStoryAudio = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.play()
    }
  }, [])

  // Reset progress
  const resetProgress = useCallback(() => {
    if (window.confirm('确定要重置学习进度吗？')) {
      setLearnedWords(new Set())
      saveProgress(new Set())
    }
  }, [saveProgress])

  // Handle word click in story
  const handleWordClick = useCallback(
    (word: string, pinyin: string, meaning: string) => {
      // Pause main audio if playing
      const audio = audioRef.current
      if (audio && !audio.paused) {
        audio.pause()
      }

      setCurrentPopup({ word, pinyin, meaning })
    },
    []
  )

  // Close word popup
  const closeWordPopup = useCallback(() => {
    setCurrentPopup(null)
  }, [])

  // Play popup word audio using TTS
  const playPopupAudio = useCallback(() => {
    if (currentPopup) {
      const utterance = new SpeechSynthesisUtterance(currentPopup.word)
      utterance.lang = 'zh-CN'
      utterance.rate = 0.7
      speechSynthesis.speak(utterance)
    }
  }, [currentPopup])

  // Open practice modal
  const openPractice = useCallback((word: (typeof vocabulary)[0]) => {
    setCurrentPracticeWord(word)
  }, [])

  // Close practice modal
  const closePractice = useCallback(() => {
    setCurrentPracticeWord(null)
  }, [])

  // Play word audio in practice modal
  const playWordAudio = useCallback(() => {
    if (currentPracticeWord) {
      const utterance = new SpeechSynthesisUtterance(currentPracticeWord.chinese)
      utterance.lang = 'zh-CN'
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }, [currentPracticeWord])

  // Toggle learned status
  const toggleLearned = useCallback(() => {
    if (currentPracticeWord) {
      setLearnedWords((prev) => {
        const newSet = new Set(prev)
        if (newSet.has(currentPracticeWord.chinese)) {
          newSet.delete(currentPracticeWord.chinese)
        } else {
          newSet.add(currentPracticeWord.chinese)
        }
        saveProgress(newSet)
        return newSet
      })
    }
  }, [currentPracticeWord, saveProgress])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePractice()
        closeWordPopup()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [closePractice, closeWordPopup])

  return (
    <div className="koushi-page">
      <div className="lesson-header lesson-header-orange">
        <h1>口试练习：《家庭凝聚力》</h1>
        <div className="lesson-subtitle">
          P3HCL 综合练习4 阅读计划 - Family Cohesion
        </div>
      </div>

      <div className="content-container">
        {/* Controls Bar */}
        <div className="controls-bar">
          <button className="control-btn" onClick={playStoryAudio}>
            播放故事音频
          </button>
          <div className="progress-info">
            <span>已学习词语: </span>
            <span>{learnedWords.size}</span> / <span>{vocabulary.length}</span>
          </div>
          <button className="control-btn secondary" onClick={resetProgress}>
            重置进度
          </button>
        </div>

        {/* Audio Player */}
        <div className="audio-player-sticky">
          <div style={{ fontWeight: 500, marginBottom: '10px' }}>朗读音频</div>
          <audio ref={audioRef} controls preload="none">
            <source src="/audio/family-cohesion/story.mp4" type="audio/mp4" />
            您的浏览器不支持音频播放。
          </audio>
        </div>

        {/* Pictures Section */}
        <div className="section-title">图片</div>
        <div className="picture-container">
          <div className="pictures-row">
            <div className="picture-box">
              <img
                src="/images/family-cohesion/picture1.png"
                alt="图片1 - 一家人在车里"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
              <div className="picture-number">1. 一家人在车里</div>
            </div>
            <div className="picture-box">
              <img
                src="/images/family-cohesion/picture2.png"
                alt="图片2 - 海边野餐"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
              <div className="picture-number">2. 海边野餐</div>
            </div>
            <div className="picture-box">
              <img
                src="/images/family-cohesion/picture3.png"
                alt="图片3 - 回家的车"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
              <div className="picture-number">3. 回家的车</div>
            </div>
          </div>
        </div>

        {/* Question 1: Story Content */}
        <div className="section-title">
          问题一：
          <span
            className="koushi-word"
            onClick={() => handleWordClick('谈谈', 'tán tan', 'talk about')}
          >
            谈谈
          </span>
          <span
            className="koushi-word"
            onClick={() => handleWordClick('你', 'nǐ', 'you')}
          >
            你
          </span>
          <span
            className="koushi-word"
            onClick={() => handleWordClick('在', 'zài', 'in')}
          >
            在
          </span>
          <span
            className="koushi-word"
            onClick={() => handleWordClick('图片', 'tú piàn', 'picture')}
          >
            图片
          </span>
          <span
            className="koushi-word"
            onClick={() => handleWordClick('中', 'zhōng', 'in')}
          >
            中
          </span>
          <span
            className="koushi-word"
            onClick={() => handleWordClick('看到', 'kàn dào', 'see')}
          >
            看到
          </span>
          <span
            className="koushi-word"
            onClick={() => handleWordClick('的', 'de', '(particle)')}
          >
            的
          </span>
          <span
            className="koushi-word"
            onClick={() => handleWordClick('事情', 'shì qing', 'things')}
          >
            事情
          </span>
        </div>

        <div className="question-box">
          <h3>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('内容', 'nèi róng', 'content')}
            >
              内容
            </span>
          </h3>
          <div className="story-text">
            {storySentences.map((sentence, index) => (
              <Sentence
                key={index}
                sentence={sentence}
                isHighlighted={highlightedSentenceIndex === index}
                onWordClick={handleWordClick}
              />
            ))}
          </div>
          <div className="hint-box">
            <strong>提示：</strong>
            <ul>
              <li>点击任何词语查看拼音、英文翻译和听发音</li>
              <li>点击 "播放故事音频" 按钮，句子会同步高亮显示英文翻译</li>
              <li>点击词语时，主音频会自动暂停</li>
            </ul>
          </div>
        </div>

        {/* Summary Section */}
        <div className="question-box">
          <h3>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('总结', 'zǒng jié', 'summary')}
            >
              总结
            </span>
            （
            <span
              className="koushi-word"
              onClick={() => handleWordClick('感受', 'gǎn shòu', 'feelings')}
            >
              感受
            </span>
            、
            <span
              className="koushi-word"
              onClick={() => handleWordClick('看法', 'kàn fǎ', 'opinion')}
            >
              看法
            </span>
            、
            <span
              className="koushi-word"
              onClick={() => handleWordClick('原因', 'yuán yīn', 'reason')}
            >
              原因
            </span>
            、
            <span
              className="koushi-word"
              onClick={() => handleWordClick('如果', 'rú guǒ', 'if')}
            >
              如果
            </span>
            ）
          </h3>
          <div className="reflection-text">
            <div className="reflection-label">F=感受</div>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('看了', 'kàn le', 'saw/watched')}
            >
              看了
            </span>
            <span
              className="koushi-word"
              onClick={() =>
                handleWordClick('这一幕', 'zhè yī mù', 'this scene')
              }
            >
              这一幕
            </span>
            ，
            <span
              className="koushi-word"
              onClick={() => handleWordClick('我', 'wǒ', 'I')}
            >
              我
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('很', 'hěn', 'very')}
            >
              很
            </span>
            <span
              className="koushi-word"
              onClick={() =>
                handleWordClick('感动', 'gǎn dòng', 'moved/touched')
              }
            >
              感动
            </span>
            。
            <div className="reflection-label" style={{ marginTop: '15px' }}>
              O=看法
            </div>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('我', 'wǒ', 'I')}
            >
              我
            </span>
            <span
              className="koushi-word"
              onClick={() =>
                handleWordClick('认为', 'rèn wéi', 'think/believe')
              }
            >
              认为
            </span>
            <span
              className="koushi-word"
              onClick={() =>
                handleWordClick('这一家人', 'zhè yī jiā rén', 'this family')
              }
            >
              这一家人
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('的', 'de', '(particle)')}
            >
              的
            </span>
            <span
              className="koushi-word"
              onClick={() =>
                handleWordClick('感情', 'gǎn qíng', 'feelings/relationship')
              }
            >
              感情
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('很好', 'hěn hǎo', 'very good')}
            >
              很好
            </span>
            。
            <div className="reflection-label" style={{ marginTop: '15px' }}>
              R=原因
            </div>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('因为', 'yīn wèi', 'because')}
            >
              因为
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('父母', 'fù mǔ', 'parents')}
            >
              父母
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('每天', 'měi tiān', 'every day')}
            >
              每天
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('工作', 'gōng zuò', 'work')}
            >
              工作
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('非常', 'fēi cháng', 'very')}
            >
              非常
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('忙', 'máng', 'busy')}
            >
              忙
            </span>
            ，
            <span
              className="koushi-word"
              onClick={() =>
                handleWordClick('很少', 'hěn shǎo', 'seldom/rarely')
              }
            >
              很少
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('有', 'yǒu', 'have')}
            >
              有
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('时间', 'shí jiān', 'time')}
            >
              时间
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('和', 'hé', 'and/with')}
            >
              和
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('我们', 'wǒ men', 'us')}
            >
              我们
            </span>
            <span
              className="koushi-word"
              onClick={() =>
                handleWordClick('聚在一起', 'jù zài yī qǐ', 'gather together')
              }
            >
              聚在一起
            </span>
            。
            <span
              className="koushi-word"
              onClick={() => handleWordClick('一家人', 'yī jiā rén', 'family')}
            >
              一家人
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('应该', 'yīng gāi', 'should')}
            >
              应该
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('多', 'duō', 'more')}
            >
              多
            </span>
            <span
              className="koushi-word"
              onClick={() =>
                handleWordClick('聚在一起', 'jù zài yī qǐ', 'gather together')
              }
            >
              聚在一起
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('进行', 'jìn xíng', 'carry out')}
            >
              进行
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('活动', 'huó dòng', 'activities')}
            >
              活动
            </span>
            ，
            <span
              className="koushi-word"
              onClick={() => handleWordClick('这样', 'zhè yàng', 'this way')}
            >
              这样
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('就', 'jiù', 'then')}
            >
              就
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('能', 'néng', 'can')}
            >
              能
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('有', 'yǒu', 'have')}
            >
              有
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('更多', 'gèng duō', 'more')}
            >
              更多
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('的', 'de', '(particle)')}
            >
              的
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('时间', 'shí jiān', 'time')}
            >
              时间
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('去', 'qù', 'to go')}
            >
              去
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('了解', 'liǎo jiě', 'understand')}
            >
              了解
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('和', 'hé', 'and')}
            >
              和
            </span>
            <span
              className="koushi-word"
              onClick={() =>
                handleWordClick('关心', 'guān xīn', 'care about')
              }
            >
              关心
            </span>
            <span
              className="koushi-word"
              onClick={() =>
                handleWordClick('对方', 'duì fāng', 'each other')
              }
            >
              对方
            </span>
            ，
            <span
              className="koushi-word"
              onClick={() =>
                handleWordClick('家人之间', 'jiā rén zhī jiān', 'between family')
              }
            >
              家人之间
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('的', 'de', '(particle)')}
            >
              的
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('感情', 'gǎn qíng', 'feelings')}
            >
              感情
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('就', 'jiù', 'then')}
            >
              就
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('会', 'huì', 'will')}
            >
              会
            </span>
            <span
              className="koushi-word"
              onClick={() =>
                handleWordClick(
                  '越来越好',
                  'yuè lái yuè hǎo',
                  'better and better'
                )
              }
            >
              越来越好
            </span>
            。
            <div className="reflection-label" style={{ marginTop: '15px' }}>
              IF=如果
            </div>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('如果', 'rú guǒ', 'if')}
            >
              如果
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('我', 'wǒ', 'I')}
            >
              我
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('是', 'shì', 'am')}
            >
              是
            </span>
            <span
              className="koushi-word"
              onClick={() =>
                handleWordClick('图片中', 'tú piàn zhōng', 'in the picture')
              }
            >
              图片中
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('的', 'de', '(particle)')}
            >
              的
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('小孩', 'xiǎo hái', 'child')}
            >
              小孩
            </span>
            ，
            <span
              className="koushi-word"
              onClick={() => handleWordClick('我', 'wǒ', 'I')}
            >
              我
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('也', 'yě', 'also')}
            >
              也
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('会', 'huì', 'will')}
            >
              会
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('多', 'duō', 'more')}
            >
              多
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('和', 'hé', 'with')}
            >
              和
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('家人', 'jiā rén', 'family')}
            >
              家人
            </span>
            <span
              className="koushi-word"
              onClick={() =>
                handleWordClick('聚在一起', 'jù zài yī qǐ', 'gather together')
              }
            >
              聚在一起
            </span>
            ，
            <span
              className="koushi-word"
              onClick={() => handleWordClick('珍惜', 'zhēn xī', 'cherish')}
            >
              珍惜
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('和', 'hé', 'with')}
            >
              和
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('家人', 'jiā rén', 'family')}
            >
              家人
            </span>
            <span
              className="koushi-word"
              onClick={() =>
                handleWordClick('相处', 'xiāng chǔ', 'get along')
              }
            >
              相处
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('的', 'de', '(particle)')}
            >
              的
            </span>
            <span
              className="koushi-word"
              onClick={() =>
                handleWordClick('时光', 'shí guāng', 'time/moments')
              }
            >
              时光
            </span>
            。
          </div>
        </div>

        {/* Question 2: Personal Experience */}
        <div className="section-title">
          问题二：
          <span
            className="koushi-word"
            onClick={() => handleWordClick('经历', 'jīng lì', 'experience')}
          >
            经历
          </span>
          <span
            className="koushi-word"
            onClick={() => handleWordClick('类', 'lèi', 'type')}
          >
            类
          </span>
          <span
            className="koushi-word"
            onClick={() => handleWordClick('问题', 'wèn tí', 'question')}
          >
            问题
          </span>
        </div>
        <div className="question-box">
          <h3>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('除了', 'chú le', 'besides')}
            >
              除了
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('图片', 'tú piàn', 'picture')}
            >
              图片
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('中', 'zhōng', 'in')}
            >
              中
            </span>
            <span
              className="koushi-word"
              onClick={() =>
                handleWordClick('所看到的', 'suǒ kàn dào de', 'what was seen')
              }
            >
              所看到的
            </span>
            ，
            <span
              className="koushi-word"
              onClick={() =>
                handleWordClick('谈一谈', 'tán yi tan', 'talk about')
              }
            >
              谈一谈
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('你', 'nǐ', 'you')}
            >
              你
            </span>
            <span
              className="koushi-word"
              onClick={() =>
                handleWordClick('曾经', 'céng jīng', 'once/previously')
              }
            >
              曾经
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('和', 'hé', 'with')}
            >
              和
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('家人', 'jiā rén', 'family')}
            >
              家人
            </span>
            <span
              className="koushi-word"
              onClick={() =>
                handleWordClick('聚在一起', 'jù zài yī qǐ', 'gather together')
              }
            >
              聚在一起
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('的', 'de', '(particle)')}
            >
              的
            </span>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('事', 'shì', 'matter/thing')}
            >
              事
            </span>
            。
          </h3>
          <div className="story-text">
            <div className="sentence-with-translation">
              <p>
                <span
                  className="koushi-word"
                  onClick={() => handleWordClick('记得', 'jì de', 'remember')}
                >
                  记得
                </span>
                （
                <span
                  className="koushi-word"
                  onClick={() => handleWordClick('时间', 'shí jiān', 'time')}
                >
                  时间
                </span>
                ）
                <span
                  className="koushi-word"
                  onClick={() => handleWordClick('去年', 'qù nián', 'last year')}
                >
                  去年
                </span>
                <span
                  className="koushi-word"
                  onClick={() =>
                    handleWordClick(
                      '学校假期',
                      'xué xiào jià qī',
                      'school holiday'
                    )
                  }
                >
                  学校假期
                </span>
                <span
                  className="koushi-word"
                  onClick={() => handleWordClick('时', 'shí', 'when')}
                >
                  时
                </span>
                ，
                <span
                  className="koushi-word"
                  onClick={() => handleWordClick('爸爸', 'bà ba', 'dad')}
                >
                  爸爸
                </span>
                <span
                  className="koushi-word"
                  onClick={() => handleWordClick('提议', 'tí yì', 'suggest')}
                >
                  提议
                </span>
                <span
                  className="koushi-word"
                  onClick={() =>
                    handleWordClick('一起去', 'yī qǐ qù', 'go together')
                  }
                >
                  一起去
                </span>
                （
                <span
                  className="koushi-word"
                  onClick={() => handleWordClick('地点', 'dì diǎn', 'location')}
                >
                  地点
                </span>
                ）
                <span
                  className="koushi-word"
                  onClick={() => handleWordClick('海边', 'hǎi biān', 'seaside')}
                >
                  海边
                </span>
                （
                <span
                  className="koushi-word"
                  onClick={() =>
                    handleWordClick('起因', 'qǐ yīn', 'reason')
                  }
                >
                  起因
                </span>
                ）
                <span
                  className="koushi-word"
                  onClick={() => handleWordClick('度假', 'dù jià', 'vacation')}
                >
                  度假
                </span>
                ，（
                <span
                  className="koushi-word"
                  onClick={() =>
                    handleWordClick('人物', 'rén wù', 'people')
                  }
                >
                  人物
                </span>
                ）
                <span
                  className="koushi-word"
                  onClick={() =>
                    handleWordClick(
                      '我们全家人',
                      'wǒ men quán jiā rén',
                      'our whole family'
                    )
                  }
                >
                  我们全家人
                </span>
                <span
                  className="koushi-word"
                  onClick={() => handleWordClick('听了', 'tīng le', 'heard')}
                >
                  听了
                </span>
                ，
                <span
                  className="koushi-word"
                  onClick={() =>
                    handleWordClick('立刻', 'lì kè', 'immediately')
                  }
                >
                  立刻
                </span>
                <span
                  className="koushi-word"
                  onClick={() =>
                    handleWordClick(
                      '拍手欢呼',
                      'pāi shǒu huān hū',
                      'clap and cheer'
                    )
                  }
                >
                  拍手欢呼
                </span>
                。
              </p>
              <p className="sentence-translation">
                I remember last year during school holidays, dad suggested we go
                to the seaside for vacation, and our whole family immediately
                clapped and cheered.
              </p>
            </div>

            <div className="sentence-with-translation">
              <p>
                <span
                  className="koushi-word"
                  onClick={() =>
                    handleWordClick('一切', 'yī qiè', 'everything')
                  }
                >
                  一切
                </span>
                <span
                  className="koushi-word"
                  onClick={() =>
                    handleWordClick('准备就绪', 'zhǔn bèi jiù xù', 'ready')
                  }
                >
                  准备就绪
                </span>
                <span
                  className="koushi-word"
                  onClick={() => handleWordClick('后', 'hòu', 'after')}
                >
                  后
                </span>
                ，
                <span
                  className="koushi-word"
                  onClick={() => handleWordClick('便', 'biàn', 'then')}
                >
                  便
                </span>
                <span
                  className="koushi-word"
                  onClick={() =>
                    handleWordClick(
                      '兴致勃勃',
                      'xìng zhì bó bó',
                      'enthusiastic'
                    )
                  }
                >
                  兴致勃勃
                </span>
                <span
                  className="koushi-word"
                  onClick={() => handleWordClick('地', 'de', '(adverb)')}
                >
                  地
                </span>
                <span
                  className="koushi-word"
                  onClick={() =>
                    handleWordClick('出发了', 'chū fā le', 'set off')
                  }
                >
                  出发了
                </span>
                。
              </p>
              <p className="sentence-translation">
                After everything was ready, we enthusiastically set off.
              </p>
            </div>

            <div className="sentence-with-translation">
              <p>
                （
                <span
                  className="koushi-word"
                  onClick={() =>
                    handleWordClick('经过', 'jīng guò', 'process')
                  }
                >
                  经过
                </span>
                ）
                <span
                  className="koushi-word"
                  onClick={() => handleWordClick('到了', 'dào le', 'arrived')}
                >
                  到了
                </span>
                <span
                  className="koushi-word"
                  onClick={() => handleWordClick('海边', 'hǎi biān', 'seaside')}
                >
                  海边
                </span>
                ，
                <span
                  className="koushi-word"
                  onClick={() => handleWordClick('我', 'wǒ', 'I')}
                >
                  我
                </span>
                <span
                  className="koushi-word"
                  onClick={() => handleWordClick('赶紧', 'gǎn jǐn', 'hurry')}
                >
                  赶紧
                </span>
                <span
                  className="koushi-word"
                  onClick={() =>
                    handleWordClick('换上', 'huàn shang', 'change into')
                  }
                >
                  换上
                </span>
                <span
                  className="koushi-word"
                  onClick={() => handleWordClick('泳衣', 'yǒng yī', 'swimsuit')}
                >
                  泳衣
                </span>
                ，
                <span
                  className="koushi-word"
                  onClick={() =>
                    handleWordClick('呼着', 'hū zhe', 'humming')
                  }
                >
                  呼着
                </span>
                <span
                  className="koushi-word"
                  onClick={() =>
                    handleWordClick('欢快', 'huān kuài', 'cheerful')
                  }
                >
                  欢快
                </span>
                <span
                  className="koushi-word"
                  onClick={() => handleWordClick('的', 'de', '(particle)')}
                >
                  的
                </span>
                <span
                  className="koushi-word"
                  onClick={() => handleWordClick('歌儿', 'gē r', 'song')}
                >
                  歌儿
                </span>
                <span
                  className="koushi-word"
                  onClick={() => handleWordClick('向', 'xiàng', 'toward')}
                >
                  向
                </span>
                <span
                  className="koushi-word"
                  onClick={() =>
                    handleWordClick('水里', 'shuǐ lǐ', 'into water')
                  }
                >
                  水里
                </span>
                <span
                  className="koushi-word"
                  onClick={() =>
                    handleWordClick('走去', 'zǒu qù', 'walk toward')
                  }
                >
                  走去
                </span>
                。
              </p>
              <p className="sentence-translation">
                When we arrived at the seaside, I quickly changed into my
                swimsuit and walked toward the water, humming a cheerful song.
              </p>
            </div>

            <div className="sentence-with-translation">
              <p>
                <span
                  className="koushi-word"
                  onClick={() => handleWordClick('我们', 'wǒ men', 'we')}
                >
                  我们
                </span>
                <span
                  className="koushi-word"
                  onClick={() => handleWordClick('几个', 'jǐ gè', 'a few')}
                >
                  几个
                </span>
                <span
                  className="koushi-word"
                  onClick={() => handleWordClick('小孩', 'xiǎo hái', 'children')}
                >
                  小孩
                </span>
                <span
                  className="koushi-word"
                  onClick={() => handleWordClick('在', 'zài', 'at')}
                >
                  在
                </span>
                <span
                  className="koushi-word"
                  onClick={() =>
                    handleWordClick('水里', 'shuǐ lǐ', 'in water')
                  }
                >
                  水里
                </span>
                <span
                  className="koushi-word"
                  onClick={() =>
                    handleWordClick('游来游去', 'yóu lái yóu qù', 'swim around')
                  }
                >
                  游来游去
                </span>
                ，
                <span
                  className="koushi-word"
                  onClick={() =>
                    handleWordClick('玩得', 'wán de', 'having fun')
                  }
                >
                  玩得
                </span>
                <span
                  className="koushi-word"
                  onClick={() =>
                    handleWordClick('真痛快', 'zhēn tòng kuài', 'really fun')
                  }
                >
                  真痛快
                </span>
                。
              </p>
              <p className="sentence-translation">
                We children swam around in the water, having a really great
                time.
              </p>
            </div>

            <div className="sentence-with-translation">
              <p>
                （
                <span
                  className="koushi-word"
                  onClick={() => handleWordClick('结果', 'jié guǒ', 'result')}
                >
                  结果
                </span>
                ）
                <span
                  className="koushi-word"
                  onClick={() => handleWordClick('到了', 'dào le', 'when')}
                >
                  到了
                </span>
                <span
                  className="koushi-word"
                  onClick={() => handleWordClick('该', 'gāi', 'should')}
                >
                  该
                </span>
                <span
                  className="koushi-word"
                  onClick={() => handleWordClick('回家', 'huí jiā', 'go home')}
                >
                  回家
                </span>
                <span
                  className="koushi-word"
                  onClick={() => handleWordClick('的', 'de', '(particle)')}
                >
                  的
                </span>
                <span
                  className="koushi-word"
                  onClick={() => handleWordClick('时候', 'shí hou', 'time')}
                >
                  时候
                </span>
                ，
                <span
                  className="koushi-word"
                  onClick={() => handleWordClick('我们', 'wǒ men', 'we')}
                >
                  我们
                </span>
                <span
                  className="koushi-word"
                  onClick={() => handleWordClick('便', 'biàn', 'then')}
                >
                  便
                </span>
                <span
                  className="koushi-word"
                  onClick={() =>
                    handleWordClick(
                      '依依不舍',
                      'yī yī bù shě',
                      'reluctantly'
                    )
                  }
                >
                  依依不舍
                </span>
                <span
                  className="koushi-word"
                  onClick={() => handleWordClick('地', 'de', '(adverb)')}
                >
                  地
                </span>
                <span
                  className="koushi-word"
                  onClick={() =>
                    handleWordClick('离开了', 'lí kāi le', 'left')
                  }
                >
                  离开了
                </span>
                。
              </p>
              <p className="sentence-translation">
                When it was time to go home, we reluctantly left.
              </p>
            </div>
          </div>
        </div>

        {/* Vocabulary Section */}
        <div className="section-title">
          本课词语（共{vocabulary.length}个）
        </div>
        <div className="koushi-vocab-grid">
          {vocabulary.map((word, index) => (
            <VocabCard
              key={index}
              word={word}
              isLearned={learnedWords.has(word.chinese)}
              onClick={() => openPractice(word)}
            />
          ))}
        </div>
      </div>

      {/* Word Popup */}
      {currentPopup && (
        <WordPopup
          word={currentPopup.word}
          pinyin={currentPopup.pinyin}
          meaning={currentPopup.meaning}
          onClose={closeWordPopup}
          onPlayAudio={playPopupAudio}
        />
      )}

      {/* Practice Modal */}
      {currentPracticeWord && (
        <PracticeModal
          word={currentPracticeWord}
          isLearned={learnedWords.has(currentPracticeWord.chinese)}
          onClose={closePractice}
          onPlayAudio={playWordAudio}
          onToggleLearned={toggleLearned}
        />
      )}
    </div>
  )
}
