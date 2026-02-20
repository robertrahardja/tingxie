import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef, useCallback } from 'react'

export const Route = createFileRoute('/koushi-traffic-safety')({
  component: KoushiTrafficSafetyPage,
})

// Vocabulary data
const vocabulary = [
  { chinese: '注意', pinyin: 'zhù yì', english: 'attention/pay attention' },
  { chinese: '安全', pinyin: 'ān quán', english: 'safety' },
  { chinese: '遵守', pinyin: 'zūn shǒu', english: 'obey/follow' },
  { chinese: '交通规则', pinyin: 'jiāo tōng guī zé', english: 'traffic rules' },
  { chinese: '不耐烦', pinyin: 'bù nài fán', english: 'impatient' },
  { chinese: '转绿', pinyin: 'zhuǎn lǜ', english: 'turn green' },
  { chinese: '驶过来', pinyin: 'shǐ guò lái', english: 'drive past' },
  { chinese: '撞到', pinyin: 'zhuàng dào', english: 'crash into' },
  { chinese: '连忙', pinyin: 'lián máng', english: 'hurriedly' },
  { chinese: '危险', pinyin: 'wēi xiǎn', english: 'dangerous' },
  {
    chinese: '马路如虎口',
    pinyin: 'mǎ lù rú hǔ kǒu',
    english: "road is like a tiger's mouth",
  },
  {
    chinese: '不堪设想',
    pinyin: 'bù kān shè xiǎng',
    english: 'hard to imagine (consequences)',
  },
  {
    chinese: '印象深刻',
    pinyin: 'yìn xiàng shēn kè',
    english: 'deep impression',
  },
  { chinese: '停下来', pinyin: 'tíng xià lái', english: 'stop' },
  { chinese: '来往', pinyin: 'lái wǎng', english: 'come and go' },
  { chinese: '批评', pinyin: 'pī píng', english: 'criticize' },
  { chinese: '惭愧', pinyin: 'cán kuì', english: 'ashamed' },
  { chinese: '收起来', pinyin: 'shōu qǐ lái', english: 'put away' },
]

