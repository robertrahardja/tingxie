import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef, useCallback } from 'react'

export const Route = createFileRoute('/koushi-no-civic-mindedness')({
  component: KoushiNoCivicMindednessPage,
})

// Vocabulary data
const vocabulary = [
  { chinese: '组屋', pinyin: 'zǔ wū', english: 'HDB flat' },
  { chinese: '墙壁', pinyin: 'qiáng bì', english: 'wall' },
  { chinese: '告示牌', pinyin: 'gào shì pái', english: 'notice board/sign' },
  { chinese: '不准', pinyin: 'bù zhǔn', english: 'not allowed' },
  { chinese: '理睬', pinyin: 'lǐ cǎi', english: 'pay attention to' },
  { chinese: '继续', pinyin: 'jì xù', english: 'continue' },
  { chinese: '公德心', pinyin: 'gōng dé xīn', english: 'civic mindedness' },
  { chinese: '公共场所', pinyin: 'gōng gòng chǎng suǒ', english: 'public place' },
  { chinese: '人来人往', pinyin: 'rén lái rén wǎng', english: 'people coming and going' },
  { chinese: '遵守', pinyin: 'zūn shǒu', english: 'follow/obey' },
  { chinese: '公共规则', pinyin: 'gōng gòng guī zé', english: 'public rules' },
  { chinese: '阻止', pinyin: 'zǔ zhǐ', english: 'stop/prevent' },
  { chinese: '洗手池', pinyin: 'xǐ shǒu chí', english: 'washbasin' },
  { chinese: '水龙头', pinyin: 'shuǐ lóng tóu', english: 'tap/faucet' },
  { chinese: '浪费', pinyin: 'làng fèi', english: 'waste' },
  { chinese: '挥着手', pinyin: 'huī zhe shǒu', english: 'waving hands' },
  { chinese: '劝告', pinyin: 'quàn gào', english: 'advise' },
  { chinese: '节约', pinyin: 'jié yuē', english: 'save/conserve' },
  { chinese: '宝贵', pinyin: 'bǎo guì', english: 'precious/valuable' },
  { chinese: '随意', pinyin: 'suí yì', english: 'casually/at will' },
]

// Type for sentence items
type WordItem = { word: string; pinyin: string; meaning: string }
type TextItem = { text: string }
type SentenceItem = WordItem | TextItem

function isWordItem(item: SentenceItem): item is WordItem {
  return 'word' in item
}

// ============================================================
// 练习一：《在组屋楼下踢足球》
// ============================================================

