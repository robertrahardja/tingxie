import { useCallback, useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/p3-picture-composition')({
  component: P3PictureCompositionPage,
})

type Token =
  | { kind: 'word'; hanzi: string; pinyin: string; english: string }
  | { kind: 'punct'; text: string }

interface TokenSentence {
  tokens: Token[]
  english: string
}

const w = (hanzi: string, pinyin: string, english: string): Token => ({
  kind: 'word',
  hanzi,
  pinyin,
  english,
})
const p = (text: string): Token => ({ kind: 'punct', text })

const sentenceText = (s: TokenSentence) =>
  s.tokens.map((t) => (t.kind === 'word' ? t.hanzi : t.text)).join('')

interface WordChip {
  hanzi: string
  pinyin: string
  english: string
}

const PROMPT_WORDS: WordChip[] = [
  { hanzi: '唱生日歌', pinyin: 'chàng shēng rì gē', english: 'sing birthday song' },
  { hanzi: '荡秋千', pinyin: 'dàng qiū qiān', english: 'play on a swing' },
  { hanzi: '溜滑梯', pinyin: 'liū huá tī', english: 'go down a slide' },
  { hanzi: '庆祝', pinyin: 'qìng zhù', english: 'celebrate' },
  { hanzi: '蛋糕', pinyin: 'dàn gāo', english: 'cake' },
  { hanzi: '红包', pinyin: 'hóng bāo', english: 'red packet (money gift)' },
]

const SCENES = [
  {
    num: '①',
    image: '/images/p3-composition/scene1.png',
    place: { hanzi: '学校', pinyin: 'xué xiào', english: 'school' },
    words: [PROMPT_WORDS[0]],
    timeLabel: { hanzi: '上午', pinyin: 'shàng wǔ', english: 'morning' },
  },
  {
    num: '②',
    image: '/images/p3-composition/scene2.png',
    place: { hanzi: '游乐场', pinyin: 'yóu lè chǎng', english: 'playground' },
    words: [PROMPT_WORDS[1], PROMPT_WORDS[2]],
    timeLabel: { hanzi: '下午', pinyin: 'xià wǔ', english: 'afternoon' },
  },
  {
    num: '③',
    image: '/images/p3-composition/scene3.png',
    place: { hanzi: '家里', pinyin: 'jiā lǐ', english: 'at home' },
    words: [PROMPT_WORDS[3], PROMPT_WORDS[4], PROMPT_WORDS[5]],
    timeLabel: { hanzi: '傍晚', pinyin: 'bàng wǎn', english: 'evening' },
  },
]

const INSTRUCTION: TokenSentence = {
  english:
    'Pretend you are Xiao Le. Based on the pictures and hints below, write about your day\'s activities.',
  tokens: [
    w('假如', 'jiǎ rú', 'if / suppose'),
    w('你', 'nǐ', 'you'),
    w('是', 'shì', 'am / is / are'),
    w('小乐', 'Xiǎo Lè', 'Xiao Le (the character\'s name)'),
    p('，'),
    w('根据', 'gēn jù', 'according to / based on'),
    w('下面', 'xià miàn', 'below'),
    w('的', 'de', '(possessive particle)'),
    w('图意', 'tú yì', 'picture meaning'),
    w('和', 'hé', 'and'),
    w('提示', 'tí shì', 'hint / prompt'),
    p('，'),
    w('写出', 'xiě chū', 'write out'),
    w('你', 'nǐ', 'you / your'),
    w('一天', 'yì tiān', 'one day'),
    w('的', 'de', '(possessive particle)'),
    w('活动', 'huó dòng', 'activities'),
    p('。'),
  ],
}

const HOW_TO_USE: TokenSentence[] = [
  {
    english: 'Tap any word to hear how it is pronounced.',
    tokens: [
      w('点一点', 'diǎn yi diǎn', 'tap / click'),
      w('词语', 'cí yǔ', 'word'),
      p('，'),
      w('就', 'jiù', 'then'),
      w('可以', 'kě yǐ', 'can'),
      w('听到', 'tīng dào', 'hear'),
      w('读音', 'dú yīn', 'pronunciation'),
      p('。'),
    ],
  },
  {
    english: 'Tap any sentence to hear the whole sentence read aloud.',
    tokens: [
      w('点一点', 'diǎn yi diǎn', 'tap / click'),
      w('句子', 'jù zi', 'sentence'),
      p('，'),
      w('就', 'jiù', 'then'),
      w('可以', 'kě yǐ', 'can'),
      w('听到', 'tīng dào', 'hear'),
      w('整句话', 'zhěng jù huà', 'the whole sentence'),
      p('。'),
    ],
  },
]

interface RubricCriterion {
  tokens: Token[]
  english: string
}

interface RubricColumn {
  grade: string
  gradePinyin: string
  gradeEnglish: string
  marks: string
  color: string
  criteria: RubricCriterion[]
}

interface Rubric {
  title: string
  titlePinyin: string
  titleEnglish: string
  totalMarks: number
  columns: RubricColumn[]
}

