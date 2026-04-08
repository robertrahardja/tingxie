import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef, useCallback } from 'react'

export const Route = createFileRoute('/koushi-no-civic-mindedness-2')({
  component: KoushiNoCivicMindedness2Page,
})

// Vocabulary data
const vocabulary = [
  { chinese: '购物中心', pinyin: 'gòu wù zhōng xīn', english: 'shopping centre' },
  { chinese: '喷水池', pinyin: 'pēn shuǐ chí', english: 'fountain' },
  { chinese: '圆柱', pinyin: 'yuán zhù', english: 'pillar/column' },
  { chinese: '贴', pinyin: 'tiē', english: 'to paste/stick' },
  { chinese: '告示牌', pinyin: 'gào shì pái', english: 'notice board/sign' },
  { chinese: '禁止吸烟', pinyin: 'jìn zhǐ xī yān', english: 'no smoking' },
  { chinese: '中年男子', pinyin: 'zhōng nián nán zǐ', english: 'middle-aged man' },
  { chinese: '不加理睬', pinyin: 'bù jiā lǐ cǎi', english: 'completely ignore' },
  { chinese: '继续', pinyin: 'jì xù', english: 'continue' },
  { chinese: '捂着', pinyin: 'wǔ zhe', english: 'covering (with hand)' },
  { chinese: '口鼻', pinyin: 'kǒu bí', english: 'mouth and nose' },
  { chinese: '公德心', pinyin: 'gōng dé xīn', english: 'civic mindedness' },
  { chinese: '污染', pinyin: 'wū rǎn', english: 'pollute' },
  { chinese: '周围', pinyin: 'zhōu wéi', english: 'surroundings' },
  { chinese: '二手烟', pinyin: 'èr shǒu yān', english: 'secondhand smoke' },
  { chinese: '危害', pinyin: 'wēi hài', english: 'endanger/harm' },
  { chinese: '阻止', pinyin: 'zǔ zhǐ', english: 'stop/prevent' },
  { chinese: '公共场所', pinyin: 'gōng gòng chǎng suǒ', english: 'public place' },
  { chinese: '长椅', pinyin: 'cháng yǐ', english: 'bench' },
  { chinese: '准备', pinyin: 'zhǔn bèi', english: 'prepare/about to' },
  { chinese: '采花', pinyin: 'cǎi huā', english: 'pick flowers' },
  { chinese: '观赏', pinyin: 'guān shǎng', english: 'admire/appreciate' },
  { chinese: '美丽', pinyin: 'měi lì', english: 'beautiful' },
  { chinese: '花朵', pinyin: 'huā duǒ', english: 'flowers/blossoms' },
]

// Type for sentence items
type WordItem = { word: string; pinyin: string; meaning: string }
type TextItem = { text: string }
type SentenceItem = WordItem | TextItem

function isWordItem(item: SentenceItem): item is WordItem {
  return 'word' in item
}

// ============================================================
// 练习三：《在公共场所吸烟》
// ============================================================

