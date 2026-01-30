import { useState, useRef, useEffect, useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/p3hcl-reading-sync')({
  component: P3HCLReadingSyncPage,
})

// Word data with traditional, pinyin, and meaning
interface WordData {
  simplified: string
  traditional: string
  pinyin: string
  meaning: string
}

// Comprehensive word dictionary
const wordDictionary: { [key: string]: WordData } = {
  // Section titles
  '一': { simplified: '一', traditional: '一', pinyin: 'yī', meaning: 'one' },
  '二': { simplified: '二', traditional: '二', pinyin: 'èr', meaning: 'two' },
  '三': { simplified: '三', traditional: '三', pinyin: 'sān', meaning: 'three' },
  '四': { simplified: '四', traditional: '四', pinyin: 'sì', meaning: 'four' },
  '第一天': { simplified: '第一天', traditional: '第一天', pinyin: 'dì yī tiān', meaning: 'first day' },
  '第二天': { simplified: '第二天', traditional: '第二天', pinyin: 'dì èr tiān', meaning: 'second day' },
  '又过了一天': { simplified: '又过了一天', traditional: '又過了一天', pinyin: 'yòu guò le yī tiān', meaning: 'another day passed' },
  '再过了一天': { simplified: '再过了一天', traditional: '再過了一天', pinyin: 'zài guò le yī tiān', meaning: 'yet another day passed' },
  '后来': { simplified: '后来', traditional: '後來', pinyin: 'hòu lái', meaning: 'later; afterwards' },
  '过了几天': { simplified: '过了几天', traditional: '過了幾天', pinyin: 'guò le jǐ tiān', meaning: 'after a few days' },
  '又过了几天': { simplified: '又过了几天', traditional: '又過了幾天', pinyin: 'yòu guò le jǐ tiān', meaning: 'after a few more days' },
  '再过了几天': { simplified: '再过了几天', traditional: '再過了幾天', pinyin: 'zài guò le jǐ tiān', meaning: 'after yet more days' },
  '先': { simplified: '先', traditional: '先', pinyin: 'xiān', meaning: 'first' },
  '接着': { simplified: '接着', traditional: '接著', pinyin: 'jiē zhe', meaning: 'then; next' },
  '然后': { simplified: '然后', traditional: '然後', pinyin: 'rán hòu', meaning: 'after that' },
  '再': { simplified: '再', traditional: '再', pinyin: 'zài', meaning: 'then; again' },
  '最后': { simplified: '最后', traditional: '最後', pinyin: 'zuì hòu', meaning: 'finally; lastly' },
  '过了一个月': { simplified: '过了一个月', traditional: '過了一個月', pinyin: 'guò le yī gè yuè', meaning: 'after a month' },
  '又过了几个月': { simplified: '又过了几个月', traditional: '又過了幾個月', pinyin: 'yòu guò le jǐ gè yuè', meaning: 'after a few more months' },

  // Section 1 words
  '我': { simplified: '我', traditional: '我', pinyin: 'wǒ', meaning: 'I; me' },
  '把': { simplified: '把', traditional: '把', pinyin: 'bǎ', meaning: '(particle for object)' },
  '绿豆': { simplified: '绿豆', traditional: '綠豆', pinyin: 'lǜ dòu', meaning: 'mung bean' },
  '放在': { simplified: '放在', traditional: '放在', pinyin: 'fàng zài', meaning: 'put on; place on' },
  '湿': { simplified: '湿', traditional: '濕', pinyin: 'shī', meaning: 'wet; damp' },
  '的': { simplified: '的', traditional: '的', pinyin: 'de', meaning: '(particle)' },
  '棉花': { simplified: '棉花', traditional: '棉花', pinyin: 'mián hua', meaning: 'cotton' },
  '上': { simplified: '上', traditional: '上', pinyin: 'shàng', meaning: 'on; above' },
  '变大': { simplified: '变大', traditional: '變大', pinyin: 'biàn dà', meaning: 'become bigger' },
  '了': { simplified: '了', traditional: '了', pinyin: 'le', meaning: '(particle)' },
  '它': { simplified: '它', traditional: '它', pinyin: 'tā', meaning: 'it' },
  '外壳': { simplified: '外壳', traditional: '外殼', pinyin: 'wài ké', meaning: 'outer shell' },
  '裂开': { simplified: '裂开', traditional: '裂開', pinyin: 'liè kāi', meaning: 'split open' },
  '开始': { simplified: '开始', traditional: '開始', pinyin: 'kāi shǐ', meaning: 'start; begin' },
  '发芽': { simplified: '发芽', traditional: '發芽', pinyin: 'fā yá', meaning: 'sprout' },
  '还': { simplified: '还', traditional: '還', pinyin: 'hái', meaning: 'also; still' },
  '长出': { simplified: '长出', traditional: '長出', pinyin: 'zhǎng chū', meaning: 'grow out' },
  '细细': { simplified: '细细', traditional: '細細', pinyin: 'xì xì', meaning: 'thin; fine' },
  '根': { simplified: '根', traditional: '根', pinyin: 'gēn', meaning: 'root' },
  '脱落': { simplified: '脱落', traditional: '脫落', pinyin: 'tuō luò', meaning: 'fall off' },
  '细芽': { simplified: '细芽', traditional: '細芽', pinyin: 'xì yá', meaning: 'thin sprout' },
  '长得': { simplified: '长得', traditional: '長得', pinyin: 'zhǎng de', meaning: 'grow to be' },
  '更长': { simplified: '更长', traditional: '更長', pinyin: 'gèng cháng', meaning: 'longer' },
  '茎': { simplified: '茎', traditional: '莖', pinyin: 'jīng', meaning: 'stem' },
  '越来越': { simplified: '越来越', traditional: '越來越', pinyin: 'yuè lái yuè', meaning: 'more and more' },
  '长': { simplified: '长', traditional: '長', pinyin: 'cháng/zhǎng', meaning: 'long / grow' },
  '叶子': { simplified: '叶子', traditional: '葉子', pinyin: 'yè zi', meaning: 'leaf' },
  '也': { simplified: '也', traditional: '也', pinyin: 'yě', meaning: 'also' },
  '大': { simplified: '大', traditional: '大', pinyin: 'dà', meaning: 'big' },
  '幼苗': { simplified: '幼苗', traditional: '幼苗', pinyin: 'yòu miáo', meaning: 'seedling' },
  '一天天': { simplified: '一天天', traditional: '一天天', pinyin: 'yī tiān tiān', meaning: 'day by day' },
  '长大': { simplified: '长大', traditional: '長大', pinyin: 'zhǎng dà', meaning: 'grow up' },
  '变成': { simplified: '变成', traditional: '變成', pinyin: 'biàn chéng', meaning: 'become' },
  '豆芽菜': { simplified: '豆芽菜', traditional: '豆芽菜', pinyin: 'dòu yá cài', meaning: 'bean sprouts' },

  // Section 2 words
  '池塘': { simplified: '池塘', traditional: '池塘', pinyin: 'chí táng', meaning: 'pond' },
  '里': { simplified: '里', traditional: '裡', pinyin: 'lǐ', meaning: 'inside' },
  '有': { simplified: '有', traditional: '有', pinyin: 'yǒu', meaning: 'have; there is' },
  '几只': { simplified: '几只', traditional: '幾隻', pinyin: 'jǐ zhī', meaning: 'a few (animals)' },
  '小': { simplified: '小', traditional: '小', pinyin: 'xiǎo', meaning: 'small; little' },
  '蝌蚪': { simplified: '蝌蚪', traditional: '蝌蚪', pinyin: 'kē dǒu', meaning: 'tadpole' },
  '小蝌蚪': { simplified: '小蝌蚪', traditional: '小蝌蚪', pinyin: 'xiǎo kē dǒu', meaning: 'little tadpole' },
  '两条': { simplified: '两条', traditional: '兩條', pinyin: 'liǎng tiáo', meaning: 'two (long things)' },
  '后腿': { simplified: '后腿', traditional: '後腿', pinyin: 'hòu tuǐ', meaning: 'hind legs' },
  '前腿': { simplified: '前腿', traditional: '前腿', pinyin: 'qián tuǐ', meaning: 'front legs' },
  '尾巴': { simplified: '尾巴', traditional: '尾巴', pinyin: 'wěi ba', meaning: 'tail' },
  '变短': { simplified: '变短', traditional: '變短', pinyin: 'biàn duǎn', meaning: 'become shorter' },
  '小青蛙': { simplified: '小青蛙', traditional: '小青蛙', pinyin: 'xiǎo qīng wā', meaning: 'little frog' },
  '不见': { simplified: '不见', traditional: '不見', pinyin: 'bú jiàn', meaning: 'disappear' },

  // Section 3 words
  '当': { simplified: '当', traditional: '當', pinyin: 'dāng', meaning: 'when' },
  '放学': { simplified: '放学', traditional: '放學', pinyin: 'fàng xué', meaning: 'finish school' },
  '回到': { simplified: '回到', traditional: '回到', pinyin: 'huí dào', meaning: 'return to' },
  '家': { simplified: '家', traditional: '家', pinyin: 'jiā', meaning: 'home' },
  '放下': { simplified: '放下', traditional: '放下', pinyin: 'fàng xià', meaning: 'put down' },
  '书包': { simplified: '书包', traditional: '書包', pinyin: 'shū bāo', meaning: 'schoolbag' },
  '去': { simplified: '去', traditional: '去', pinyin: 'qù', meaning: 'go' },
  '冲凉': { simplified: '冲凉', traditional: '沖涼', pinyin: 'chōng liáng', meaning: 'take a shower' },
  '拿出': { simplified: '拿出', traditional: '拿出', pinyin: 'ná chū', meaning: 'take out' },
  '碗筷': { simplified: '碗筷', traditional: '碗筷', pinyin: 'wǎn kuài', meaning: 'bowls and chopsticks' },
  '吃饭': { simplified: '吃饭', traditional: '吃飯', pinyin: 'chī fàn', meaning: 'eat (a meal)' },
  '作业': { simplified: '作业', traditional: '作業', pinyin: 'zuò yè', meaning: 'homework' },
  '复习': { simplified: '复习', traditional: '複習', pinyin: 'fù xí', meaning: 'review; revise' },
  '看': { simplified: '看', traditional: '看', pinyin: 'kàn', meaning: 'watch; look' },
  '一会儿': { simplified: '一会儿', traditional: '一會兒', pinyin: 'yī huì r', meaning: 'a while' },
  '电视': { simplified: '电视', traditional: '電視', pinyin: 'diàn shì', meaning: 'television' },
  '洗漱': { simplified: '洗漱', traditional: '洗漱', pinyin: 'xǐ shù', meaning: 'wash up' },
  '完毕': { simplified: '完毕', traditional: '完畢', pinyin: 'wán bì', meaning: 'finished' },
  '就': { simplified: '就', traditional: '就', pinyin: 'jiù', meaning: 'then' },
  '上床': { simplified: '上床', traditional: '上床', pinyin: 'shàng chuáng', meaning: 'go to bed' },
  '睡觉': { simplified: '睡觉', traditional: '睡覺', pinyin: 'shuì jiào', meaning: 'sleep' },

  // Section 4 words
  '树苗': { simplified: '树苗', traditional: '樹苗', pinyin: 'shù miáo', meaning: 'sapling; young tree' },
  '种在': { simplified: '种在', traditional: '種在', pinyin: 'zhòng zài', meaning: 'plant in' },
  '泥土': { simplified: '泥土', traditional: '泥土', pinyin: 'ní tǔ', meaning: 'soil; earth' },
  '很快': { simplified: '很快', traditional: '很快', pinyin: 'hěn kuài', meaning: 'very quickly' },
  '长高': { simplified: '长高', traditional: '長高', pinyin: 'zhǎng gāo', meaning: 'grow tall' },
  '小树': { simplified: '小树', traditional: '小樹', pinyin: 'xiǎo shù', meaning: 'small tree' },
  '更高大': { simplified: '更高大', traditional: '更高大', pinyin: 'gèng gāo dà', meaning: 'taller and bigger' },
  '树上': { simplified: '树上', traditional: '樹上', pinyin: 'shù shàng', meaning: 'on the tree' },
  '很多': { simplified: '很多', traditional: '很多', pinyin: 'hěn duō', meaning: 'many; a lot' },
  '树枝': { simplified: '树枝', traditional: '樹枝', pinyin: 'shù zhī', meaning: 'tree branch' },
  '长满': { simplified: '长满', traditional: '長滿', pinyin: 'zhǎng mǎn', meaning: 'fully grown; covered with' },
  '绿色': { simplified: '绿色', traditional: '綠色', pinyin: 'lǜ sè', meaning: 'green (color)' },
  '窗外': { simplified: '窗外', traditional: '窗外', pinyin: 'chuāng wài', meaning: 'outside the window' },
  '一棵': { simplified: '一棵', traditional: '一棵', pinyin: 'yī kē', meaning: 'one (tree)' },
  '笔直': { simplified: '笔直', traditional: '筆直', pinyin: 'bǐ zhí', meaning: 'straight' },
  '大树': { simplified: '大树', traditional: '大樹', pinyin: 'dà shù', meaning: 'big tree' },
}