const RUBRIC_CONTENT: Rubric = {
  title: '内容',
  titlePinyin: 'nèi róng',
  titleEnglish: 'Content',
  totalMarks: 7,
  columns: [
    {
      grade: '上',
      gradePinyin: 'shàng',
      gradeEnglish: 'High',
      marks: '6–7 分',
      color: 'emerald',
      criteria: [
        {
          english: 'Meets the question requirements',
          tokens: [
            w('符合', 'fú hé', 'meets / matches'),
            w('题目', 'tí mù', 'the question'),
            w('要求', 'yāo qiú', 'requirements'),
          ],
        },
        {
          english: 'Content is complete',
          tokens: [w('内容', 'nèi róng', 'content'), w('完整', 'wán zhěng', 'complete')],
        },
        {
          english: 'Well organised and clear',
          tokens: [w('条理', 'tiáo lǐ', 'organisation / order'), w('清楚', 'qīng chu', 'clear')],
        },
      ],
    },
    {
      grade: '中',
      gradePinyin: 'zhōng',
      gradeEnglish: 'Mid',
      marks: '3–5 分',
      color: 'amber',
      criteria: [
        {
          english: 'Does not fully meet the requirements',
          tokens: [
            w('不', 'bù', 'not'),
            w('完全', 'wán quán', 'completely'),
            w('符合', 'fú hé', 'meet'),
            w('题目', 'tí mù', 'the question'),
            w('要求', 'yāo qiú', 'requirements'),
          ],
        },
        {
          english: 'Some content is missing',
          tokens: [
            w('内容', 'nèi róng', 'content'),
            w('有些', 'yǒu xiē', 'has some'),
            w('缺漏', 'quē lòu', 'gaps / missing parts'),
          ],
        },
        {
          english: 'Not clearly organised',
          tokens: [
            w('条理', 'tiáo lǐ', 'organisation'),
            w('不够', 'bú gòu', 'not enough'),
            w('清楚', 'qīng chu', 'clear'),
          ],
        },
      ],
    },
    {
      grade: '下',
      gradePinyin: 'xià',
      gradeEnglish: 'Low',
      marks: '1–2 分',
      color: 'rose',
      criteria: [
        {
          english: 'Does not meet the requirements',
          tokens: [
            w('不', 'bù', 'not'),
            w('符合', 'fú hé', 'meet'),
            w('题目', 'tí mù', 'the question'),
            w('要求', 'yāo qiú', 'requirements'),
          ],
        },
        {
          english: 'Content is seriously lacking',
          tokens: [
            w('内容', 'nèi róng', 'content'),
            w('严重', 'yán zhòng', 'serious / severe'),
            w('缺漏', 'quē lòu', 'gaps / missing'),
          ],
        },
        {
          english: 'Not organised or clear',
          tokens: [
            w('条理', 'tiáo lǐ', 'organisation'),
            w('不', 'bù', 'not'),
            w('清楚', 'qīng chu', 'clear'),
          ],
        },
      ],
    },
  ],
}