// 描述图片 sentences with audio timing
const smoking_descriptionSentences = [
  {
    start: 9.98,
    end: 19.28,
    chinese: [
      { word: '在', pinyin: 'zài', meaning: 'in' },
      { word: '图片', pinyin: 'tú piàn', meaning: 'picture' },
      { word: '中', pinyin: 'zhōng', meaning: 'middle/in' },
      { text: '，' },
      { word: '我', pinyin: 'wǒ', meaning: 'I' },
      { word: '看到', pinyin: 'kàn dào', meaning: 'see' },
      { word: '在', pinyin: 'zài', meaning: 'at' },
      { word: '购物中心', pinyin: 'gòu wù zhōng xīn', meaning: 'shopping centre' },
      { word: '里', pinyin: 'lǐ', meaning: 'inside' },
      { text: '，' },
      { word: '喷水池', pinyin: 'pēn shuǐ chí', meaning: 'fountain' },
      { word: '旁', pinyin: 'páng', meaning: 'beside' },
      { word: '的', pinyin: 'de', meaning: '(particle)' },
      { word: '圆柱', pinyin: 'yuán zhù', meaning: 'pillar' },
      { word: '上', pinyin: 'shàng', meaning: 'on' },
      { word: '贴', pinyin: 'tiē', meaning: 'pasted' },
      { word: '了', pinyin: 'le', meaning: '(particle)' },
      { word: '一个', pinyin: 'yī gè', meaning: 'one' },
      { word: '告示牌', pinyin: 'gào shì pái', meaning: 'notice board' },
      { text: '，' },
    ] as SentenceItem[],
    english:
      'In the picture, I see in a shopping centre, on the pillar beside the fountain, a notice board is pasted,',
  },
  {
    start: 19.28,
    end: 22.92,
    chinese: [
      { word: '上面', pinyin: 'shàng miàn', meaning: 'on it' },
      { word: '写着', pinyin: 'xiě zhe', meaning: 'written' },
      { text: '"' },
      { word: '禁止', pinyin: 'jìn zhǐ', meaning: 'prohibit' },
      { word: '吸烟', pinyin: 'xī yān', meaning: 'smoking' },
      { text: '"。' },
    ] as SentenceItem[],
    english: 'On it is written "No Smoking".',
  },
  {
    start: 22.92,
    end: 33.08,
    chinese: [
      { word: '可是', pinyin: 'kě shì', meaning: 'but' },
      { word: '有', pinyin: 'yǒu', meaning: 'there is' },
      { word: '一个', pinyin: 'yī gè', meaning: 'one' },
      { word: '中年', pinyin: 'zhōng nián', meaning: 'middle-aged' },
      { word: '男子', pinyin: 'nán zǐ', meaning: 'man' },
      { word: '却', pinyin: 'què', meaning: 'however' },
      { word: '对', pinyin: 'duì', meaning: 'towards' },
      { word: '告示牌', pinyin: 'gào shì pái', meaning: 'notice board' },
      { word: '不加理睬', pinyin: 'bù jiā lǐ cǎi', meaning: 'completely ignore' },
      { text: '，' },
      { word: '继续', pinyin: 'jì xù', meaning: 'continue' },
      { word: '坐在', pinyin: 'zuò zài', meaning: 'sit at' },
      { word: '喷水池', pinyin: 'pēn shuǐ chí', meaning: 'fountain' },
      { word: '边上', pinyin: 'biān shàng', meaning: 'beside' },
      { word: '吸烟', pinyin: 'xī yān', meaning: 'smoking' },
      { text: '。' },
    ] as SentenceItem[],
    english:
      'But a middle-aged man completely ignored the sign and continued to sit by the fountain smoking.',
  },
  {
    start: 33.08,
    end: 41.88,
    chinese: [
      { word: '坐在', pinyin: 'zuò zài', meaning: 'sitting at' },
      { word: '他', pinyin: 'tā', meaning: 'his' },
      { word: '旁边', pinyin: 'páng biān', meaning: 'beside' },
      { word: '的', pinyin: 'de', meaning: '(particle)' },
      { word: '女士', pinyin: 'nǚ shì', meaning: 'lady' },
      { word: '看起来', pinyin: 'kàn qǐ lái', meaning: 'looks like' },
      { word: '很', pinyin: 'hěn', meaning: 'very' },
      { word: '生气', pinyin: 'shēng qì', meaning: 'angry' },
      { text: '，' },
      { word: '连忙', pinyin: 'lián máng', meaning: 'hurriedly' },
      { word: '用', pinyin: 'yòng', meaning: 'use' },
      { word: '手', pinyin: 'shǒu', meaning: 'hand' },
      { word: '捂着', pinyin: 'wǔ zhe', meaning: 'covering' },
      { word: '口鼻', pinyin: 'kǒu bí', meaning: 'mouth and nose' },
      { text: '。' },
    ] as SentenceItem[],
    english:
      'The lady sitting beside him looked very angry and hurriedly covered her mouth and nose with her hand.',
  },
]