// Sentence data with timing for audio sync
interface Sentence {
  text: string
  start: number
  end: number
  isSequenceWord?: boolean
  isTitle?: boolean
}

interface Section {
  id: number
  title: string
  sequenceWords: string
  sentences: Sentence[]
}

// Audio timing for each sentence (in seconds)
// ADJUSTED: Compressed to fit ~55 second audio file
// Teacher reads at faster pace (~5-6 chars/second)
const sections: Section[] = [
  {
    id: 1,
    title: '一、第一天、第二天、又过了一天、再过了一天、后来',
    sequenceWords: '第一天、第二天、又过了一天、再过了一天、后来',
    sentences: [
      { text: '一、第一天、第二天、又过了一天、再过了一天、后来', start: 0.0, end: 2.5, isTitle: true },
      { text: '第一天，', start: 2.5, end: 3.2, isSequenceWord: true },
      { text: '我把绿豆放在湿的棉花上。', start: 3.2, end: 5.0 },
      { text: '第二天，', start: 5.0, end: 5.7, isSequenceWord: true },
      { text: '绿豆变大了，它的外壳裂开了，开始发芽了，还长出了细细的根。', start: 5.7, end: 9.5 },
      { text: '又过了一天，', start: 9.5, end: 10.3, isSequenceWord: true },
      { text: '绿豆的外壳脱落了，细芽长得更长了。', start: 10.3, end: 12.5 },
      { text: '再过了一天，', start: 12.5, end: 13.3, isSequenceWord: true },
      { text: '绿豆的茎越来越长，叶子也越来越大。', start: 13.3, end: 15.5 },
      { text: '后来，', start: 15.5, end: 16.0, isSequenceWord: true },
      { text: '幼苗一天天长大，变成了豆芽菜。', start: 16.0, end: 18.0 },
    ],
  },
  {
    id: 2,
    title: '二、过了几天、又过了几天、再过了几天、后来',
    sequenceWords: '过了几天、又过了几天、再过了几天、后来',
    sentences: [
      { text: '二、过了几天、又过了几天、再过了几天、后来', start: 18.0, end: 20.5, isTitle: true },
      { text: '池塘里有几只小蝌蚪。', start: 20.5, end: 22.0 },
      { text: '过了几天，', start: 22.0, end: 22.8, isSequenceWord: true },
      { text: '小蝌蚪长出两条后腿。', start: 22.8, end: 24.3 },
      { text: '又过了几天，', start: 24.3, end: 25.2, isSequenceWord: true },
      { text: '小蝌蚪长出了两条前腿。', start: 25.2, end: 26.8 },
      { text: '再过了几天，', start: 26.8, end: 27.7, isSequenceWord: true },
      { text: '小蝌蚪的尾巴变短了。', start: 27.7, end: 29.2 },
      { text: '后来，', start: 29.2, end: 29.8, isSequenceWord: true },
      { text: '小青蛙的尾巴不见了。', start: 29.8, end: 31.5 },
    ],
  },
  {
    id: 3,
    title: '三、先、接着、然后、再、最后',
    sequenceWords: '先、接着、然后、再、最后',
    sentences: [
      { text: '三、先、接着、然后、再、最后', start: 31.5, end: 33.5, isTitle: true },
      { text: '当我放学回到家，', start: 33.5, end: 34.8 },
      { text: '我先放下书包去冲凉，', start: 34.8, end: 36.3, isSequenceWord: true },
      { text: '接着拿出碗筷开始吃饭，', start: 36.3, end: 38.0, isSequenceWord: true },
      { text: '然后拿出作业开始复习，', start: 38.0, end: 39.7, isSequenceWord: true },
      { text: '再看一会儿电视，', start: 39.7, end: 41.0, isSequenceWord: true },
      { text: '最后洗漱完毕就上床睡觉了。', start: 41.0, end: 43.5, isSequenceWord: true },
    ],
  },
  {
    id: 4,
    title: '四、过了一个月、又过了几个月、后来',
    sequenceWords: '过了一个月、又过了几个月、后来',
    sentences: [
      { text: '四、过了一个月、又过了几个月、后来', start: 43.5, end: 45.8, isTitle: true },
      { text: '我把树苗种在泥土里。', start: 45.8, end: 47.3 },
      { text: '过了一个月，', start: 47.3, end: 48.2, isSequenceWord: true },
      { text: '树苗很快就长高了。', start: 48.2, end: 49.5 },
      { text: '又过了几个月，', start: 49.5, end: 50.5, isSequenceWord: true },
      { text: '小树长得更高大了，树上长出很多树枝，还长满了绿色的叶子。', start: 50.5, end: 54.5 },
      { text: '后来，', start: 54.5, end: 55.2, isSequenceWord: true },
      { text: '窗外的小树变成了一棵笔直的大树。', start: 55.2, end: 58.0 },
    ],
  },
]