const RUBRIC_LANGUAGE: Rubric = {
  title: '语文',
  titlePinyin: 'yǔ wén',
  titleEnglish: 'Language',
  totalMarks: 8,
  columns: [
    {
      grade: '上',
      gradePinyin: 'shàng',
      gradeEnglish: 'High',
      marks: '6–8 分',
      color: 'emerald',
      criteria: [
        {
          english: 'Expression is very clear and coherent',
          tokens: [
            w('表达', 'biǎo dá', 'expression'),
            w('非常', 'fēi cháng', 'very'),
            w('清楚', 'qīng chu', 'clear'),
            p('、'),
            w('连贯', 'lián guàn', 'coherent / flows'),
          ],
        },
        {
          english: 'Sentences flow well, words used correctly',
          tokens: [
            w('句子', 'jù zi', 'sentences'),
            w('通顺', 'tōng shùn', 'smooth / flowing'),
            p('、'),
            w('词语', 'cí yǔ', 'words'),
            w('正确', 'zhèng què', 'correct'),
          ],
        },
        {
          english: 'Chinese characters and pinyin are correct',
          tokens: [
            w('汉字', 'hàn zì', 'Chinese characters'),
            p('、'),
            w('拼音', 'pīn yīn', 'pinyin'),
            w('正确', 'zhèng què', 'correct'),
          ],
        },
        {
          english: 'Paragraph format and punctuation are correct',
          tokens: [
            w('段落', 'duàn luò', 'paragraph'),
            w('格式', 'gé shì', 'format'),
            w('正确', 'zhèng què', 'correct'),
            p('、'),
            w('标点', 'biāo diǎn', 'punctuation'),
            w('正确', 'zhèng què', 'correct'),
          ],
        },
      ],
    },
    {
      grade: '中',
      gradePinyin: 'zhōng',
      gradeEnglish: 'Mid',
      marks: '3–5 分',
      color: 'amber',
      criteria: [
        {
          english: 'Expression is fairly clear and coherent',
          tokens: [
            w('表达', 'biǎo dá', 'expression'),
            w('比较', 'bǐ jiào', 'fairly / relatively'),
            w('清楚', 'qīng chu', 'clear'),
            p('、'),
            w('连贯', 'lián guàn', 'coherent'),
          ],
        },
        {
          english: 'Most sentences flow well, most words correct',
          tokens: [
            w('多数', 'duō shù', 'most'),
            w('句子', 'jù zi', 'sentences'),
            w('通顺', 'tōng shùn', 'smooth'),
            p('、'),
            w('多数', 'duō shù', 'most'),
            w('词语', 'cí yǔ', 'words'),
            w('正确', 'zhèng què', 'correct'),
          ],
        },
        {
          english: 'Not many character or pinyin mistakes',
          tokens: [
            w('汉字', 'hàn zì', 'Chinese characters'),
            p('、'),
            w('拼音', 'pīn yīn', 'pinyin'),
            w('错误', 'cuò wù', 'mistakes'),
            w('不多', 'bù duō', 'not many'),
          ],
        },
        {
          english: 'Paragraph format correct, few punctuation errors',
          tokens: [
            w('段落', 'duàn luò', 'paragraph'),
            w('格式', 'gé shì', 'format'),
            w('正确', 'zhèng què', 'correct'),
            p('、'),
            w('标点', 'biāo diǎn', 'punctuation'),
            w('错误', 'cuò wù', 'mistakes'),
            w('不多', 'bù duō', 'not many'),
          ],
        },
      ],
    },
    {
      grade: '下',
      gradePinyin: 'xià',
      gradeEnglish: 'Low',
      marks: '1–2 分',
      color: 'rose',
      criteria: [
        {
          english: 'Expression is unclear and incoherent',
          tokens: [
            w('表达', 'biǎo dá', 'expression'),
            w('不', 'bù', 'not'),
            w('清楚', 'qīng chu', 'clear'),
            p('、'),
            w('不', 'bù', 'not'),
            w('连贯', 'lián guàn', 'coherent'),
          ],
        },
        {
          english: 'Most sentences awkward, most words incorrect',
          tokens: [
            w('多数', 'duō shù', 'most'),
            w('句子', 'jù zi', 'sentences'),
            w('不', 'bù', 'not'),
            w('通顺', 'tōng shùn', 'smooth'),
            p('、'),
            w('多数', 'duō shù', 'most'),
            w('词语', 'cí yǔ', 'words'),
            w('不', 'bù', 'not'),
            w('正确', 'zhèng què', 'correct'),
          ],
        },
        {
          english: 'Many character and pinyin mistakes',
          tokens: [
            w('汉字', 'hàn zì', 'Chinese characters'),
            p('、'),
            w('拼音', 'pīn yīn', 'pinyin'),
            w('错误', 'cuò wù', 'mistakes'),
            w('较多', 'jiào duō', 'quite many'),
          ],
        },
        {
          english: 'Paragraph format wrong, many punctuation errors',
          tokens: [
            w('段落', 'duàn luò', 'paragraph'),
            w('格式', 'gé shì', 'format'),
            w('不', 'bù', 'not'),
            w('正确', 'zhèng què', 'correct'),
            p('、'),
            w('标点', 'biāo diǎn', 'punctuation'),
            w('错误', 'cuò wù', 'mistakes'),
            w('较多', 'jiào duō', 'quite many'),
          ],
        },
      ],
    },
  ],
}