// 看法感受 (FORI) sentences with audio timing
const smoking_foriSentences = [
  {
    start: 41.88,
    end: 45.48,
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
    start: 45.48,
    end: 52.12,
    label: 'O=看法',
    chinese: [
      { word: '我', pinyin: 'wǒ', meaning: 'I' },
      { word: '认为', pinyin: 'rèn wéi', meaning: 'think/believe' },
      { word: '在', pinyin: 'zài', meaning: 'at' },
      { word: '公共场所', pinyin: 'gōng gòng chǎng suǒ', meaning: 'public place' },
      { word: '吸烟', pinyin: 'xī yān', meaning: 'smoking' },
      { word: '是', pinyin: 'shì', meaning: 'is' },
      { word: '一种', pinyin: 'yī zhǒng', meaning: 'a kind of' },
      { word: '没有', pinyin: 'méi yǒu', meaning: 'without' },
      { word: '公德心', pinyin: 'gōng dé xīn', meaning: 'civic mindedness' },
      { word: '的', pinyin: 'de', meaning: '(particle)' },
      { word: '行为', pinyin: 'xíng wéi', meaning: 'behavior' },
      { text: '。' },
    ] as SentenceItem[],
    english:
      'I think smoking in public places is a behavior that shows a lack of civic mindedness.',
  },
  {
    start: 52.12,
    end: 63.54,
    label: 'R=原因',
    chinese: [
      { word: '因为', pinyin: 'yīn wèi', meaning: 'because' },
      { word: '他', pinyin: 'tā', meaning: 'he' },
      { word: '这样', pinyin: 'zhè yàng', meaning: 'this way' },
      { word: '做', pinyin: 'zuò', meaning: 'do' },
      { word: '不但', pinyin: 'bú dàn', meaning: 'not only' },
      { word: '会', pinyin: 'huì', meaning: 'will' },
      { word: '污染', pinyin: 'wū rǎn', meaning: 'pollute' },
      { word: '空气', pinyin: 'kōng qì', meaning: 'air' },
      { text: '，' },
      { word: '也', pinyin: 'yě', meaning: 'also' },
      { word: '会', pinyin: 'huì', meaning: 'will' },
      { word: '让', pinyin: 'ràng', meaning: 'let/make' },
      { word: '周围', pinyin: 'zhōu wéi', meaning: 'surroundings' },
      { word: '的', pinyin: 'de', meaning: '(particle)' },
      { word: '人', pinyin: 'rén', meaning: 'people' },
      { word: '吸入', pinyin: 'xī rù', meaning: 'inhale' },
      { word: '二手烟', pinyin: 'èr shǒu yān', meaning: 'secondhand smoke' },
      { text: '，' },
      { word: '危害', pinyin: 'wēi hài', meaning: 'endanger' },
      { word: '别人', pinyin: 'bié rén', meaning: 'other people' },
      { word: '的', pinyin: 'de', meaning: '(particle)' },
      { word: '身体', pinyin: 'shēn tǐ', meaning: 'body' },
      { word: '健康', pinyin: 'jiàn kāng', meaning: 'health' },
      { text: '。' },
    ] as SentenceItem[],
    english:
      'Because doing this will not only pollute the air, but also make the people around inhale secondhand smoke, endangering their health.',
  },
  {
    start: 63.54,
    end: 71.36,
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
      { word: '他', pinyin: 'tā', meaning: 'him' },
      { text: '，' },
      { word: '叫', pinyin: 'jiào', meaning: 'tell' },
      { word: '他', pinyin: 'tā', meaning: 'him' },
      { word: '不要', pinyin: 'bú yào', meaning: 'don\'t' },
      { word: '在', pinyin: 'zài', meaning: 'at' },
      { word: '公共场所', pinyin: 'gōng gòng chǎng suǒ', meaning: 'public place' },
      { word: '吸烟', pinyin: 'xī yān', meaning: 'smoking' },
      { text: '。' },
    ] as SentenceItem[],
    english:
      'If it were me, I would immediately go forward to stop him and tell him not to smoke in public places.',
  },
]

// ============================================================
// 练习四：《采花》
// ============================================================