// 描述图片 sentences (no audio sync - text only)
const football_descriptionSentences: {
  chinese: SentenceItem[]
  english: string
}[] = [
  {
    chinese: [
      { word: '在', pinyin: 'zài', meaning: 'in' },
      { word: '图片', pinyin: 'tú piàn', meaning: 'picture' },
      { word: '中', pinyin: 'zhōng', meaning: 'middle/in' },
      { text: '，' },
      { word: '我', pinyin: 'wǒ', meaning: 'I' },
      { word: '看到', pinyin: 'kàn dào', meaning: 'see' },
      { word: '有', pinyin: 'yǒu', meaning: 'there are' },
      { word: '三个', pinyin: 'sān gè', meaning: 'three' },
      { word: '小男孩', pinyin: 'xiǎo nán hái', meaning: 'little boys' },
      { word: '在', pinyin: 'zài', meaning: 'at' },
      { word: '组屋', pinyin: 'zǔ wū', meaning: 'HDB flat' },
      { word: '楼下', pinyin: 'lóu xià', meaning: 'downstairs' },
      { word: '踢', pinyin: 'tī', meaning: 'kick' },
      { word: '足球', pinyin: 'zú qiú', meaning: 'football' },
      { text: '，' },
      { word: '他们', pinyin: 'tā men', meaning: 'they' },
      { word: '玩', pinyin: 'wán', meaning: 'play' },
      { word: '得', pinyin: 'de', meaning: '(complement marker)' },
      { word: '很', pinyin: 'hěn', meaning: 'very' },
      { word: '开心', pinyin: 'kāi xīn', meaning: 'happy' },
      { text: '。' },
    ],
    english:
      'In the picture, I see three little boys playing football under the HDB block, and they are having a lot of fun.',
  },
  {
    chinese: [
      { word: '在', pinyin: 'zài', meaning: 'at' },
      { word: '他们', pinyin: 'tā men', meaning: 'their' },
      { word: '不远处', pinyin: 'bù yuǎn chù', meaning: 'not far away' },
      { word: '的', pinyin: 'de', meaning: '(particle)' },
      { word: '墙壁', pinyin: 'qiáng bì', meaning: 'wall' },
      { word: '上', pinyin: 'shàng', meaning: 'on' },
      { word: '贴着', pinyin: 'tiē zhe', meaning: 'posted' },
      { word: '一张', pinyin: 'yī zhāng', meaning: 'one (sheet)' },
      { word: '告示牌', pinyin: 'gào shì pái', meaning: 'notice board' },
      { text: '，' },
      { word: '上面', pinyin: 'shàng miàn', meaning: 'on it' },
      { word: '写着', pinyin: 'xiě zhe', meaning: 'written' },
      { text: '"' },
      { word: '不准', pinyin: 'bù zhǔn', meaning: 'not allowed' },
      { word: '踢球', pinyin: 'tī qiú', meaning: 'play ball' },
      { text: '"。' },
    ],
    english:
      'Not far from them on the wall, there is a notice board that says "No Ball Games".',
  },
  {
    chinese: [
      { word: '可是', pinyin: 'kě shì', meaning: 'but' },
      { word: '他们', pinyin: 'tā men', meaning: 'they' },
      { word: '却', pinyin: 'què', meaning: 'however' },
      { word: '对', pinyin: 'duì', meaning: 'towards' },
      { word: '告示牌', pinyin: 'gào shì pái', meaning: 'notice board' },
      { word: '上', pinyin: 'shàng', meaning: 'on' },
      { word: '的', pinyin: 'de', meaning: '(particle)' },
      { word: '内容', pinyin: 'nèi róng', meaning: 'content' },
      { word: '不加理睬', pinyin: 'bù jiā lǐ cǎi', meaning: 'completely ignore' },
      { text: '，' },
      { word: '继续', pinyin: 'jì xù', meaning: 'continue' },
      { word: '在', pinyin: 'zài', meaning: 'at' },
      { word: '那里', pinyin: 'nà lǐ', meaning: 'there' },
      { word: '踢球', pinyin: 'tī qiú', meaning: 'play ball' },
      { text: '。' },
    ],
    english:
      'But they completely ignored what was written on the sign and continued playing ball there.',
  },
]