// Hannah's own composition (corrected version) — based on her handwritten draft
const MY_COMPOSITION: TokenSentence[] = [
  {
    english: 'Today is April 8th, it is my birthday. I am very happy!',
    tokens: [
      w('今天', 'jīn tiān', 'today'),
      w('是', 'shì', 'is'),
      w('四月', 'sì yuè', 'April'),
      w('八号', 'bā hào', '8th'),
      p('，'),
      w('是', 'shì', 'is'),
      w('我', 'wǒ', 'my'),
      w('的', 'de', '(possessive)'),
      w('生日', 'shēng rì', 'birthday'),
      p('。'),
      w('我', 'wǒ', 'I'),
      w('很', 'hěn', 'very'),
      w('开心', 'kāi xīn', 'happy'),
      p('！'),
    ],
  },
  {
    english: 'In the morning, at school, my classmates all sang the birthday song: "Happy birthday to you..."',
    tokens: [
      w('上午', 'shàng wǔ', 'morning'),
      p('，'),
      w('我', 'wǒ', 'I'),
      w('在', 'zài', 'at / in'),
      w('学校', 'xué xiào', 'school'),
      w('里', 'lǐ', 'inside'),
      p('，'),
      w('同学们', 'tóng xué men', 'classmates'),
      w('都', 'dōu', 'all'),
      w('唱', 'chàng', 'sing'),
      w('生日歌', 'shēng rì gē', 'birthday song'),
      p('：'),
      p('"'),
      w('祝', 'zhù', 'wish'),
      w('你', 'nǐ', 'you'),
      w('生日', 'shēng rì', 'birthday'),
      w('快乐', 'kuài lè', 'happy'),
      p('……"'),
    ],
  },
  {
    english: 'My classmates also gave me lots of presents.',
    tokens: [
      w('同学们', 'tóng xué men', 'classmates'),
      w('也', 'yě', 'also'),
      w('给', 'gěi', 'give'),
      w('我', 'wǒ', 'me'),
      w('很多', 'hěn duō', 'a lot of'),
      w('礼物', 'lǐ wù', 'presents'),
      p('。'),
    ],
  },
  {
    english: 'In the afternoon, after I bathed and finished my homework, Mum took me to the playground.',
    tokens: [
      w('下午', 'xià wǔ', 'afternoon'),
      p('，'),
      w('我', 'wǒ', 'I'),
      w('冲凉', 'chōng liáng', 'take a bath'),
      w('和', 'hé', 'and'),
      w('做完', 'zuò wán', 'finish doing'),
      w('功课', 'gōng kè', 'homework'),
      w('后', 'hòu', 'after'),
      p('，'),
      w('妈妈', 'mā ma', 'mum'),
      w('带', 'dài', 'bring / take'),
      w('我', 'wǒ', 'me'),
      w('去', 'qù', 'go to'),
      w('游乐场', 'yóu lè chǎng', 'playground'),
      p('。'),
    ],
  },
  {
    english: 'I played on the swing and went down the slide!',
    tokens: [
      w('我', 'wǒ', 'I'),
      w('玩', 'wán', 'play'),
      w('荡秋千', 'dàng qiū qiān', 'swing'),
      w('和', 'hé', 'and'),
      w('溜滑梯', 'liū huá tī', 'go down the slide'),
      p('！'),
    ],
  },
  {
    english: 'But there was no one there, so Mum played with me.',
    tokens: [
      w('可是', 'kě shì', 'but / however'),
      w('没有人', 'méi yǒu rén', 'no one'),
      w('在', 'zài', 'at'),
      w('那里', 'nà lǐ', 'there'),
      p('，'),
      w('所以', 'suǒ yǐ', 'so / therefore'),
      w('妈妈', 'mā ma', 'mum'),
      w('跟', 'gēn', 'with'),
      w('我', 'wǒ', 'me'),
      w('玩', 'wán', 'play'),
      p('。'),
    ],
  },
  {
    english: 'In the evening, we went home to celebrate my birthday together.',
    tokens: [
      w('傍晚', 'bàng wǎn', 'evening'),
      p('，'),
      w('我们', 'wǒ men', 'we'),
      w('回到', 'huí dào', 'return to'),
      w('家里', 'jiā lǐ', 'home'),
      p('，'),
      w('一起', 'yì qǐ', 'together'),
      w('庆祝', 'qìng zhù', 'celebrate'),
      w('我', 'wǒ', 'my'),
      w('的', 'de', '(possessive)'),
      w('生日', 'shēng rì', 'birthday'),
      p('。'),
    ],
  },
  {
    english: 'Mum prepared a big cake. We sang the birthday song and I made a wish.',
    tokens: [
      w('妈妈', 'mā ma', 'mum'),
      w('准备', 'zhǔn bèi', 'prepare'),
      w('了', 'le', '(completed action)'),
      w('一个', 'yí ge', 'a / one'),
      w('大', 'dà', 'big'),
      w('蛋糕', 'dàn gāo', 'cake'),
      p('。'),
      w('我们', 'wǒ men', 'we'),
      w('唱', 'chàng', 'sing'),
      w('生日歌', 'shēng rì gē', 'birthday song'),
      p('，'),
      w('我', 'wǒ', 'I'),
      w('许', 'xǔ', 'make (a wish)'),
      w('了', 'le', '(completed action)'),
      w('一个', 'yí ge', 'a / one'),
      w('愿望', 'yuàn wàng', 'wish'),
      p('。'),
    ],
  },
  {
    english: 'Mum and Dad also gave me a red packet. I was so happy!',
    tokens: [
      w('爸爸', 'bà ba', 'dad'),
      w('妈妈', 'mā ma', 'mum'),
      w('还', 'hái', 'also'),
      w('给', 'gěi', 'give'),
      w('我', 'wǒ', 'me'),
      w('一个', 'yí ge', 'a / one'),
      w('红包', 'hóng bāo', 'red packet'),
      p('。'),
      w('我', 'wǒ', 'I'),
      w('好', 'hǎo', 'so'),
      w('开心', 'kāi xīn', 'happy'),
      p('！'),
    ],
  },
  {
    english: 'This was truly an unforgettable birthday!',
    tokens: [
      w('这', 'zhè', 'this'),
      w('真是', 'zhēn shì', 'truly'),
      w('一个', 'yí ge', 'a / one'),
      w('难忘', 'nán wàng', 'unforgettable'),
      w('的', 'de', '(particle)'),
      w('生日', 'shēng rì', 'birthday'),
      p('！'),
    ],
  },
]

// Corrections and tips based on Hannah's handwritten draft
interface CorrectionItem {
  original: string
  corrected: string
  explanation: string
  explanationEn: string
}

const CORRECTIONS: CorrectionItem[] = [
  {
    original: '我在学校后',
    corrected: '我在学校里',
    explanation: '用"里"表示在里面，不是"后"',
    explanationEn: 'Use 里 (inside) for location, not 后 (after/behind)',
  },
  {
    original: '妈妈带去我去游乐场',
    corrected: '妈妈带我去游乐场',
    explanation: '不需要重复"去"',
    explanationEn: 'No need to repeat 去',
  },
]

