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
  audio?: string
}

// Comprehensive word dictionary - includes all characters and compound words
// Grouped words take priority over individual characters in lookup
const wordDictionary: { [key: string]: WordData } = {
  // Punctuation
  '、': { simplified: '、', traditional: '、', pinyin: '', meaning: 'enumeration comma' },
  '，': { simplified: '，', traditional: '，', pinyin: '', meaning: 'comma' },
  '。': { simplified: '。', traditional: '。', pinyin: '', meaning: 'period' },
  '！': { simplified: '！', traditional: '！', pinyin: '', meaning: 'exclamation mark' },
  '啊': { simplified: '啊', traditional: '啊', pinyin: 'a', meaning: 'particle (exclamation)' },

  // ===== TIME WORDS (bolded/underlined in text) =====
  '天还没亮': { simplified: '天还没亮', traditional: '天還沒亮', pinyin: 'tiān hái méi liàng', meaning: 'before dawn; sky not yet bright', audio: 'audio/天还没亮.mp3' },
  '天刚刚亮': { simplified: '天刚刚亮', traditional: '天剛剛亮', pinyin: 'tiān gāng gāng liàng', meaning: 'just at dawn; sky just brightened', audio: 'audio/天刚刚亮.mp3' },
  '上午': { simplified: '上午', traditional: '上午', pinyin: 'shàng wǔ', meaning: 'morning (before noon)', audio: 'audio/上午.mp3' },
  '中午': { simplified: '中午', traditional: '中午', pinyin: 'zhōng wǔ', meaning: 'noon; midday', audio: 'audio/中午.mp3' },
  '下午': { simplified: '下午', traditional: '下午', pinyin: 'xià wǔ', meaning: 'afternoon', audio: 'audio/下午.mp3' },
  '傍晚': { simplified: '傍晚', traditional: '傍晚', pinyin: 'bàng wǎn', meaning: 'evening; dusk', audio: 'audio/傍晚.mp3' },

  // ===== SECTION 1 COMPOUND WORDS =====
  '起床': { simplified: '起床', traditional: '起床', pinyin: 'qǐ chuáng', meaning: 'get out of bed; wake up', audio: 'audio/起床.mp3' },
  '闹钟': { simplified: '闹钟', traditional: '鬧鐘', pinyin: 'nào zhōng', meaning: 'alarm clock', audio: 'audio/闹钟.mp3' },
  '爸爸': { simplified: '爸爸', traditional: '爸爸', pinyin: 'bà ba', meaning: 'father; dad', audio: 'audio/爸爸.mp3' },
  '妈妈': { simplified: '妈妈', traditional: '媽媽', pinyin: 'mā ma', meaning: 'mother; mom', audio: 'audio/妈妈.mp3' },
  '来到': { simplified: '来到', traditional: '來到', pinyin: 'lái dào', meaning: 'arrive at; come to', audio: 'audio/来到.mp3' },
  '学校': { simplified: '学校', traditional: '學校', pinyin: 'xué xiào', meaning: 'school', audio: 'audio/学校.mp3' },
  '礼堂': { simplified: '礼堂', traditional: '禮堂', pinyin: 'lǐ táng', meaning: 'auditorium; hall', audio: 'audio/礼堂.mp3' },
  '集合': { simplified: '集合', traditional: '集合', pinyin: 'jí hé', meaning: 'gather; assemble', audio: 'audio/集合.mp3' },
  '老师': { simplified: '老师', traditional: '老師', pinyin: 'lǎo shī', meaning: 'teacher', audio: 'audio/老师.mp3' },
  '带着': { simplified: '带着', traditional: '帶著', pinyin: 'dài zhe', meaning: 'bringing along; leading', audio: 'audio/带着.mp3' },
  '同学们': { simplified: '同学们', traditional: '同學們', pinyin: 'tóng xué men', meaning: 'classmates', audio: 'audio/同学们.mp3' },
  '新加坡': { simplified: '新加坡', traditional: '新加坡', pinyin: 'xīn jiā pō', meaning: 'Singapore', audio: 'audio/新加坡.mp3' },
  '滨海艺术中心': { simplified: '滨海艺术中心', traditional: '濱海藝術中心', pinyin: 'bīn hǎi yì shù zhōng xīn', meaning: 'Esplanade (arts centre)', audio: 'audio/滨海艺术中心.mp3' },
  '画展': { simplified: '画展', traditional: '畫展', pinyin: 'huà zhǎn', meaning: 'art exhibition', audio: 'audio/画展.mp3' },
  '附近': { simplified: '附近', traditional: '附近', pinyin: 'fù jìn', meaning: 'nearby; vicinity', audio: 'audio/附近.mp3' },
  '美味': { simplified: '美味', traditional: '美味', pinyin: 'měi wèi', meaning: 'delicious', audio: 'audio/美味.mp3' },
  '食物': { simplified: '食物', traditional: '食物', pinyin: 'shí wù', meaning: 'food', audio: 'audio/食物.mp3' },
  '参观': { simplified: '参观', traditional: '參觀', pinyin: 'cān guān', meaning: 'visit (a place)', audio: 'audio/参观.mp3' },
  '滨海湾': { simplified: '滨海湾', traditional: '濱海灣', pinyin: 'bīn hǎi wān', meaning: 'Marina Bay', audio: 'audio/滨海湾.mp3' },
  '鱼尾狮': { simplified: '鱼尾狮', traditional: '魚尾獅', pinyin: 'yú wěi shī', meaning: 'Merlion', audio: 'audio/鱼尾狮.mp3' },
  '公园': { simplified: '公园', traditional: '公園', pinyin: 'gōng yuán', meaning: 'park', audio: 'audio/公园.mp3' },
  '夜市': { simplified: '夜市', traditional: '夜市', pinyin: 'yè shì', meaning: 'night market', audio: 'audio/夜市.mp3' },
  '品尝': { simplified: '品尝', traditional: '品嚐', pinyin: 'pǐn cháng', meaning: 'taste; sample', audio: 'audio/品尝.mp3' },
  '美食': { simplified: '美食', traditional: '美食', pinyin: 'měi shí', meaning: 'delicious food; cuisine', audio: 'audio/美食.mp3' },
  '今天': { simplified: '今天', traditional: '今天', pinyin: 'jīn tiān', meaning: 'today', audio: 'audio/今天.mp3' },
  '特别': { simplified: '特别', traditional: '特別', pinyin: 'tè bié', meaning: 'special; especially', audio: 'audio/特别.mp3' },
  '日子': { simplified: '日子', traditional: '日子', pinyin: 'rì zi', meaning: 'day; date', audio: 'audio/日子.mp3' },

  // ===== SECTION 2 COMPOUND WORDS =====
  '假期': { simplified: '假期', traditional: '假期', pinyin: 'jià qī', meaning: 'holiday; vacation', audio: 'audio/假期.mp3' },
  '小丽': { simplified: '小丽', traditional: '小麗', pinyin: 'xiǎo lì', meaning: 'Xiao Li (girl\'s name)', audio: 'audio/小丽.mp3' },
  '刷牙': { simplified: '刷牙', traditional: '刷牙', pinyin: 'shuā yá', meaning: 'brush teeth', audio: 'audio/刷牙.mp3' },
  '所有': { simplified: '所有', traditional: '所有', pinyin: 'suǒ yǒu', meaning: 'all; every', audio: 'audio/所有.mp3' },
  '外出': { simplified: '外出', traditional: '外出', pinyin: 'wài chū', meaning: 'go out; outing', audio: 'audio/外出.mp3' },
  '需要': { simplified: '需要', traditional: '需要', pinyin: 'xū yào', meaning: 'need; require', audio: 'audio/需要.mp3' },
  '用品': { simplified: '用品', traditional: '用品', pinyin: 'yòng pǐn', meaning: 'supplies; articles', audio: 'audio/用品.mp3' },
  '准备': { simplified: '准备', traditional: '準備', pinyin: 'zhǔn bèi', meaning: 'prepare; get ready', audio: 'audio/准备.mp3' },
  '家人': { simplified: '家人', traditional: '家人', pinyin: 'jiā rén', meaning: 'family members', audio: 'audio/家人.mp3' },
  '一起': { simplified: '一起', traditional: '一起', pinyin: 'yī qǐ', meaning: 'together', audio: 'audio/一起.mp3' },
  '东海岸公园': { simplified: '东海岸公园', traditional: '東海岸公園', pinyin: 'dōng hǎi àn gōng yuán', meaning: 'East Coast Park', audio: 'audio/东海岸公园.mp3' },
  '出发': { simplified: '出发', traditional: '出發', pinyin: 'chū fā', meaning: 'set off; depart', audio: 'audio/出发.mp3' },
  '一会儿': { simplified: '一会儿', traditional: '一會兒', pinyin: 'yī huìr', meaning: 'a while; a moment', audio: 'audio/一会儿.mp3' },
  '脚踏车': { simplified: '脚踏车', traditional: '腳踏車', pinyin: 'jiǎo tà chē', meaning: 'bicycle', audio: 'audio/脚踏车.mp3' },
  '溜滑轮': { simplified: '溜滑轮', traditional: '溜滑輪', pinyin: 'liū huá lún', meaning: 'roller skating; rollerblading', audio: 'audio/溜滑轮.mp3' },
  '开心': { simplified: '开心', traditional: '開心', pinyin: 'kāi xīn', meaning: 'happy; joyful', audio: 'audio/开心.mp3' },
  '极了': { simplified: '极了', traditional: '極了', pinyin: 'jí le', meaning: 'extremely; to the utmost', audio: 'audio/极了.mp3' },
  '摆放': { simplified: '摆放', traditional: '擺放', pinyin: 'bǎi fàng', meaning: 'arrange; set out', audio: 'audio/摆放.mp3' },
  '席子': { simplified: '席子', traditional: '席子', pinyin: 'xí zi', meaning: 'mat; straw mat', audio: 'audio/席子.mp3' },
  '开始': { simplified: '开始', traditional: '開始', pinyin: 'kāi shǐ', meaning: 'start; begin', audio: 'audio/开始.mp3' },
  '跟着': { simplified: '跟着', traditional: '跟著', pinyin: 'gēn zhe', meaning: 'follow; following', audio: 'audio/跟着.mp3' },
  '海边': { simplified: '海边', traditional: '海邊', pinyin: 'hǎi biān', meaning: 'seaside; beach', audio: 'audio/海边.mp3' },
  '钓鱼': { simplified: '钓鱼', traditional: '釣魚', pinyin: 'diào yú', meaning: 'go fishing', audio: 'audio/钓鱼.mp3' },
  '太阳': { simplified: '太阳', traditional: '太陽', pinyin: 'tài yáng', meaning: 'sun', audio: 'audio/太阳.mp3' },
  '下山': { simplified: '下山', traditional: '下山', pinyin: 'xià shān', meaning: 'go down a mountain; set (sun)', audio: 'audio/下山.mp3' },
  '依依不舍': { simplified: '依依不舍', traditional: '依依不捨', pinyin: 'yī yī bù shě', meaning: 'reluctant to part; lingering', audio: 'audio/依依不舍.mp3' },
  '回家': { simplified: '回家', traditional: '回家', pinyin: 'huí jiā', meaning: 'go home; return home', audio: 'audio/回家.mp3' },
  '过得': { simplified: '过得', traditional: '過得', pinyin: 'guò de', meaning: 'to pass (time); to live', audio: 'audio/过得.mp3' },
  '真快': { simplified: '真快', traditional: '真快', pinyin: 'zhēn kuài', meaning: 'really fast', audio: 'audio/真快.mp3' },

  // ===== INDIVIDUAL CHARACTERS (fallback) =====
  '天': { simplified: '天', traditional: '天', pinyin: 'tiān', meaning: 'day; sky' },
  '还': { simplified: '还', traditional: '還', pinyin: 'hái', meaning: 'still; also' },
  '没': { simplified: '没', traditional: '沒', pinyin: 'méi', meaning: 'not; have not' },
  '亮': { simplified: '亮', traditional: '亮', pinyin: 'liàng', meaning: 'bright; light' },
  '我': { simplified: '我', traditional: '我', pinyin: 'wǒ', meaning: 'I; me' },
  '就': { simplified: '就', traditional: '就', pinyin: 'jiù', meaning: 'then; just' },
  '了': { simplified: '了', traditional: '了', pinyin: 'le', meaning: 'particle (completed action)' },
  '不': { simplified: '不', traditional: '不', pinyin: 'bù', meaning: 'not; no' },
  '等': { simplified: '等', traditional: '等', pinyin: 'děng', meaning: 'wait; and so on' },
  '响': { simplified: '响', traditional: '響', pinyin: 'xiǎng', meaning: 'sound; ring', audio: 'audio/响.mp3' },
  '也': { simplified: '也', traditional: '也', pinyin: 'yě', meaning: 'also; too' },
  '用': { simplified: '用', traditional: '用', pinyin: 'yòng', meaning: 'use' },
  '叫': { simplified: '叫', traditional: '叫', pinyin: 'jiào', meaning: 'call; shout', audio: 'audio/叫.mp3' },
  '刚': { simplified: '刚', traditional: '剛', pinyin: 'gāng', meaning: 'just; barely' },
  '的': { simplified: '的', traditional: '的', pinyin: 'de', meaning: 'particle (possessive)' },
  '到': { simplified: '到', traditional: '到', pinyin: 'dào', meaning: 'arrive; to' },
  '去': { simplified: '去', traditional: '去', pinyin: 'qù', meaning: 'go' },
  '看': { simplified: '看', traditional: '看', pinyin: 'kàn', meaning: 'look; see; watch' },
  '在': { simplified: '在', traditional: '在', pinyin: 'zài', meaning: 'at; in' },
  '吃': { simplified: '吃', traditional: '吃', pinyin: 'chī', meaning: 'eat' },
  '们': { simplified: '们', traditional: '們', pinyin: 'men', meaning: 'plural suffix (for people)' },
  '逛': { simplified: '逛', traditional: '逛', pinyin: 'guàng', meaning: 'stroll; browse', audio: 'audio/逛.mp3' },
  '真': { simplified: '真', traditional: '真', pinyin: 'zhēn', meaning: 'really; truly' },
  '是': { simplified: '是', traditional: '是', pinyin: 'shì', meaning: 'is; am; are' },
  '一': { simplified: '一', traditional: '一', pinyin: 'yī', meaning: 'one' },
  '个': { simplified: '个', traditional: '個', pinyin: 'gè', meaning: 'measure word' },
  '里': { simplified: '里', traditional: '裡', pinyin: 'lǐ', meaning: 'inside' },
  '把': { simplified: '把', traditional: '把', pinyin: 'bǎ', meaning: 'particle (object marker)' },
  '都': { simplified: '都', traditional: '都', pinyin: 'dōu', meaning: 'all; both' },
  '好': { simplified: '好', traditional: '好', pinyin: 'hǎo', meaning: 'good; well' },
  '和': { simplified: '和', traditional: '和', pinyin: 'hé', meaning: 'and; with' },
  '向': { simplified: '向', traditional: '向', pinyin: 'xiàng', meaning: 'towards' },
  '他': { simplified: '他', traditional: '他', pinyin: 'tā', meaning: 'he; him' },
  '他们': { simplified: '他们', traditional: '他們', pinyin: 'tā men', meaning: 'they; them' },
  '骑': { simplified: '骑', traditional: '騎', pinyin: 'qí', meaning: 'ride (bicycle/horse)', audio: 'audio/骑.mp3' },
  '上': { simplified: '上', traditional: '上', pinyin: 'shàng', meaning: 'on; above; up' },
  '便': { simplified: '便', traditional: '便', pinyin: 'biàn', meaning: 'then; thereupon', audio: 'audio/便.mp3' },
  '着': { simplified: '着', traditional: '著', pinyin: 'zhe', meaning: 'particle (continuous action)' },
  '快': { simplified: '快', traditional: '快', pinyin: 'kuài', meaning: 'fast; quick; soon' },
  '地': { simplified: '地', traditional: '地', pinyin: 'de/dì', meaning: 'particle (adverbial) / earth' },
  '这': { simplified: '这', traditional: '這', pinyin: 'zhè', meaning: 'this' },

  // ===== ADDITIONAL COMPOUND WORDS =====
  '不等': { simplified: '不等', traditional: '不等', pinyin: 'bù děng', meaning: 'not wait for' },
  '不用': { simplified: '不用', traditional: '不用', pinyin: 'bù yòng', meaning: 'need not; don\'t need to' },
  '我们': { simplified: '我们', traditional: '我們', pinyin: 'wǒ men', meaning: 'we; us' },
  '鱼尾狮公园': { simplified: '鱼尾狮公园', traditional: '魚尾獅公園', pinyin: 'yú wěi shī gōng yuán', meaning: 'Merlion Park' },
  '准备好': { simplified: '准备好', traditional: '準備好', pinyin: 'zhǔn bèi hǎo', meaning: 'prepared; ready' },
  '开心极了': { simplified: '开心极了', traditional: '開心極了', pinyin: 'kāi xīn jí le', meaning: 'extremely happy' },
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
// Generated from OpenAI Whisper transcription of 6_P3HCL.mp4 (p3hcl_reading_6.mp4)
// Audio duration: ~98 seconds
// Timing derived from whisper-cpp large-v3-turbo model
// Intro "阅读计划六" is 0-4.96s, real reading starts at ~4.96s
// Note: Title lines are not read aloud in the audio - only shown visually
const sections: Section[] = [
  {
    id: 1,
    title: '一、天还没亮、天刚刚亮、上午、中午、下午、傍晚',
    sequenceWords: '天还没亮、天刚刚亮、上午、中午、下午、傍晚',
    sentences: [
      // Intro "阅读计划六" from 0.62-4.96, section 1 starts reading at 4.96
      { text: '一、天还没亮、天刚刚亮、上午、中午、下午、傍晚', start: 0.0, end: 4.96, isTitle: true },
      // Whisper: [4.96-9.76] "天还没亮,我就起床了"
      { text: '天还没亮，我就起床了。', start: 4.96, end: 9.76, isSequenceWord: true },
      // Whisper: [9.76-13.42] "不等闹钟响,也不用爸爸妈妈叫"
      { text: '不等闹钟响，也不用爸爸妈妈叫。', start: 9.76, end: 13.42 },
      // Whisper: [13.42-18.26] "天刚刚亮,我就来到学校礼堂集合"
      { text: '天刚刚亮，我就来到学校礼堂集合。', start: 13.42, end: 18.26, isSequenceWord: true },
      // Whisper: [18.26-25.32] "上午,老师带着同学们到了新加坡滨海艺术中心去看画展"
      { text: '上午，老师带着同学们到了新加坡滨海艺术中心去看画展。', start: 18.26, end: 25.32, isSequenceWord: true },
      // Whisper: [26.28-30.52] "中午,我们就在附近吃了美味的食物"
      { text: '中午，我们就在附近吃了美味的食物。', start: 25.32, end: 30.52, isSequenceWord: true },
      // Whisper: [30.52-36.08] "下午,我们去参观了滨海湾鱼尾狮公园"
      { text: '下午，我们去参观了滨海湾鱼尾狮公园。', start: 30.52, end: 36.08, isSequenceWord: true },
      // Whisper: [36.08-41.00] "傍晚,我们去逛了夜市,还品尝了美食"
      { text: '傍晚，我们去逛了夜市、还品尝了美食。', start: 36.08, end: 41.00, isSequenceWord: true },
      // Whisper: [41.00-45.14] "今天真是一个特别的日子"
      { text: '今天真是一个特别的日子！', start: 41.00, end: 45.14 },
    ],
  },
  {
    id: 2,
    title: '二、天还没亮、天刚刚亮、上午、中午、下午、傍晚',
    sequenceWords: '天还没亮、天刚刚亮、上午、中午、下午、傍晚',
    sentences: [
      // Whisper: [45.14-52.74] "假期里的一天,天还没亮,小丽就起床刷牙"
      { text: '二、天还没亮、天刚刚亮、上午、中午、下午、傍晚', start: 45.14, end: 46.5, isTitle: true },
      { text: '假期里的一天，天还没亮，小丽就起床刷牙。', start: 46.5, end: 52.74, isSequenceWord: true },
      // Whisper: [53.48-60.14] "天刚刚亮,小丽就把所有外出需要的用品都准备好了"
      { text: '天刚刚亮，小丽就把所有外出需要的用品都准备好了。', start: 52.74, end: 60.14, isSequenceWord: true },
      // Whisper: [60.14-66.32] "上午,小丽和家人一起向东海岸公园出发了"
      { text: '上午，小丽和家人一起向东海岸公园出发了。', start: 60.14, end: 66.32, isSequenceWord: true },
      // Whisper: [66.32-72.82] "他们一会儿骑脚踏车,一会儿溜滑轮,开心极了"
      { text: '他们一会儿骑脚踏车，一会儿溜滑轮，开心极了！', start: 66.32, end: 72.82 },
      // Whisper: [72.82-79.34] "中午,小丽和家人把准备好的食物摆放在席子上"
      { text: '中午，小丽和家人把准备好的食物摆放在席子上，', start: 72.82, end: 79.34, isSequenceWord: true },
      // Whisper: [79.34-81.24] "开始吃了起来"
      { text: '开始吃了起来。', start: 79.34, end: 81.24 },
      // Whisper: [81.24-87.02] "下午,小丽便跟着爸爸到附近的海边去钓鱼"
      { text: '下午，小丽便跟着爸爸到附近的海边去钓鱼。', start: 81.24, end: 87.02, isSequenceWord: true },
      // Whisper: [87.02-90.94] "傍晚,太阳快下山了"
      { text: '傍晚，太阳快下山了，', start: 87.02, end: 90.94, isSequenceWord: true },
      // Whisper: [90.94-94.88] "小丽便和家人依依不舍地回家了"
      { text: '小丽便和家人依依不舍地回家了。', start: 90.94, end: 94.88 },
      // Whisper: [94.88-97.70] "这一天过得真快啊"
      { text: '这一天过得真快啊！', start: 94.88, end: 97.70 },
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
  if (!word) return null

  return (
    <>
      <div className="popup-overlay show" onClick={onClose} />
      <div className="word-popup show">
        <div className="popup-traditional">{word.traditional || ''}</div>
        <div className="popup-simplified">({word.simplified || ''})</div>
        <div className="popup-pinyin">{word.pinyin || ''}</div>
        <div className="popup-meaning">{word.meaning || ''}</div>
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

  // Handle word click - look up in dictionary using longest match
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
    if (!selectedWord) return

    // Try dictionary audio path first, then guess path from word, then speech synthesis
    const audioPath = selectedWord.audio || `audio/${selectedWord.simplified}.mp3`
    const audio = new Audio('/' + audioPath)
    audio.play().catch(() => {
      // Fallback to speech synthesis if mp3 not found
      const utterance = new SpeechSynthesisUtterance(selectedWord.simplified)
      utterance.lang = 'zh-CN'
      utterance.rate = 0.7
      speechSynthesis.speak(utterance)
    })
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

  // Segment text into words using greedy longest-match against dictionary
  const segmentText = useCallback((text: string): string[] => {
    const segments: string[] = []
    let i = 0
    while (i < text.length) {
      let matched = false
      // Try longest match first (up to 7 chars for words like 滨海艺术中心)
      for (let len = Math.min(7, text.length - i); len >= 2; len--) {
        const candidate = text.substring(i, i + len)
        if (wordDictionary[candidate]) {
          segments.push(candidate)
          i += len
          matched = true
          break
        }
      }
      if (!matched) {
        segments.push(text[i])
        i++
      }
    }
    return segments
  }, [])

  // Render clickable text with word segmentation
  const renderClickableText = (
    text: string,
    isHighlighted: boolean,
    isSequenceWord?: boolean,
    isTitle?: boolean
  ) => {
    const words = segmentText(text)

    return (
      <span
        className={cn(
          isTitle ? 'reading-title-text' : 'reading-sentence',
          isHighlighted && 'highlighted',
          isSequenceWord && !isTitle && 'sequence-word'
        )}
      >
        {words.map((word, idx) => (
          <span
            key={idx}
            className={cn('clickable-char', word.length > 1 && wordDictionary[word] && 'clickable-word')}
            onClick={() => handleWordClick(word)}
          >
            {word}
          </span>
        ))}
      </span>
    )
  }

  return (
    <div className="reading-sync-page">
      <div className="lesson-header lesson-header-blue">
        <h1>《说一说一天的活动》</h1>
        <div className="lesson-subtitle">Describe a Day&apos;s Activities - Reading Practice</div>
      </div>

      <div className="content-container">
        {/* Audio Player - Fixed at top */}
        <div className="audio-player-card audio-player-sticky">
          <audio
            ref={audioRef}
            src="/audio/p3hcl_reading_6.mp4"
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
            <li>点击 ▶️ 从头播放全部两段朗读</li>
            <li>朗读时，当前句子会<span className="highlighted-demo">高亮显示</span></li>
            <li>点击任何字词查看详细信息</li>
            <li>注意<span className="sequence-word-inline">时间顺序词</span>的使用</li>
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