// 看法感受 (FORI) sentences with audio timing for football
const football_foriSentences = [
  {
    start: 6.40,
    end: 10.76,
    label: 'F=感受',
    chinese: [
      { word: '看了', pinyin: 'kàn le', meaning: 'after seeing' },
      { word: '这一幕', pinyin: 'zhè yī mù', meaning: 'this scene' },
      { text: '，' },
      { word: '我', pinyin: 'wǒ', meaning: 'I' },
      { word: '感到', pinyin: 'gǎn dào', meaning: 'feel' },
      { word: '十分', pinyin: 'shí fēn', meaning: 'very' },
      { word: '生气', pinyin: 'shēng qì', meaning: 'angry' },
      { text: '。' },
    ] as SentenceItem[],
    english: 'After seeing this scene, I feel very angry.',
  },
  {
    start: 10.76,
    end: 15.86,
    label: 'O=看法',
    chinese: [
      { word: '我', pinyin: 'wǒ', meaning: 'I' },
      { word: '认为', pinyin: 'rèn wéi', meaning: 'think/believe' },
      { word: '他们', pinyin: 'tā men', meaning: 'they' },
      { word: '这种', pinyin: 'zhè zhǒng', meaning: 'this kind of' },
      { word: '行为', pinyin: 'xíng wéi', meaning: 'behavior' },
      { word: '是', pinyin: 'shì', meaning: 'is' },
      { word: '非常', pinyin: 'fēi cháng', meaning: 'very' },
      { word: '没有', pinyin: 'méi yǒu', meaning: 'without' },
      { word: '公德心', pinyin: 'gōng dé xīn', meaning: 'civic mindedness' },
      { word: '的', pinyin: 'de', meaning: '(particle)' },
      { text: '。' },
    ] as SentenceItem[],
    english: 'I think their behavior shows a complete lack of civic mindedness.',
  },
  {
    start: 15.86,
    end: 33.00,
    label: 'R=原因',
    chinese: [
      { word: '因为', pinyin: 'yīn wèi', meaning: 'because' },
      { word: '组屋', pinyin: 'zǔ wū', meaning: 'HDB flat' },
      { word: '楼下', pinyin: 'lóu xià', meaning: 'downstairs' },
      { word: '是', pinyin: 'shì', meaning: 'is' },
      { word: '公共场所', pinyin: 'gōng gòng chǎng suǒ', meaning: 'public place' },
      { text: '，' },
      { word: '人来人往', pinyin: 'rén lái rén wǎng', meaning: 'people coming and going' },
      { text: '。' },
      { word: '一不小心', pinyin: 'yī bù xiǎo xīn', meaning: 'if not careful' },
      { word: '球', pinyin: 'qiú', meaning: 'ball' },
      { word: '可能', pinyin: 'kě néng', meaning: 'might' },
      { word: '会', pinyin: 'huì', meaning: 'will' },
      { word: '打到', pinyin: 'dǎ dào', meaning: 'hit' },
      { word: '别人', pinyin: 'bié rén', meaning: 'other people' },
      { text: '，' },
      { word: '害', pinyin: 'hài', meaning: 'cause/harm' },
      { word: '别人', pinyin: 'bié rén', meaning: 'other people' },
      { word: '受伤', pinyin: 'shòu shāng', meaning: 'get injured' },
      { text: '。' },
      { word: '他们', pinyin: 'tā men', meaning: 'they' },
      { word: '应该', pinyin: 'yīng gāi', meaning: 'should' },
      { word: '遵守', pinyin: 'zūn shǒu', meaning: 'follow/obey' },
      { word: '公共规则', pinyin: 'gōng gòng guī zé', meaning: 'public rules' },
      { text: '，' },
      { word: '不应该', pinyin: 'bù yīng gāi', meaning: 'should not' },
      { word: '在', pinyin: 'zài', meaning: 'at' },
      { word: '组屋', pinyin: 'zǔ wū', meaning: 'HDB flat' },
      { word: '楼下', pinyin: 'lóu xià', meaning: 'downstairs' },
      { word: '踢', pinyin: 'tī', meaning: 'kick' },
      { word: '足球', pinyin: 'zú qiú', meaning: 'football' },
      { text: '。' },
    ] as SentenceItem[],
    english:
      'Because the area under the HDB block is a public place with people coming and going. If they are not careful, the ball might hit someone and cause injury. They should follow public rules and should not play football under the HDB block.',
  },
  {
    start: 33.00,
    end: 42.80,
    label: 'IF=如果',
    chinese: [
      { word: '如果', pinyin: 'rú guǒ', meaning: 'if' },
      { word: '是', pinyin: 'shì', meaning: 'is' },
      { word: '我', pinyin: 'wǒ', meaning: 'I' },
      { text: '，' },
      { word: '我', pinyin: 'wǒ', meaning: 'I' },
      { word: '会', pinyin: 'huì', meaning: 'will' },
      { word: '立刻', pinyin: 'lì kè', meaning: 'immediately' },
      { word: '走上前', pinyin: 'zǒu shàng qián', meaning: 'walk forward' },
      { word: '去', pinyin: 'qù', meaning: 'go' },
      { word: '阻止', pinyin: 'zǔ zhǐ', meaning: 'stop' },
      { word: '他们', pinyin: 'tā men', meaning: 'them' },
      { text: '，' },
      { word: '叫', pinyin: 'jiào', meaning: 'tell' },
      { word: '他们', pinyin: 'tā men', meaning: 'them' },
      { word: '去', pinyin: 'qù', meaning: 'go' },
      { word: '足球场', pinyin: 'zú qiú chǎng', meaning: 'football field' },
      { word: '踢球', pinyin: 'tī qiú', meaning: 'play football' },
      { text: '。' },
    ] as SentenceItem[],
    english:
      'If it were me, I would immediately go forward to stop them and tell them to go to a football field to play.',
  },
]