// Good things in Hannah's writing
interface PraiseItem {
  text: string
  textEn: string
}

const PRAISE_ITEMS: PraiseItem[] = [
  {
    text: '用了"可是……所以……"来连接句子，很棒！',
    textEn: 'Great use of "可是...所以..." to connect sentences!',
  },
  {
    text: '加了自己的想法（冲凉、做功课），内容更丰富！',
    textEn: 'Added your own ideas (bathing, homework) — richer content!',
  },
  {
    text: '三个时间段都写到了：上午、下午、傍晚',
    textEn: 'Covered all three time periods: morning, afternoon, evening',
  },
  {
    text: '用了"都"和"也"，句子更生动',
    textEn: 'Used 都 and 也 to make sentences more vivid',
  },
]

const SAMPLE: TokenSentence[] = [
  {
    english: 'Today is April 8th, it is my birthday.',
    tokens: [
      w('今天', 'jīn tiān', 'today'),
      w('是', 'shì', 'is'),
      w('四月', 'sì yuè', 'April'),
      w('八号', 'bā hào', '8th'),
      p('，'),
      w('是', 'shì', 'is'),
      w('我', 'wǒ', 'my'),
      w('的', 'de', '(possessive)'),
      w('生日', 'shēng rì', 'birthday'),
      p('。'),
    ],
  },
  {
    english: 'In the morning, I celebrated my birthday at school.',
    tokens: [
      w('上午', 'shàng wǔ', 'morning'),
      p('，'),
      w('我', 'wǒ', 'I'),
      w('在', 'zài', 'at / in'),
      w('学校', 'xué xiào', 'school'),
      w('庆祝', 'qìng zhù', 'celebrate'),
      w('生日', 'shēng rì', 'birthday'),
      p('。'),
    ],
  },
  {
    english: 'My classmates gathered around me and sang the birthday song together. I felt very happy.',
    tokens: [
      w('我的', 'wǒ de', 'my'),
      w('同学们', 'tóng xué men', 'classmates'),
      w('围着', 'wéi zhe', 'surround'),
      w('我', 'wǒ', 'me'),
      p('，'),
      w('一起', 'yì qǐ', 'together'),
      w('唱', 'chàng', 'sing'),
      w('生日歌', 'shēng rì gē', 'birthday song'),
      p('，'),
      w('我', 'wǒ', 'I'),
      w('觉得', 'jué de', 'feel'),
      w('非常', 'fēi cháng', 'very'),
      w('开心', 'kāi xīn', 'happy'),
      p('。'),
    ],
  },
  {
    english: 'In the afternoon, Mum and Dad took me to the playground to play.',
    tokens: [
      w('下午', 'xià wǔ', 'afternoon'),
      p('，'),
      w('爸爸', 'bà ba', 'dad'),
      w('妈妈', 'mā ma', 'mum'),
      w('带', 'dài', 'bring / take'),
      w('我', 'wǒ', 'me'),
      w('去', 'qù', 'go'),
      w('游乐场', 'yóu lè chǎng', 'playground'),
      w('玩', 'wán', 'play'),
      p('。'),
    ],
  },
  {
    english: 'First I went down the slide, then I played on the swing. I played until I was sweating all over.',
    tokens: [
      w('我', 'wǒ', 'I'),
      w('先', 'xiān', 'first'),
      w('溜滑梯', 'liū huá tī', 'go down the slide'),
      p('，'),
      w('再', 'zài', 'then'),
      w('去', 'qù', 'go'),
      w('荡秋千', 'dàng qiū qiān', 'swing'),
      p('，'),
      w('玩得', 'wán de', 'played until'),
      w('满头大汗', 'mǎn tóu dà hàn', 'sweating all over'),
      p('。'),
    ],
  },
  {
    english: 'In the evening, we went home to have dinner together.',
    tokens: [
      w('傍晚', 'bàng wǎn', 'evening'),
      p('，'),
      w('我们', 'wǒ men', 'we'),
      w('回到', 'huí dào', 'return to'),
      w('家里', 'jiā lǐ', 'home'),
      w('一起', 'yì qǐ', 'together'),
      w('吃', 'chī', 'eat'),
      w('晚饭', 'wǎn fàn', 'dinner'),
      p('。'),
    ],
  },
  {
    english: 'Grandma prepared a big cake for me, and Mum and Dad also gave me a red packet.',
    tokens: [
      w('奶奶', 'nǎi nai', 'grandma'),
      w('为', 'wèi', 'for'),
      w('我', 'wǒ', 'me'),
      w('准备', 'zhǔn bèi', 'prepare'),
      w('了', 'le', '(completed action)'),
      w('一个', 'yí ge', 'a / one'),
      w('大', 'dà', 'big'),
      w('蛋糕', 'dàn gāo', 'cake'),
      p('，'),
      w('爸爸', 'bà ba', 'dad'),
      w('妈妈', 'mā ma', 'mum'),
      w('还', 'hái', 'also'),
      w('给', 'gěi', 'give'),
      w('我', 'wǒ', 'me'),
      w('一个', 'yí ge', 'a / one'),
      w('红包', 'hóng bāo', 'red packet'),
      p('。'),
    ],
  },
  {
    english: 'We sang the birthday song together, and I made a wish.',
    tokens: [
      w('我们', 'wǒ men', 'we'),
      w('一起', 'yì qǐ', 'together'),
      w('唱', 'chàng', 'sing'),
      w('生日歌', 'shēng rì gē', 'birthday song'),
      p('，'),
      w('我', 'wǒ', 'I'),
      w('许', 'xǔ', 'make (a wish)'),
      w('了', 'le', '(completed action)'),
      w('一个', 'yí ge', 'a / one'),
      w('愿望', 'yuàn wàng', 'wish'),
      p('。'),
    ],
  },
  {
    english: 'This was truly an unforgettable day!',
    tokens: [
      w('这', 'zhè', 'this'),
      w('真是', 'zhēn shì', 'truly'),
      w('难忘', 'nán wàng', 'unforgettable'),
      w('的', 'de', '(particle)'),
      w('一天', 'yì tiān', 'day'),
      p('！'),
    ],
  },
]