// Story sentences with audio timing for Question 1 content
const storySentences = [
  {
    start: 40.06,
    end: 51.64,
    label: null,
    chinese: [
      { word: '一天', pinyin: 'yī tiān', meaning: 'one day' },
      { word: '下午', pinyin: 'xià wǔ', meaning: 'afternoon' },
      { text: '，' },
      { word: '有', pinyin: 'yǒu', meaning: 'there is' },
      { word: '一个', pinyin: 'yī gè', meaning: 'one' },
      { word: '戴着', pinyin: 'dài zhe', meaning: 'wearing' },
      { word: '眼镜', pinyin: 'yǎn jìng', meaning: 'glasses' },
      { text: '，' },
      { word: '穿着', pinyin: 'chuān zhe', meaning: 'wearing (clothes)' },
      { word: '红色', pinyin: 'hóng sè', meaning: 'red' },
      { word: '上衣', pinyin: 'shàng yī', meaning: 'upper garment/top' },
      { word: '的', pinyin: 'de', meaning: '(particle)' },
      { word: '男生', pinyin: 'nán shēng', meaning: 'boy' },
      { text: '，' },
      { word: '一直', pinyin: 'yī zhí', meaning: 'continuously' },
      { word: '不停', pinyin: 'bù tíng', meaning: 'non-stop' },
      { word: '地', pinyin: 'de', meaning: '(adverb marker)' },
      { word: '低头', pinyin: 'dī tóu', meaning: 'lower head' },
      { word: '看', pinyin: 'kàn', meaning: 'look at' },
      { word: '手表', pinyin: 'shǒu biǎo', meaning: 'watch' },
      { text: '，' },
    ],
    labels: [
      { text: '时间', position: 0 },
      { text: '人物', position: 3 },
    ],
    english:
      'One afternoon, a boy wearing glasses and a red top kept lowering his head to look at his watch,',
  },
  {
    start: 52.26,
    end: 60.94,
    label: null,
    chinese: [
      { word: '看起来', pinyin: 'kàn qǐ lái', meaning: 'looks like' },
      { word: '等', pinyin: 'děng', meaning: 'wait' },
      { word: '得', pinyin: 'de', meaning: '(complement marker)' },
      { word: '不耐烦', pinyin: 'bù nài fán', meaning: 'impatient' },
      { word: '了', pinyin: 'le', meaning: '(particle)' },
      { text: '，' },
      { word: '没', pinyin: 'méi', meaning: 'not' },
      { word: '等', pinyin: 'děng', meaning: 'wait' },
      { word: '红灯', pinyin: 'hóng dēng', meaning: 'red light' },
      { word: '转绿', pinyin: 'zhuǎn lǜ', meaning: 'turn green' },
      { word: '就', pinyin: 'jiù', meaning: 'then' },
      { word: '开始', pinyin: 'kāi shǐ', meaning: 'start' },
      { word: '过马路', pinyin: 'guò mǎ lù', meaning: 'cross the road' },
      { text: '。' },
    ],
    labels: [{ text: '起因', position: 0 }],
    english:
      'He looked impatient from waiting and started crossing the road before the red light turned green.',
  },
  {
    start: 61.56,
    end: 69.06,
    label: null,
    chinese: [
      { word: '刚好', pinyin: 'gāng hǎo', meaning: 'just then' },
      { word: '一辆', pinyin: 'yī liàng', meaning: 'one (vehicle)' },
      { word: '车子', pinyin: 'chē zi', meaning: 'car' },
      { word: '驶过来', pinyin: 'shǐ guò lái', meaning: 'drove past' },
      { text: '，' },
      { word: '眼看', pinyin: 'yǎn kàn', meaning: 'about to/on the verge' },
      { word: '就要', pinyin: 'jiù yào', meaning: 'about to' },
      { word: '撞到', pinyin: 'zhuàng dào', meaning: 'crash into' },
      { word: '这个', pinyin: 'zhè ge', meaning: 'this' },
      { word: '男生', pinyin: 'nán shēng', meaning: 'boy' },
      { text: '。' },
    ],
    labels: [{ text: '经过', position: 0 }],
    english:
      'Just then a car drove past, and it was about to crash into the boy.',
  },
  {
    start: 69.06,
    end: 83.80,
    label: null,
    chinese: [
      { word: '幸好', pinyin: 'xìng hǎo', meaning: 'fortunately' },
      { word: '另一个', pinyin: 'lìng yī gè', meaning: 'another' },
      { word: '穿着', pinyin: 'chuān zhe', meaning: 'wearing' },
      { word: '白色', pinyin: 'bái sè', meaning: 'white' },
      { word: '上衣', pinyin: 'shàng yī', meaning: 'top' },
      { word: '的', pinyin: 'de', meaning: '(particle)' },
      { word: '男孩', pinyin: 'nán hái', meaning: 'boy' },
      { word: '看见', pinyin: 'kàn jiàn', meaning: 'saw' },
      { word: '了', pinyin: 'le', meaning: '(particle)' },
      { text: '，' },
      { word: '连忙', pinyin: 'lián máng', meaning: 'hurriedly' },
      { word: '上前', pinyin: 'shàng qián', meaning: 'step forward' },
      { word: '拉住', pinyin: 'lā zhù', meaning: 'grab/hold' },
      { word: '他', pinyin: 'tā', meaning: 'him' },
      { text: '，' },
      { word: '告诉', pinyin: 'gào su', meaning: 'tell' },
      { word: '他', pinyin: 'tā', meaning: 'him' },
      { word: '应该', pinyin: 'yīng gāi', meaning: 'should' },
      { word: '等', pinyin: 'děng', meaning: 'wait' },
      { word: '红灯', pinyin: 'hóng dēng', meaning: 'red light' },
      { word: '转绿', pinyin: 'zhuǎn lǜ', meaning: 'turn green' },
      { word: '才能', pinyin: 'cái néng', meaning: 'only then can' },
      { word: '过马路', pinyin: 'guò mǎ lù', meaning: 'cross the road' },
      { text: '。' },
    ],
    labels: [{ text: '结果', position: 0 }],
    english:
      'Fortunately, another boy in a white top saw this, hurried forward to grab him, and told him he should wait for the red light to turn green before crossing the road.',
  },
]