// 描述图片 sentences with audio timing
const flowers_descriptionSentences = [
  {
    start: 4.16,
    end: 11.98,
    chinese: [
      { word: '在', pinyin: 'zài', meaning: 'in' },
      { word: '图片', pinyin: 'tú piàn', meaning: 'picture' },
      { word: '中', pinyin: 'zhōng', meaning: 'middle/in' },
      { text: '，' },
      { word: '我', pinyin: 'wǒ', meaning: 'I' },
      { word: '看到', pinyin: 'kàn dào', meaning: 'see' },
      { word: '公园', pinyin: 'gōng yuán', meaning: 'park' },
      { word: '里', pinyin: 'lǐ', meaning: 'inside' },
      { text: '，' },
      { word: '有', pinyin: 'yǒu', meaning: 'there is' },
      { word: '一位', pinyin: 'yī wèi', meaning: 'one (person)' },
      { word: '头发', pinyin: 'tóu fa', meaning: 'hair' },
      { word: '花白', pinyin: 'huā bái', meaning: 'grey/white' },
      { word: '的', pinyin: 'de', meaning: '(particle)' },
      { word: '老爷爷', pinyin: 'lǎo yé ye', meaning: 'old grandpa' },
      { word: '正', pinyin: 'zhèng', meaning: 'currently' },
      { word: '坐在', pinyin: 'zuò zài', meaning: 'sitting on' },
      { word: '长椅', pinyin: 'cháng yǐ', meaning: 'bench' },
      { word: '上', pinyin: 'shàng', meaning: 'on' },
      { word: '看', pinyin: 'kàn', meaning: 'reading' },
      { word: '报纸', pinyin: 'bào zhǐ', meaning: 'newspaper' },
      { text: '。' },
    ] as SentenceItem[],
    english:
      'In the picture, I see in the park, an old grandpa with grey hair is sitting on a bench reading the newspaper.',
  },
  {
    start: 12.42,
    end: 16.28,
    chinese: [
      { word: '在', pinyin: 'zài', meaning: 'at' },
      { word: '他', pinyin: 'tā', meaning: 'his' },
      { word: '的', pinyin: 'de', meaning: '(particle)' },
      { word: '对面', pinyin: 'duì miàn', meaning: 'opposite' },
      { text: '，' },
      { word: '有', pinyin: 'yǒu', meaning: 'there is' },
      { word: '一位', pinyin: 'yī wèi', meaning: 'one (person)' },
      { word: '小', pinyin: 'xiǎo', meaning: 'little' },
      { word: '女生', pinyin: 'nǚ shēng', meaning: 'girl' },
      { word: '正', pinyin: 'zhèng', meaning: 'currently' },
      { word: '准备', pinyin: 'zhǔn bèi', meaning: 'about to' },
      { word: '采花', pinyin: 'cǎi huā', meaning: 'pick flowers' },
      { text: '。' },
    ] as SentenceItem[],
    english:
      'Opposite him, a little girl is about to pick flowers.',
  },
  {
    start: 17.16,
    end: 22.44,
    chinese: [
      { word: '一位', pinyin: 'yī wèi', meaning: 'one (person)' },
      { word: '正在', pinyin: 'zhèng zài', meaning: 'currently' },
      { word: '跑步', pinyin: 'pǎo bù', meaning: 'jogging' },
      { word: '的', pinyin: 'de', meaning: '(particle)' },
      { word: '女生', pinyin: 'nǚ shēng', meaning: 'girl' },
      { word: '看见', pinyin: 'kàn jiàn', meaning: 'saw' },
      { word: '了', pinyin: 'le', meaning: '(particle)' },
      { text: '，' },
      { word: '急忙', pinyin: 'jí máng', meaning: 'hurriedly' },
      { word: '跑上前', pinyin: 'pǎo shàng qián', meaning: 'ran forward' },
      { word: '阻止', pinyin: 'zǔ zhǐ', meaning: 'stop' },
      { word: '她', pinyin: 'tā', meaning: 'her' },
      { text: '。' },
    ] as SentenceItem[],
    english:
      'A girl who was jogging saw this, and hurriedly ran forward to stop her.',
  },
]