// ============================================================
// 练习二：《浪费水》
// ============================================================

// 描述图片 sentences with audio timing for water
const water_descriptionSentences = [
  {
    start: 3.78,
    end: 14.80,
    chinese: [
      { word: '在', pinyin: 'zài', meaning: 'in' },
      { word: '图片', pinyin: 'tú piàn', meaning: 'picture' },
      { word: '中', pinyin: 'zhōng', meaning: 'middle/in' },
      { text: '，' },
      { word: '我', pinyin: 'wǒ', meaning: 'I' },
      { word: '看到', pinyin: 'kàn dào', meaning: 'see' },
      { word: '在', pinyin: 'zài', meaning: 'at' },
      { word: '洗手池', pinyin: 'xǐ shǒu chí', meaning: 'washbasin' },
      { word: '旁', pinyin: 'páng', meaning: 'beside' },
      { text: '，' },
      { word: '有', pinyin: 'yǒu', meaning: 'there is' },
      { word: '一个', pinyin: 'yī gè', meaning: 'one' },
      { word: '小男孩', pinyin: 'xiǎo nán hái', meaning: 'little boy' },
      { word: '正在', pinyin: 'zhèng zài', meaning: 'currently' },
      { word: '洗手', pinyin: 'xǐ shǒu', meaning: 'wash hands' },
      { text: '，' },
    ] as SentenceItem[],
    english:
      'In the picture, I see beside a washbasin, a little boy is washing his hands,',
  },
  {
    start: 14.80,
    end: 22.70,
    chinese: [
      { word: '他', pinyin: 'tā', meaning: 'he' },
      { word: '把', pinyin: 'bǎ', meaning: '(object marker)' },
      { word: '水龙头', pinyin: 'shuǐ lóng tóu', meaning: 'tap/faucet' },
      { word: '开', pinyin: 'kāi', meaning: 'turn on' },
      { word: '得', pinyin: 'de', meaning: '(complement marker)' },
      { word: '很大', pinyin: 'hěn dà', meaning: 'very big' },
      { text: '，' },
      { word: '浪费', pinyin: 'làng fèi', meaning: 'waste' },
      { word: '了', pinyin: 'le', meaning: '(particle)' },
      { word: '很多', pinyin: 'hěn duō', meaning: 'a lot of' },
      { word: '水', pinyin: 'shuǐ', meaning: 'water' },
      { text: '。' },
    ] as SentenceItem[],
    english: 'He turned the tap on very high, wasting a lot of water.',
  },
  {
    start: 22.70,
    end: 37.86,
    chinese: [
      { word: '旁边', pinyin: 'páng biān', meaning: 'beside' },
      { word: '一名', pinyin: 'yī míng', meaning: 'one (person)' },
      { word: '同学', pinyin: 'tóng xué', meaning: 'classmate' },
      { word: '看到', pinyin: 'kàn dào', meaning: 'saw' },
      { word: '了', pinyin: 'le', meaning: '(particle)' },
      { text: '，' },
      { word: '马上', pinyin: 'mǎ shàng', meaning: 'immediately' },
      { word: '跑上前', pinyin: 'pǎo shàng qián', meaning: 'ran forward' },
      { text: '，' },
      { word: '挥着手', pinyin: 'huī zhe shǒu', meaning: 'waving hands' },
      { word: '劝告', pinyin: 'quàn gào', meaning: 'advise' },
      { word: '小男孩', pinyin: 'xiǎo nán hái', meaning: 'little boy' },
      { word: '把', pinyin: 'bǎ', meaning: '(object marker)' },
      { word: '水龙头', pinyin: 'shuǐ lóng tóu', meaning: 'tap' },
      { word: '关小', pinyin: 'guān xiǎo', meaning: 'turn down' },
      { word: '一点', pinyin: 'yī diǎn', meaning: 'a little' },
      { text: '，' },
      { word: '要', pinyin: 'yào', meaning: 'must' },
      { word: '节约', pinyin: 'jié yuē', meaning: 'save/conserve' },
      { word: '用水', pinyin: 'yòng shuǐ', meaning: 'use water' },
      { text: '。' },
    ] as SentenceItem[],
    english:
      'A classmate nearby saw this, immediately ran forward, waving hands to advise the boy to turn down the tap and save water.',
  },
]