// Summary sentences with audio timing (FORI framework)
const summarySentences = [
  {
    start: 85.28,
    end: 90.16,
    label: 'F=感受',
    chinese: [
      { word: '看了', pinyin: 'kàn le', meaning: 'watched' },
      { word: '这段', pinyin: 'zhè duàn', meaning: 'this' },
      { word: '视频', pinyin: 'shì pín', meaning: 'video' },
      { text: '，' },
      { word: '我', pinyin: 'wǒ', meaning: 'I' },
      { word: '感到', pinyin: 'gǎn dào', meaning: 'feel' },
      { word: '很', pinyin: 'hěn', meaning: 'very' },
      { word: '担心', pinyin: 'dān xīn', meaning: 'worried' },
      { text: '。' },
    ],
    english: 'After watching this video, I felt very worried.',
  },
  {
    start: 90.16,
    end: 95.80,
    label: 'O=看法',
    chinese: [
      { word: '我', pinyin: 'wǒ', meaning: 'I' },
      { word: '认为', pinyin: 'rèn wéi', meaning: 'think/believe' },
      { word: '男生', pinyin: 'nán shēng', meaning: 'boy' },
      { word: '的', pinyin: 'de', meaning: '(particle)' },
      { word: '行为', pinyin: 'xíng wéi', meaning: 'behavior' },
      { word: '是', pinyin: 'shì', meaning: 'is' },
      { word: '十分', pinyin: 'shí fēn', meaning: 'very' },
      { word: '危险', pinyin: 'wēi xiǎn', meaning: 'dangerous' },
      { word: '的', pinyin: 'de', meaning: '(particle)' },
      { text: '。' },
    ],
    english: "I think the boy's behavior is very dangerous.",
  },
  {
    start: 96.38,
    end: 114.58,
    label: 'R=原因',
    chinese: [
      { word: '俗话', pinyin: 'sú huà', meaning: 'proverb' },
      { word: '说', pinyin: 'shuō', meaning: 'says' },
      { text: '"' },
      { word: '马路如虎口', pinyin: 'mǎ lù rú hǔ kǒu', meaning: "road is like a tiger's mouth" },
      { text: '"，' },
      { word: '我们', pinyin: 'wǒ men', meaning: 'we' },
      { word: '在', pinyin: 'zài', meaning: 'when' },
      { word: '过马路', pinyin: 'guò mǎ lù', meaning: 'crossing the road' },
      { word: '时', pinyin: 'shí', meaning: 'when' },
      { word: '一定', pinyin: 'yī dìng', meaning: 'must' },
      { word: '要', pinyin: 'yào', meaning: 'need to' },
      { word: '遵守', pinyin: 'zūn shǒu', meaning: 'follow/obey' },
      { word: '交通规则', pinyin: 'jiāo tōng guī zé', meaning: 'traffic rules' },
      { text: '，' },
      { word: '注意', pinyin: 'zhù yì', meaning: 'pay attention' },
      { word: '安全', pinyin: 'ān quán', meaning: 'safety' },
      { text: '。' },
      { word: '一旦', pinyin: 'yī dàn', meaning: 'once' },
      { word: '发生', pinyin: 'fā shēng', meaning: 'happen' },
      { word: '意外', pinyin: 'yì wài', meaning: 'accident' },
      { text: '，' },
      { word: '后果', pinyin: 'hòu guǒ', meaning: 'consequences' },
      { word: '将', pinyin: 'jiāng', meaning: 'will' },
      { word: '不堪设想', pinyin: 'bù kān shè xiǎng', meaning: 'hard to imagine' },
      { text: '。' },
    ],
    english:
      'As the saying goes, "the road is like a tiger\'s mouth." We must follow traffic rules and pay attention to safety when crossing the road. Once an accident happens, the consequences are unimaginable.',
  },
  {
    start: 114.58,
    end: 126.46,
    label: 'I=如果',
    chinese: [
      { word: '如果', pinyin: 'rú guǒ', meaning: 'if' },
      { word: '我', pinyin: 'wǒ', meaning: 'I' },
      { word: '是', pinyin: 'shì', meaning: 'am' },
      { word: '录像', pinyin: 'lù xiàng', meaning: 'video/recording' },
      { word: '中', pinyin: 'zhōng', meaning: 'in' },
      { word: '的', pinyin: 'de', meaning: '(particle)' },
      { word: '男生', pinyin: 'nán shēng', meaning: 'boy' },
      { text: '，' },
      { word: '我', pinyin: 'wǒ', meaning: 'I' },
      { word: '会', pinyin: 'huì', meaning: 'will' },
      { word: '遵守', pinyin: 'zūn shǒu', meaning: 'follow/obey' },
      { word: '交通规则', pinyin: 'jiāo tōng guī zé', meaning: 'traffic rules' },
      { text: '，' },
      { word: '等', pinyin: 'děng', meaning: 'wait' },
      { word: '绿灯', pinyin: 'lǜ dēng', meaning: 'green light' },
      { word: '亮了', pinyin: 'liàng le', meaning: 'turned on' },
      { word: '才', pinyin: 'cái', meaning: 'only then' },
      { word: '过马路', pinyin: 'guò mǎ lù', meaning: 'cross the road' },
      { text: '。' },
    ],
    english:
      'If I were the boy in the video, I would follow traffic rules and only cross the road when the green light is on.',
  },
]