// 看法感受 (FORI) sentences with audio timing
const flowers_foriSentences = [
  {
    start: 23.04,
    end: 26.24,
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
    start: 26.78,
    end: 30.74,
    label: 'O=看法',
    chinese: [
      { word: '我', pinyin: 'wǒ', meaning: 'I' },
      { word: '认为', pinyin: 'rèn wéi', meaning: 'think/believe' },
      { word: '采花', pinyin: 'cǎi huā', meaning: 'pick flowers' },
      { word: '是', pinyin: 'shì', meaning: 'is' },
      { word: '一种', pinyin: 'yī zhǒng', meaning: 'a kind of' },
      { word: '没有', pinyin: 'méi yǒu', meaning: 'without' },
      { word: '公德心', pinyin: 'gōng dé xīn', meaning: 'civic mindedness' },
      { word: '的', pinyin: 'de', meaning: '(particle)' },
      { word: '行为', pinyin: 'xíng wéi', meaning: 'behavior' },
      { text: '。' },
    ] as SentenceItem[],
    english:
      'I think picking flowers is a behavior that shows a lack of civic mindedness.',
  },
  {
    start: 31.14,
    end: 40.40,
    label: 'R=原因',
    chinese: [
      { word: '因为', pinyin: 'yīn wèi', meaning: 'because' },
      { word: '公园', pinyin: 'gōng yuán', meaning: 'park' },
      { word: '里', pinyin: 'lǐ', meaning: 'inside' },
      { word: '的', pinyin: 'de', meaning: '(particle)' },
      { word: '花', pinyin: 'huā', meaning: 'flowers' },
      { word: '是', pinyin: 'shì', meaning: 'is' },
      { word: '给', pinyin: 'gěi', meaning: 'for' },
      { word: '大家', pinyin: 'dà jiā', meaning: 'everyone' },
      { word: '观赏', pinyin: 'guān shǎng', meaning: 'admire' },
      { word: '的', pinyin: 'de', meaning: '(particle)' },
      { text: '，' },
      { word: '如果', pinyin: 'rú guǒ', meaning: 'if' },
      { word: '人人', pinyin: 'rén rén', meaning: 'everyone' },
      { word: '都', pinyin: 'dōu', meaning: 'all' },
      { word: '采花', pinyin: 'cǎi huā', meaning: 'pick flowers' },
      { text: '，' },
      { word: '那么', pinyin: 'nà me', meaning: 'then' },
      { word: '公园', pinyin: 'gōng yuán', meaning: 'park' },
      { word: '里', pinyin: 'lǐ', meaning: 'inside' },
      { word: '就', pinyin: 'jiù', meaning: 'then' },
      { word: '不会', pinyin: 'bú huì', meaning: 'will not' },
      { word: '再', pinyin: 'zài', meaning: 'again' },
      { word: '有', pinyin: 'yǒu', meaning: 'have' },
      { word: '美丽', pinyin: 'měi lì', meaning: 'beautiful' },
      { word: '的', pinyin: 'de', meaning: '(particle)' },
      { word: '花朵', pinyin: 'huā duǒ', meaning: 'flowers' },
      { word: '了', pinyin: 'le', meaning: '(particle)' },
      { text: '。' },
    ] as SentenceItem[],
    english:
      'Because the flowers in the park are for everyone to admire. If everyone picks flowers, then the park will no longer have beautiful flowers.',
  },
  {
    start: 41.08,
    end: 48.78,
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
      { word: '女生', pinyin: 'nǚ shēng', meaning: 'girl' },
      { word: '一样', pinyin: 'yī yàng', meaning: 'the same' },
      { text: '，' },
      { word: '立刻', pinyin: 'lì kè', meaning: 'immediately' },
      { word: '走上前', pinyin: 'zǒu shàng qián', meaning: 'walk forward' },
      { word: '去', pinyin: 'qù', meaning: 'go' },
      { word: '阻止', pinyin: 'zǔ zhǐ', meaning: 'stop' },
      { word: '她', pinyin: 'tā', meaning: 'her' },
      { text: '，' },
      { word: '叫', pinyin: 'jiào', meaning: 'tell' },
      { word: '她', pinyin: 'tā', meaning: 'her' },
      { word: '不要', pinyin: 'bú yào', meaning: 'don\'t' },
      { word: '采花', pinyin: 'cǎi huā', meaning: 'pick flowers' },
      { text: '。' },
    ] as SentenceItem[],
    english:
      'If it were me, I would also be like that girl, immediately go forward to stop her and tell her not to pick flowers.',
  },
]

// Combine all timed sentences for each exercise
const smoking_allTimed = [...smoking_descriptionSentences, ...smoking_foriSentences]
const flowers_allTimed = [...flowers_descriptionSentences, ...flowers_foriSentences]

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

const STORAGE_KEY = 'koushi_no_civic_mindedness_2_learned'

