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

// Comprehensive word dictionary - includes all characters and compound words
const wordDictionary: { [key: string]: WordData } = {
  // Individual characters - Numbers
  '一': { simplified: '一', traditional: '一', pinyin: 'yī', meaning: 'one' },
  '二': { simplified: '二', traditional: '二', pinyin: 'èr', meaning: 'two' },
  '三': { simplified: '三', traditional: '三', pinyin: 'sān', meaning: 'three' },
  '四': { simplified: '四', traditional: '四', pinyin: 'sì', meaning: 'four' },
  '五': { simplified: '五', traditional: '五', pinyin: 'wǔ', meaning: 'five' },
  '几': { simplified: '几', traditional: '幾', pinyin: 'jǐ', meaning: 'how many; several' },
  '两': { simplified: '两', traditional: '兩', pinyin: 'liǎng', meaning: 'two (before measure words)' },

  // Individual characters - Common
  '第': { simplified: '第', traditional: '第', pinyin: 'dì', meaning: 'ordinal prefix (1st, 2nd...)' },
  '天': { simplified: '天', traditional: '天', pinyin: 'tiān', meaning: 'day; sky' },
  '又': { simplified: '又', traditional: '又', pinyin: 'yòu', meaning: 'again; also' },
  '过': { simplified: '过', traditional: '過', pinyin: 'guò', meaning: 'pass; cross' },
  '再': { simplified: '再', traditional: '再', pinyin: 'zài', meaning: 'again; then' },
  '后': { simplified: '后', traditional: '後', pinyin: 'hòu', meaning: 'after; behind' },
  '来': { simplified: '来', traditional: '來', pinyin: 'lái', meaning: 'come' },
  '先': { simplified: '先', traditional: '先', pinyin: 'xiān', meaning: 'first; before' },
  '接': { simplified: '接', traditional: '接', pinyin: 'jiē', meaning: 'connect; catch' },
  '着': { simplified: '着', traditional: '著', pinyin: 'zhe', meaning: 'particle (continuous action)' },
  '然': { simplified: '然', traditional: '然', pinyin: 'rán', meaning: 'so; thus' },
  '最': { simplified: '最', traditional: '最', pinyin: 'zuì', meaning: 'most' },
  '个': { simplified: '个', traditional: '個', pinyin: 'gè', meaning: 'measure word' },
  '月': { simplified: '月', traditional: '月', pinyin: 'yuè', meaning: 'month; moon' },

  // Individual characters - Pronouns & Particles
  '我': { simplified: '我', traditional: '我', pinyin: 'wǒ', meaning: 'I; me' },
  '它': { simplified: '它', traditional: '它', pinyin: 'tā', meaning: 'it' },
  '把': { simplified: '把', traditional: '把', pinyin: 'bǎ', meaning: 'particle (object marker)' },
  '的': { simplified: '的', traditional: '的', pinyin: 'de', meaning: 'particle (possessive)' },
  '了': { simplified: '了', traditional: '了', pinyin: 'le', meaning: 'particle (completed action)' },
  '也': { simplified: '也', traditional: '也', pinyin: 'yě', meaning: 'also' },
  '还': { simplified: '还', traditional: '還', pinyin: 'hái', meaning: 'still; also' },
  '就': { simplified: '就', traditional: '就', pinyin: 'jiù', meaning: 'then; just' },
  '当': { simplified: '当', traditional: '當', pinyin: 'dāng', meaning: 'when; as' },

  // Individual characters - Verbs
  '放': { simplified: '放', traditional: '放', pinyin: 'fàng', meaning: 'put; place' },
  '在': { simplified: '在', traditional: '在', pinyin: 'zài', meaning: 'at; in' },
  '变': { simplified: '变', traditional: '變', pinyin: 'biàn', meaning: 'change; become' },
  '开': { simplified: '开', traditional: '開', pinyin: 'kāi', meaning: 'open' },
  '始': { simplified: '始', traditional: '始', pinyin: 'shǐ', meaning: 'begin' },
  '发': { simplified: '发', traditional: '發', pinyin: 'fā', meaning: 'emit; send out' },
  '长': { simplified: '长', traditional: '長', pinyin: 'zhǎng/cháng', meaning: 'grow / long' },
  '出': { simplified: '出', traditional: '出', pinyin: 'chū', meaning: 'go out; come out' },
  '得': { simplified: '得', traditional: '得', pinyin: 'de/dé', meaning: 'particle / get' },
  '脱': { simplified: '脱', traditional: '脫', pinyin: 'tuō', meaning: 'take off; shed' },
  '落': { simplified: '落', traditional: '落', pinyin: 'luò', meaning: 'fall; drop' },
  '越': { simplified: '越', traditional: '越', pinyin: 'yuè', meaning: 'exceed; more' },
  '成': { simplified: '成', traditional: '成', pinyin: 'chéng', meaning: 'become; accomplish' },
  '有': { simplified: '有', traditional: '有', pinyin: 'yǒu', meaning: 'have; there is' },
  '见': { simplified: '见', traditional: '見', pinyin: 'jiàn', meaning: 'see' },
  '不': { simplified: '不', traditional: '不', pinyin: 'bù', meaning: 'not; no' },
  '回': { simplified: '回', traditional: '回', pinyin: 'huí', meaning: 'return' },
  '到': { simplified: '到', traditional: '到', pinyin: 'dào', meaning: 'arrive; to' },
  '下': { simplified: '下', traditional: '下', pinyin: 'xià', meaning: 'down; below' },
  '去': { simplified: '去', traditional: '去', pinyin: 'qù', meaning: 'go' },
  '冲': { simplified: '冲', traditional: '沖', pinyin: 'chōng', meaning: 'rush; rinse' },
  '凉': { simplified: '凉', traditional: '涼', pinyin: 'liáng', meaning: 'cool' },
  '拿': { simplified: '拿', traditional: '拿', pinyin: 'ná', meaning: 'take; hold' },
  '吃': { simplified: '吃', traditional: '吃', pinyin: 'chī', meaning: 'eat' },
  '复': { simplified: '复', traditional: '複', pinyin: 'fù', meaning: 'repeat; review' },
  '习': { simplified: '习', traditional: '習', pinyin: 'xí', meaning: 'practice; study' },
  '看': { simplified: '看', traditional: '看', pinyin: 'kàn', meaning: 'look; watch' },
  '洗': { simplified: '洗', traditional: '洗', pinyin: 'xǐ', meaning: 'wash' },
  '漱': { simplified: '漱', traditional: '漱', pinyin: 'shù', meaning: 'rinse (mouth)' },
  '完': { simplified: '完', traditional: '完', pinyin: 'wán', meaning: 'finish; complete' },
  '毕': { simplified: '毕', traditional: '畢', pinyin: 'bì', meaning: 'finish; complete' },
  '睡': { simplified: '睡', traditional: '睡', pinyin: 'shuì', meaning: 'sleep' },
  '觉': { simplified: '觉', traditional: '覺', pinyin: 'jiào/jué', meaning: 'sleep / feel' },
  '种': { simplified: '种', traditional: '種', pinyin: 'zhòng/zhǒng', meaning: 'plant / seed' },
  '满': { simplified: '满', traditional: '滿', pinyin: 'mǎn', meaning: 'full' },

  // Individual characters - Nouns
  '绿': { simplified: '绿', traditional: '綠', pinyin: 'lǜ', meaning: 'green' },
  '豆': { simplified: '豆', traditional: '豆', pinyin: 'dòu', meaning: 'bean' },
  '湿': { simplified: '湿', traditional: '濕', pinyin: 'shī', meaning: 'wet; damp' },
  '棉': { simplified: '棉', traditional: '棉', pinyin: 'mián', meaning: 'cotton' },
  '花': { simplified: '花', traditional: '花', pinyin: 'huā', meaning: 'flower' },
  '上': { simplified: '上', traditional: '上', pinyin: 'shàng', meaning: 'on; above' },
  '外': { simplified: '外', traditional: '外', pinyin: 'wài', meaning: 'outside' },
  '壳': { simplified: '壳', traditional: '殼', pinyin: 'ké', meaning: 'shell' },
  '裂': { simplified: '裂', traditional: '裂', pinyin: 'liè', meaning: 'crack; split' },
  '芽': { simplified: '芽', traditional: '芽', pinyin: 'yá', meaning: 'sprout; bud' },
  '细': { simplified: '细', traditional: '細', pinyin: 'xì', meaning: 'thin; fine' },
  '根': { simplified: '根', traditional: '根', pinyin: 'gēn', meaning: 'root' },
  '茎': { simplified: '茎', traditional: '莖', pinyin: 'jīng', meaning: 'stem' },
  '叶': { simplified: '叶', traditional: '葉', pinyin: 'yè', meaning: 'leaf' },
  '子': { simplified: '子', traditional: '子', pinyin: 'zi', meaning: 'child; suffix' },
  '大': { simplified: '大', traditional: '大', pinyin: 'dà', meaning: 'big; large' },
  '幼': { simplified: '幼', traditional: '幼', pinyin: 'yòu', meaning: 'young; immature' },
  '苗': { simplified: '苗', traditional: '苗', pinyin: 'miáo', meaning: 'seedling' },
  '菜': { simplified: '菜', traditional: '菜', pinyin: 'cài', meaning: 'vegetable' },
  '池': { simplified: '池', traditional: '池', pinyin: 'chí', meaning: 'pool; pond' },
  '塘': { simplified: '塘', traditional: '塘', pinyin: 'táng', meaning: 'pond' },
  '里': { simplified: '里', traditional: '裡', pinyin: 'lǐ', meaning: 'inside' },
  '只': { simplified: '只', traditional: '隻', pinyin: 'zhī', meaning: 'measure word (animals)' },
  '小': { simplified: '小', traditional: '小', pinyin: 'xiǎo', meaning: 'small; little' },
  '蝌': { simplified: '蝌', traditional: '蝌', pinyin: 'kē', meaning: 'tadpole (蝌蚪)' },
  '蚪': { simplified: '蚪', traditional: '蚪', pinyin: 'dǒu', meaning: 'tadpole (蝌蚪)' },
  '条': { simplified: '条', traditional: '條', pinyin: 'tiáo', meaning: 'strip; measure word' },
  '腿': { simplified: '腿', traditional: '腿', pinyin: 'tuǐ', meaning: 'leg' },
  '前': { simplified: '前', traditional: '前', pinyin: 'qián', meaning: 'front; before' },
  '尾': { simplified: '尾', traditional: '尾', pinyin: 'wěi', meaning: 'tail' },
  '巴': { simplified: '巴', traditional: '巴', pinyin: 'ba', meaning: 'suffix' },
  '短': { simplified: '短', traditional: '短', pinyin: 'duǎn', meaning: 'short' },
  '青': { simplified: '青', traditional: '青', pinyin: 'qīng', meaning: 'green; blue' },
  '蛙': { simplified: '蛙', traditional: '蛙', pinyin: 'wā', meaning: 'frog' },
  '学': { simplified: '学', traditional: '學', pinyin: 'xué', meaning: 'study; school' },
  '家': { simplified: '家', traditional: '家', pinyin: 'jiā', meaning: 'home; family' },
  '书': { simplified: '书', traditional: '書', pinyin: 'shū', meaning: 'book' },
  '包': { simplified: '包', traditional: '包', pinyin: 'bāo', meaning: 'bag; wrap' },
  '碗': { simplified: '碗', traditional: '碗', pinyin: 'wǎn', meaning: 'bowl' },
  '筷': { simplified: '筷', traditional: '筷', pinyin: 'kuài', meaning: 'chopsticks' },
  '饭': { simplified: '饭', traditional: '飯', pinyin: 'fàn', meaning: 'meal; rice' },
  '作': { simplified: '作', traditional: '作', pinyin: 'zuò', meaning: 'do; make' },
  '业': { simplified: '业', traditional: '業', pinyin: 'yè', meaning: 'business; work' },
  '会': { simplified: '会', traditional: '會', pinyin: 'huì', meaning: 'can; meet' },
  '儿': { simplified: '儿', traditional: '兒', pinyin: 'r/ér', meaning: 'suffix / child' },
  '电': { simplified: '电', traditional: '電', pinyin: 'diàn', meaning: 'electricity' },
  '视': { simplified: '视', traditional: '視', pinyin: 'shì', meaning: 'look; view' },
  '床': { simplified: '床', traditional: '床', pinyin: 'chuáng', meaning: 'bed' },
  '树': { simplified: '树', traditional: '樹', pinyin: 'shù', meaning: 'tree' },
  '泥': { simplified: '泥', traditional: '泥', pinyin: 'ní', meaning: 'mud' },
  '土': { simplified: '土', traditional: '土', pinyin: 'tǔ', meaning: 'soil; earth' },
  '很': { simplified: '很', traditional: '很', pinyin: 'hěn', meaning: 'very' },
  '快': { simplified: '快', traditional: '快', pinyin: 'kuài', meaning: 'fast; quick' },
  '高': { simplified: '高', traditional: '高', pinyin: 'gāo', meaning: 'tall; high' },
  '更': { simplified: '更', traditional: '更', pinyin: 'gèng', meaning: 'even more' },
  '多': { simplified: '多', traditional: '多', pinyin: 'duō', meaning: 'many; much' },
  '枝': { simplified: '枝', traditional: '枝', pinyin: 'zhī', meaning: 'branch' },
  '色': { simplified: '色', traditional: '色', pinyin: 'sè', meaning: 'color' },
  '窗': { simplified: '窗', traditional: '窗', pinyin: 'chuāng', meaning: 'window' },
  '棵': { simplified: '棵', traditional: '棵', pinyin: 'kē', meaning: 'measure word (trees)' },
  '笔': { simplified: '笔', traditional: '筆', pinyin: 'bǐ', meaning: 'pen; writing' },
  '直': { simplified: '直', traditional: '直', pinyin: 'zhí', meaning: 'straight' },

  // Punctuation
  '、': { simplified: '、', traditional: '、', pinyin: '', meaning: 'enumeration comma' },
  '，': { simplified: '，', traditional: '，', pinyin: '', meaning: 'comma' },
  '。': { simplified: '。', traditional: '。', pinyin: '', meaning: 'period' },

  // Compound words - Sequence words
  '第一天': { simplified: '第一天', traditional: '第一天', pinyin: 'dì yī tiān', meaning: 'first day' },
  '第二天': { simplified: '第二天', traditional: '第二天', pinyin: 'dì èr tiān', meaning: 'second day' },
  '又过了一天': { simplified: '又过了一天', traditional: '又過了一天', pinyin: 'yòu guò le yī tiān', meaning: 'another day passed' },
  '再过了一天': { simplified: '再过了一天', traditional: '再過了一天', pinyin: 'zài guò le yī tiān', meaning: 'yet another day passed' },
  '后来': { simplified: '后来', traditional: '後來', pinyin: 'hòu lái', meaning: 'later; afterwards' },
  '过了几天': { simplified: '过了几天', traditional: '過了幾天', pinyin: 'guò le jǐ tiān', meaning: 'after a few days' },
  '又过了几天': { simplified: '又过了几天', traditional: '又過了幾天', pinyin: 'yòu guò le jǐ tiān', meaning: 'after a few more days' },
  '再过了几天': { simplified: '再过了几天', traditional: '再過了幾天', pinyin: 'zài guò le jǐ tiān', meaning: 'after yet more days' },
  '接着': { simplified: '接着', traditional: '接著', pinyin: 'jiē zhe', meaning: 'then; next' },
  '然后': { simplified: '然后', traditional: '然後', pinyin: 'rán hòu', meaning: 'after that' },
  '最后': { simplified: '最后', traditional: '最後', pinyin: 'zuì hòu', meaning: 'finally; lastly' },
  '过了一个月': { simplified: '过了一个月', traditional: '過了一個月', pinyin: 'guò le yī gè yuè', meaning: 'after a month' },
  '又过了几个月': { simplified: '又过了几个月', traditional: '又過了幾個月', pinyin: 'yòu guò le jǐ gè yuè', meaning: 'after a few more months' },

  // Compound words - Section 1
  '绿豆': { simplified: '绿豆', traditional: '綠豆', pinyin: 'lǜ dòu', meaning: 'mung bean' },
  '放在': { simplified: '放在', traditional: '放在', pinyin: 'fàng zài', meaning: 'put on; place on' },
  '棉花': { simplified: '棉花', traditional: '棉花', pinyin: 'mián hua', meaning: 'cotton' },
  '变大': { simplified: '变大', traditional: '變大', pinyin: 'biàn dà', meaning: 'become bigger' },
  '外壳': { simplified: '外壳', traditional: '外殼', pinyin: 'wài ké', meaning: 'outer shell' },
  '裂开': { simplified: '裂开', traditional: '裂開', pinyin: 'liè kāi', meaning: 'split open' },
  '开始': { simplified: '开始', traditional: '開始', pinyin: 'kāi shǐ', meaning: 'start; begin' },
  '发芽': { simplified: '发芽', traditional: '發芽', pinyin: 'fā yá', meaning: 'sprout' },
  '长出': { simplified: '长出', traditional: '長出', pinyin: 'zhǎng chū', meaning: 'grow out' },
  '细细': { simplified: '细细', traditional: '細細', pinyin: 'xì xì', meaning: 'thin; fine' },
  '脱落': { simplified: '脱落', traditional: '脫落', pinyin: 'tuō luò', meaning: 'fall off' },
  '细芽': { simplified: '细芽', traditional: '細芽', pinyin: 'xì yá', meaning: 'thin sprout' },
  '长得': { simplified: '长得', traditional: '長得', pinyin: 'zhǎng de', meaning: 'grow to be' },
  '更长': { simplified: '更长', traditional: '更長', pinyin: 'gèng cháng', meaning: 'longer' },
  '越来越': { simplified: '越来越', traditional: '越來越', pinyin: 'yuè lái yuè', meaning: 'more and more' },
  '叶子': { simplified: '叶子', traditional: '葉子', pinyin: 'yè zi', meaning: 'leaf' },
  '幼苗': { simplified: '幼苗', traditional: '幼苗', pinyin: 'yòu miáo', meaning: 'seedling' },
  '一天天': { simplified: '一天天', traditional: '一天天', pinyin: 'yī tiān tiān', meaning: 'day by day' },
  '长大': { simplified: '长大', traditional: '長大', pinyin: 'zhǎng dà', meaning: 'grow up' },
  '变成': { simplified: '变成', traditional: '變成', pinyin: 'biàn chéng', meaning: 'become' },
  '豆芽菜': { simplified: '豆芽菜', traditional: '豆芽菜', pinyin: 'dòu yá cài', meaning: 'bean sprouts' },
  '豆芽': { simplified: '豆芽', traditional: '豆芽', pinyin: 'dòu yá', meaning: 'bean sprout' },

  // Compound words - Section 2
  '池塘': { simplified: '池塘', traditional: '池塘', pinyin: 'chí táng', meaning: 'pond' },
  '几只': { simplified: '几只', traditional: '幾隻', pinyin: 'jǐ zhī', meaning: 'a few (animals)' },
  '蝌蚪': { simplified: '蝌蚪', traditional: '蝌蚪', pinyin: 'kē dǒu', meaning: 'tadpole' },
  '小蝌蚪': { simplified: '小蝌蚪', traditional: '小蝌蚪', pinyin: 'xiǎo kē dǒu', meaning: 'little tadpole' },
  '两条': { simplified: '两条', traditional: '兩條', pinyin: 'liǎng tiáo', meaning: 'two (long things)' },
  '后腿': { simplified: '后腿', traditional: '後腿', pinyin: 'hòu tuǐ', meaning: 'hind legs' },
  '前腿': { simplified: '前腿', traditional: '前腿', pinyin: 'qián tuǐ', meaning: 'front legs' },
  '尾巴': { simplified: '尾巴', traditional: '尾巴', pinyin: 'wěi ba', meaning: 'tail' },
  '变短': { simplified: '变短', traditional: '變短', pinyin: 'biàn duǎn', meaning: 'become shorter' },
  '青蛙': { simplified: '青蛙', traditional: '青蛙', pinyin: 'qīng wā', meaning: 'frog' },
  '小青蛙': { simplified: '小青蛙', traditional: '小青蛙', pinyin: 'xiǎo qīng wā', meaning: 'little frog' },
  '不见': { simplified: '不见', traditional: '不見', pinyin: 'bú jiàn', meaning: 'disappear' },

  // Compound words - Section 3
  '放学': { simplified: '放学', traditional: '放學', pinyin: 'fàng xué', meaning: 'finish school' },
  '回到': { simplified: '回到', traditional: '回到', pinyin: 'huí dào', meaning: 'return to' },
  '放下': { simplified: '放下', traditional: '放下', pinyin: 'fàng xià', meaning: 'put down' },
  '书包': { simplified: '书包', traditional: '書包', pinyin: 'shū bāo', meaning: 'schoolbag' },
  '冲凉': { simplified: '冲凉', traditional: '沖涼', pinyin: 'chōng liáng', meaning: 'take a shower' },
  '拿出': { simplified: '拿出', traditional: '拿出', pinyin: 'ná chū', meaning: 'take out' },
  '碗筷': { simplified: '碗筷', traditional: '碗筷', pinyin: 'wǎn kuài', meaning: 'bowls and chopsticks' },
  '吃饭': { simplified: '吃饭', traditional: '吃飯', pinyin: 'chī fàn', meaning: 'eat (a meal)' },
  '作业': { simplified: '作业', traditional: '作業', pinyin: 'zuò yè', meaning: 'homework' },
  '复习': { simplified: '复习', traditional: '複習', pinyin: 'fù xí', meaning: 'review; revise' },
  '一会儿': { simplified: '一会儿', traditional: '一會兒', pinyin: 'yī huìr', meaning: 'a while' },
  '电视': { simplified: '电视', traditional: '電視', pinyin: 'diàn shì', meaning: 'television' },
  '洗漱': { simplified: '洗漱', traditional: '洗漱', pinyin: 'xǐ shù', meaning: 'wash up' },
  '完毕': { simplified: '完毕', traditional: '完畢', pinyin: 'wán bì', meaning: 'finished; completed' },
  '上床': { simplified: '上床', traditional: '上床', pinyin: 'shàng chuáng', meaning: 'go to bed' },
  '睡觉': { simplified: '睡觉', traditional: '睡覺', pinyin: 'shuì jiào', meaning: 'sleep' },

  // Compound words - Section 4
  '树苗': { simplified: '树苗', traditional: '樹苗', pinyin: 'shù miáo', meaning: 'sapling; young tree' },
  '种在': { simplified: '种在', traditional: '種在', pinyin: 'zhòng zài', meaning: 'plant in' },
  '泥土': { simplified: '泥土', traditional: '泥土', pinyin: 'ní tǔ', meaning: 'soil; earth' },
  '很快': { simplified: '很快', traditional: '很快', pinyin: 'hěn kuài', meaning: 'very quickly' },
  '长高': { simplified: '长高', traditional: '長高', pinyin: 'zhǎng gāo', meaning: 'grow tall' },
  '小树': { simplified: '小树', traditional: '小樹', pinyin: 'xiǎo shù', meaning: 'small tree' },
  '高大': { simplified: '高大', traditional: '高大', pinyin: 'gāo dà', meaning: 'tall and big' },
  '更高大': { simplified: '更高大', traditional: '更高大', pinyin: 'gèng gāo dà', meaning: 'taller and bigger' },
  '树上': { simplified: '树上', traditional: '樹上', pinyin: 'shù shàng', meaning: 'on the tree' },
  '很多': { simplified: '很多', traditional: '很多', pinyin: 'hěn duō', meaning: 'many; a lot' },
  '树枝': { simplified: '树枝', traditional: '樹枝', pinyin: 'shù zhī', meaning: 'tree branch' },
  '长满': { simplified: '长满', traditional: '長滿', pinyin: 'zhǎng mǎn', meaning: 'covered with; full of' },
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
// Generated from OpenAI Whisper transcription of p3hcl_reading_5.mp4
// Audio duration: ~110 seconds
// Timing derived from whisper-cpp large-v3-turbo model
// Note: Title lines are not read aloud in the audio - only shown visually
const sections: Section[] = [
  {
    id: 1,
    title: '一、第一天、第二天、又过了一天、再过了一天、后来',
    sequenceWords: '第一天、第二天、又过了一天、再过了一天、后来',
    sentences: [
      // Audio starts at ~2.82s with "第一天" (intro "阅读计划五" is 0-2.82s)
      { text: '一、第一天、第二天、又过了一天、再过了一天、后来', start: 0.0, end: 2.82, isTitle: true },
      // Whisper: [2.82-9.18] "第一天,我把绿豆放在湿的棉花上"
      { text: '第一天，我把绿豆放在湿的棉花上。', start: 2.82, end: 9.18, isSequenceWord: true },
      // Whisper: [9.18-13.20] "第二天,绿豆变大了"
      { text: '第二天，绿豆变大了，', start: 9.18, end: 13.20, isSequenceWord: true },
      // Whisper: [13.20-16.60] "它的外壳裂开了,开始发芽了"
      { text: '它的外壳裂开了，开始发芽了，', start: 13.20, end: 16.60 },
      // Whisper: [16.60-18.66] "还长出了细细的根"
      { text: '还长出了细细的根。', start: 16.60, end: 18.66 },
      // Whisper: [18.66-23.68] "又过了一天,绿豆的外壳脱落了"
      { text: '又过了一天，绿豆的外壳脱落了，', start: 18.66, end: 23.68, isSequenceWord: true },
      // Whisper: [23.68-26.16] "细芽长得更长了"
      { text: '细芽长得更长了。', start: 23.68, end: 26.16 },
      // Whisper: [26.16-31.04] "再过了一天,绿豆的筋越来越长"
      { text: '再过了一天，绿豆的茎越来越长，', start: 26.16, end: 31.04, isSequenceWord: true },
      // Whisper: [31.04-33.46] "叶子也越来越大"
      { text: '叶子也越来越大。', start: 31.04, end: 33.46 },
      // Whisper: [33.46-37.26] "后来,幼苗一天天长大"
      { text: '后来，幼苗一天天长大，', start: 33.46, end: 37.26, isSequenceWord: true },
      // Whisper: [37.26-39.08] "变成了豆芽菜"
      { text: '变成了豆芽菜。', start: 37.26, end: 39.08 },
    ],
  },
  {
    id: 2,
    title: '二、过了几天、又过了几天、再过了几天、后来',
    sequenceWords: '过了几天、又过了几天、再过了几天、后来',
    sentences: [
      // Whisper: [39.08-44.80] "二,池塘里有几只小蝌蚪"
      { text: '二、过了几天、又过了几天、再过了几天、后来', start: 39.08, end: 40.5, isTitle: true },
      { text: '池塘里有几只小蝌蚪。', start: 40.5, end: 44.80 },
      // Whisper: [44.80-49.66] "过了几天,小蝌蚪长出两条后腿"
      { text: '过了几天，小蝌蚪长出两条后腿。', start: 44.80, end: 49.66, isSequenceWord: true },
      // Whisper: [49.66-55.00] "又过了几天,小蝌蚪长出了两条前腿"
      { text: '又过了几天，小蝌蚪长出了两条前腿。', start: 49.66, end: 55.00, isSequenceWord: true },
      // Whisper: [55.00-59.74] "再过了几天,小蝌蚪的尾巴变短了"
      { text: '再过了几天，小蝌蚪的尾巴变短了。', start: 55.00, end: 59.74, isSequenceWord: true },
      // Whisper: [59.74-64.00] "后来,小青蛙的尾巴不见了"
      { text: '后来，小青蛙的尾巴不见了。', start: 59.74, end: 64.00, isSequenceWord: true },
    ],
  },
  {
    id: 3,
    title: '三、先、接着、然后、再、最后',
    sequenceWords: '先、接着、然后、再、最后',
    sentences: [
      // Whisper: [64.00-68.26] "三,当我放学回到家"
      { text: '三、先、接着、然后、再、最后', start: 64.00, end: 65.0, isTitle: true },
      { text: '当我放学回到家，', start: 65.0, end: 68.26 },
      // Whisper: [68.26-71.26] "我先放下书包去冲凉"
      { text: '我先放下书包去冲凉，', start: 68.26, end: 71.26, isSequenceWord: true },
      // Whisper: [71.26-74.62] "接着拿出碗筷开始吃饭"
      { text: '接着拿出碗筷开始吃饭，', start: 71.26, end: 74.62, isSequenceWord: true },
      // Whisper: [74.62-78.36] "然后拿出作业开始复习"
      { text: '然后拿出作业开始复习，', start: 74.62, end: 78.36, isSequenceWord: true },
      // Whisper: [78.36-80.40] "再看一会儿电视"
      { text: '再看一会儿电视，', start: 78.36, end: 80.40, isSequenceWord: true },
      // Whisper: [80.40-84.30] "最后,洗漱完毕就上床睡觉了"
      { text: '最后，洗漱完毕就上床睡觉了。', start: 80.40, end: 84.30, isSequenceWord: true },
    ],
  },
  {
    id: 4,
    title: '四、过了一个月、又过了几个月、后来',
    sequenceWords: '过了一个月、又过了几个月、后来',
    sentences: [
      // Whisper: [84.30-89.36] "四,我把树苗种在泥土里"
      { text: '四、过了一个月、又过了几个月、后来', start: 84.30, end: 85.5, isTitle: true },
      { text: '我把树苗种在泥土里。', start: 85.5, end: 89.36 },
      // Whisper: [89.36-94.08] "过了一个月,树苗很快就长高了"
      { text: '过了一个月，树苗很快就长高了。', start: 89.36, end: 94.08, isSequenceWord: true },
      // Whisper: [94.08-98.64] "又过了几个月,小树长得更高大了"
      { text: '又过了几个月，小树长得更高大了，', start: 94.08, end: 98.64, isSequenceWord: true },
      // Whisper: [98.64-101.34] "树上长出很多树枝"
      { text: '树上长出很多树枝，', start: 98.64, end: 101.34 },
      // Whisper: [101.34-103.82] "还长满了绿色的叶子"
      { text: '还长满了绿色的叶子。', start: 101.34, end: 103.82 },
      // Whisper: [103.82-110.00] "后来,窗外的小树变成了一棵笔直的大树"
      { text: '后来，窗外的小树变成了一棵笔直的大树。', start: 103.82, end: 110.00, isSequenceWord: true },
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
    if (selectedWord && selectedWord.simplified) {
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