// 看法感受 (FORI) sentences with audio timing for water
const water_foriSentences = [
  {
    start: 37.86,
    end: 44.50,
    label: 'F=感受',
    chinese: [
      { word: '看了', pinyin: 'kàn le', meaning: 'after seeing' },
      { word: '这一幕', pinyin: 'zhè yī mù', meaning: 'this scene' },
      { text: '，' },
      { word: '我', pinyin: 'wǒ', meaning: 'I' },
      { word: '感到', pinyin: 'gǎn dào', meaning: 'feel' },
      { word: '十分', pinyin: 'shí fēn', meaning: 'very' },
      { word: '生气', pinyin: 'shēng qì', meaning: 'angry' },
      { text: '。' },
    ] as SentenceItem[],
    english: 'After seeing this scene, I feel very angry.',
  },
  {
    start: 44.50,
    end: 52.26,
    label: 'O=看法',
    chinese: [
      { word: '我', pinyin: 'wǒ', meaning: 'I' },
      { word: '认为', pinyin: 'rèn wéi', meaning: 'think/believe' },
      { word: '小男孩', pinyin: 'xiǎo nán hái', meaning: 'little boy' },
      { word: '浪费', pinyin: 'làng fèi', meaning: 'waste' },
      { word: '水', pinyin: 'shuǐ', meaning: 'water' },
      { word: '的', pinyin: 'de', meaning: '(particle)' },
      { word: '行为', pinyin: 'xíng wéi', meaning: 'behavior' },
      { word: '是', pinyin: 'shì', meaning: 'is' },
      { word: '没有', pinyin: 'méi yǒu', meaning: 'without' },
      { word: '公德心', pinyin: 'gōng dé xīn', meaning: 'civic mindedness' },
      { word: '的', pinyin: 'de', meaning: '(particle)' },
      { text: '。' },
    ] as SentenceItem[],
    english:
      "I think the little boy's behavior of wasting water shows a lack of civic mindedness.",
  },
  {
    start: 52.26,
    end: 61.80,
    label: 'R=原因',
    chinese: [
      { word: '因为', pinyin: 'yīn wèi', meaning: 'because' },
      { word: '水', pinyin: 'shuǐ', meaning: 'water' },
      { word: '是', pinyin: 'shì', meaning: 'is' },
      { word: '宝贵', pinyin: 'bǎo guì', meaning: 'precious' },
      { word: '的', pinyin: 'de', meaning: '(particle)' },
      { text: '，' },
      { word: '他', pinyin: 'tā', meaning: 'he' },
      { word: '不应该', pinyin: 'bù yīng gāi', meaning: 'should not' },
      { word: '只顾着', pinyin: 'zhǐ gù zhe', meaning: 'only care about' },
      { word: '好玩', pinyin: 'hǎo wán', meaning: 'fun' },
      { word: '而', pinyin: 'ér', meaning: 'and/but' },
      { word: '随意', pinyin: 'suí yì', meaning: 'casually' },
      { word: '浪费', pinyin: 'làng fèi', meaning: 'waste' },
      { text: '。' },
    ] as SentenceItem[],
    english:
      'Because water is precious, he should not just care about having fun and waste it casually.',
  },
  {
    start: 61.80,
    end: 73.96,
    label: 'IF=如果',
    chinese: [
      { word: '如果', pinyin: 'rú guǒ', meaning: 'if' },
      { word: '是', pinyin: 'shì', meaning: 'is' },
      { word: '我', pinyin: 'wǒ', meaning: 'I' },
      { text: '，' },
      { word: '我', pinyin: 'wǒ', meaning: 'I' },
      { word: '也', pinyin: 'yě', meaning: 'also' },
      { word: '会', pinyin: 'huì', meaning: 'will' },
      { word: '像', pinyin: 'xiàng', meaning: 'like' },
      { word: '那位', pinyin: 'nà wèi', meaning: 'that' },
      { word: '同学', pinyin: 'tóng xué', meaning: 'classmate' },
      { word: '一样', pinyin: 'yī yàng', meaning: 'the same' },
      { text: '，' },
      { word: '立刻', pinyin: 'lì kè', meaning: 'immediately' },
      { word: '走上前', pinyin: 'zǒu shàng qián', meaning: 'walk forward' },
      { word: '去', pinyin: 'qù', meaning: 'go' },
      { word: '阻止', pinyin: 'zǔ zhǐ', meaning: 'stop' },
      { word: '他', pinyin: 'tā', meaning: 'him' },
      { text: '。' },
    ] as SentenceItem[],
    english:
      'If it were me, I would also do the same as that classmate and immediately go forward to stop him.',
  },
]