function KoushiNoCivicMindedness2Page() {
  const [learnedWords, setLearnedWords] = useState<Set<string>>(new Set())
  const [currentPopup, setCurrentPopup] = useState<{
    word: string
    pinyin: string
    meaning: string
  } | null>(null)
  const [currentPracticeWord, setCurrentPracticeWord] = useState<
    (typeof vocabulary)[0] | null
  >(null)
  const [smokingHighlight, setSmokingHighlight] = useState<number | null>(null)
  const [flowersHighlight, setFlowersHighlight] = useState<number | null>(null)

  const smokingAudioRef = useRef<HTMLAudioElement>(null)
  const flowersAudioRef = useRef<HTMLAudioElement>(null)

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

  // Handle smoking audio time update
  useEffect(() => {
    const audio = smokingAudioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      const currentTime = audio.currentTime
      let foundIndex: number | null = null
      for (let i = 0; i < smoking_allTimed.length; i++) {
        const sentence = smoking_allTimed[i]
        if (currentTime >= sentence.start && currentTime < sentence.end) {
          foundIndex = i
          break
        }
      }
      setSmokingHighlight(foundIndex)
    }

    const handleEnded = () => setSmokingHighlight(null)

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  // Handle flowers audio time update
  useEffect(() => {
    const audio = flowersAudioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      const currentTime = audio.currentTime
      let foundIndex: number | null = null
      for (let i = 0; i < flowers_allTimed.length; i++) {
        const sentence = flowers_allTimed[i]
        if (currentTime >= sentence.start && currentTime < sentence.end) {
          foundIndex = i
          break
        }
      }
      setFlowersHighlight(foundIndex)
    }

    const handleEnded = () => setFlowersHighlight(null)

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  // Play audio helpers
  const playSmokingAudio = useCallback(() => {
    smokingAudioRef.current?.play()
  }, [])

  const playFlowersAudio = useCallback(() => {
    flowersAudioRef.current?.play()
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
      const sa = smokingAudioRef.current
      if (sa && !sa.paused) sa.pause()
      const fa = flowersAudioRef.current
      if (fa && !fa.paused) fa.pause()

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

  // Offsets for highlighting
  const smokingDescOffset = 0
  const smokingForiOffset = smoking_descriptionSentences.length
  const flowersDescOffset = 0
  const flowersForiOffset = flowers_descriptionSentences.length

  return (
    <div className="koushi-page">
      <div className="lesson-header lesson-header-orange">
        <h1>
          <span className="koushi-word" onClick={() => handleWordClick('口试', 'kǒu shì', 'oral exam')}>口试</span>
          <span className="koushi-word" onClick={() => handleWordClick('练习', 'liàn xí', 'practice')}>练习</span>
          ：
          <span className="koushi-word" onClick={() => handleWordClick('没有', 'méi yǒu', 'without')}>没有</span>
          <span className="koushi-word" onClick={() => handleWordClick('公德心', 'gōng dé xīn', 'civic mindedness')}>公德心</span>
          （二）
        </h1>
        <div className="lesson-subtitle">
          P3HCL W14 口试 - No Civic Mindedness (Part 2)
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
        {/* 练习三：《在公共场所吸烟》 */}
        {/* ============================================================ */}
        <div className="section-title" style={{ fontSize: '1.3rem' }}>
          练习三：《
          <span className="koushi-word" onClick={() => handleWordClick('在', 'zài', 'at')}>在</span>
          <span className="koushi-word" onClick={() => handleWordClick('公共场所', 'gōng gòng chǎng suǒ', 'public place')}>公共场所</span>
          <span className="koushi-word" onClick={() => handleWordClick('吸烟', 'xī yān', 'smoking')}>吸烟</span>
          》
        </div>

        {/* Smoking Audio Player */}
        <div className="audio-player-sticky">
          <div style={{ fontWeight: 500, marginBottom: '10px' }}>
            <span className="koushi-word" onClick={() => handleWordClick('朗读', 'lǎng dú', 'read aloud')}>朗读</span>
            <span className="koushi-word" onClick={() => handleWordClick('音频', 'yīn pín', 'audio')}>音频</span>
            （练习三）
          </div>
          <audio ref={smokingAudioRef} controls preload="none">
            <source
              src="/audio/no-civic-mindedness/smoking.mp4"
              type="audio/mp4"
            />
            您的浏览器不支持音频播放。
          </audio>
          <button
            className="control-btn"
            onClick={playSmokingAudio}
            style={{ marginTop: '8px' }}
          >
            播放音频
          </button>
        </div>

        {/* 一、描述图片 */}
        <div className="question-box">
          <h3>
            一、
            <span className="koushi-word" onClick={() => handleWordClick('描述', 'miáo shù', 'describe')}>描述</span>
            <span className="koushi-word" onClick={() => handleWordClick('图片', 'tú piàn', 'picture')}>图片</span>
            ：
          </h3>
          <div className="story-text">
            {smoking_descriptionSentences.map((sentence, index) => (
              <Sentence
                key={index}
                sentence={sentence}
                isHighlighted={smokingHighlight === smokingDescOffset + index}
                onWordClick={handleWordClick}
              />
            ))}
          </div>
        </div>

        {/* 二、看法感受 (FORI) */}
        <div className="question-box">
          <h3>
            二、
            <span className="koushi-word" onClick={() => handleWordClick('看法', 'kàn fǎ', 'opinion')}>看法</span>
            <span className="koushi-word" onClick={() => handleWordClick('感受', 'gǎn shòu', 'feelings')}>感受</span>
            ：
          </h3>
          <div className="reflection-text">
            {smoking_foriSentences.map((sentence, index) => (
              <div key={index}>
                <div
                  className="reflection-label"
                  style={index > 0 ? { marginTop: '15px' } : {}}
                >
                  {sentence.label}
                </div>
                <Sentence
                  sentence={sentence}
                  isHighlighted={smokingHighlight === smokingForiOffset + index}
                  onWordClick={handleWordClick}
                />
              </div>
            ))}
          </div>
          <div className="hint-box">
            <strong>
              <span className="koushi-word" onClick={() => handleWordClick('提示', 'tí shì', 'hint/tip')}>提示</span>
              ：
            </strong>
            <ul>
              <li>
                <span className="koushi-word" onClick={() => handleWordClick('点击', 'diǎn jī', 'click/tap')}>点击</span>
                <span className="koushi-word" onClick={() => handleWordClick('任何', 'rèn hé', 'any')}>任何</span>
                <span className="koushi-word" onClick={() => handleWordClick('词语', 'cí yǔ', 'words/vocabulary')}>词语</span>
                <span className="koushi-word" onClick={() => handleWordClick('查看', 'chá kàn', 'view/check')}>查看</span>
                <span className="koushi-word" onClick={() => handleWordClick('拼音', 'pīn yīn', 'pinyin')}>拼音</span>
                、
                <span className="koushi-word" onClick={() => handleWordClick('英文', 'yīng wén', 'English')}>英文</span>
                <span className="koushi-word" onClick={() => handleWordClick('翻译', 'fān yì', 'translation')}>翻译</span>
                <span className="koushi-word" onClick={() => handleWordClick('和', 'hé', 'and')}>和</span>
                <span className="koushi-word" onClick={() => handleWordClick('听', 'tīng', 'listen')}>听</span>
                <span className="koushi-word" onClick={() => handleWordClick('发音', 'fā yīn', 'pronunciation')}>发音</span>
              </li>
              <li>
                <span className="koushi-word" onClick={() => handleWordClick('播放', 'bō fàng', 'play')}>播放</span>
                <span className="koushi-word" onClick={() => handleWordClick('音频', 'yīn pín', 'audio')}>音频</span>
                <span className="koushi-word" onClick={() => handleWordClick('时', 'shí', 'when')}>时</span>
                ，
                <span className="koushi-word" onClick={() => handleWordClick('句子', 'jù zi', 'sentence')}>句子</span>
                <span className="koushi-word" onClick={() => handleWordClick('会', 'huì', 'will')}>会</span>
                <span className="koushi-word" onClick={() => handleWordClick('同步', 'tóng bù', 'synchronize')}>同步</span>
                <span className="koushi-word" onClick={() => handleWordClick('高亮', 'gāo liàng', 'highlight')}>高亮</span>
                <span className="koushi-word" onClick={() => handleWordClick('显示', 'xiǎn shì', 'display')}>显示</span>
                <span className="koushi-word" onClick={() => handleWordClick('英文', 'yīng wén', 'English')}>英文</span>
                <span className="koushi-word" onClick={() => handleWordClick('翻译', 'fān yì', 'translation')}>翻译</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 练习四：《采花》 */}
        {/* ============================================================ */}
        <div className="section-title" style={{ fontSize: '1.3rem', marginTop: '30px' }}>
          练习四：《
          <span className="koushi-word" onClick={() => handleWordClick('采花', 'cǎi huā', 'pick flowers')}>采花</span>
          》
        </div>

        {/* Flowers Audio Player */}
        <div className="audio-player-sticky">
          <div style={{ fontWeight: 500, marginBottom: '10px' }}>
            <span className="koushi-word" onClick={() => handleWordClick('朗读', 'lǎng dú', 'read aloud')}>朗读</span>
            <span className="koushi-word" onClick={() => handleWordClick('音频', 'yīn pín', 'audio')}>音频</span>
            （练习四）
          </div>
          <audio ref={flowersAudioRef} controls preload="none">
            <source
              src="/audio/no-civic-mindedness/picking-flowers.mp4"
              type="audio/mp4"
            />
            您的浏览器不支持音频播放。
          </audio>
          <button
            className="control-btn"
            onClick={playFlowersAudio}
            style={{ marginTop: '8px' }}
          >
            播放音频
          </button>
        </div>

        {/* 一、描述图片 */}
        <div className="question-box">
          <h3>
            一、
            <span className="koushi-word" onClick={() => handleWordClick('描述', 'miáo shù', 'describe')}>描述</span>
            <span className="koushi-word" onClick={() => handleWordClick('图片', 'tú piàn', 'picture')}>图片</span>
            ：
          </h3>
          <div className="story-text">
            {flowers_descriptionSentences.map((sentence, index) => (
              <Sentence
                key={index}
                sentence={sentence}
                isHighlighted={flowersHighlight === flowersDescOffset + index}
                onWordClick={handleWordClick}
              />
            ))}
          </div>
        </div>

        {/* 二、看法感受 (FORI) */}
        <div className="question-box">
          <h3>
            二、
            <span className="koushi-word" onClick={() => handleWordClick('看法', 'kàn fǎ', 'opinion')}>看法</span>
            <span className="koushi-word" onClick={() => handleWordClick('感受', 'gǎn shòu', 'feelings')}>感受</span>
            ：
          </h3>
          <div className="reflection-text">
            {flowers_foriSentences.map((sentence, index) => (
              <div key={index}>
                <div
                  className="reflection-label"
                  style={index > 0 ? { marginTop: '15px' } : {}}
                >
                  {sentence.label}
                </div>
                <Sentence
                  sentence={sentence}
                  isHighlighted={flowersHighlight === flowersForiOffset + index}
                  onWordClick={handleWordClick}
                />
              </div>
            ))}
          </div>
          <div className="hint-box">
            <strong>
              <span className="koushi-word" onClick={() => handleWordClick('提示', 'tí shì', 'hint/tip')}>提示</span>
              ：
            </strong>
            <ul>
              <li>
                <span className="koushi-word" onClick={() => handleWordClick('点击', 'diǎn jī', 'click/tap')}>点击</span>
                <span className="koushi-word" onClick={() => handleWordClick('任何', 'rèn hé', 'any')}>任何</span>
                <span className="koushi-word" onClick={() => handleWordClick('词语', 'cí yǔ', 'words/vocabulary')}>词语</span>
                <span className="koushi-word" onClick={() => handleWordClick('查看', 'chá kàn', 'view/check')}>查看</span>
                <span className="koushi-word" onClick={() => handleWordClick('拼音', 'pīn yīn', 'pinyin')}>拼音</span>
                、
                <span className="koushi-word" onClick={() => handleWordClick('英文', 'yīng wén', 'English')}>英文</span>
                <span className="koushi-word" onClick={() => handleWordClick('翻译', 'fān yì', 'translation')}>翻译</span>
                <span className="koushi-word" onClick={() => handleWordClick('和', 'hé', 'and')}>和</span>
                <span className="koushi-word" onClick={() => handleWordClick('听', 'tīng', 'listen')}>听</span>
                <span className="koushi-word" onClick={() => handleWordClick('发音', 'fā yīn', 'pronunciation')}>发音</span>
              </li>
              <li>
                <span className="koushi-word" onClick={() => handleWordClick('播放', 'bō fàng', 'play')}>播放</span>
                <span className="koushi-word" onClick={() => handleWordClick('音频', 'yīn pín', 'audio')}>音频</span>
                <span className="koushi-word" onClick={() => handleWordClick('时', 'shí', 'when')}>时</span>
                ，
                <span className="koushi-word" onClick={() => handleWordClick('句子', 'jù zi', 'sentence')}>句子</span>
                <span className="koushi-word" onClick={() => handleWordClick('会', 'huì', 'will')}>会</span>
                <span className="koushi-word" onClick={() => handleWordClick('同步', 'tóng bù', 'synchronize')}>同步</span>
                <span className="koushi-word" onClick={() => handleWordClick('高亮', 'gāo liàng', 'highlight')}>高亮</span>
                <span className="koushi-word" onClick={() => handleWordClick('显示', 'xiǎn shì', 'display')}>显示</span>
                <span className="koushi-word" onClick={() => handleWordClick('英文', 'yīng wén', 'English')}>英文</span>
                <span className="koushi-word" onClick={() => handleWordClick('翻译', 'fān yì', 'translation')}>翻译</span>
              </li>
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