// Question 2 sentences with audio timing
const question2Sentences = [
  {
    start: 139.52,
    end: 146.10,
    label: null,
    chinese: [
      { word: '我', pinyin: 'wǒ', meaning: 'I' },
      { word: '在', pinyin: 'zài', meaning: 'when' },
      { word: '过马路', pinyin: 'guò mǎ lù', meaning: 'crossing the road' },
      { word: '的', pinyin: 'de', meaning: '(particle)' },
      { word: '时候', pinyin: 'shí hou', meaning: 'time' },
      { word: '有', pinyin: 'yǒu', meaning: 'have' },
      { word: '看见', pinyin: 'kàn jiàn', meaning: 'seen' },
      { word: '过', pinyin: 'guò', meaning: '(experience marker)' },
      { word: '让', pinyin: 'ràng', meaning: 'make/let' },
      { word: '我', pinyin: 'wǒ', meaning: 'me' },
      { word: '印象深刻', pinyin: 'yìn xiàng shēn kè', meaning: 'deep impression' },
      { word: '的', pinyin: 'de', meaning: '(particle)' },
      { word: '事情', pinyin: 'shì qing', meaning: 'things' },
      { text: '。' },
    ],
    labels: [],
    english:
      'I have seen things that left a deep impression on me while crossing the road.',
  },
  {
    start: 147.18,
    end: 163.30,
    label: null,
    chinese: [
      { word: '记得', pinyin: 'jì de', meaning: 'remember' },
      { word: '一天', pinyin: 'yī tiān', meaning: 'one day' },
      { word: '下午', pinyin: 'xià wǔ', meaning: 'afternoon' },
      { word: '放学', pinyin: 'fàng xué', meaning: 'after school' },
      { word: '后', pinyin: 'hòu', meaning: 'after' },
      { text: '，' },
      { word: '我', pinyin: 'wǒ', meaning: 'I' },
      { word: '背着', pinyin: 'bēi zhe', meaning: 'carrying on back' },
      { word: '书包', pinyin: 'shū bāo', meaning: 'school bag' },
      { text: '，' },
      { word: '走在', pinyin: 'zǒu zài', meaning: 'walking on' },
      { word: '放学', pinyin: 'fàng xué', meaning: 'after school' },
      { word: '回家', pinyin: 'huí jiā', meaning: 'going home' },
      { word: '的', pinyin: 'de', meaning: '(particle)' },
      { word: '路上', pinyin: 'lù shàng', meaning: 'on the road' },
      { text: '，' },
      { word: '看见', pinyin: 'kàn jiàn', meaning: 'saw' },
      { word: '了', pinyin: 'le', meaning: '(particle)' },
      { word: '两个', pinyin: 'liǎng gè', meaning: 'two' },
      { word: '戴', pinyin: 'dài', meaning: 'wearing' },
      { word: '眼镜', pinyin: 'yǎn jìng', meaning: 'glasses' },
      { word: '的', pinyin: 'de', meaning: '(particle)' },
      { word: '男生', pinyin: 'nán shēng', meaning: 'boys' },
      { text: '，' },
      { word: '一边', pinyin: 'yī biān', meaning: 'while' },
      { word: '走路', pinyin: 'zǒu lù', meaning: 'walking' },
      { text: '，' },
      { word: '一边', pinyin: 'yī biān', meaning: 'while' },
      { word: '玩', pinyin: 'wán', meaning: 'play' },
      { word: '手机', pinyin: 'shǒu jī', meaning: 'phone' },
      { text: '。' },
    ],
    labels: [
      { text: '时间', position: 2 },
      { text: '人物', position: 6 },
      { text: '地点', position: 10 },
      { text: '起因', position: 16 },
    ],
    english:
      'I remember one afternoon after school, I was carrying my bag on the way home and saw two boys wearing glasses walking and playing on their phones at the same time.',
  },
  {
    start: 163.86,
    end: 180.84,
    label: null,
    chinese: [
      { word: '走到', pinyin: 'zǒu dào', meaning: 'walked to' },
      { word: '红绿灯', pinyin: 'hóng lǜ dēng', meaning: 'traffic light' },
      { word: '路口', pinyin: 'lù kǒu', meaning: 'intersection' },
      { word: '处', pinyin: 'chù', meaning: 'place' },
      { word: '时', pinyin: 'shí', meaning: 'when' },
      { text: '，' },
      { word: '他们', pinyin: 'tā men', meaning: 'they' },
      { word: '也', pinyin: 'yě', meaning: 'also' },
      { word: '没有', pinyin: 'méi yǒu', meaning: 'did not' },
      { word: '停下来', pinyin: 'tíng xià lái', meaning: 'stop' },
      { text: '，' },
      { word: '而是', pinyin: 'ér shì', meaning: 'but rather' },
      { word: '低着', pinyin: 'dī zhe', meaning: 'lowering' },
      { word: '头', pinyin: 'tóu', meaning: 'head' },
      { word: '一边', pinyin: 'yī biān', meaning: 'while' },
      { word: '玩', pinyin: 'wán', meaning: 'play' },
      { word: '手机', pinyin: 'shǒu jī', meaning: 'phone' },
      { text: '，' },
      { word: '一边', pinyin: 'yī biān', meaning: 'while' },
      { word: '往前走', pinyin: 'wǎng qián zǒu', meaning: 'walk forward' },
      { text: '，' },
      { word: '完全', pinyin: 'wán quán', meaning: 'completely' },
      { word: '没有', pinyin: 'méi yǒu', meaning: 'did not' },
      { word: '注意', pinyin: 'zhù yì', meaning: 'pay attention' },
      { word: '马路上', pinyin: 'mǎ lù shàng', meaning: 'on the road' },
      { word: '来往', pinyin: 'lái wǎng', meaning: 'coming and going' },
      { word: '的', pinyin: 'de', meaning: '(particle)' },
      { word: '车辆', pinyin: 'chē liàng', meaning: 'vehicles' },
      { text: '。' },
    ],
    labels: [],
    english:
      "When they reached the traffic light intersection, they didn't stop but instead kept their heads down playing on their phones while walking forward, completely ignoring the traffic on the road.",
  },
  {
    start: 181.62,
    end: 208.66,
    label: null,
    chinese: [
      { word: '幸好', pinyin: 'xìng hǎo', meaning: 'fortunately' },
      { word: '一名', pinyin: 'yī míng', meaning: 'one (person)' },
      { word: '女老师', pinyin: 'nǚ lǎo shī', meaning: 'female teacher' },
      { word: '看到', pinyin: 'kàn dào', meaning: 'saw' },
      { word: '了', pinyin: 'le', meaning: '(particle)' },
      { text: '，' },
      { word: '连忙', pinyin: 'lián máng', meaning: 'hurriedly' },
      { word: '上前', pinyin: 'shàng qián', meaning: 'step forward' },
      { word: '拉住', pinyin: 'lā zhù', meaning: 'grab/hold' },
      { word: '两个', pinyin: 'liǎng gè', meaning: 'two' },
      { word: '男生', pinyin: 'nán shēng', meaning: 'boys' },
      { text: '。' },
      { word: '老师', pinyin: 'lǎo shī', meaning: 'teacher' },
      { word: '批评', pinyin: 'pī píng', meaning: 'criticized' },
      { word: '他们', pinyin: 'tā men', meaning: 'them' },
      { word: '一边', pinyin: 'yī biān', meaning: 'while' },
      { word: '走路', pinyin: 'zǒu lù', meaning: 'walking' },
      { word: '一边', pinyin: 'yī biān', meaning: 'while' },
      { word: '玩', pinyin: 'wán', meaning: 'play' },
      { word: '手机', pinyin: 'shǒu jī', meaning: 'phone' },
      { word: '的', pinyin: 'de', meaning: '(particle)' },
      { word: '行为', pinyin: 'xíng wéi', meaning: 'behavior' },
      { text: '。' },
      { word: '他们俩', pinyin: 'tā men liǎ', meaning: 'the two of them' },
      { word: '听了', pinyin: 'tīng le', meaning: 'heard' },
      { text: '，' },
      { word: '惭愧', pinyin: 'cán kuì', meaning: 'ashamed' },
      { word: '地', pinyin: 'de', meaning: '(adverb marker)' },
      { word: '低下了', pinyin: 'dī xià le', meaning: 'lowered' },
      { word: '头', pinyin: 'tóu', meaning: 'head' },
      { text: '。' },
      { word: '最后', pinyin: 'zuì hòu', meaning: 'finally' },
      { word: '他们', pinyin: 'tā men', meaning: 'they' },
      { word: '把', pinyin: 'bǎ', meaning: '(object marker)' },
      { word: '手机', pinyin: 'shǒu jī', meaning: 'phone' },
      { word: '收起来', pinyin: 'shōu qǐ lái', meaning: 'put away' },
      { text: '，' },
      { word: '跟着', pinyin: 'gēn zhe', meaning: 'following' },
      { word: '老师', pinyin: 'lǎo shī', meaning: 'teacher' },
      { word: '一起', pinyin: 'yī qǐ', meaning: 'together' },
      { word: '过马路', pinyin: 'guò mǎ lù', meaning: 'cross the road' },
      { text: '。' },
    ],
    labels: [
      { text: '经过', position: 0 },
      { text: '结果', position: 41 },
    ],
    english:
      'Fortunately, a female teacher saw them and hurried forward to grab the two boys. The teacher criticized their behavior of walking and playing on their phones. They felt ashamed and lowered their heads. Finally, they put their phones away and crossed the road with the teacher.',
  },
  {
    start: 208.66,
    end: 217.94,
    label: null,
    chinese: [
      { word: '俗话', pinyin: 'sú huà', meaning: 'proverb' },
      { word: '说', pinyin: 'shuō', meaning: 'says' },
      { text: '："' },
      { word: '马路如虎口', pinyin: 'mǎ lù rú hǔ kǒu', meaning: "road is like a tiger's mouth" },
      { text: '。"' },
      { word: '我们', pinyin: 'wǒ men', meaning: 'we' },
      { word: '在', pinyin: 'zài', meaning: 'when' },
      { word: '过马路', pinyin: 'guò mǎ lù', meaning: 'crossing the road' },
      { word: '时', pinyin: 'shí', meaning: 'when' },
      { word: '一定', pinyin: 'yī dìng', meaning: 'must' },
      { word: '要', pinyin: 'yào', meaning: 'need to' },
      { word: '遵守', pinyin: 'zūn shǒu', meaning: 'follow/obey' },
      { word: '交通规则', pinyin: 'jiāo tōng guī zé', meaning: 'traffic rules' },
      { text: '。' },
    ],
    labels: [],
    english:
      'As the saying goes, "the road is like a tiger\'s mouth." We must follow traffic rules when crossing the road.',
  },
]