// Combine all timed sentences for each exercise
const football_allTimed = [...football_foriSentences]
const water_allTimed = [...water_descriptionSentences, ...water_foriSentences]

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

// Sentence component
interface SentenceProps {
  sentence: {
    chinese: SentenceItem[]
    english: string
  }
  isHighlighted: boolean
  onWordClick: (word: string, pinyin: string, meaning: string) => void
}

function Sentence({ sentence, isHighlighted, onWordClick }: SentenceProps) {
  return (
    <div className={`koushi-sentence ${isHighlighted ? 'highlighted' : ''}`}>
      <span className="chinese">
        {sentence.chinese.map((item, i) =>
          isWordItem(item) ? (
            <Word
              key={i}
              word={item.word}
              pinyin={item.pinyin}
              meaning={item.meaning}
              onClick={onWordClick}
            />
          ) : (
            <span key={i}>{item.text}</span>
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

const STORAGE_KEY = 'koushi_no_civic_mindedness_learned'

function KoushiNoCivicMindednessPage() {
  const [learnedWords, setLearnedWords] = useState<Set<string>>(new Set())
  const [currentPopup, setCurrentPopup] = useState<{
    word: string
    pinyin: string
    meaning: string
  } | null>(null)
  const [currentPracticeWord, setCurrentPracticeWord] = useState<
    (typeof vocabulary)[0] | null
  >(null)
  const [footballHighlight, setFootballHighlight] = useState<number | null>(null)
  const [waterHighlight, setWaterHighlight] = useState<number | null>(null)

  const footballAudioRef = useRef<HTMLAudioElement>(null)
  const waterAudioRef = useRef<HTMLAudioElement>(null)

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

  // Handle football audio time update
  useEffect(() => {
    const audio = footballAudioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      const currentTime = audio.currentTime
      let foundIndex: number | null = null
      for (let i = 0; i < football_allTimed.length; i++) {
        const sentence = football_allTimed[i]
        if (currentTime >= sentence.start && currentTime < sentence.end) {
          foundIndex = i
          break
        }
      }
      setFootballHighlight(foundIndex)
    }

    const handleEnded = () => setFootballHighlight(null)

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  // Handle water audio time update
  useEffect(() => {
    const audio = waterAudioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      const currentTime = audio.currentTime
      let foundIndex: number | null = null
      for (let i = 0; i < water_allTimed.length; i++) {
        const sentence = water_allTimed[i]
        if (currentTime >= sentence.start && currentTime < sentence.end) {
          foundIndex = i
          break
        }
      }
      setWaterHighlight(foundIndex)
    }

    const handleEnded = () => setWaterHighlight(null)

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  // Play audio helpers
  const playFootballAudio = useCallback(() => {
    footballAudioRef.current?.play()
  }, [])

  const playWaterAudio = useCallback(() => {
    waterAudioRef.current?.play()
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
      // Pause both audios if playing
      const fa = footballAudioRef.current
      if (fa && !fa.paused) fa.pause()
      const wa = waterAudioRef.current
      if (wa && !wa.paused) wa.pause()

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
      const utterance = new SpeechSynthesisUtterance(
        currentPracticeWord.chinese
      )
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

  // Water description offset and FORI offset
  const waterDescOffset = 0
  const waterForiOffset = water_descriptionSentences.length

  return (
    <div className="koushi-page">
      <div className="lesson-header lesson-header-orange">
        <h1>口试练习：没有公德心</h1>
        <div className="lesson-subtitle">
          P3HCL W13 口试 - No Civic Mindedness
        </div>
      </div>

      <div className="content-container">
        {/* Controls Bar */}
        <div className="controls-bar">
          <div className="progress-info">
            <span>已学习词语: </span>
            <span>{learnedWords.size}</span> / <span>{vocabulary.length}</span>
          </div>
          <button className="control-btn secondary" onClick={resetProgress}>
            重置进度
          </button>
        </div>

        {/* ============================================================ */}
        {/* 练习一：《在组屋楼下踢足球》 */}
        {/* ============================================================ */}
        <div className="section-title" style={{ fontSize: '1.3rem' }}>
          练习一：《
          <span
            className="koushi-word"
            onClick={() =>
              handleWordClick('在', 'zài', 'at')
            }
          >
            在
          </span>
          <span
            className="koushi-word"
            onClick={() =>
              handleWordClick('组屋', 'zǔ wū', 'HDB flat')
            }
          >
            组屋
          </span>
          <span
            className="koushi-word"
            onClick={() =>
              handleWordClick('楼下', 'lóu xià', 'downstairs')
            }
          >
            楼下
          </span>
          <span
            className="koushi-word"
            onClick={() => handleWordClick('踢', 'tī', 'kick')}
          >
            踢
          </span>
          <span
            className="koushi-word"
            onClick={() =>
              handleWordClick('足球', 'zú qiú', 'football')
            }
          >
            足球
          </span>
          》
        </div>

        {/* Football Audio Player */}
        <div className="audio-player-sticky">
          <div style={{ fontWeight: 500, marginBottom: '10px' }}>
            <span
              className="koushi-word"
              onClick={() =>
                handleWordClick('朗读', 'lǎng dú', 'read aloud')
              }
            >
              朗读
            </span>
            <span
              className="koushi-word"
              onClick={() =>
                handleWordClick('音频', 'yīn pín', 'audio')
              }
            >
              音频
            </span>
            （练习一）
          </div>
          <audio ref={footballAudioRef} controls preload="none">
            <source
              src="/audio/no-civic-mindedness/football.mp4"
              type="audio/mp4"
            />
            您的浏览器不支持音频播放。
          </audio>
          <button
            className="control-btn"
            onClick={playFootballAudio}
            style={{ marginTop: '8px' }}
          >
            播放音频
          </button>
        </div>

        {/* 一、描述图片 */}
        <div className="question-box">
          <h3>
            一、
            <span
              className="koushi-word"
              onClick={() =>
                handleWordClick('描述', 'miáo shù', 'describe')
              }
            >
              描述
            </span>
            <span
              className="koushi-word"
              onClick={() =>
                handleWordClick('图片', 'tú piàn', 'picture')
              }
            >
              图片
            </span>
            ：
          </h3>
          <div className="story-text">
            {football_descriptionSentences.map((sentence, index) => (
              <Sentence
                key={index}
                sentence={sentence}
                isHighlighted={false}
                onWordClick={handleWordClick}
              />
            ))}
          </div>
        </div>

        {/* 二、看法感受 (FORI) */}
        <div className="question-box">
          <h3>
            二、
            <span
              className="koushi-word"
              onClick={() =>
                handleWordClick('看法', 'kàn fǎ', 'opinion')
              }
            >
              看法
            </span>
            <span
              className="koushi-word"
              onClick={() =>
                handleWordClick('感受', 'gǎn shòu', 'feelings')
              }
            >
              感受
            </span>
            ：
          </h3>
          <div className="reflection-text">
            {football_foriSentences.map((sentence, index) => (
              <div key={index}>
                <div
                  className="reflection-label"
                  style={index > 0 ? { marginTop: '15px' } : {}}
                >
                  {sentence.label}
                </div>
                <Sentence
                  sentence={sentence}
                  isHighlighted={footballHighlight === index}
                  onWordClick={handleWordClick}
                />
              </div>
            ))}
          </div>
          <div className="hint-box">
            <strong>提示：</strong>
            <ul>
              <li>点击任何词语查看拼音、英文翻译和听发音</li>
              <li>播放音频时，句子会同步高亮显示英文翻译</li>
            </ul>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 练习二：《浪费水》 */}
        {/* ============================================================ */}
        <div className="section-title" style={{ fontSize: '1.3rem', marginTop: '30px' }}>
          练习二：《
          <span
            className="koushi-word"
            onClick={() =>
              handleWordClick('浪费', 'làng fèi', 'waste')
            }
          >
            浪费
          </span>
          <span
            className="koushi-word"
            onClick={() =>
              handleWordClick('水', 'shuǐ', 'water')
            }
          >
            水
          </span>
          》
        </div>

        {/* Water Audio Player */}
        <div className="audio-player-sticky">
          <div style={{ fontWeight: 500, marginBottom: '10px' }}>
            <span
              className="koushi-word"
              onClick={() =>
                handleWordClick('朗读', 'lǎng dú', 'read aloud')
              }
            >
              朗读
            </span>
            <span
              className="koushi-word"
              onClick={() =>
                handleWordClick('音频', 'yīn pín', 'audio')
              }
            >
              音频
            </span>
            （练习二）
          </div>
          <audio ref={waterAudioRef} controls preload="none">
            <source
              src="/audio/no-civic-mindedness/water.mp4"
              type="audio/mp4"
            />
            您的浏览器不支持音频播放。
          </audio>
          <button
            className="control-btn"
            onClick={playWaterAudio}
            style={{ marginTop: '8px' }}
          >
            播放音频
          </button>
        </div>

        {/* 一、描述图片 */}
        <div className="question-box">
          <h3>
            一、
            <span
              className="koushi-word"
              onClick={() =>
                handleWordClick('描述', 'miáo shù', 'describe')
              }
            >
              描述
            </span>
            <span
              className="koushi-word"
              onClick={() =>
                handleWordClick('图片', 'tú piàn', 'picture')
              }
            >
              图片
            </span>
            ：
          </h3>
          <div className="story-text">
            {water_descriptionSentences.map((sentence, index) => (
              <Sentence
                key={index}
                sentence={sentence}
                isHighlighted={waterHighlight === waterDescOffset + index}
                onWordClick={handleWordClick}
              />
            ))}
          </div>
        </div>

        {/* 二、看法感受 (FORI) */}
        <div className="question-box">
          <h3>
            二、
            <span
              className="koushi-word"
              onClick={() =>
                handleWordClick('看法', 'kàn fǎ', 'opinion')
              }
            >
              看法
            </span>
            <span
              className="koushi-word"
              onClick={() =>
                handleWordClick('感受', 'gǎn shòu', 'feelings')
              }
            >
              感受
            </span>
            ：
          </h3>
          <div className="reflection-text">
            {water_foriSentences.map((sentence, index) => (
              <div key={index}>
                <div
                  className="reflection-label"
                  style={index > 0 ? { marginTop: '15px' } : {}}
                >
                  {sentence.label}
                </div>
                <Sentence
                  sentence={sentence}
                  isHighlighted={waterHighlight === waterForiOffset + index}
                  onWordClick={handleWordClick}
                />
              </div>
            ))}
          </div>
          <div className="hint-box">
            <strong>提示：</strong>
            <ul>
              <li>点击任何词语查看拼音、英文翻译和听发音</li>
              <li>播放音频时，句子会同步高亮显示英文翻译</li>
            </ul>
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