// Create a flat list of all sentences with section info for highlighting
interface FlatSentence extends Sentence {
  sectionId: number
  sentenceIndex: number
}

const allSentences: FlatSentence[] = sections.flatMap((section) =>
  section.sentences.map((sentence, index) => ({
    ...sentence,
    sectionId: section.id,
    sentenceIndex: index,
  }))
)

// Word popup component
interface WordPopupProps {
  word: WordData
  onClose: () => void
  onPlayAudio: () => void
}

function WordPopup({ word, onClose, onPlayAudio }: WordPopupProps) {
  return (
    <>
      <div className="popup-overlay show" onClick={onClose} />
      <div className="word-popup show">
        <div className="popup-traditional">{word.traditional}</div>
        <div className="popup-simplified">({word.simplified})</div>
        <div className="popup-pinyin">{word.pinyin}</div>
        <div className="popup-meaning">{word.meaning}</div>
        <button className="popup-audio-btn" onClick={onPlayAudio}>
          🔊 听发音
        </button>
        <br />
        <button className="popup-close" onClick={onClose}>
          关闭
        </button>
      </div>
    </>
  )
}

function P3HCLReadingSyncPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSentence, setCurrentSentence] = useState<FlatSentence | null>(null)
  const [selectedWord, setSelectedWord] = useState<WordData | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([])

  // Handle audio time update to highlight current sentence across ALL sections
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      const currentTime = audio.currentTime

      // Find which sentence is currently being read (across all sections)
      const found = allSentences.find(
        (s) => currentTime >= s.start && currentTime < s.end
      )
      setCurrentSentence(found || null)

      // Auto-scroll to current section if needed
      if (found) {
        const sectionIndex = found.sectionId - 1
        const sectionEl = sectionRefs.current[sectionIndex]
        if (sectionEl) {
          const rect = sectionEl.getBoundingClientRect()
          // Only scroll if section is not visible
          if (rect.top < 100 || rect.bottom > window.innerHeight - 100) {
            sectionEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }
      }
    }

    const handleEnded = () => {
      setCurrentSentence(null)
      setIsPlaying(false)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    const handlePlay = () => {
      setIsPlaying(true)
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('play', handlePlay)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('play', handlePlay)
    }
  }, [])

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        // Start from beginning
        audioRef.current.currentTime = 0
        audioRef.current.play()
      }
    }
  }

  // Handle word click - look up in dictionary
  const handleWordClick = useCallback((text: string) => {
    if (wordDictionary[text]) {
      setSelectedWord(wordDictionary[text])
      return
    }

    // Try to find longest matching word
    for (let len = text.length; len >= 1; len--) {
      for (let start = 0; start <= text.length - len; start++) {
        const substr = text.substring(start, start + len)
        if (wordDictionary[substr]) {
          setSelectedWord(wordDictionary[substr])
          return
        }
      }
    }

    // If no match, create a basic entry
    setSelectedWord({
      simplified: text,
      traditional: text,
      pinyin: '(点击听发音)',
      meaning: '(查询中...)',
    })
  }, [])

  const handlePlayWordAudio = useCallback(() => {
    if (selectedWord) {
      const utterance = new SpeechSynthesisUtterance(selectedWord.simplified)
      utterance.lang = 'zh-CN'
      utterance.rate = 0.7
      speechSynthesis.speak(utterance)
    }
  }, [selectedWord])

  const closePopup = useCallback(() => {
    setSelectedWord(null)
  }, [])

  // Check if a sentence is currently highlighted
  const isSentenceHighlighted = (sectionId: number, sentenceIndex: number) => {
    return (
      currentSentence?.sectionId === sectionId &&
      currentSentence?.sentenceIndex === sentenceIndex
    )
  }

  // Render clickable text
  const renderClickableText = (
    text: string,
    isHighlighted: boolean,
    isSequenceWord?: boolean,
    isTitle?: boolean
  ) => {
    const chars = text.split('')

    return (
      <span
        className={cn(
          isTitle ? 'reading-title-text' : 'reading-sentence',
          isHighlighted && 'highlighted',
          isSequenceWord && !isTitle && 'sequence-word'
        )}
      >
        {chars.map((char, idx) => (
          <span
            key={idx}
            className="clickable-char"
            onClick={() => handleWordClick(char)}
          >
            {char}
          </span>
        ))}
      </span>
    )
  }

  return (
    <div className="reading-sync-page">
      <div className="lesson-header lesson-header-blue">
        <h1>《事物的变化》</h1>
        <div className="lesson-subtitle">Changes in Things - Reading Practice</div>
      </div>

      <div className="content-container">
        {/* Audio Player - Fixed at top */}
        <div className="audio-player-card audio-player-sticky">
          <audio
            ref={audioRef}
            src="/audio/p3hcl_reading_5.mp4"
            preload="auto"
          />
          <button
            className={cn('audio-play-btn-large', isPlaying && 'playing')}
            onClick={handlePlayPause}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          <p className="audio-hint">
            {isPlaying ? '正在播放... 句子会自动高亮' : '点击播放全文朗读'}
          </p>
        </div>

        {/* All Sections */}
        {sections.map((section, sectionIndex) => (
          <div
            key={section.id}
            ref={(el) => { sectionRefs.current[sectionIndex] = el }}
            className="reading-card"
          >
            {/* Section title */}
            <h2 className="section-title-reading">
              {renderClickableText(
                section.sentences[0].text,
                isSentenceHighlighted(section.id, 0),
                false,
                true
              )}
            </h2>

            <div className="sequence-words-box">
              <span className="sequence-label">顺序词：</span>
              <span className="clickable-text" onClick={() => handleWordClick(section.sequenceWords)}>
                {section.sequenceWords}
              </span>
            </div>

            <div className="reading-content">
              {/* Skip first sentence (title) since it's shown above */}
              {section.sentences.slice(1).map((sentence, index) => (
                <span key={index}>
                  {renderClickableText(
                    sentence.text,
                    isSentenceHighlighted(section.id, index + 1),
                    sentence.isSequenceWord
                  )}
                </span>
              ))}
            </div>
          </div>
        ))}

        {/* Instruction */}
        <div className="reading-instruction">
          <p>💡 点击任何字词查看繁体、拼音和英文意思</p>
        </div>

        {/* Tips */}
        <div className="reading-tips">
          <h3>学习提示</h3>
          <ul>
            <li>点击 ▶️ 从头播放全部四段朗读</li>
            <li>朗读时，当前句子会<span className="highlighted-demo">高亮显示</span></li>
            <li>点击任何字词查看详细信息</li>
            <li>注意<span className="sequence-word-inline">顺序词</span>的使用</li>
          </ul>
        </div>
      </div>

      {/* Word Popup */}
      {selectedWord && (
        <WordPopup
          word={selectedWord}
          onClose={closePopup}
          onPlayAudio={handlePlayWordAudio}
        />
      )}
    </div>
  )
}