// Combine all timed sentences for audio sync
const allTimedSentences = [
  ...storySentences,
  ...summarySentences,
  ...question2Sentences,
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

// Sentence component with optional labels
interface SentenceProps {
  sentence: {
    chinese: SentenceItem[]
    english: string
    labels?: { text: string; position: number }[]
    label?: string | null
  }
  isHighlighted: boolean
  onWordClick: (word: string, pinyin: string, meaning: string) => void
}

function Sentence({ sentence, isHighlighted, onWordClick }: SentenceProps) {
  // Build elements with labels inserted at correct positions
  const elements: React.ReactNode[] = []
  const labels = sentence.labels || []
  const labelMap = new Map(labels.map((l) => [l.position, l.text]))

  sentence.chinese.forEach((item, index) => {
    // Check if there's a label at this position
    if (labelMap.has(index)) {
      elements.push(
        <span key={`label-${index}`} className="koushi-label">
          （{labelMap.get(index)}）
        </span>
      )
    }

    if (isWordItem(item)) {
      elements.push(
        <Word
          key={index}
          word={item.word}
          pinyin={item.pinyin}
          meaning={item.meaning}
          onClick={onWordClick}
        />
      )
    } else {
      elements.push(<span key={index}>{item.text}</span>)
    }
  })

  // Check for trailing labels (position at end)
  if (labelMap.has(sentence.chinese.length)) {
    elements.push(
      <span key={`label-end`} className="koushi-label">
        （{labelMap.get(sentence.chinese.length)}）
      </span>
    )
  }

  return (
    <div className={`koushi-sentence ${isHighlighted ? 'highlighted' : ''}`}>
      <span className="chinese">{elements}</span>
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

const STORAGE_KEY = 'koushi_traffic_safety_learned'

function KoushiTrafficSafetyPage() {
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
      for (let i = 0; i < allTimedSentences.length; i++) {
        const sentence = allTimedSentences[i]
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

  // Helper to get the global index offset for each sentence array
  const storyOffset = 0
  const summaryOffset = storySentences.length
  const question2Offset = storySentences.length + summarySentences.length

  return (
    <div className="koushi-page">
      <div className="lesson-header lesson-header-orange">
        <h1>口试练习：《交通安全》</h1>
        <div className="lesson-subtitle">
          P3HCL 综合练习4 阅读计划 - Traffic Safety
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
            <source src="/audio/traffic-safety/story.mp4" type="audio/mp4" />
            您的浏览器不支持音频播放。
          </audio>
        </div>

        {/* Pictures Section */}
        <div className="section-title">图片</div>
        <div className="picture-container">
          <div className="pictures-row">
            <div className="picture-box" style={{ flex: '1 1 100%' }}>
              <img
                src="/images/traffic-safety/picture1.png"
                alt="交通安全 - 过马路"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
              <div className="picture-number">
                <span
                  className="koushi-word"
                  onClick={() =>
                    handleWordClick('交通', 'jiāo tōng', 'traffic')
                  }
                >
                  交通
                </span>
                <span
                  className="koushi-word"
                  onClick={() => handleWordClick('安全', 'ān quán', 'safety')}
                >
                  安全
                </span>
                {' - '}
                <span
                  className="koushi-word"
                  onClick={() =>
                    handleWordClick('过马路', 'guò mǎ lù', 'cross the road')
                  }
                >
                  过马路
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Theme Section */}
        <div className="section-title">
          <span
            className="koushi-word"
            onClick={() => handleWordClick('主题', 'zhǔ tí', 'theme')}
          >
            主题
          </span>
        </div>
        <div className="question-box">
          <div className="story-text">
            <p>
              <span
                className="koushi-word"
                onClick={() => handleWordClick('在', 'zài', 'when')}
              >
                在
              </span>
              <span
                className="koushi-word"
                onClick={() =>
                  handleWordClick('过马路', 'guò mǎ lù', 'crossing the road')
                }
              >
                过马路
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
                onClick={() => handleWordClick('一定', 'yī dìng', 'must')}
              >
                一定
              </span>
              <span
                className="koushi-word"
                onClick={() => handleWordClick('要', 'yào', 'need to')}
              >
                要
              </span>
              <span
                className="koushi-word"
                onClick={() =>
                  handleWordClick('注意', 'zhù yì', 'pay attention')
                }
              >
                注意
              </span>
              <span
                className="koushi-word"
                onClick={() => handleWordClick('自己', 'zì jǐ', 'oneself')}
              >
                自己
              </span>
              <span
                className="koushi-word"
                onClick={() => handleWordClick('的', 'de', '(particle)')}
              >
                的
              </span>
              <span
                className="koushi-word"
                onClick={() => handleWordClick('安全', 'ān quán', 'safety')}
              >
                安全
              </span>
              ，
              <span
                className="koushi-word"
                onClick={() => handleWordClick('也', 'yě', 'also')}
              >
                也
              </span>
              <span
                className="koushi-word"
                onClick={() => handleWordClick('要', 'yào', 'need to')}
              >
                要
              </span>
              <span
                className="koushi-word"
                onClick={() =>
                  handleWordClick('遵守', 'zūn shǒu', 'follow/obey')
                }
              >
                遵守
              </span>
              <span
                className="koushi-word"
                onClick={() =>
                  handleWordClick(
                    '交通规则',
                    'jiāo tōng guī zé',
                    'traffic rules'
                  )
                }
              >
                交通规则
              </span>
              。
            </p>
          </div>
        </div>

        {/* Question 1 */}
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
            onClick={() => handleWordClick('视频', 'shì pín', 'video')}
          >
            视频
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
          ？
        </div>

        <div className="question-box">
          <h3>
            <span
              className="koushi-word"
              onClick={() => handleWordClick('开头', 'kāi tóu', 'opening')}
            >
              开头
            </span>
          </h3>
          <div className="story-text">
            <p>
              <span
                className="koushi-word"
                onClick={() =>
                  handleWordClick('这段', 'zhè duàn', 'this (segment)')
                }
              >
                这段
              </span>
              <span
                className="koushi-word"
                onClick={() => handleWordClick('视频', 'shì pín', 'video')}
              >
                视频
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
                  handleWordClick('主要', 'zhǔ yào', 'main/primary')
                }
              >
                主要
              </span>
              <span
                className="koushi-word"
                onClick={() => handleWordClick('内容', 'nèi róng', 'content')}
              >
                内容
              </span>
              <span
                className="koushi-word"
                onClick={() => handleWordClick('是', 'shì', 'is')}
              >
                是
              </span>
              ：
              <span
                className="koushi-word"
                onClick={() => handleWordClick('在', 'zài', 'when')}
              >
                在
              </span>
              <span
                className="koushi-word"
                onClick={() =>
                  handleWordClick('过马路', 'guò mǎ lù', 'crossing the road')
                }
              >
                过马路
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
                onClick={() => handleWordClick('我们', 'wǒ men', 'we')}
              >
                我们
              </span>
              <span
                className="koushi-word"
                onClick={() => handleWordClick('一定', 'yī dìng', 'must')}
              >
                一定
              </span>
              <span
                className="koushi-word"
                onClick={() => handleWordClick('要', 'yào', 'need to')}
              >
                要
              </span>
              <span
                className="koushi-word"
                onClick={() =>
                  handleWordClick('注意', 'zhù yì', 'pay attention')
                }
              >
                注意
              </span>
              <span
                className="koushi-word"
                onClick={() => handleWordClick('自己', 'zì jǐ', 'oneself')}
              >
                自己
              </span>
              <span
                className="koushi-word"
                onClick={() => handleWordClick('的', 'de', '(particle)')}
              >
                的
              </span>
              <span
                className="koushi-word"
                onClick={() => handleWordClick('安全', 'ān quán', 'safety')}
              >
                安全
              </span>
              ，
              <span
                className="koushi-word"
                onClick={() => handleWordClick('也', 'yě', 'also')}
              >
                也
              </span>
              <span
                className="koushi-word"
                onClick={() => handleWordClick('要', 'yào', 'need to')}
              >
                要
              </span>
              <span
                className="koushi-word"
                onClick={() =>
                  handleWordClick('遵守', 'zūn shǒu', 'follow/obey')
                }
              >
                遵守
              </span>
              <span
                className="koushi-word"
                onClick={() =>
                  handleWordClick(
                    '交通规则',
                    'jiāo tōng guī zé',
                    'traffic rules'
                  )
                }
              >
                交通规则
              </span>
              。
            </p>
          </div>
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
                isHighlighted={highlightedSentenceIndex === storyOffset + index}
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

        {/* Summary Section (FORI) */}
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
            {summarySentences.map((sentence, index) => (
              <div key={index}>
                <div
                  className="reflection-label"
                  style={index > 0 ? { marginTop: '15px' } : {}}
                >
                  {sentence.label}
                </div>
                <div
                  className={`koushi-sentence ${highlightedSentenceIndex === summaryOffset + index ? 'highlighted' : ''}`}
                >
                  <span className="chinese">
                    {sentence.chinese.map((item, i) =>
                      isWordItem(item) ? (
                        <Word
                          key={i}
                          word={item.word}
                          pinyin={item.pinyin}
                          meaning={item.meaning}
                          onClick={handleWordClick}
                        />
                      ) : (
                        <span key={i}>{item.text}</span>
                      )
                    )}
                  </span>
                  <span className="english-translation">
                    {sentence.english}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section Divider: 会话练习 */}
        <div className="section-title">
          <span
            className="koushi-word"
            onClick={() =>
              handleWordClick(
                '会话练习',
                'huì huà liàn xí',
                'conversation practice'
              )
            }
          >
            会话练习
          </span>
        </div>

        {/* Question 2 */}
        <div className="section-title">
          问题二：
          <span
            className="koushi-word"
            onClick={() => handleWordClick('除了', 'chú le', 'besides')}
          >
            除了
          </span>
          <span
            className="koushi-word"
            onClick={() => handleWordClick('视频', 'shì pín', 'video')}
          >
            视频
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
            onClick={() => handleWordClick('在', 'zài', 'when')}
          >
            在
          </span>
          <span
            className="koushi-word"
            onClick={() =>
              handleWordClick('过马路', 'guò mǎ lù', 'crossing the road')
            }
          >
            过马路
          </span>
          <span
            className="koushi-word"
            onClick={() => handleWordClick('时', 'shí', 'when')}
          >
            时
          </span>
          <span
            className="koushi-word"
            onClick={() => handleWordClick('有', 'yǒu', 'have')}
          >
            有
          </span>
          <span
            className="koushi-word"
            onClick={() => handleWordClick('看见', 'kàn jiàn', 'seen')}
          >
            看见
          </span>
          <span
            className="koushi-word"
            onClick={() => handleWordClick('什么', 'shén me', 'what')}
          >
            什么
          </span>
          <span
            className="koushi-word"
            onClick={() => handleWordClick('事', 'shì', 'matter')}
          >
            事
          </span>
          <span
            className="koushi-word"
            onClick={() => handleWordClick('让', 'ràng', 'make')}
          >
            让
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
              handleWordClick(
                '印象深刻',
                'yìn xiàng shēn kè',
                'deep impression'
              )
            }
          >
            印象深刻
          </span>
          ？（
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
          ）
        </div>

        <div className="question-box">
          <div className="story-text">
            {question2Sentences.map((sentence, index) => (
              <Sentence
                key={index}
                sentence={sentence}
                isHighlighted={
                  highlightedSentenceIndex === question2Offset + index
                }
                onWordClick={handleWordClick}
              />
            ))}
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