function useChineseVoice() {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices()
      if (!voices.length) return
      const preferred =
        voices.find((v) => v.lang === 'zh-CN' && /Tingting|Sinji|Google/i.test(v.name)) ||
        voices.find((v) => v.lang === 'zh-CN') ||
        voices.find((v) => v.lang.startsWith('zh')) ||
        null
      setVoice(preferred)
    }

    pickVoice()
    window.speechSynthesis.addEventListener('voiceschanged', pickVoice)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', pickVoice)
  }, [])

  return voice
}

function useSpeak() {
  const voice = useChineseVoice()

  return useCallback(
    (text: string, rate = 0.85) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return
      window.speechSynthesis.cancel()
      const utter = new SpeechSynthesisUtterance(text)
      utter.lang = 'zh-CN'
      utter.rate = rate
      if (voice) utter.voice = voice
      window.speechSynthesis.speak(utter)
    },
    [voice],
  )
}

function WordChipButton({ word, onClick }: { word: WordChip; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group inline-flex flex-col items-center rounded-2xl bg-white/95 px-4 py-3 shadow-md transition hover:scale-105 hover:shadow-lg active:scale-95"
    >
      <span className="text-[10px] font-medium uppercase tracking-wide text-indigo-500">
        {word.pinyin}
      </span>
      <span className="text-2xl font-bold text-gray-900">{word.hanzi}</span>
      <span className="mt-0.5 text-xs text-gray-500">{word.english}</span>
    </button>
  )
}

function TokenWord({
  token,
  selected,
  onClick,
}: {
  token: Extract<Token, { kind: 'word' }>
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex min-w-[44px] min-h-[44px] flex-col items-center justify-center rounded-lg border px-2 py-1.5 transition active:scale-95 ${
        selected
          ? 'border-indigo-500 bg-indigo-100 shadow-sm'
          : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50'
      }`}
    >
      <span className="text-[9px] font-medium leading-tight text-indigo-500">{token.pinyin}</span>
      <span className="text-lg font-semibold leading-tight text-gray-900">{token.hanzi}</span>
    </button>
  )
}

function ClickableSentence({
  sentence,
  speak,
}: {
  sentence: TokenSentence
  speak: (t: string) => void
}) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const fullText = sentenceText(sentence)
  const selected =
    selectedIdx != null && sentence.tokens[selectedIdx]?.kind === 'word'
      ? (sentence.tokens[selectedIdx] as Extract<Token, { kind: 'word' }>)
      : null

  return (
    <div className="rounded-xl bg-white/95 p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-1.5">
        {sentence.tokens.map((tok, i) =>
          tok.kind === 'word' ? (
            <TokenWord
              key={i}
              token={tok}
              selected={selectedIdx === i}
              onClick={() => {
                setSelectedIdx(i)
                speak(tok.hanzi)
              }}
            />
          ) : (
            <span key={i} className="self-end pb-1 text-lg text-gray-500">
              {tok.text}
            </span>
          ),
        )}
      </div>

      {selected && (
        <div className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50 p-3">
          <div className="text-[11px] font-medium uppercase tracking-wide text-indigo-500">
            {selected.pinyin}
          </div>
          <div className="text-xl font-bold text-gray-900">{selected.hanzi}</div>
          <div className="mt-0.5 text-sm text-gray-700">{selected.english}</div>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
        <p className="flex-1 text-xs italic text-gray-500">{sentence.english}</p>
        <button
          onClick={() => speak(fullText)}
          className="flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow transition hover:bg-indigo-700 active:scale-95"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
            <path d="M8 5v14l11-7z" />
          </svg>
          Read all
        </button>
      </div>
    </div>
  )
}

const GRADE_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-300', text: 'text-rose-700' },
}

function RubricCriterionRow({
  criterion,
  speak,
}: {
  criterion: RubricCriterion
  speak: (t: string) => void
}) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const fullText = criterion.tokens
    .map((t) => (t.kind === 'word' ? t.hanzi : t.text))
    .join('')
  const selected =
    selectedIdx != null && criterion.tokens[selectedIdx]?.kind === 'word'
      ? (criterion.tokens[selectedIdx] as Extract<Token, { kind: 'word' }>)
      : null

  return (
    <div className="rounded-lg bg-white p-2.5 shadow-sm">
      <div className="flex flex-wrap items-end gap-1">
        {criterion.tokens.map((tok, i) =>
          tok.kind === 'word' ? (
            <button
              key={i}
              onClick={() => {
                setSelectedIdx(i)
                speak(tok.hanzi)
              }}
              className={`inline-flex min-w-[44px] min-h-[44px] flex-col items-center justify-center rounded border px-1.5 py-1 transition active:scale-95 ${
                selectedIdx === i
                  ? 'border-indigo-500 bg-indigo-100'
                  : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50'
              }`}
            >
              <span className="text-[8px] leading-tight text-indigo-500">{tok.pinyin}</span>
              <span className="text-sm font-semibold leading-tight text-gray-900">
                {tok.hanzi}
              </span>
            </button>
          ) : (
            <span key={i} className="self-end pb-0.5 text-sm text-gray-500">
              {tok.text}
            </span>
          ),
        )}
      </div>
      {selected && (
        <div className="mt-2 rounded border border-indigo-200 bg-indigo-50 p-1.5">
          <div className="text-[9px] font-medium uppercase text-indigo-500">{selected.pinyin}</div>
          <div className="text-xs font-semibold text-gray-900">
            {selected.hanzi} — <span className="font-normal text-gray-600">{selected.english}</span>
          </div>
        </div>
      )}
      <div className="mt-2 flex items-center justify-between gap-2 border-t border-gray-100 pt-2">
        <span className="flex-1 text-[11px] italic text-gray-500">{criterion.english}</span>
        <button
          onClick={() => speak(fullText)}
          className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 hover:bg-indigo-200"
        >
          ▶
        </button>
      </div>
    </div>
  )
}

function RubricCard({ rubric, speak }: { rubric: Rubric; speak: (t: string) => void }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white/95 shadow-lg">
      <button
        onClick={() => speak(`${rubric.title} ${rubric.totalMarks} 分`)}
        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-4 text-left text-white transition hover:from-indigo-600 hover:to-purple-700"
      >
        <div className="text-[11px] font-medium uppercase tracking-wide text-indigo-100">
          {rubric.titlePinyin}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold">{rubric.title}</span>
          <span className="text-sm text-indigo-100">({rubric.titleEnglish})</span>
          <span className="ml-auto rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
            {rubric.totalMarks} 分
          </span>
        </div>
      </button>
      <div className="space-y-4 p-4">
        {rubric.columns.map((col) => {
          const s = GRADE_STYLES[col.color]
          return (
            <div key={col.grade} className={`rounded-xl border ${s.border} ${s.bg} p-3`}>
              <button
                onClick={() => speak(col.grade)}
                className={`mb-3 flex min-h-[44px] w-full items-center justify-between rounded-lg px-2 py-2 ${s.text}`}
              >
                <span className="flex items-baseline gap-2">
                  <span className="text-xl font-bold">{col.grade}</span>
                  <span className="text-[10px] uppercase">{col.gradePinyin}</span>
                  <span className="text-xs text-gray-600">({col.gradeEnglish})</span>
                </span>
                <span className="text-xs font-semibold">{col.marks}</span>
              </button>
              <div className="space-y-2">
                {col.criteria.map((c, i) => (
                  <RubricCriterionRow key={i} criterion={c} speak={speak} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function P3PictureCompositionPage() {
  const speak = useSpeak()
  const [supported, setSupported] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setSupported(!!window.speechSynthesis)
  }, [])

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 pb-24">
      <header className="rounded-2xl bg-white/95 p-6 text-center shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900">三年级看图作文（三）</h1>
        <p className="mt-1 text-sm text-gray-500">P3 Picture Composition — My Birthday</p>
        {!supported && (
          <p className="mt-3 rounded-lg bg-amber-50 p-2 text-xs text-amber-700">
            Your browser does not support speech. Try Chrome or Safari.
          </p>
        )}
      </header>

      <section className="space-y-3">
        <h2 className="text-center text-lg font-semibold text-white drop-shadow">
          题目 · The Question
        </h2>
        <p className="text-center text-xs text-white/80">
          Tap any word to hear it and see the meaning
        </p>
        <ClickableSentence sentence={INSTRUCTION} speak={speak} />
      </section>

      <section className="space-y-3">
        <div className="rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 p-4 shadow-lg">
          <h2 className="text-center text-base font-bold text-white">
            怎么用 · How to use this page
          </h2>
        </div>
        <div className="space-y-3">
          {HOW_TO_USE.map((s, i) => (
            <ClickableSentence key={i} sentence={s} speak={speak} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-center text-lg font-semibold text-white drop-shadow">
          参考词语 · Key Vocabulary
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {PROMPT_WORDS.map((word) => (
            <WordChipButton key={word.hanzi} word={word} onClick={() => speak(word.hanzi)} />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-center text-lg font-semibold text-white drop-shadow">
          三幅图 · The Three Scenes
        </h2>
        {SCENES.map((scene) => (
          <div key={scene.num} className="overflow-hidden rounded-2xl bg-white/95 shadow-lg">
            <div className="relative">
              <img
                src={scene.image}
                alt={scene.place.english}
                className="w-full object-cover"
              />
              <div className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-xl font-bold text-white shadow-lg">
                {scene.num}
              </div>
            </div>
            <div className="space-y-3 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => speak(scene.place.hanzi)}
                  className="rounded-full bg-indigo-50 px-4 py-2 text-left transition hover:bg-indigo-100 active:scale-95"
                >
                  <span className="block text-[10px] font-medium uppercase tracking-wide text-indigo-500">
                    {scene.place.pinyin}
                  </span>
                  <span className="text-lg font-bold text-indigo-700">{scene.place.hanzi}</span>
                  <span className="ml-2 text-sm text-gray-500">{scene.place.english}</span>
                </button>
                <button
                  onClick={() => speak(scene.timeLabel.hanzi)}
                  className="rounded-full bg-amber-50 px-4 py-2 text-left transition hover:bg-amber-100 active:scale-95"
                >
                  <span className="block text-[10px] font-medium uppercase tracking-wide text-amber-600">
                    {scene.timeLabel.pinyin}
                  </span>
                  <span className="text-lg font-bold text-amber-700">{scene.timeLabel.hanzi}</span>
                  <span className="ml-2 text-sm text-gray-500">{scene.timeLabel.english}</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {scene.words.map((word) => (
                  <WordChipButton
                    key={word.hanzi}
                    word={word}
                    onClick={() => speak(word.hanzi)}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <div className="rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 p-5 shadow-lg">
          <h2 className="text-center text-lg font-bold text-white">
            我的作文 · My Composition
          </h2>
          <p className="mt-1 text-center text-xs text-pink-50">
            Hannah's composition (corrected). Tap any word to hear it.
          </p>
        </div>

        <div className="space-y-3">
          {MY_COMPOSITION.map((s, i) => (
            <ClickableSentence key={i} sentence={s} speak={speak} />
          ))}
        </div>
        <button
          onClick={() => speak(MY_COMPOSITION.map(sentenceText).join(' '), 0.8)}
          className="mt-2 w-full rounded-xl bg-rose-600 px-6 py-4 text-center font-semibold text-white shadow-lg transition hover:bg-rose-700 active:scale-[0.98]"
        >
          ▶ 朗读我的作文 · Read My Composition
        </button>

        <div className="overflow-hidden rounded-2xl bg-white/95 shadow-lg">
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-5 py-4">
            <h3 className="text-base font-bold text-white">
              写得好 · What you did well
            </h3>
          </div>
          <div className="space-y-3 p-4">
            {PRAISE_ITEMS.map((item, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl bg-emerald-50 p-3">
                <span className="mt-0.5 text-xl">&#11088;</span>
                <div>
                  <p className="text-sm font-semibold text-emerald-800">{item.text}</p>
                  <p className="mt-0.5 text-xs text-emerald-600">{item.textEn}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white/95 shadow-lg">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-4">
            <h3 className="text-base font-bold text-white">
              改一改 · Things to fix
            </h3>
          </div>
          <div className="space-y-3 p-4">
            {CORRECTIONS.map((c, i) => (
              <div key={i} className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-rose-100 px-2 py-1 text-sm font-semibold text-rose-700 line-through">
                        {c.original}
                      </span>
                      <span className="text-gray-400">&rarr;</span>
                      <button
                        onClick={() => speak(c.corrected)}
                        className="min-h-[44px] min-w-[44px] rounded bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-200 active:scale-95"
                      >
                        {c.corrected}
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-700">{c.explanation}</p>
                    <p className="text-xs text-gray-500">{c.explanationEn}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 p-5 shadow-lg">
          <h2 className="text-center text-lg font-bold text-white">
            范文 · Sample Composition
          </h2>
          <p className="mt-1 text-center text-xs text-emerald-50">
            Tap any word to hear it. Tap "Read all" to hear the whole sentence.
          </p>
        </div>
        <div className="space-y-3">
          {SAMPLE.map((s, i) => (
            <ClickableSentence key={i} sentence={s} speak={speak} />
          ))}
        </div>
        <button
          onClick={() => speak(SAMPLE.map(sentenceText).join(' '), 0.8)}
          className="mt-2 w-full rounded-xl bg-indigo-600 px-6 py-4 text-center font-semibold text-white shadow-lg transition hover:bg-indigo-700 active:scale-[0.98]"
        >
          ▶ 朗读整篇作文 · Read Whole Composition
        </button>
      </section>

      <section className="space-y-4">
        <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 p-5 shadow-lg">
          <h2 className="text-center text-lg font-bold text-white">
            评分标准 · Grading Rubric
          </h2>
          <p className="mt-1 text-center text-xs text-indigo-100">
            Tap any word to hear it. Total: 15 marks
          </p>
        </div>
        <RubricCard rubric={RUBRIC_CONTENT} speak={speak} />
        <RubricCard rubric={RUBRIC_LANGUAGE} speak={speak} />
      </section>
    </div>
  )
}
