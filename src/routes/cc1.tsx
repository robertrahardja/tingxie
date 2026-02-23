import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'

export const Route = createFileRoute('/cc1')({
  component: CC1MagazinePage,
})

// ============================================================
// Types
// ============================================================

interface WordDef {
  pinyin: string
  english: string
  explanation: string
  pages: number[]
}

interface QuizOption {
  text: string
  correct: boolean
}

interface Quiz {
  question: string
  options: QuizOption[]
  explanation: string
}

interface StoryParagraph {
  text: string
}

interface Section {
  id: string
  title: string
  subtitle: string
  pages: number[]
  type: 'cover' | 'story' | 'language' | 'comic' | 'writing' | 'puzzle'
  icon: string
  paragraphs?: StoryParagraph[]
  quiz?: Quiz
  grammarCards?: GrammarCard[]
  exerciseItems?: ExerciseItem[]
  comicPanels?: string[]
  coverText?: string
  writingGuide?: string[]
  puzzleItems?: string[]
}

interface GrammarCard {
  word: string
  pinyin: string
  meaning: string
  example?: string
}

interface ExerciseItem {
  sentence: string
  blank: string
  options: string[]
  answer: string
}

// ============================================================
// Constants
// ============================================================

const STORAGE_KEY_WORDS = 'cc1_looked_up_words'
const STORAGE_KEY_PROGRESS = 'cc1_section_progress'
const STORAGE_KEY_QUIZZES = 'cc1_quiz_results'

// ============================================================
// Word Definitions (vocabulary from the magazine)
// ============================================================

const wordDefinitions: Record<string, WordDef> = {
  // === Cover (p1) ===
  '愿望': { pinyin: 'yuàn wàng', english: 'wish, desire', explanation: '心里希望达到的目标或想要的东西。', pages: [1] },
  '物品': { pinyin: 'wù pǐn', english: 'item, object', explanation: '东西。', pages: [1] },
  '远处': { pinyin: 'yuǎn chù', english: 'distance, far away', explanation: '很远的地方。', pages: [1] },
  '高山': { pinyin: 'gāo shān', english: 'tall mountain', explanation: '很高的山。', pages: [1] },
  '靠近': { pinyin: 'kào jìn', english: 'get close to', explanation: '向某个方向移动，距离变近。', pages: [1] },
  '实现': { pinyin: 'shí xiàn', english: 'realize, achieve', explanation: '把愿望变成真的。', pages: [1, 3] },
  '过程': { pinyin: 'guò chéng', english: 'process', explanation: '事情从开始到结束的经过。', pages: [1] },
  '不停': { pinyin: 'bù tíng', english: 'non-stop', explanation: '一直不停下来。', pages: [1] },
  '重要': { pinyin: 'zhòng yào', english: 'important', explanation: '很有用，不能忽视。', pages: [1, 3] },
  '每个人': { pinyin: 'měi gè rén', english: 'everyone', explanation: '所有的人。', pages: [1] },
  '心中': { pinyin: 'xīn zhōng', english: 'in one\'s heart', explanation: '心里面。', pages: [1] },
  '做到': { pinyin: 'zuò dào', english: 'achieve, accomplish', explanation: '完成某件事。', pages: [1] },
  '成为': { pinyin: 'chéng wéi', english: 'become', explanation: '变成。', pages: [1] },
  '样子': { pinyin: 'yàng zi', english: 'appearance, look', explanation: '外表的模样。', pages: [1] },
  '看起来': { pinyin: 'kàn qǐ lái', english: 'looks like, seems', explanation: '外表看上去的样子。', pages: [1, 9] },
  '往前走': { pinyin: 'wǎng qián zǒu', english: 'walk forward', explanation: '向前面走。', pages: [1] },
  '总有一天': { pinyin: 'zǒng yǒu yī tiān', english: 'someday, one day', explanation: '将来的某一天。', pages: [1] },

  // === 新水壶 Story (p2-3) ===
  '开学': { pinyin: 'kāi xué', english: 'start of school', explanation: '新学期的第一天。', pages: [2] },
  '书包': { pinyin: 'shū bāo', english: 'school bag', explanation: '装书本和文具的包。', pages: [2] },
  '教室': { pinyin: 'jiào shì', english: 'classroom', explanation: '学生上课的房间。', pages: [2] },
  '同桌': { pinyin: 'tóng zhuō', english: 'deskmate', explanation: '坐在同一张桌子旁的同学。', pages: [2] },
  '水壶': { pinyin: 'shuǐ hú', english: 'water bottle', explanation: '装水喝水用的瓶子。', pages: [2, 3] },
  '漂亮': { pinyin: 'piào liang', english: 'beautiful, pretty', explanation: '好看的样子。', pages: [2] },
  '蓝色': { pinyin: 'lán sè', english: 'blue', explanation: '蓝色，像天空的颜色。', pages: [2] },
  '星球': { pinyin: 'xīng qiú', english: 'planet, star', explanation: '宇宙中的天体，比如地球。', pages: [2] },
  '图案': { pinyin: 'tú àn', english: 'pattern, design', explanation: '有美术设计的花纹或形象。', pages: [2] },
  '按钮': { pinyin: 'àn niǔ', english: 'button (press)', explanation: '按下去可以操作的小零件。', pages: [2] },
  '盖子': { pinyin: 'gài zi', english: 'lid, cap', explanation: '盖在瓶子或杯子上面的东西。', pages: [2] },
  '喜欢': { pinyin: 'xǐ huan', english: 'like', explanation: '觉得好，想要。', pages: [2] },
  '心想': { pinyin: 'xīn xiǎng', english: 'think to oneself', explanation: '在心里想。', pages: [2, 8] },
  '华文': { pinyin: 'huá wén', english: 'Chinese language', explanation: '中文课。', pages: [2] },
  '听写': { pinyin: 'tīng xiě', english: 'dictation', explanation: '老师念词语，学生写下来。', pages: [2, 3] },
  '妈妈': { pinyin: 'mā ma', english: 'mother', explanation: '自己的母亲。', pages: [2, 3, 8, 9] },
  '点点头': { pinyin: 'diǎn diǎn tóu', english: 'nod', explanation: '点头表示同意。', pages: [2, 6] },
  '作业': { pinyin: 'zuò yè', english: 'homework', explanation: '老师布置的学习任务。', pages: [2] },
  '认真': { pinyin: 'rèn zhēn', english: 'serious, careful', explanation: '做事很用心，不马虎。', pages: [2] },
  '复习': { pinyin: 'fù xí', english: 'review, revise', explanation: '重新学习以前学过的内容。', pages: [2] },
  '难写': { pinyin: 'nán xiě', english: 'hard to write', explanation: '不容易写好的字。', pages: [2] },
  '一笔一画': { pinyin: 'yī bǐ yī huà', english: 'stroke by stroke', explanation: '写字时每一笔都认真写好。', pages: [2] },
  '信心满满': { pinyin: 'xìn xīn mǎn mǎn', english: 'full of confidence', explanation: '非常有自信。', pages: [2] },
  '老师': { pinyin: 'lǎo shī', english: 'teacher', explanation: '教学生知识的人。', pages: [2, 6] },
  '词语': { pinyin: 'cí yǔ', english: 'vocabulary, words', explanation: '语言中有意义的词。', pages: [2, 3] },
  '伤心': { pinyin: 'shāng xīn', english: 'sad, heartbroken', explanation: '心里很难过。', pages: [2, 9] },
  '难过': { pinyin: 'nán guò', english: 'sad, upset', explanation: '心里不舒服。', pages: [2] },
  '忘记': { pinyin: 'wàng jì', english: 'forget', explanation: '记不起来了。', pages: [2] },
  '以前': { pinyin: 'yǐ qián', english: 'before, previously', explanation: '过去的时候。', pages: [3] },
  '写错': { pinyin: 'xiě cuò', english: 'write wrongly', explanation: '写了不对的字。', pages: [3] },
  '进步': { pinyin: 'jìn bù', english: 'progress, improve', explanation: '比以前做得更好。', pages: [3] },
  '努力': { pinyin: 'nǔ lì', english: 'work hard, effort', explanation: '用力气去做某件事。', pages: [1, 3] },
  '相信': { pinyin: 'xiāng xìn', english: 'believe', explanation: '觉得是真的。', pages: [3] },
  '结果': { pinyin: 'jié guǒ', english: 'result, outcome', explanation: '事情最后的样子。', pages: [3] },
  '暖暖的': { pinyin: 'nuǎn nuǎn de', english: 'warm and cozy', explanation: '温暖的感觉，形容心里很感动。', pages: [3] },
  '考试': { pinyin: 'kǎo shì', english: 'exam, test', explanation: '测试学生学到的知识。', pages: [3] },
  '答错': { pinyin: 'dá cuò', english: 'answer wrongly', explanation: '回答错了。', pages: [3] },
  '满分': { pinyin: 'mǎn fēn', english: 'full marks, perfect score', explanation: '所有分数都拿到了。', pages: [3] },
  '考卷': { pinyin: 'kǎo juàn', english: 'exam paper', explanation: '考试的试卷。', pages: [3] },
  '成功': { pinyin: 'chéng gōng', english: 'success', explanation: '做到了想做的事。', pages: [3, 4] },
  '进步之星': { pinyin: 'jìn bù zhī xīng', english: 'progress star', explanation: '进步最大的学生获得的奖励。', pages: [3] },
  '阿果': { pinyin: 'ā guǒ', english: 'Aguo (name)', explanation: '故事中写信的人物名字。', pages: [3] },
  '第一天': { pinyin: 'dì yī tiān', english: 'first day', explanation: '开始的那天。', pages: [2] },
  '哈比': { pinyin: 'hā bǐ', english: 'Habi (name)', explanation: '故事中的主角名字。', pages: [2, 3] },
  '走进': { pinyin: 'zǒu jìn', english: 'walk into', explanation: '走到里面去。', pages: [2, 16] },
  '一眼': { pinyin: 'yī yǎn', english: 'one glance', explanation: '看一下。', pages: [2] },
  '看到': { pinyin: 'kàn dào', english: 'see, saw', explanation: '用眼睛看见了。', pages: [2] },
  '巴乔': { pinyin: 'bā qiáo', english: 'Ba Qiao (name)', explanation: '故事中的同桌名字。', pages: [2] },
  '打开': { pinyin: 'dǎ kāi', english: 'open', explanation: '把关着的东西弄开。', pages: [2] },
  '越看越': { pinyin: 'yuè kàn yuè', english: 'the more one looks', explanation: '看得越多越觉得。', pages: [2] },
  '回家': { pinyin: 'huí jiā', english: 'go home', explanation: '回到自己的家。', pages: [2] },
  '如果': { pinyin: 'rú guǒ', english: 'if', explanation: '假如。', pages: [2] },
  '全对': { pinyin: 'quán duì', english: 'all correct', explanation: '全部答对了。', pages: [2, 3] },
  '那几天': { pinyin: 'nà jǐ tiān', english: 'those few days', explanation: '那几日。', pages: [2] },
  '做完': { pinyin: 'zuò wán', english: 'finish doing', explanation: '把事情做完了。', pages: [2] },
  '碰到': { pinyin: 'pèng dào', english: 'encounter', explanation: '遇到。', pages: [2] },
  '多写': { pinyin: 'duō xiě', english: 'write more', explanation: '写多几次。', pages: [2] },
  '前几个': { pinyin: 'qián jǐ gè', english: 'first few', explanation: '前面几个。', pages: [2] },
  '写出来': { pinyin: 'xiě chū lái', english: 'write out', explanation: '把字写出来。', pages: [2] },
  '可是': { pinyin: 'kě shì', english: 'but, however', explanation: '表示转折。', pages: [2, 3] },
  '最后': { pinyin: 'zuì hòu', english: 'finally, last', explanation: '最后面的。', pages: [2] },
  '想不起来': { pinyin: 'xiǎng bù qǐ lái', english: 'can\'t remember', explanation: '记不起来了。', pages: [2] },
  '怎么写': { pinyin: 'zěn me xiě', english: 'how to write', explanation: '用什么方式写。', pages: [2] },
  '听写本': { pinyin: 'tīng xiě běn', english: 'dictation notebook', explanation: '听写用的本子。', pages: [2, 3] },
  '扣了两分': { pinyin: 'kòu le liǎng fēn', english: 'lost two marks', explanation: '被减了两分。', pages: [2] },
  '买不成': { pinyin: 'mǎi bù chéng', english: 'can\'t buy', explanation: '没办法买了。', pages: [2] },
  '递给': { pinyin: 'dì gěi', english: 'hand to', explanation: '把东西传给别人。', pages: [2, 3] },
  '常写错': { pinyin: 'cháng xiě cuò', english: 'often write wrongly', explanation: '经常写错。', pages: [3] },
  '写对': { pinyin: 'xiě duì', english: 'write correctly', explanation: '写得对的。', pages: [3] },
  '说明': { pinyin: 'shuō míng', english: 'show, indicate', explanation: '表示说明。', pages: [3] },
  '一周': { pinyin: 'yī zhōu', english: 'one week', explanation: '七天。', pages: [3] },
  '不敢': { pinyin: 'bù gǎn', english: 'dare not', explanation: '不敢做某事。', pages: [3] },
  '相信地': { pinyin: 'xiāng xìn de', english: 'believingly', explanation: '相信的样子。', pages: [3] },
  '懂得': { pinyin: 'dǒng de', english: 'understand, know', explanation: '知道明白。', pages: [3] },
  '要靠': { pinyin: 'yào kào', english: 'need to rely on', explanation: '需要依靠。', pages: [3] },
  '一样': { pinyin: 'yī yàng', english: 'the same', explanation: '相同的。', pages: [3, 13] },
  '故事': { pinyin: 'gù shi', english: 'story', explanation: '讲述的事情。', pages: [3] },
  '得到': { pinyin: 'dé dào', english: 'get, obtain', explanation: '收到拥有。', pages: [3] },
  '每天': { pinyin: 'měi tiān', english: 'every day', explanation: '每一天。', pages: [3, 16] },
  '看见': { pinyin: 'kàn jiàn', english: 'see, notice', explanation: '用眼睛看到了。', pages: [3, 4] },
  '本身': { pinyin: 'běn shēn', english: 'itself', explanation: '事物自己。', pages: [3] },
  '向前走': { pinyin: 'xiàng qián zǒu', english: 'walk forward', explanation: '向前面走。', pages: [3] },
  '一刻': { pinyin: 'yī kè', english: 'a moment', explanation: '短短的时间。', pages: [3] },
  '对吗': { pinyin: 'duì ma', english: 'right?', explanation: '对不对。', pages: [3] },

  // === 语文园地 - 记一记 (p4) ===
  '龙争虎斗': { pinyin: 'lóng zhēng hǔ dòu', english: 'fierce battle (dragon vs tiger)', explanation: '比喻两个强大的对手在激烈竞争。', pages: [4] },
  '马到成功': { pinyin: 'mǎ dào chéng gōng', english: 'instant success', explanation: '做事情一开始就取得成功。', pages: [4] },
  '成语': { pinyin: 'chéng yǔ', english: 'idiom', explanation: '中文里面固定搭配的词语，通常四个字。', pages: [4] },
  '比喻': { pinyin: 'bǐ yù', english: 'metaphor, analogy', explanation: '用一个东西来说明另一个东西。', pages: [4] },
  '竞争': { pinyin: 'jìng zhēng', english: 'compete', explanation: '互相争着要赢。', pages: [4] },
  '激烈': { pinyin: 'jī liè', english: 'intense, fierce', explanation: '非常厉害的。', pages: [4] },
  '胜利': { pinyin: 'shèng lì', english: 'victory, win', explanation: '赢了。', pages: [4] },
  '代词': { pinyin: 'dài cí', english: 'pronoun', explanation: '代替名词的词，如他、她、它。', pages: [4] },
  '句子': { pinyin: 'jù zi', english: 'sentence', explanation: '完整的一句话。', pages: [4] },
  '动物': { pinyin: 'dòng wù', english: 'animal', explanation: '有生命、会动的生物。', pages: [4] },
  '画龙点睛': { pinyin: 'huà lóng diǎn jīng', english: 'add the finishing touch', explanation: '在关键地方加上一点，使整体更加生动。', pages: [4] },
  '一马当先': { pinyin: 'yī mǎ dāng xiān', english: 'take the lead', explanation: '走在最前面，带头做事。', pages: [4] },
  '井底之蛙': { pinyin: 'jǐng dǐ zhī wā', english: 'frog at the bottom of a well', explanation: '比喻见识很少，目光短浅的人。', pages: [4] },
  '生龙活虎': { pinyin: 'shēng lóng huó hǔ', english: 'full of life and energy', explanation: '形容非常有活力和精神。', pages: [4] },
  '车水马龙': { pinyin: 'chē shuǐ mǎ lóng', english: 'heavy traffic', explanation: '形容路上车辆和行人很多，非常热闹。', pages: [4] },
  '猴年马月': { pinyin: 'hóu nián mǎ yuè', english: 'a very long time (who knows when)', explanation: '不知道要等到什么时候，遥遥无期。', pages: [4] },
  '虎背熊腰': { pinyin: 'hǔ bèi xióng yāo', english: 'broad-shouldered and strong', explanation: '形容身体壮实，像老虎和熊一样强壮。', pages: [4] },
  '人称代词': { pinyin: 'rén chēng dài cí', english: 'personal pronoun', explanation: '代替人名的词，如我、你、他。', pages: [4] },
  '主语': { pinyin: 'zhǔ yǔ', english: 'subject (grammar)', explanation: '句子中表示动作发出者的部分。', pages: [4] },
  '阅读': { pinyin: 'yuè dú', english: 'reading', explanation: '看书或文章来理解内容。', pages: [4] },
  '口语': { pinyin: 'kǒu yǔ', english: 'spoken language', explanation: '用嘴巴说出来的语言。', pages: [4] },
  '交流': { pinyin: 'jiāo liú', english: 'communicate', explanation: '互相说话，分享想法。', pages: [4] },
  '丰富': { pinyin: 'fēng fù', english: 'rich, abundant', explanation: '种类多，内容多。', pages: [4] },
  '语言': { pinyin: 'yǔ yán', english: 'language', explanation: '人们用来交流的工具，如中文、英文。', pages: [4] },
  '实力': { pinyin: 'shí lì', english: 'strength, capability', explanation: '做事的能力和力量。', pages: [4] },
  '战场': { pinyin: 'zhàn chǎng', english: 'battlefield', explanation: '打仗的地方。', pages: [4] },
  '顺利': { pinyin: 'shùn lì', english: 'smooth, successful', explanation: '事情进行得很好，没有问题。', pages: [4] },
  '双方': { pinyin: 'shuāng fāng', english: 'both sides', explanation: '两个方面。', pages: [4] },
  '玩具车': { pinyin: 'wán jù chē', english: 'toy car', explanation: '小孩子玩的汽车玩具。', pages: [4] },
  '弟弟': { pinyin: 'dì di', english: 'younger brother', explanation: '比自己小的兄弟。', pages: [4] },
  '姐姐': { pinyin: 'jiě jie', english: 'older sister', explanation: '比自己大的姐妹。', pages: [4] },
  '唱歌': { pinyin: 'chàng gē', english: 'sing', explanation: '用嘴巴唱出歌曲。', pages: [4] },
  '小狗': { pinyin: 'xiǎo gǒu', english: 'puppy, small dog', explanation: '小的狗。', pages: [4] },
  '爸爸': { pinyin: 'bà ba', english: 'father, dad', explanation: '自己的父亲。', pages: [4] },
  '爱护': { pinyin: 'ài hù', english: 'cherish, take care of', explanation: '爱惜和保护。', pages: [4] },
  '哥哥': { pinyin: 'gē ge', english: 'older brother', explanation: '比自己大的兄弟。', pages: [4, 5] },
  '获得': { pinyin: 'huò dé', english: 'obtain, gain', explanation: '得到。', pages: [4] },
  '运动会': { pinyin: 'yùn dòng huì', english: 'sports meet', explanation: '学校举办的运动比赛。', pages: [4] },
  '差不多': { pinyin: 'chà bù duō', english: 'about the same', explanation: '几乎一样。', pages: [4] },
  '非常': { pinyin: 'fēi cháng', english: 'very', explanation: '非常，很。', pages: [4] },
  '去掉': { pinyin: 'qù diào', english: 'remove', explanation: '删掉，拿掉。', pages: [4] },
  '开心': { pinyin: 'kāi xīn', english: 'happy', explanation: '高兴。', pages: [4] },
  '改成': { pinyin: 'gǎi chéng', english: 'change to', explanation: '改变成为。', pages: [4] },
  '代替': { pinyin: 'dài tì', english: 'replace', explanation: '用另一个代替。', pages: [4] },
  '不知道': { pinyin: 'bù zhī dào', english: 'don\'t know', explanation: '不了解。', pages: [4] },
  '觉得': { pinyin: 'jué de', english: 'think, feel', explanation: '认为，感觉。', pages: [4] },
  '东西': { pinyin: 'dōng xi', english: 'thing, stuff', explanation: '物品。', pages: [4] },
  '吃饱': { pinyin: 'chī bǎo', english: 'eat until full', explanation: '吃得饱了。', pages: [4] },
  '两支': { pinyin: 'liǎng zhī', english: 'two (teams)', explanation: '两个。', pages: [4] },
  '球队': { pinyin: 'qiú duì', english: 'sports team', explanation: '运动队伍。', pages: [4] },
  '在家': { pinyin: 'zài jiā', english: 'at home', explanation: '在家里。', pages: [4] },
  '去了': { pinyin: 'qù le', english: 'went', explanation: '到别的地方去了。', pages: [4] },
  '哪里': { pinyin: 'nǎ lǐ', english: 'where', explanation: '什么地方。', pages: [4] },
  '很好听': { pinyin: 'hěn hǎo tīng', english: 'very nice to listen', explanation: '听起来很好。', pages: [4] },
  '不要': { pinyin: 'bù yào', english: 'don\'t', explanation: '不可以。', pages: [4, 11] },
  '好好': { pinyin: 'hǎo hǎo', english: 'properly', explanation: '认真地。', pages: [4] },

  // === 语文园地 - 学一学 (p5) ===
  '忍不住': { pinyin: 'rěn bù zhù', english: 'cannot help but', explanation: '控制不了自己，一定要做某事。', pages: [5] },
  '了不起': { pinyin: 'liǎo bù qǐ', english: 'remarkable, amazing', explanation: '非常厉害，让人佩服。', pages: [5] },
  '来不及': { pinyin: 'lái bù jí', english: 'too late, no time', explanation: '时间不够，赶不上。', pages: [5] },
  '电视': { pinyin: 'diàn shì', english: 'TV, television', explanation: '看节目的电器。', pages: [5] },
  '节目': { pinyin: 'jié mù', english: 'program, show', explanation: '电视上播放的内容。', pages: [5] },
  '表达': { pinyin: 'biǎo dá', english: 'express', explanation: '把想法说出来。', pages: [5] },
  '表演': { pinyin: 'biǎo yǎn', english: 'perform, performance', explanation: '在别人面前展示才艺或演出。', pages: [5] },
  '项目': { pinyin: 'xiàng mù', english: 'project', explanation: '要完成的一件事或活动。', pages: [5] },
  '闹钟': { pinyin: 'nào zhōng', english: 'alarm clock', explanation: '到了设定的时间会响的钟。', pages: [5] },
  '校车': { pinyin: 'xiào chē', english: 'school bus', explanation: '接送学生上下学的车。', pages: [5] },
  '篮球赛': { pinyin: 'lán qiú sài', english: 'basketball game', explanation: '篮球比赛。', pages: [5] },
  '新闻': { pinyin: 'xīn wén', english: 'news', explanation: '最新发生的事情。', pages: [5] },
  '播放': { pinyin: 'bō fàng', english: 'broadcast, play', explanation: '电视上放出节目。', pages: [5] },
  '连续剧': { pinyin: 'lián xù jù', english: 'TV series, drama', explanation: '一集接一集的电视剧。', pages: [5] },
  '心情': { pinyin: 'xīn qíng', english: 'mood', explanation: '心里的感觉。', pages: [5] },
  '愉快': { pinyin: 'yú kuài', english: 'happy, pleasant', explanation: '高兴，开心。', pages: [5] },
  '精彩': { pinyin: 'jīng cǎi', english: 'wonderful, exciting', explanation: '非常好看。', pages: [5] },
  '入迷': { pinyin: 'rù mí', english: 'fascinated', explanation: '看得太专心了。', pages: [5] },
  '炸鸡腿': { pinyin: 'zhà jī tuǐ', english: 'fried chicken leg', explanation: '油炸的鸡腿。', pages: [5] },
  '流口水': { pinyin: 'liú kǒu shuǐ', english: 'drool', explanation: '口水流出来，形容很想吃。', pages: [5] },
  '面包': { pinyin: 'miàn bāo', english: 'bread', explanation: '用面粉做的食物。', pages: [5] },
  '科学家': { pinyin: 'kē xué jiā', english: 'scientist', explanation: '研究科学的人。', pages: [5] },
  '发明': { pinyin: 'fā míng', english: 'invent', explanation: '创造出新的东西。', pages: [5] },
  '衣服': { pinyin: 'yī fu', english: 'clothes', explanation: '穿在身上的东西。', pages: [5] },
  '淋湿': { pinyin: 'lín shī', english: 'get wet (by rain)', explanation: '被雨水弄湿。', pages: [5] },
  '谈论': { pinyin: 'tán lùn', english: 'discuss', explanation: '大家一起说某个话题。', pages: [5] },
  '演出': { pinyin: 'yǎn chū', english: 'performance', explanation: '表演节目。', pages: [5] },
  '使用': { pinyin: 'shǐ yòng', english: 'use', explanation: '拿来用。', pages: [5] },
  '句型': { pinyin: 'jù xíng', english: 'sentence pattern', explanation: '句子的格式。', pages: [5] },
  '大喊': { pinyin: 'dà hǎn', english: 'shout', explanation: '大声叫。', pages: [5] },
  '好看': { pinyin: 'hǎo kàn', english: 'good-looking', explanation: '漂亮的。', pages: [5] },
  '太香': { pinyin: 'tài xiāng', english: 'too fragrant', explanation: '非常香。', pages: [5] },
  '小丽': { pinyin: 'xiǎo lì', english: 'Xiao Li (name)', explanation: '人物名字。', pages: [5, 7] },
  '早餐': { pinyin: 'zǎo cān', english: 'breakfast', explanation: '早上吃的饭。', pages: [5] },
  '抓起': { pinyin: 'zhuā qǐ', english: 'grab', explanation: '用手拿起来。', pages: [5] },
  '跑出门': { pinyin: 'pǎo chū mén', english: 'run out the door', explanation: '跑出家门。', pages: [5] },
  '带有': { pinyin: 'dài yǒu', english: 'contain', explanation: '含有。', pages: [5] },
  '正确': { pinyin: 'zhèng què', english: 'correct', explanation: '对的。', pages: [5] },
  '答案': { pinyin: 'dá àn', english: 'answer', explanation: '问题的回答。', pages: [5] },
  '代表': { pinyin: 'dài biǎo', english: 'represent', explanation: '代替表示。', pages: [5] },
  '数字': { pinyin: 'shù zì', english: 'number', explanation: '用来计数的字。', pages: [5] },
  '括号': { pinyin: 'kuò hào', english: 'bracket, parentheses', explanation: '标点符号的一种。', pages: [5] },
  '难不倒': { pinyin: 'nán bù dǎo', english: 'can\'t stump/defeat', explanation: '难不住，不怕困难。', pages: [5] },
  '受不了': { pinyin: 'shòu bù liǎo', english: 'can\'t stand', explanation: '忍受不了。', pages: [5] },
  '好笑': { pinyin: 'hǎo xiào', english: 'funny', explanation: '让人想笑。', pages: [5] },
  '一个人': { pinyin: 'yī gè rén', english: 'one person, alone', explanation: '只有自己。', pages: [5] },
  '完成': { pinyin: 'wán chéng', english: 'complete', explanation: '做完了。', pages: [5] },
  '没响': { pinyin: 'méi xiǎng', english: 'didn\'t ring', explanation: '没有发出声音。', pages: [5] },
  '起晚': { pinyin: 'qǐ wǎn', english: 'wake up late', explanation: '起床太迟了。', pages: [5] },
  '有用': { pinyin: 'yǒu yòng', english: 'useful', explanation: '有帮助的。', pages: [5] },
  '外面': { pinyin: 'wài miàn', english: 'outside', explanation: '在外头。', pages: [5] },
  '拍着': { pinyin: 'pāi zhe', english: 'clapping', explanation: '用手拍打。', pages: [5] },
  '手掌': { pinyin: 'shǒu zhǎng', english: 'palm', explanation: '手的内侧。', pages: [5] },
  '叫好': { pinyin: 'jiào hǎo', english: 'cheer, applaud', explanation: '大声说好。', pages: [5] },

  // === 品德园地 - 三字经 + 孔子 (p6) ===
  '论语': { pinyin: 'lún yǔ', english: 'The Analects (Confucius)', explanation: '记录孔子和学生谈话的书。', pages: [6] },
  '弟子': { pinyin: 'dì zǐ', english: 'disciple, student', explanation: '跟着老师学习的人。', pages: [6] },
  '善言': { pinyin: 'shàn yán', english: 'wise words', explanation: '好的、有道理的话。', pages: [6] },
  '思想家': { pinyin: 'sī xiǎng jiā', english: 'thinker, philosopher', explanation: '有很深想法的人。', pages: [6] },
  '请教': { pinyin: 'qǐng jiào', english: 'ask for advice', explanation: '向别人请求教导。', pages: [6] },
  '看法': { pinyin: 'kàn fǎ', english: 'opinion, view', explanation: '对事情的想法。', pages: [6] },
  '善良': { pinyin: 'shàn liáng', english: 'kind, kindhearted', explanation: '心地好，愿意帮助别人。', pages: [6] },
  '口才': { pinyin: 'kǒu cái', english: 'eloquence', explanation: '说话的能力很好。', pages: [6] },
  '勇敢': { pinyin: 'yǒng gǎn', english: 'brave, courageous', explanation: '不怕困难和危险。', pages: [6, 12, 13] },
  '超过': { pinyin: 'chāo guò', english: 'surpass, exceed', explanation: '比别人做得更好。', pages: [6] },
  '行礼': { pinyin: 'xíng lǐ', english: 'bow, salute', explanation: '做出表示尊敬的动作。', pages: [6] },
  '善心': { pinyin: 'shàn xīn', english: 'kind heart', explanation: '善良的心。', pages: [6] },
  '沉默': { pinyin: 'chén mò', english: 'silence', explanation: '不说话，安静。', pages: [6] },
  '力量': { pinyin: 'lì liang', english: 'strength, power', explanation: '力气，能力。', pages: [6] },
  '谦虚': { pinyin: 'qiān xū', english: 'humble, modest', explanation: '不骄傲，觉得自己还不够好。', pages: [6] },
  '礼让': { pinyin: 'lǐ ràng', english: 'be courteous, yield', explanation: '礼貌地让给别人。', pages: [6] },
  '胜过': { pinyin: 'shèng guò', english: 'surpass', explanation: '超过别人。', pages: [6] },
  '帮助': { pinyin: 'bāng zhù', english: 'help', explanation: '给别人支持和力量。', pages: [6, 7] },
  '孔子': { pinyin: 'kǒng zǐ', english: 'Confucius', explanation: '中国古代伟大的思想家和教育家。', pages: [6] },
  '子夏': { pinyin: 'zǐ xià', english: 'Zixia (student of Confucius)', explanation: '孔子的学生之一。', pages: [6] },
  '学生': { pinyin: 'xué shēng', english: 'student', explanation: '在学校学习的人。', pages: [6] },
  '同学': { pinyin: 'tóng xué', english: 'classmate', explanation: '在同一个班级或学校学习的人。', pages: [6] },
  '回答': { pinyin: 'huí dá', english: 'answer', explanation: '对别人的问题给出答案。', pages: [6] },
  '明白': { pinyin: 'míng bai', english: 'understand', explanation: '懂了，知道了。', pages: [3, 6] },
  '智慧': { pinyin: 'zhì huì', english: 'wisdom', explanation: '聪明的想法和判断。', pages: [6] },
  '道理': { pinyin: 'dào lǐ', english: 'principle, truth', explanation: '正确的道理和规律。', pages: [6] },
  '整理': { pinyin: 'zhěng lǐ', english: 'organize', explanation: '把东西收拾好、排列好。', pages: [6] },
  '编写': { pinyin: 'biān xiě', english: 'compile, write', explanation: '把材料收集起来写成书。', pages: [6] },
  '记录': { pinyin: 'jì lù', english: 'record', explanation: '写下来保存。', pages: [6] },
  '充满': { pinyin: 'chōng mǎn', english: 'full of', explanation: '装满了。', pages: [6] },
  '思考': { pinyin: 'sī kǎo', english: 'think, reflect', explanation: '认真地想。', pages: [6] },
  '教给': { pinyin: 'jiāo gěi', english: 'teach (someone)', explanation: '教别人。', pages: [6] },
  '做人': { pinyin: 'zuò rén', english: 'behave, conduct oneself', explanation: '怎样做一个好人。', pages: [6] },
  '古时候': { pinyin: 'gǔ shí hou', english: 'ancient times', explanation: '很久以前的时候。', pages: [6] },
  '有名': { pinyin: 'yǒu míng', english: 'famous', explanation: '很多人知道的。', pages: [6] },
  '一天': { pinyin: 'yī tiān', english: 'one day', explanation: '某一天。', pages: [6] },
  '跟着': { pinyin: 'gēn zhe', english: 'follow', explanation: '跟在后面。', pages: [6] },
  '做得好': { pinyin: 'zuò de hǎo', english: 'done well', explanation: '做得很好。', pages: [6] },
  '很会': { pinyin: 'hěn huì', english: 'good at', explanation: '非常擅长。', pages: [6] },
  '说话': { pinyin: 'shuō huà', english: 'speak, talk', explanation: '用嘴说。', pages: [6] },
  '每个': { pinyin: 'měi gè', english: 'each, every', explanation: '每一个。', pages: [6] },
  '更好': { pinyin: 'gèng hǎo', english: 'better', explanation: '比以前好。', pages: [6] },
  '不是': { pinyin: 'bú shì', english: 'not, isn\'t', explanation: '表示否定。', pages: [6] },
  '乱用': { pinyin: 'luàn yòng', english: 'misuse', explanation: '乱用，不好好地用。', pages: [6] },

  // === 品德园地 - 学习别人好的言行 (p7) ===
  '言行': { pinyin: 'yán xíng', english: 'words and deeds', explanation: '说的话和做的事。', pages: [7] },
  '改正': { pinyin: 'gǎi zhèng', english: 'correct, fix', explanation: '把错的改成对的。', pages: [7] },
  '学习': { pinyin: 'xué xí', english: 'study, learn', explanation: '获取知识和技能。', pages: [6, 7] },
  '品德': { pinyin: 'pǐn dé', english: 'moral character', explanation: '一个人的道德和行为。', pages: [7] },
  '优点': { pinyin: 'yōu diǎn', english: 'strengths', explanation: '好的地方。', pages: [7] },
  '长处': { pinyin: 'cháng chù', english: 'strong point', explanation: '擅长的地方。', pages: [7] },
  '提升': { pinyin: 'tí shēng', english: 'improve', explanation: '变得更好。', pages: [7] },
  '观察': { pinyin: 'guān chá', english: 'observe', explanation: '仔细地看。', pages: [7] },
  '垃圾': { pinyin: 'lā jī', english: 'garbage, rubbish', explanation: '不要的东西，要丢掉的废物。', pages: [7] },
  '马路': { pinyin: 'mǎ lù', english: 'road', explanation: '车辆和行人走的大路。', pages: [7] },
  '主动': { pinyin: 'zhǔ dòng', english: 'proactive, take initiative', explanation: '自己愿意去做，不需要别人催。', pages: [7] },
  '虚心': { pinyin: 'xū xīn', english: 'humble, open-minded', explanation: '不骄傲，愿意向别人学习。', pages: [7] },
  '不断': { pinyin: 'bù duàn', english: 'continuously', explanation: '一直不停地。', pages: [7] },
  '坚持': { pinyin: 'jiān chí', english: 'persist', explanation: '不放弃，一直做下去。', pages: [7] },
  '练习': { pinyin: 'liàn xí', english: 'practice', explanation: '反复做来提高技能。', pages: [7] },
  '发现': { pinyin: 'fā xiàn', english: 'discover', explanation: '找到以前不知道的东西。', pages: [7] },
  '乐于助人': { pinyin: 'lè yú zhù rén', english: 'happy to help others', explanation: '很乐意帮助别人。', pages: [7] },
  '教教': { pinyin: 'jiāo jiāo', english: 'teach (me)', explanation: '教一教，请别人指导自己。', pages: [7] },
  '全面': { pinyin: 'quán miàn', english: 'comprehensive', explanation: '各个方面都包括。', pages: [7] },
  '优秀': { pinyin: 'yōu xiù', english: 'excellent', explanation: '非常好，非常棒。', pages: [7] },
  '跌倒': { pinyin: 'diē dǎo', english: 'fall down', explanation: '摔倒在地上。', pages: [7] },
  '跳绳': { pinyin: 'tiào shéng', english: 'jump rope', explanation: '跳过绳子的运动。', pages: [7] },
  '厉害': { pinyin: 'lì hai', english: 'impressive/amazing', explanation: '非常棒，让人佩服。', pages: [7] },
  '理由': { pinyin: 'lǐ yóu', english: 'reason', explanation: '做某件事的原因。', pages: [7] },
  '想法': { pinyin: 'xiǎng fǎ', english: 'idea/thought', explanation: '心里想的事情。', pages: [7] },
  '方面': { pinyin: 'fāng miàn', english: 'aspect', explanation: '事物的某一部分或方向。', pages: [7] },
  '明文': { pinyin: 'míng wén', english: 'Ming Wen (name)', explanation: '人物名字。', pages: [7] },
  '方法': { pinyin: 'fāng fǎ', english: 'method', explanation: '做事的方式。', pages: [7] },
  '自己': { pinyin: 'zì jǐ', english: 'oneself', explanation: '自己本人。', pages: [7] },
  '管他': { pinyin: 'guǎn tā', english: 'care about him', explanation: '去管别人的事。', pages: [7] },
  '值得': { pinyin: 'zhí de', english: 'worth', explanation: '有价值的。', pages: [7] },
  '好行为': { pinyin: 'hǎo xíng wéi', english: 'good behavior', explanation: '好的做法。', pages: [7] },
  '用心': { pinyin: 'yòng xīn', english: 'attentively', explanation: '认真用心地。', pages: [7] },
  '小月': { pinyin: 'xiǎo yuè', english: 'Xiao Yue (name)', explanation: '人物名字。', pages: [7] },
  '越来越': { pinyin: 'yuè lái yuè', english: 'more and more', explanation: '越来越。', pages: [7, 13] },
  '知道': { pinyin: 'zhī dào', english: 'know', explanation: '了解。', pages: [7] },
  '为什么': { pinyin: 'wèi shén me', english: 'why', explanation: '什么原因。', pages: [7] },
  '做法': { pinyin: 'zuò fǎ', english: 'approach, method', explanation: '做事的方法。', pages: [7, 11] },
  '对的': { pinyin: 'duì de', english: 'correct', explanation: '对的，正确的。', pages: [7] },
  '错的': { pinyin: 'cuò de', english: 'wrong', explanation: '不对的。', pages: [7] },
  '女生': { pinyin: 'nǚ shēng', english: 'girl', explanation: '女孩子。', pages: [7] },

  // === 我想快点长大 (p8-9) ===
  '长大': { pinyin: 'zhǎng dà', english: 'grow up', explanation: '从小孩变成大人。', pages: [8, 9] },
  '希望': { pinyin: 'xī wàng', english: 'hope, wish', explanation: '想要某件事发生。', pages: [8] },
  '时间': { pinyin: 'shí jiān', english: 'time', explanation: '小时、分钟等。', pages: [8, 9] },
  '爷爷': { pinyin: 'yé ye', english: 'grandfather', explanation: '爸爸的爸爸。', pages: [8] },
  '奶奶': { pinyin: 'nǎi nai', english: 'grandmother', explanation: '爸爸的妈妈。', pages: [8] },
  '菜园': { pinyin: 'cài yuán', english: 'vegetable garden', explanation: '种蔬菜的地方。', pages: [8] },
  '番茄': { pinyin: 'fān qié', english: 'tomato', explanation: '红色的蔬菜，也叫西红柿。', pages: [8] },
  '擦擦汗': { pinyin: 'cā cā hàn', english: 'wipe sweat', explanation: '用手或布把汗擦掉。', pages: [8] },
  '种菜': { pinyin: 'zhòng cài', english: 'grow vegetables', explanation: '种蔬菜。', pages: [8] },
  '书房': { pinyin: 'shū fáng', english: 'study room', explanation: '读书写字的房间。', pages: [8] },
  '毛笔字': { pinyin: 'máo bǐ zì', english: 'calligraphy', explanation: '用毛笔写的字。', pages: [8] },
  '交给': { pinyin: 'jiāo gěi', english: 'hand over to', explanation: '把东西给别人。', pages: [8] },
  '落选': { pinyin: 'luò xuǎn', english: 'not selected', explanation: '没有被选上。', pages: [9] },
  '篮球队': { pinyin: 'lán qiú duì', english: 'basketball team', explanation: '打篮球的队伍。', pages: [9] },
  '疲倦': { pinyin: 'pí juàn', english: 'tired, weary', explanation: '很累的样子。', pages: [9] },
  '下班': { pinyin: 'xià bān', english: 'get off work', explanation: '工作结束了。', pages: [9] },
  '休息': { pinyin: 'xiū xi', english: 'rest', explanation: '不做事，让身体恢复力气。', pages: [9] },
  '经过': { pinyin: 'jīng guò', english: 'what happened', explanation: '事情的过程。', pages: [9] },
  '叹了一口气': { pinyin: 'tàn le yī kǒu qì', english: 'sighed', explanation: '因为难过或无奈，长长地呼出一口气。', pages: [9] },
  '关心': { pinyin: 'guān xīn', english: 'care about', explanation: '对别人的事情放在心上。', pages: [9] },
  '可丽': { pinyin: 'kě lì', english: 'Ke Li (name)', explanation: '故事中的人物名字。', pages: [8, 9] },
  '立明': { pinyin: 'lì míng', english: 'Li Ming (name)', explanation: '故事中的人物名字。', pages: [8, 9] },
  '李阿姨': { pinyin: 'lǐ ā yí', english: 'Auntie Li', explanation: '故事中的大人，姓李的阿姨。', pages: [8, 9] },
  '快点': { pinyin: 'kuài diǎn', english: 'hurry up, quickly', explanation: '快一些。', pages: [8] },
  '需要': { pinyin: 'xū yào', english: 'need', explanation: '必须有的。', pages: [8] },
  '对了': { pinyin: 'duì le', english: 'oh right, by the way', explanation: '想到了。', pages: [8] },
  '跑到': { pinyin: 'pǎo dào', english: 'run to', explanation: '跑着去到。', pages: [8] },
  '分给': { pinyin: 'fēn gěi', english: 'share with, give part', explanation: '分一些给别人。', pages: [8] },
  '红番茄': { pinyin: 'hóng fān qié', english: 'red tomato', explanation: '红色的番茄。', pages: [8] },
  '装着': { pinyin: 'zhuāng zhe', english: 'contains', explanation: '放着，装在里面。', pages: [8] },
  '接着': { pinyin: 'jiē zhe', english: 'next, then', explanation: '然后。', pages: [8] },
  '很多遍': { pinyin: 'hěn duō biàn', english: 'many times', explanation: '重复很多次。', pages: [8] },
  '花了': { pinyin: 'huā le', english: 'spent', explanation: '用了（时间或金钱）。', pages: [8] },
  '捧着': { pinyin: 'pěng zhe', english: 'holding (in both hands)', explanation: '双手捧着。', pages: [8] },
  '快快': { pinyin: 'kuài kuài', english: 'quickly', explanation: '很快地。', pages: [8, 9] },
  '遇到': { pinyin: 'yù dào', english: 'encounter', explanation: '碰到。', pages: [9] },
  '因为': { pinyin: 'yīn wèi', english: 'because', explanation: '由于。', pages: [9] },
  '递上': { pinyin: 'dì shàng', english: 'hand over', explanation: '把东西递过去。', pages: [9] },
  '放在': { pinyin: 'fàng zài', english: 'put in', explanation: '放到某个地方。', pages: [9] },
  '练好': { pinyin: 'liàn hǎo', english: 'practice well', explanation: '练习到好。', pages: [9] },
  '进入': { pinyin: 'jìn rù', english: 'enter', explanation: '走进去。', pages: [9] },
  '楼下': { pinyin: 'lóu xià', english: 'downstairs', explanation: '楼的下面。', pages: [9] },
  '有些': { pinyin: 'yǒu xiē', english: 'some, a bit', explanation: '一点点。', pages: [9] },
  '于是': { pinyin: 'yú shì', english: 'so, therefore', explanation: '因此。', pages: [9] },
  '送上': { pinyin: 'sòng shàng', english: 'offer, give', explanation: '送过去。', pages: [9] },
  '回到': { pinyin: 'huí dào', english: 'return to', explanation: '回来到。', pages: [9] },
  '告诉': { pinyin: 'gào su', english: 'tell', explanation: '把事情说给别人听。', pages: [9, 16] },
  '然后': { pinyin: 'rán hòu', english: 'then', explanation: '接下来。', pages: [9] },
  '送人': { pinyin: 'sòng rén', english: 'give to others', explanation: '送给别人。', pages: [9] },
  '不能': { pinyin: 'bù néng', english: 'cannot', explanation: '没办法。', pages: [9] },
  '摸摸': { pinyin: 'mō mo', english: 'pat, touch gently', explanation: '轻轻地用手摸。', pages: [9] },
  '别人': { pinyin: 'bié rén', english: 'others', explanation: '其他人。', pages: [9] },
  '真的': { pinyin: 'zhēn de', english: 'really', explanation: '确实是的。', pages: [9] },

  // === 技能园地 - 作文 (p10) ===
  '作文': { pinyin: 'zuò wén', english: 'essay, composition', explanation: '学生写的文章。', pages: [10] },
  '外貌': { pinyin: 'wài mào', english: 'appearance', explanation: '一个人外表的样子。', pages: [10] },
  '身材': { pinyin: 'shēn cái', english: 'body shape', explanation: '身体的高矮胖瘦。', pages: [10] },
  '爱好': { pinyin: 'ài hào', english: 'hobbies', explanation: '喜欢做的事情。', pages: [10] },
  '描写': { pinyin: 'miáo xiě', english: 'describe', explanation: '用文字写出事物的样子。', pages: [10] },
  '动作': { pinyin: 'dòng zuò', english: 'action, movement', explanation: '身体做出的动作。', pages: [10, 11] },
  '场景': { pinyin: 'chǎng jǐng', english: 'scene', explanation: '事情发生的地方和情景。', pages: [10] },
  '祝福': { pinyin: 'zhù fú', english: 'blessing, wish well', explanation: '希望别人好。', pages: [10] },
  '头发': { pinyin: 'tóu fa', english: 'hair', explanation: '长在头上的毛发。', pages: [10] },
  '眼睛': { pinyin: 'yǎn jīng', english: 'eyes', explanation: '用来看东西的器官。', pages: [10] },
  '穿着': { pinyin: 'chuān zhuó', english: 'clothing, dress', explanation: '穿在身上的衣服和打扮。', pages: [10] },
  '三步法': { pinyin: 'sān bù fǎ', english: 'three-step method', explanation: '分三个步骤的方法。', pages: [10] },
  '感受': { pinyin: 'gǎn shòu', english: 'feeling', explanation: '心里的感觉和体会。', pages: [10] },
  '乌黑': { pinyin: 'wū hēi', english: 'jet black', explanation: '非常黑，像乌鸦一样。', pages: [10] },
  '短发': { pinyin: 'duǎn fà', english: 'short hair', explanation: '短的头发。', pages: [10] },
  '眉毛': { pinyin: 'méi mao', english: 'eyebrow', explanation: '眼睛上面的毛。', pages: [10] },
  '炯炯有神': { pinyin: 'jiǒng jiǒng yǒu shén', english: 'bright and spirited (eyes)', explanation: '形容眼睛明亮有精神。', pages: [10] },
  '宝石': { pinyin: 'bǎo shí', english: 'gemstone', explanation: '珍贵的石头。', pages: [10] },
  '闪亮': { pinyin: 'shǎn liàng', english: 'sparkling', explanation: '发出光亮。', pages: [10] },
  '姓名': { pinyin: 'xìng míng', english: 'name', explanation: '姓和名字。', pages: [10] },
  '年龄': { pinyin: 'nián líng', english: 'age', explanation: '几岁了。', pages: [10] },
  '身份': { pinyin: 'shēn fèn', english: 'identity', explanation: '一个人的角色或地位。', pages: [10] },
  '顺序': { pinyin: 'shùn xù', english: 'order, sequence', explanation: '按照一定的排列。', pages: [10] },
  '读者': { pinyin: 'dú zhě', english: 'reader', explanation: '看书或文章的人。', pages: [10] },
  '游泳': { pinyin: 'yóu yǒng', english: 'swim', explanation: '在水里游。', pages: [10] },
  '游泳馆': { pinyin: 'yóu yǒng guǎn', english: 'swimming pool', explanation: '游泳的地方。', pages: [10] },
  '蝶泳': { pinyin: 'dié yǒng', english: 'butterfly stroke', explanation: '一种游泳方式。', pages: [10] },
  '水花': { pinyin: 'shuǐ huā', english: 'splash', explanation: '水溅起来的样子。', pages: [10] },
  '健康': { pinyin: 'jiàn kāng', english: 'healthy', explanation: '身体好。', pages: [10] },
  '目标': { pinyin: 'mù biāo', english: 'goal, target', explanation: '想要达到的目的。', pages: [10] },
  '具体': { pinyin: 'jù tǐ', english: 'specific, concrete', explanation: '详细的，不模糊的。', pages: [10] },
  '九岁': { pinyin: 'jiǔ suì', english: 'nine years old', explanation: '九岁。', pages: [10] },
  '浓浓': { pinyin: 'nóng nóng', english: 'thick, dense', explanation: '很浓的样子。', pages: [10] },
  '比较高': { pinyin: 'bǐ jiào gāo', english: 'relatively tall', explanation: '比一般的高。', pages: [10] },
  '自由自在': { pinyin: 'zì yóu zì zài', english: 'free and easy', explanation: '没有束缚，很自由。', pages: [10] },
  '拿手': { pinyin: 'ná shǒu', english: 'skilled at, forte', explanation: '擅长的事。', pages: [10] },
  '比赛': { pinyin: 'bǐ sài', english: 'competition', explanation: '互相比较争夺。', pages: [10] },
  '身体': { pinyin: 'shēn tǐ', english: 'body', explanation: '人的身体。', pages: [10] },
  '继续': { pinyin: 'jì xù', english: 'continue', explanation: '接下去做。', pages: [10] },
  '前进': { pinyin: 'qián jìn', english: 'advance, move forward', explanation: '向前走。', pages: [10] },
  '写作': { pinyin: 'xiě zuò', english: 'writing (composition)', explanation: '写文章。', pages: [10] },
  '好朋友': { pinyin: 'hǎo péng you', english: 'good friend', explanation: '关系好的朋友。', pages: [10] },
  '一头': { pinyin: 'yī tóu', english: 'a head of (hair)', explanation: '形容头发。', pages: [10] },
  '一双': { pinyin: 'yī shuāng', english: 'a pair of', explanation: '两个一组。', pages: [10] },
  '最高': { pinyin: 'zuì gāo', english: 'tallest', explanation: '最高的。', pages: [10] },
  '介绍': { pinyin: 'jiè shào', english: 'introduce', explanation: '把事物说给别人认识。', pages: [10] },
  '五官': { pinyin: 'wǔ guān', english: 'facial features', explanation: '眼耳口鼻的总称。', pages: [10] },
  '抓住': { pinyin: 'zhuā zhù', english: 'grasp, capture', explanation: '抓牢不放。', pages: [10] },
  '突出': { pinyin: 'tū chū', english: 'outstanding', explanation: '特别明显的。', pages: [10] },
  '特点': { pinyin: 'tè diǎn', english: 'characteristic', explanation: '特别的地方。', pages: [10] },
  '经常': { pinyin: 'jīng cháng', english: 'often', explanation: '常常。', pages: [10] },
  '跳入': { pinyin: 'tiào rù', english: 'jump into', explanation: '跳进去。', pages: [10] },
  '水中': { pinyin: 'shuǐ zhōng', english: 'in water', explanation: '水里面。', pages: [10] },
  '变成': { pinyin: 'biàn chéng', english: 'become, turn into', explanation: '变化成为。', pages: [10] },
  '小鱼儿': { pinyin: 'xiǎo yú er', english: 'little fish', explanation: '小小的鱼。', pages: [10] },
  '打起': { pinyin: 'dǎ qǐ', english: 'create, stir up', explanation: '弄出来。', pages: [10] },
  '同时': { pinyin: 'tóng shí', english: 'at the same time', explanation: '同一时间。', pages: [10] },
  '学到': { pinyin: 'xué dào', english: 'learn (successfully)', explanation: '学会了。', pages: [10] },
  '很多': { pinyin: 'hěn duō', english: 'many, a lot', explanation: '数量很大。', pages: [10] },
  '终于': { pinyin: 'zhōng yú', english: 'finally', explanation: '经过努力最后。', pages: [10, 11] },
  '第一名': { pinyin: 'dì yī míng', english: 'first place', explanation: '冠军。', pages: [10] },
  '更高': { pinyin: 'gèng gāo', english: 'higher', explanation: '比现在还高。', pages: [10] },

  // === 技能园地 - 阅读理解 (p11) ===
  '阅读理解': { pinyin: 'yuè dú lǐ jiě', english: 'reading comprehension', explanation: '读懂文章内容后回答问题。', pages: [11] },
  '题目': { pinyin: 'tí mù', english: 'question, title', explanation: '要回答的问题。', pages: [11] },
  '答题': { pinyin: 'dá tí', english: 'answer questions', explanation: '回答问题。', pages: [11] },
  '短文': { pinyin: 'duǎn wén', english: 'short passage', explanation: '一篇短的文章。', pages: [11] },
  '原文': { pinyin: 'yuán wén', english: 'original text', explanation: '文章本来的内容。', pages: [11] },
  '道歉': { pinyin: 'dào qiàn', english: 'apologize', explanation: '做错了事向别人说对不起。', pages: [11] },
  '悄悄': { pinyin: 'qiāo qiāo', english: 'quietly, secretly', explanation: '不让别人知道。', pages: [11] },
  '文章': { pinyin: 'wén zhāng', english: 'article, essay', explanation: '写出来的一篇完整文字。', pages: [11] },
  '人物': { pinyin: 'rén wù', english: 'character (in story)', explanation: '故事中出现的人。', pages: [11] },
  '仔细': { pinyin: 'zǐ xì', english: 'careful, carefully', explanation: '认真地、不马虎地。', pages: [11] },
  '掌握': { pinyin: 'zhǎng wò', english: 'master, grasp', explanation: '学会了，能熟练使用。', pages: [11] },
  '技巧': { pinyin: 'jì qiǎo', english: 'technique, skill', explanation: '做事的方法和窍门。', pages: [11] },
  '关键词': { pinyin: 'guān jiàn cí', english: 'keyword', explanation: '最重要的词语。', pages: [11] },
  '书店': { pinyin: 'shū diàn', english: 'bookstore', explanation: '卖书的商店。', pages: [11] },
  '故事书': { pinyin: 'gù shi shū', english: 'storybook', explanation: '讲故事的书。', pages: [11] },
  '偷偷': { pinyin: 'tōu tōu', english: 'secretly, stealthily', explanation: '不让别人知道地做。', pages: [11] },
  '安心': { pinyin: 'ān xīn', english: 'at ease', explanation: '心里安稳，不担心。', pages: [11] },
  '认错': { pinyin: 'rèn cuò', english: 'admit mistake', explanation: '承认自己做错了。', pages: [11] },
  '夸奖': { pinyin: 'kuā jiǎng', english: 'praise', explanation: '说好话表扬别人。', pages: [11] },
  '完整': { pinyin: 'wán zhěng', english: 'complete', explanation: '全部都有，没有缺少。', pages: [11] },
  '乐乐': { pinyin: 'lè le', english: 'Lele (name)', explanation: '故事中的人物名字。', pages: [11] },
  '不小心': { pinyin: 'bù xiǎo xīn', english: 'accidentally', explanation: '不注意。', pages: [11] },
  '旁边': { pinyin: 'páng biān', english: 'beside', explanation: '在旁边。', pages: [11] },
  '对不起': { pinyin: 'duì bù qǐ', english: 'sorry', explanation: '道歉的话。', pages: [11, 12] },
  '放好': { pinyin: 'fàng hǎo', english: 'put away properly', explanation: '放到对的地方。', pages: [11] },
  '准备': { pinyin: 'zhǔn bèi', english: 'prepare', explanation: '做好准备。', pages: [11] },
  '开始': { pinyin: 'kāi shǐ', english: 'begin, start', explanation: '从头做起。', pages: [11] },
  '常常': { pinyin: 'cháng cháng', english: 'often', explanation: '经常。', pages: [11] },
  '关于': { pinyin: 'guān yú', english: 'about, regarding', explanation: '和某事有关的。', pages: [11] },
  '一定': { pinyin: 'yī dìng', english: 'definitely', explanation: '一定会。', pages: [11] },
  '读完': { pinyin: 'dú wán', english: 'finish reading', explanation: '读完了。', pages: [11] },
  '想一想': { pinyin: 'xiǎng yī xiǎng', english: 'think about it', explanation: '想想看。', pages: [11] },
  '找到': { pinyin: 'zhǎo dào', english: 'find', explanation: '找到了。', pages: [11] },
  '相关': { pinyin: 'xiāng guān', english: 'related', explanation: '有关系的。', pages: [11] },
  '选书': { pinyin: 'xuǎn shū', english: 'choose books', explanation: '挑选书。', pages: [11] },
  '时候': { pinyin: 'shí hou', english: 'time, moment', explanation: '某个时间。', pages: [11] },
  '一本书': { pinyin: 'yī běn shū', english: 'a book', explanation: '一本书。', pages: [11] },
  '弄掉': { pinyin: 'nòng diào', english: 'drop, knock down', explanation: '弄掉了。', pages: [11] },
  '看书': { pinyin: 'kàn shū', english: 'read books', explanation: '看书。', pages: [11] },
  '没法': { pinyin: 'méi fǎ', english: 'can\'t, no way', explanation: '没有办法。', pages: [11] },
  '一直': { pinyin: 'yī zhí', english: 'always, continuously', explanation: '一直不停地。', pages: [11] },
  '想着': { pinyin: 'xiǎng zhe', english: 'thinking about', explanation: '一直在想。', pages: [11] },
  '地上': { pinyin: 'dì shàng', english: 'on the ground', explanation: '地面上。', pages: [11] },
  '好事': { pinyin: 'hǎo shì', english: 'good deed', explanation: '好的事情。', pages: [11] },
  '最好': { pinyin: 'zuì hǎo', english: 'best, had better', explanation: '最好的。', pages: [11] },

  // === 经典园地 - 海力布 (p12-13) ===
  '猎人': { pinyin: 'liè rén', english: 'hunter', explanation: '打猎的人。', pages: [12, 13] },
  '村民': { pinyin: 'cūn mín', english: 'villagers', explanation: '住在村子里的人。', pages: [12, 13] },
  '村庄': { pinyin: 'cūn zhuāng', english: 'village', explanation: '小小的村子。', pages: [12] },
  '打猎': { pinyin: 'dǎ liè', english: 'hunt', explanation: '在野外捕捉动物。', pages: [12] },
  '搏斗': { pinyin: 'bó dòu', english: 'fight, struggle', explanation: '和敌人打架。', pages: [12] },
  '保护': { pinyin: 'bǎo hù', english: 'protect', explanation: '照顾好，不让受到伤害。', pages: [12] },
  '受伤': { pinyin: 'shòu shāng', english: 'get injured', explanation: '身体被弄伤了。', pages: [12] },
  '感激': { pinyin: 'gǎn jī', english: 'grateful', explanation: '心里非常感谢。', pages: [13] },
  '照顾': { pinyin: 'zhào gù', english: 'take care of', explanation: '照看和帮助。', pages: [13] },
  '雷雨': { pinyin: 'léi yǔ', english: 'thunderstorm', explanation: '打雷又下雨。', pages: [13] },
  '妻子': { pinyin: 'qī zi', english: 'wife', explanation: '丈夫的另一半。', pages: [13] },
  '海力布': { pinyin: 'hǎi lì bù', english: 'Halibu (name)', explanation: '故事主角的名字，意思是上天的礼物。', pages: [12, 13] },
  '黑熊': { pinyin: 'hēi xióng', english: 'black bear', explanation: '一种黑色的大熊。', pages: [12] },
  '英勇': { pinyin: 'yīng yǒng', english: 'heroic', explanation: '非常勇敢。', pages: [13] },
  '感动': { pinyin: 'gǎn dòng', english: 'moved, touched', explanation: '心里有很深的感受。', pages: [3, 13] },
  '大熊': { pinyin: 'dà xióng', english: 'big bear', explanation: '体型很大的熊。', pages: [12, 13] },
  '害怕': { pinyin: 'hài pà', english: 'scared, afraid', explanation: '心里感到恐惧。', pages: [12, 13] },
  '男孩': { pinyin: 'nán hái', english: 'boy', explanation: '男生，小男孩。', pages: [12] },
  '父亲': { pinyin: 'fù qīn', english: 'father', explanation: '爸爸。', pages: [12, 13] },
  '山脚': { pinyin: 'shān jiǎo', english: 'foot of mountain', explanation: '山的最下面。', pages: [12] },
  '老天': { pinyin: 'lǎo tiān', english: 'heaven, God', explanation: '上天。', pages: [12] },
  '赐给': { pinyin: 'cì gěi', english: 'bestow, give', explanation: '上天给的。', pages: [12] },
  '机会': { pinyin: 'jī huì', english: 'opportunity', explanation: '好的时机。', pages: [12] },
  '安全': { pinyin: 'ān quán', english: 'safe, safety', explanation: '没有危险。', pages: [12] },
  '猎物': { pinyin: 'liè wù', english: 'prey, game', explanation: '打猎捕到的动物。', pages: [12] },
  '危险': { pinyin: 'wēi xiǎn', english: 'dangerous', explanation: '可能受到伤害。', pages: [12] },
  '箭': { pinyin: 'jiàn', english: 'arrow', explanation: '用弓射出去的武器。', pages: [12] },
  '射中': { pinyin: 'shè zhòng', english: 'hit (with arrow)', explanation: '箭打中了目标。', pages: [12] },
  '吼叫': { pinyin: 'hǒu jiào', english: 'roar', explanation: '大声叫。', pages: [12] },
  '扑来': { pinyin: 'pū lái', english: 'pounce, rush toward', explanation: '猛冲过来。', pages: [12] },
  '不幸': { pinyin: 'bú xìng', english: 'unfortunate', explanation: '不好的事情发生了。', pages: [12, 13] },
  '消息': { pinyin: 'xiāo xi', english: 'news, message', explanation: '告诉别人的信息。', pages: [12, 13] },
  '看望': { pinyin: 'kàn wàng', english: 'visit (someone)', explanation: '去看望生病或需要帮助的人。', pages: [13] },
  '电闪雷鸣': { pinyin: 'diàn shǎn léi míng', english: 'lightning and thunder', explanation: '闪电和打雷。', pages: [13] },
  '哭声': { pinyin: 'kū shēng', english: 'crying sound', explanation: '哭的声音。', pages: [13] },
  '从前': { pinyin: 'cóng qián', english: 'once upon a time', explanation: '很久以前。', pages: [12] },
  '为生': { pinyin: 'wéi shēng', english: 'make a living', explanation: '作为生活的方式。', pages: [12] },
  '用力': { pinyin: 'yòng lì', english: 'with force', explanation: '使劲。', pages: [12] },
  '想必': { pinyin: 'xiǎng bì', english: 'presumably', explanation: '大概，应该是。', pages: [12] },
  '名字': { pinyin: 'míng zi', english: 'name', explanation: '人的名字。', pages: [12] },
  '快去快回': { pinyin: 'kuài qù kuài huí', english: 'go quickly and come back quickly', explanation: '快去快回来。', pages: [12] },
  '上山': { pinyin: 'shàng shān', english: 'go up the mountain', explanation: '到山上去。', pages: [12] },
  '大山': { pinyin: 'dà shān', english: 'big mountain', explanation: '很大的山。', pages: [12] },
  '脚下': { pinyin: 'jiǎo xià', english: 'at the foot of', explanation: '下面。', pages: [12] },
  '小村子': { pinyin: 'xiǎo cūn zi', english: 'small village', explanation: '小小的村庄。', pages: [12] },
  '出事': { pinyin: 'chū shì', english: 'have an accident', explanation: '发生了事故。', pages: [12] },
  '怎么办': { pinyin: 'zěn me bàn', english: 'what to do', explanation: '应该怎么处理。', pages: [12] },
  '一声': { pinyin: 'yī shēng', english: 'a sound/cry', explanation: '一个声音。', pages: [12] },
  '挡住': { pinyin: 'dǎng zhù', english: 'block', explanation: '挡在前面。', pages: [12] },
  '谢谢': { pinyin: 'xiè xie', english: 'thank you', explanation: '感谢。', pages: [13] },
  '挑好': { pinyin: 'tiāo hǎo', english: 'picked out', explanation: '选好了。', pages: [13] },
  '养好': { pinyin: 'yǎng hǎo', english: 'recover well', explanation: '养好身体。', pages: [13] },
  '一天晚上': { pinyin: 'yī tiān wǎn shang', english: 'one evening', explanation: '某个晚上。', pages: [13] },
  '下起': { pinyin: 'xià qǐ', english: 'start to fall (rain)', explanation: '开始下。', pages: [13] },
  '大雨': { pinyin: 'dà yǔ', english: 'heavy rain', explanation: '很大的雨。', pages: [13] },
  '出生': { pinyin: 'chū shēng', english: 'be born', explanation: '生出来。', pages: [13] },
  '孩子': { pinyin: 'hái zi', english: 'child', explanation: '小孩。', pages: [13] },
  '雷声': { pinyin: 'léi shēng', english: 'thunder', explanation: '打雷的声音。', pages: [13] },
  '长得': { pinyin: 'zhǎng de', english: 'grow (appearance)', explanation: '生长的样子。', pages: [13] },

  // === 学生园地 - 农场之旅 (p14) ===
  '风和日丽': { pinyin: 'fēng hé rì lì', english: 'sunny and breezy', explanation: '天气好，风很小，太阳明亮。', pages: [14] },
  '农场': { pinyin: 'nóng chǎng', english: 'farm', explanation: '种地或养动物的地方。', pages: [14] },
  '参观': { pinyin: 'cān guān', english: 'visit, tour', explanation: '去看看某个地方。', pages: [14] },
  '兴奋': { pinyin: 'xīng fèn', english: 'excited', explanation: '非常高兴和激动。', pages: [14] },
  '导游': { pinyin: 'dǎo yóu', english: 'tour guide', explanation: '带人参观游览的人。', pages: [14] },
  '嘉宝果': { pinyin: 'jiā bǎo guǒ', english: 'jabuticaba fruit', explanation: '一种长在树干上的黑色水果。', pages: [14] },
  '树枝': { pinyin: 'shù zhī', english: 'tree branch', explanation: '树上长出来的枝条。', pages: [14] },
  '树干': { pinyin: 'shù gàn', english: 'tree trunk', explanation: '树最粗的部分。', pages: [14] },
  '果实': { pinyin: 'guǒ shí', english: 'fruit', explanation: '植物结出来的可以吃的东西。', pages: [14] },
  '好奇': { pinyin: 'hào qí', english: 'curious', explanation: '对不了解的事情很想知道。', pages: [14] },
  '味道': { pinyin: 'wèi dào', english: 'taste, flavor', explanation: '食物的口味。', pages: [14] },
  '果醋': { pinyin: 'guǒ cù', english: 'fruit vinegar', explanation: '用水果做的醋。', pages: [14] },
  '银蜂': { pinyin: 'yín fēng', english: 'stingless bee', explanation: '一种很小的、没有刺的蜜蜂。', pages: [14] },
  '采蜜': { pinyin: 'cǎi mì', english: 'collect nectar', explanation: '蜜蜂去花上收集蜜。', pages: [14] },
  '蜂箱': { pinyin: 'fēng xiāng', english: 'beehive box', explanation: '养蜜蜂的箱子。', pages: [14] },
  '储存': { pinyin: 'chǔ cún', english: 'store, save', explanation: '把东西存起来。', pages: [14] },
  '花粉': { pinyin: 'huā fěn', english: 'pollen', explanation: '花上面的粉末。', pages: [14] },
  '蜂蜜': { pinyin: 'fēng mì', english: 'honey', explanation: '蜜蜂酿造的甜味食物。', pages: [14] },
  '吸管': { pinyin: 'xī guǎn', english: 'straw', explanation: '用来吸饮料的管子。', pages: [14] },
  '飞虫': { pinyin: 'fēi chóng', english: 'flying insect', explanation: '会飞的小虫子。', pages: [14] },
  '羊角豆': { pinyin: 'yáng jiǎo dòu', english: 'okra', explanation: '一种蔬菜，也叫秋葵。', pages: [14] },
  '依依不舍': { pinyin: 'yī yī bù shě', english: 'reluctant to leave', explanation: '舍不得离开。', pages: [14] },
  '叶子': { pinyin: 'yè zi', english: 'leaf', explanation: '植物上面绿色的薄片。', pages: [14] },
  '妹妹': { pinyin: 'mèi mei', english: 'younger sister', explanation: '比自己小的姐妹。', pages: [14] },
  '叔叔': { pinyin: 'shū shu', english: 'uncle', explanation: '爸爸的弟弟，也泛指年长男性。', pages: [14] },
  '葡萄': { pinyin: 'pú tao', english: 'grape', explanation: '一种圆圆的、一串一串的水果。', pages: [14] },
  '棕色': { pinyin: 'zōng sè', english: 'brown', explanation: '像巧克力一样的颜色。', pages: [14] },
  '口袋': { pinyin: 'kǒu dai', english: 'pocket, pouch', explanation: '衣服上可以装东西的小袋子。', pages: [14] },
  '首先': { pinyin: 'shǒu xiān', english: 'first, firstly', explanation: '最先。', pages: [14] },
  '走近': { pinyin: 'zǒu jìn', english: 'walk close to', explanation: '走到近处。', pages: [14] },
  '感到': { pinyin: 'gǎn dào', english: 'feel', explanation: '心里的感觉。', pages: [14] },
  '甜甜的': { pinyin: 'tián tián de', english: 'sweet', explanation: '甜甜的味道。', pages: [14] },
  '顿时': { pinyin: 'dùn shí', english: 'immediately, suddenly', explanation: '一下子。', pages: [14] },
  '小小的': { pinyin: 'xiǎo xiǎo de', english: 'tiny', explanation: '很小的。', pages: [14] },
  '一家人': { pinyin: 'yī jiā rén', english: 'the whole family', explanation: '全家人。', pages: [14] },
  '许多': { pinyin: 'xǔ duō', english: 'many', explanation: '很多。', pages: [14] },
  '第一次': { pinyin: 'dì yī cì', english: 'first time', explanation: '头一回。', pages: [14] },
  '大多': { pinyin: 'dà duō', english: 'mostly', explanation: '大部分。', pages: [14] },
  '白色': { pinyin: 'bái sè', english: 'white', explanation: '白的颜色。', pages: [14] },
  '其中': { pinyin: 'qí zhōng', english: 'among them', explanation: '在里面。', pages: [14] },
  '一个月': { pinyin: 'yī gè yuè', english: 'one month', explanation: '三十天左右。', pages: [14] },
  '左右': { pinyin: 'zuǒ yòu', english: 'approximately', explanation: '大约。', pages: [14] },
  '装满': { pinyin: 'zhuāng mǎn', english: 'filled with', explanation: '装得满满的。', pages: [14] },
  '以为': { pinyin: 'yǐ wéi', english: 'thought (mistakenly)', explanation: '以为是那样。', pages: [14] },
  '银色': { pinyin: 'yín sè', english: 'silver color', explanation: '银白色。', pages: [14] },
  '之后': { pinyin: 'zhī hòu', english: 'after', explanation: '以后。', pages: [14] },
  '中午': { pinyin: 'zhōng wǔ', english: 'noon', explanation: '中午十二点左右。', pages: [14] },
  '下次': { pinyin: 'xià cì', english: 'next time', explanation: '下一回。', pages: [14] },
  '再来': { pinyin: 'zài lái', english: 'come again', explanation: '再一次来。', pages: [14] },
  '睁得': { pinyin: 'zhēng de', english: 'opened wide (eyes)', explanation: '眼睛睁大。', pages: [14] },
  '大大的': { pinyin: 'dà dà de', english: 'big, large', explanation: '很大的。', pages: [14] },
  '里面': { pinyin: 'lǐ miàn', english: 'inside', explanation: '在里头。', pages: [14] },
  '黑色': { pinyin: 'hēi sè', english: 'black', explanation: '黑的颜色。', pages: [14] },
  '捞鱼': { pinyin: 'lāo yú', english: 'catch fish (with net)', explanation: '用网捞鱼。', pages: [14] },
  '离开': { pinyin: 'lí kāi', english: 'leave', explanation: '走开。', pages: [14] },

  // === 趣味园地 (p15) ===
  '文具': { pinyin: 'wén jù', english: 'stationery', explanation: '学习用的工具。', pages: [15] },
  '尺子': { pinyin: 'chǐ zi', english: 'ruler', explanation: '量长度的工具。', pages: [15] },
  '文具盒': { pinyin: 'wén jù hé', english: 'pencil case', explanation: '装文具的盒子。', pages: [15] },
  '太阳': { pinyin: 'tài yáng', english: 'sun', explanation: '天上发光的星球。', pages: [15] },
  '星星': { pinyin: 'xīng xing', english: 'star', explanation: '天上发光的小点。', pages: [15] },
  '花朵': { pinyin: 'huā duǒ', english: 'flower', explanation: '植物开的花。', pages: [15] },
  '对话': { pinyin: 'duì huà', english: 'dialogue', explanation: '两个人说话。', pages: [15] },
  '表格': { pinyin: 'biǎo gé', english: 'table, chart', explanation: '有格子的表。', pages: [15] },
  '芒果': { pinyin: 'máng guǒ', english: 'mango', explanation: '一种热带水果。', pages: [15] },
  '蛋糕': { pinyin: 'dàn gāo', english: 'cake', explanation: '甜的烘焙食品。', pages: [15] },
  '巧克力': { pinyin: 'qiǎo kè lì', english: 'chocolate', explanation: '可可做的甜食。', pages: [15] },
  '价钱': { pinyin: 'jià qian', english: 'price', explanation: '东西要花多少钱。', pages: [15] },
  '规律': { pinyin: 'guī lǜ', english: 'pattern, rule', explanation: '事物变化的规则。', pages: [15] },
  '小云': { pinyin: 'xiǎo yún', english: 'Xiao Yun (name)', explanation: '人物名字。', pages: [15] },
  '不同': { pinyin: 'bù tóng', english: 'different', explanation: '不一样。', pages: [15] },
  '明明': { pinyin: 'míng ming', english: 'Ming Ming (name)', explanation: '人物名字。', pages: [15] },
  '水果': { pinyin: 'shuǐ guǒ', english: 'fruit', explanation: '水果。', pages: [15] },
  '请问': { pinyin: 'qǐng wèn', english: 'excuse me, may I ask', explanation: '礼貌地问。', pages: [15] },
  '每件': { pinyin: 'měi jiàn', english: 'each piece', explanation: '每一件。', pages: [15] },
  '买了': { pinyin: 'mǎi le', english: 'bought', explanation: '购买了。', pages: [15] },
  '三种': { pinyin: 'sān zhǒng', english: 'three types', explanation: '三个种类。', pages: [15] },
  '一共': { pinyin: 'yī gòng', english: 'altogether', explanation: '加在一起。', pages: [15] },
  '下图': { pinyin: 'xià tú', english: 'the picture below', explanation: '下面的图。', pages: [15] },
  '猜一猜': { pinyin: 'cāi yī cāi', english: 'guess', explanation: '猜猜看。', pages: [15] },
  '下一步': { pinyin: 'xià yī bù', english: 'next step', explanation: '下面一步。', pages: [15] },
  '画出': { pinyin: 'huà chū', english: 'draw', explanation: '画出来。', pages: [15] },
  '买一送一': { pinyin: 'mǎi yī sòng yī', english: 'buy one get one free', explanation: '买一个送一个。', pages: [15] },

  // === 生活园地 - 阿宝 (p16) ===
  '变化': { pinyin: 'biàn huà', english: 'change', explanation: '和以前不一样了。', pages: [16] },
  '发型': { pinyin: 'fà xíng', english: 'hairstyle', explanation: '头发的样子。', pages: [16] },
  '精神': { pinyin: 'jīng shen', english: 'energetic, spirited', explanation: '看起来很有活力。', pages: [16] },
  '假期': { pinyin: 'jià qī', english: 'holiday, vacation', explanation: '不用上学的日子。', pages: [16] },
  '篮球': { pinyin: 'lán qiú', english: 'basketball', explanation: '一种球类运动。', pages: [9, 16] },
  '期待': { pinyin: 'qī dài', english: 'look forward to', explanation: '盼望好事发生。', pages: [16] },
  '新学期': { pinyin: 'xīn xué qī', english: 'new semester', explanation: '新的学习阶段开始了。', pages: [16] },
  '活力': { pinyin: 'huó lì', english: 'energy, vitality', explanation: '有精神有力量。', pages: [16] },
  '阿宝': { pinyin: 'ā bǎo', english: 'A Bao (name)', explanation: '漫画中的人物名字。', pages: [16] },
  '朋友': { pinyin: 'péng you', english: 'friend', explanation: '关系好的人，好朋友。', pages: [16] },
  '学校': { pinyin: 'xué xiào', english: 'school', explanation: '学生上课学习的地方。', pages: [16] },
  '高兴': { pinyin: 'gāo xìng', english: 'happy', explanation: '心里很开心。', pages: [16] },
  '新衣': { pinyin: 'xīn yī', english: 'new clothes', explanation: '新的衣服。', pages: [16] },
  '秘密': { pinyin: 'mì mì', english: 'secret', explanation: '不想让别人知道的事。', pages: [16] },
  '开玩笑': { pinyin: 'kāi wán xiào', english: 'joke', explanation: '说好玩的话逗别人。', pages: [16] },
  '长高': { pinyin: 'zhǎng gāo', english: 'grow taller', explanation: '个子变高了。', pages: [16] },
  '好主意': { pinyin: 'hǎo zhǔ yi', english: 'good idea', explanation: '好的想法。', pages: [16] },
  '运动': { pinyin: 'yùn dòng', english: 'exercise, sports', explanation: '锻炼身体的活动。', pages: [16] },
  '看出来': { pinyin: 'kàn chū lái', english: 'can tell', explanation: '看得出来。', pages: [16] },
  '不一样': { pinyin: 'bù yī yàng', english: 'different', explanation: '不同。', pages: [16] },
  '没错': { pinyin: 'méi cuò', english: 'that\'s right', explanation: '没有错。', pages: [16] },
  '不少': { pinyin: 'bù shǎo', english: 'quite a lot', explanation: '很多。', pages: [16] },
  '以后': { pinyin: 'yǐ hòu', english: 'in the future', explanation: '以后。', pages: [16] },
  '一起': { pinyin: 'yī qǐ', english: 'together', explanation: '在一起。', pages: [16] },
  '当然': { pinyin: 'dāng rán', english: 'of course', explanation: '理所当然。', pages: [16] },
  '新变化': { pinyin: 'xīn biàn huà', english: 'new changes', explanation: '新的变化。', pages: [16] },
}

// ============================================================
// Section Data
// ============================================================

const sections: Section[] = [
  {
    id: 'cover',
    title: '封面',
    subtitle: '愿望',
    pages: [1],
    type: 'cover',
    icon: '📕',
    coverText: '每个人心中都有愿望。它可能是想得到喜欢的物品，希望做到的事，或是想成为的样子。愿望就像远处的高山，看起来有点远，但只要我们不停地往前走，总有一天会靠近它。愿望不只是想得到什么，更重要的是为实现它而努力的过程。',
  },
  {
    id: 'habi-story',
    title: '哈比故事',
    subtitle: '新水壶',
    pages: [2, 3],
    type: 'story',
    icon: '💧',
    paragraphs: [
      { text: '开学第一天，哈比背着书包走进教室，一眼就看到了同桌巴乔的新水壶。那个水壶很漂亮，上面有蓝色星球的图案，一按按钮，水壶的盖子就打开了。哈比越看越喜欢，心想：要是我也有个这样的水壶就好了！' },
      { text: '回家后，哈比对妈妈说："妈妈，如果我的华文听写全对，您能给我买一个新水壶吗？"妈妈点点头，说："好啊，只要你做到，我就给你买。"' },
      { text: '那几天，哈比做完作业就认真复习听写，碰到难写的字，他就一笔一画地多写几遍。' },
      { text: '听写那天，哈比信心满满，老师念的前几个词语，他都写出来了。可是最后一个词语，他却想不起来怎么写。听写本发下来，哈比被扣了两分。他伤心地想：水壶买不成了。' },
      { text: '回到家，哈比把听写本递给妈妈，难过地说："妈妈，有一个词语我忘记怎么写……"' },
      { text: '妈妈指着听写本上的几个词语，说："这几个词语你以前常写错，现在都写对了，说明你这一周很努力，进步很大，水壶我还是会给你买的。"' },
      { text: '"没有全对，您还要给我买？"哈比不敢相信地问。妈妈笑着说："因为你懂得要靠努力去实现自己的愿望，而且你真的努力了，这和结果一样重要！"哈比听了，心里暖暖的。' },
      { text: '【阿果的话】哈比：读了你的故事，我很感动。努力和得到想要的结果一样重要。你为了实现愿望认真复习，你妈妈都看在眼里了。' },
      { text: '有一次，我为了得到进步之星，每天都认真复习。可是考试时，有一道题我答错了，没能拿到满分。我有些难过，但老师在我的考卷上写了一句话：你的努力我看见了！' },
      { text: '看到这句话的那一刻，我懂得了：努力本身就是一种成功。愿望就像远处的高山，看起来有点远，但只要我们不停地向前走，总有一天会靠近它。你说对吗？阿果' },
    ],
    quiz: {
      question: '根据故事内容，下面哪个说法是不正确的？',
      options: [
        { text: '哈比想要巴乔那样的水壶，就想通过努力得到它。', correct: false },
        { text: '妈妈答应哈比只要听写全对，就带他去买新水壶。', correct: false },
        { text: '最后哈比听写全对，妈妈高兴地带他去买新水壶。', correct: true },
        { text: '妈妈说懂得靠努力去实现愿望，和结果一样重要。', correct: false },
      ],
      explanation: '故事中哈比并没有听写全对，他被扣了两分。但妈妈看到他努力了，还是给他买了水壶。所以选项3是不正确的。',
    },
  },
  {
    id: 'language-remember',
    title: '语文园地',
    subtitle: '记一记 · 改一改',
    pages: [4],
    type: 'language',
    icon: '📝',
    grammarCards: [
      { word: '龙争虎斗', pinyin: 'lóng zhēng hǔ dòu', meaning: '比喻两个强大的对手在激烈竞争。', example: '两支球队龙争虎斗，比赛非常精彩。' },
      { word: '马到成功', pinyin: 'mǎ dào chéng gōng', meaning: '做事情一开始就取得成功。', example: '祝你考试马到成功！' },
    ],
    paragraphs: [
      { text: '【记一记】华文中有许多带有动物名称的成语，生动又有趣，让语言更丰富。' },
      { text: '龙争虎斗：龙和虎的实力差不多，竞争激烈。比喻双方实力不分上下，竞争非常激烈。运动会上大家龙争虎斗，都想得到第一名。' },
      { text: '马到成功：战马一到战场，很快就获得成功或取得胜利。比喻做事情很顺利。常用来祝福别人。这件事交给哥哥去做，一定会马到成功！' },
      { text: '记住一些带动物名称的成语，对阅读和口语交流都有帮助。' },
      { text: '带一种动物：人高马大、画龙点睛、一马当先、井底之蛙' },
      { text: '带两种动物：生龙活虎、车水马龙、猴年马月、虎背熊腰' },
      { text: '【改一改】把两个句子改写成一句话时，有时主语可以去掉或者用人称代词代替，让句子更短、更好懂。' },
      { text: '去掉主语的例子：弟弟看见玩具车。弟弟开心地笑了。改成：弟弟看见玩具车，开心地笑了。前面写了主语，可以把后面的弟弟去掉。' },
      { text: '用人称代词"他"（代替男的，不知道男女的）：爸爸不在家。我不知道爸爸去了哪里。改成：爸爸不在家，我不知道他去了哪里。' },
      { text: '用人称代词"她"（代替女的）：姐姐在唱歌。我觉得姐姐唱得很好听。改成：姐姐在唱歌，我觉得她唱得很好听。' },
      { text: '用人称代词"它"（代替动物、东西）：小狗吃饱了。你不要再喂小狗吃东西。改成：小狗吃饱了，你不要再喂它吃东西。' },
      { text: '练一练：把下面的句子改写成一句话。这个书包很漂亮。我会好好爱护这个书包。' },
    ],
  },
  {
    id: 'language-learn',
    title: '语文园地',
    subtitle: '学一学 · 选一选',
    pages: [5],
    type: 'language',
    icon: '💡',
    grammarCards: [
      { word: '忍不住', pinyin: 'rěn bù zhù', meaning: '控制不了自己，一定要做某事。', example: '看到蛋糕，我忍不住吃了一块。' },
      { word: '了不起', pinyin: 'liǎo bù qǐ', meaning: '非常厉害，让人佩服。', example: '他小小年纪就会弹钢琴，真了不起！' },
      { word: '来不及', pinyin: 'lái bù jí', meaning: '时间不够，赶不上。', example: '快跑！不然来不及了！' },
    ],
    paragraphs: [
      { text: '【学一学】谈论喜欢的电视节目或演出，可以使用一些常用的句型。学一学下面的表达方式，并把它们用在生活中。' },
      { text: '它是什么？哥哥喜欢看篮球赛。爸爸喜欢看新闻节目。' },
      { text: '节目是怎样的？这个节目每天播放一次，每次一个小时。这部连续剧共有三十集，每晚播放两集。' },
      { text: '为什么喜欢？看篮球赛，可以让自己心情愉快。看新闻节目，可以了解最近发生的事。' },
      { text: '怎样表现喜欢？好球！哥哥乐得大喊。篮球赛很精彩，哥哥拍着手掌叫好。这个节目很好看，我们看得入迷了。' },
      { text: '炸鸡腿太香了，弟弟见了忍不住流口水。小丽来不及吃早餐，抓起面包就跑出门了。' },
      { text: '这样的三字词语还有了不起、难不倒、受不了等。' },
      { text: '【选一选】"忍不住"是带有"不"字的三字词语，学习一些这样的词语，并从中选出正确的答案，把代表它的数字写在括号里。' },
      { text: '这里用"忍不住"说明炸鸡腿很香。' },
      { text: '这里用"来不及"说明小丽吃早餐的时间不够。' },
      { text: 'Q1. 科学家发明了很多对我们有用的东西，真了不起！Q2. 妈妈来不及收晾在外面的衣服，结果被雨淋湿了。' },
    ],
    exerciseItems: [
      { sentence: '看到这么好笑的表演，大家都___笑了起来。', blank: '___', options: ['忍不住', '了不起', '来不及'], answer: '忍不住' },
      { sentence: '他一个人完成了这么大的项目，真___！', blank: '___', options: ['忍不住', '了不起', '来不及'], answer: '了不起' },
      { sentence: '闹钟没响，我起晚了，___赶校车了。', blank: '___', options: ['忍不住', '了不起', '来不及'], answer: '来不及' },
    ],
  },
  {
    id: 'moral-garden',
    title: '品德园地',
    subtitle: '三字经 · 孔子的故事',
    pages: [6],
    type: 'story',
    icon: '🏛️',
    paragraphs: [
      { text: '论语者，二十篇。群弟子，记善言。' },
      { text: '《论语》这本书一共有二十篇，是孔子的学生和学生的学生整理编写的。书里主要记录了孔子和他的弟子们说过的话，这些话充满了智慧与思考，教给我们很多学习和做人的道理。' },
      { text: '孔子是古时候有名的大思想家，很多学生跟着他学习。一天，子夏来向孔子请教，问他对几个同学的看法。孔子说："有的同学很善良，比我做得好；有的同学很会说话，口才比我好；还有的同学非常勇敢，超过了我。"' },
      { text: '子夏听了，向孔子行礼，问道："他们比您强，为什么还要向您学习呢？"孔子回答："善良的同学要学会不乱用善心；口才好的同学要懂得沉默的力量；勇敢的同学要学会谦虚、礼让。这些都是我可以教他们的。"子夏点点头，明白了。原来老师不是要在每个方面都胜过学生，而是要帮助学生成为更好的自己。' },
    ],
  },
  {
    id: 'moral-comic',
    title: '品德园地',
    subtitle: '学习别人好的言行',
    pages: [7],
    type: 'comic',
    icon: '🎭',
    comicPanels: [
      '每个人都有值得我们学习的地方，我会用心观察别人好的言行，虚心向他们学习，让自己不断进步。',
      '明文乐于助人，我要向他学习。',
      '小丽，你的字写得真漂亮，可以教教我吗？',
      '我用小丽教的方法努力练习，一定会越写越好！',
      '1. 用心观察，学习别人的好行为、好品德。',
      '2. 看到别人的长处，主动学习他们的优点。',
      '3. 学习别人的好方法，努力提升自己。',
      '我们可以……',
      '小月，你懂得学习别人好的言行，变得越来越棒了！',
      '我也要学会勇敢地表达自己的想法。',
      '4. 在各个方面向别人学习，让自己全面提升，变得更好。',
      '5. 学习别人好的言行，让自己不断进步，变得更优秀。',
      '看到同学帮助老奶奶过马路，我也要向他学习。',
      '看到朋友主动捡起垃圾，我也应该这样做。',
      '动动脑：图1的短发女生和图2的男孩，谁的做法是对的？对的在口里打勾，错的在口里打叉，并说明理由。',
      '是他自己跌倒的，为什么要管他？',
      '你跳绳太厉害了，我要向你学习。',
    ],
    quiz: {
      question: '为什么我们要学习别人好的言行？',
      options: [
        { text: '因为别人比我们聪明。', correct: false },
        { text: '因为学习好的行为能让我们变得更好。', correct: true },
        { text: '因为老师要求我们这样做。', correct: false },
        { text: '因为这样别人会喜欢我们。', correct: false },
      ],
      explanation: '学习别人好的言行，是为了让自己变得更好。每个人都有值得学习的地方。',
    },
  },
  {
    id: 'grow-up-story',
    title: '阅读园地',
    subtitle: '我想快点长大',
    pages: [8, 9],
    type: 'story',
    icon: '🌱',
    paragraphs: [
      { text: '可丽一直希望自己能快点长大，但妈妈总说："长大需要时间。"可丽心想：谁的时间多呢？对了，爷爷奶奶！' },
      { text: '可丽跑到爷爷奶奶家，先去菜园找奶奶："奶奶，您能分我一点时间吗？我想快点长大。"奶奶擦擦汗，递给她一个红番茄："我的时间都在这儿呢！这个番茄里，装着奶奶种菜的时间。"' },
      { text: '接着，可丽又去找在书房写毛笔字的爷爷："爷爷，您能分我一点时间吗？我想快点长大。"爷爷笑着把一幅字交给她，说："爷爷的时间都在这里了。这个\'永\'字我练了很多遍，花了很多时间才写好！"' },
      { text: '可丽捧着红番茄和"永"字，心想：有了这么多时间，我一定能快快长大！' },
      { text: '回家的路上，可丽遇到了因为落选篮球队而伤心的立明。她递上那幅字，说："我爷爷把很多时间放在这幅字里，有了这些时间，你就可以把球练好，进入篮球队！"' },
      { text: '走到楼下时，可丽看到李阿姨下班回来，看起来有些疲倦，于是送上红番茄，说："这个番茄里装着我奶奶种菜的时间。我把它送给您，您就有时间好好休息了。"' },
      { text: '回到家，可丽把经过告诉妈妈，然后叹了一口气，说："我把时间都送人了，不能快快长大了……"' },
      { text: '妈妈笑着摸摸她的头，说："不，你已经长大了。当你懂得关心别人时，就是真的长大了！"' },
    ],
    quiz: {
      question: '根据故事内容，下面哪个说法是不正确的？',
      options: [
        { text: '奶奶把时间用在菜园里，爷爷把时间用在练字上。', correct: false },
        { text: '爷爷的"永"字，可丽送给了落选篮球队的立明。', correct: false },
        { text: '可丽以为把时间送人，才能实现快快长大的愿望。', correct: true },
        { text: '妈妈认为可丽懂得关心别人，说明她已经长大了。', correct: false },
      ],
      explanation: '可丽并不是以为送人时间才能长大。她本来想要时间来让自己长大，但把时间送给了需要的人。妈妈说这正是长大的表现。',
    },
  },
  {
    id: 'writing-guide',
    title: '技能园地',
    subtitle: '作文：怎样写一个人',
    pages: [10],
    type: 'writing',
    icon: '✍️',
    writingGuide: [
      '第一步：写外貌。描写这个人的样子，比如头发、眼睛、穿着等。',
      '第二步：写爱好。详细描写他/她喜欢做什么事情，怎么做的。',
      '第三步：写感受。写你对这个人的感受，或者你的愿望。',
    ],
    paragraphs: [
      { text: '小王的写作课上，要写关于一个人。怎么写？学会下面的写作方法，写好一个人就很简单了！' },
      { text: '【外貌介绍】小文今年九岁，是我的好朋友。他一头乌黑的短发，浓浓的眉毛下，有一双炯炯有神的眼睛，看起来像黑宝石一样闪亮。他的身材比较高，在班上算是最高的。' },
      { text: '写作提示：首先可以先介绍人物的姓名、年龄和身份。再按照顺序描写他的外表，比如头发、眉毛、五官等，抓住人物突出的特点，让读者好像看到这个人一样！' },
      { text: '【爱好详写】小文最爱游泳。所以他经常去游泳馆游泳。他一跳入水中，就变成一条自由自在的小鱼儿了。他最拿手的是蝶泳，在比赛中总能打起漂亮的水花。' },
      { text: '写作提示：介绍人物的爱好时，可以写在一个具体的场景，重点写他在这个场景里的动作描写，通过这些动作描写，可以将爱好介绍更详细。' },
      { text: '【愿望感想】小文说，游泳让他的身体更健康。同时也让他学到很多。他不断努力，终于在一次游泳比赛中获得了第一名。他会继续练习游泳，向着更高的目标前进。' },
      { text: '写作提示：写人物的感想和愿望，可以表达对他的欣赏和祝福，向着美好的方向展望。' },
    ],
  },
  {
    id: 'reading-tips',
    title: '技能园地',
    subtitle: '阅读理解：怎么做',
    pages: [11],
    type: 'writing',
    icon: '📖',
    writingGuide: [
      '题目问"某某做了什么事"时，要找出文章中这个人的动作。',
      '先找到人物的名字出现的地方。',
      '再看他/她做了哪些事情，用自己的话写出来。',
    ],
    paragraphs: [
      { text: '阅读理解中常常会有关于做法的问题，掌握一定的答题技巧才能答好这类题目。' },
      { text: '读完题目后想一想，题目问的是什么。首先，读题目。找到关键词。找一找，在文中找到相关的句子。' },
      { text: '【例题故事】这天，妈妈带乐乐到书店去找故事书。乐乐选书的时候，不小心把一本书弄掉了。他看看旁边没有人在看，觉得对不起这本书，偷偷把它放好。回到家后，妈妈准备好了一切，乐乐开始看他的书。乐乐觉得自己没法安心看书，因为一直想着那本掉在地上的书。于是妈妈带他回书店认错了，他把书放好，乐乐终于安心了。妈妈夸奖他：你做了一件好事。' },
      { text: '问题：乐乐做了什么事？答题方法：找到乐乐的名字出现的地方，看他做了哪些动作，用自己的话写出来。' },
      { text: '【答题注意】问题一：乐乐做了什么事？注意：答案最好用完整的句子，不要用原文回答。注意：答案不要太短，也不要太长。' },
    ],
  },
  {
    id: 'halibu-story',
    title: '经典园地',
    subtitle: '海力布出生',
    pages: [12, 13],
    type: 'comic',
    icon: '🏔️',
    comicPanels: [
      '从前，在大山脚下有一个小村子，村民们以打猎为生。',
      '海力布，想必是老天赐给我们的机会，这个名字好！',
      '注意安全，快去快回！猎人和几个村民一起上山去打猎。',
      '救我吧，我打些猎物就回来。大天林子里特别危险，出事了怎么办？',
      '黑熊被箭射中，吼叫一声，向猎人扑来，猎人用力挡住。',
      '村民们把这个不幸的消息告诉猎人的妻子。',
      '对不起，他是为了大家的安全才……这些是我们送来的，你要多吃点。',
      '谢谢你们。水果我挑好了，你安心养好身体。',
      '村民们把消息告诉了猎人的妻子。',
      '猎人的妻子的行为感动了村民们，大家都来看望和帮助她。',
      '一天晚上，电闪雷鸣，下起了大雨。猎人的妻子就要生了。',
      '海力布出生了。',
      '这孩子的哭声比雷声还响呢！海力布，希望他像他父亲一样，做一个勇敢、英勇的猎人。',
      '小海力布长得越来越壮！',
    ],
  },
  {
    id: 'farm-trip',
    title: '学生园地',
    subtitle: '快乐的农场之旅',
    pages: [14],
    type: 'story',
    icon: '🌾',
    paragraphs: [
      { text: '那天风和日丽，爸爸带我们一家人到农场参观，我和妹妹都很兴奋。' },
      { text: '首先，导游叔叔带我们来到了嘉宝果树园。我们看到一些叶子很小的树。我走近一看，发现树枝和树干上有许多像黑葡萄一样的果实。那就是嘉宝果，我第一次见这种果子，感到很好奇。叔叔让我尝了一颗，味道甜甜的。叔叔说，这种果子大多用来做果醋或酒。树上开着一些白色的小花，叔叔说那是银蜂喜欢采蜜的花。' },
      { text: '接着，导游叔叔带我们去参观银蜂的家。我看到一个个小房子，那就是蜂箱。他把其中一个打开，我们的眼睛顿时睁得大大的：里面有很多小小的棕色口袋。叔叔介绍道："这是银蜂储存花粉和蜂蜜的地方。别看它们很小，但填满一个需要一个月左右的时间。"他轻轻打开一个小口袋，里面装满了蜂蜜。我和妹妹用吸管吸蜂蜜，真甜啊！这时，我看见了很多小小的、黑色的飞虫。叔叔说："这就是银蜂。"我还以为银蜂是银色的呢！' },
      { text: '之后，我们又去摘羊角豆、捞鱼。中午，我们依依不舍地离开了农场。真希望下次我们能再来农场参观！' },
    ],
  },
  {
    id: 'fun-puzzles',
    title: '趣味园地',
    subtitle: '动动脑',
    pages: [15],
    type: 'puzzle',
    icon: '🧩',
    puzzleItems: [
      '文具上的图案：小云和哥哥各买了三种文具：尺子、笔和文具盒。每件文具上都有图案（太阳、星星或花朵），并且同一种文具的图案不同。请根据小云和哥哥的对话，把他们的文具对应的图案写在表格里。',
      '蛋糕的价钱：明明和妈妈去买蛋糕。每个芒果蛋糕七元，每个巧克力蛋糕比水果蛋糕贵一元，而且买巧克力蛋糕买一送一个。他们一共付了二十二元，请问他们每种蛋糕各买了几个？',
      '变化的小鱼：下图中的小鱼从图一到图四一直在变化，请仔细观察它的变化规律，猜一猜下一步会变成什么样子，在图五的位置画出下一幅图。',
    ],
  },
  {
    id: 'abao-comic',
    title: '生活园地',
    subtitle: '阿宝的日常生活：新变化',
    pages: [16],
    type: 'comic',
    icon: '👦',
    comicPanels: [
      '开学第一天，阿宝穿着新衣走进教室。早上好！',
      '早啊，阿宝！对了，新学期要从头开始哦！我看出来了！',
      '你们发现我有些不一样了吗？',
      '真的？你看，我出了一个秘密……剪了新发型。',
      '没错！告诉你们一个秘密……',
      '哈哈，开玩笑的！果然你长高了。',
      '阿宝感觉精神了不少。',
      '我假期里每天都跟爸爸去打篮球！打篮球比赛真的好高。我们以后一起去打篮球吧！',
      '好主意！',
      '当然，多运动多变，对，这话是真的！新学期有新变化，也有新的活力！',
    ],
  },
]

// ============================================================
// Helpers
// ============================================================

function getStoredWords(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_WORDS)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function storeWord(word: string) {
  const words = getStoredWords()
  if (!words.includes(word)) {
    words.push(word)
    localStorage.setItem(STORAGE_KEY_WORDS, JSON.stringify(words))
  }
}

function getVisitedSections(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_PROGRESS)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function markSectionVisited(sectionId: string) {
  const visited = getVisitedSections()
  if (!visited.includes(sectionId)) {
    visited.push(sectionId)
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(visited))
  }
}

function getQuizResults(): Record<string, boolean> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_QUIZZES)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

function saveQuizResult(sectionId: string, correct: boolean) {
  const results = getQuizResults()
  results[sectionId] = correct
  localStorage.setItem(STORAGE_KEY_QUIZZES, JSON.stringify(results))
}

// ============================================================
// Audio Player (uses pre-generated Google TTS MP3 files)
// ============================================================

let currentAudio: HTMLAudioElement | null = null

function stopAudio() {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
    currentAudio = null
  }
}

function playAudioFile(src: string, onEnd?: () => void): HTMLAudioElement {
  stopAudio()
  const audio = new Audio(src)
  currentAudio = audio
  audio.onended = () => {
    currentAudio = null
    onEnd?.()
  }
  audio.onerror = () => {
    currentAudio = null
    onEnd?.()
  }
  audio.play().catch(() => {
    currentAudio = null
    onEnd?.()
  })
  return audio
}

function playWordAudio(word: string, onEnd?: () => void) {
  const src = `/audio/cc1/word_${word}.mp3`
  return playAudioFile(src, onEnd)
}

function playSequentialAudio(keys: string[], onAllEnd?: () => void) {
  let idx = 0
  const playNext = () => {
    if (idx >= keys.length) {
      onAllEnd?.()
      return
    }
    const src = `/audio/cc1/${keys[idx]}.mp3`
    idx++
    playAudioFile(src, playNext)
  }
  playNext()
}

// ============================================================
// Text segmenter: finds vocabulary words in text
// ============================================================

function segmentText(text: string): Array<{ text: string; isWord: boolean; def?: WordDef }> {
  const segments: Array<{ text: string; isWord: boolean; def?: WordDef }> = []
  let i = 0

  while (i < text.length) {
    let matched = false
    for (let len = Math.min(6, text.length - i); len >= 2; len--) {
      const substr = text.substring(i, i + len)
      if (wordDefinitions[substr]) {
        segments.push({ text: substr, isWord: true, def: wordDefinitions[substr] })
        i += len
        matched = true
        break
      }
    }
    if (!matched) {
      // Merge consecutive non-word characters
      if (segments.length > 0 && !segments[segments.length - 1].isWord) {
        segments[segments.length - 1].text += text[i]
      } else {
        segments.push({ text: text[i], isWord: false })
      }
      i++
    }
  }
  return segments
}

// ============================================================
// Sub-components
// ============================================================

function AudioButton({ audioKey, audioKeys, label }: { audioKey?: string; audioKeys?: string[]; label?: string }) {
  const [playing, setPlaying] = useState(false)

  const handlePlay = useCallback(() => {
    if (playing) {
      stopAudio()
      setPlaying(false)
      return
    }
    setPlaying(true)
    if (audioKeys && audioKeys.length > 0) {
      playSequentialAudio(audioKeys, () => setPlaying(false))
    } else if (audioKey) {
      playAudioFile(`/audio/cc1/${audioKey}.mp3`, () => setPlaying(false))
    }
  }, [audioKey, audioKeys, playing])

  return (
    <button
      className={`cc1-audio-btn ${playing ? 'cc1-audio-playing' : ''}`}
      onClick={handlePlay}
      aria-label={label || '朗读'}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        {playing
          ? <><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></>
          : <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
        }
      </svg>
      {label && <span className="cc1-audio-label">{label}</span>}
    </button>
  )
}

function InteractiveText({
  text,
  onWordTap,
}: {
  text: string
  onWordTap: (word: string, def: WordDef) => void
}) {
  const segments = useMemo(() => segmentText(text), [text])

  return (
    <span>
      {segments.map((seg, i) =>
        seg.isWord && seg.def ? (
          <span
            key={i}
            className="cc1-vocab-highlight"
            onClick={() => onWordTap(seg.text, seg.def!)}
          >
            {seg.text}
          </span>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </span>
  )
}

function QuizComponent({
  quiz,
  sectionId,
}: {
  quiz: Quiz
  sectionId: string
}) {
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const results = getQuizResults()
    if (results[sectionId] !== undefined) {
      // Find the correct answer index to show it was completed
      const correctIdx = quiz.options.findIndex((o) => o.correct)
      setSelected(correctIdx)
      setSubmitted(true)
    }
  }, [sectionId, quiz.options])

  const handleSelect = (idx: number) => {
    if (submitted) return
    setSelected(idx)
    setSubmitted(true)
    saveQuizResult(sectionId, quiz.options[idx].correct)
  }

  return (
    <div className="cc1-quiz">
      <div className="cc1-quiz-header">
        <span className="cc1-quiz-icon">🧠</span>
        <span>动动脑</span>
      </div>
      <p className="cc1-quiz-question">{quiz.question}</p>
      <div className="cc1-quiz-options">
        {quiz.options.map((opt, idx) => {
          let optClass = 'cc1-quiz-option'
          if (submitted && selected === idx) {
            optClass += opt.correct ? ' correct' : ' incorrect'
          }
          if (submitted && opt.correct && selected !== idx) {
            optClass += ' show-correct'
          }
          return (
            <button
              key={idx}
              className={optClass}
              onClick={() => handleSelect(idx)}
            >
              <span className="cc1-quiz-num">{idx + 1}</span>
              <span className="cc1-quiz-text">{opt.text}</span>
              {submitted && selected === idx && (
                <span className="cc1-quiz-result">
                  {opt.correct ? '✓' : '✗'}
                </span>
              )}
              {submitted && opt.correct && selected !== idx && (
                <span className="cc1-quiz-result correct-mark">✓</span>
              )}
            </button>
          )
        })}
      </div>
      {submitted && (
        <div className="cc1-quiz-explanation">
          <strong>解释：</strong>
          {quiz.explanation}
        </div>
      )}
    </div>
  )
}

function FillBlankExercise({ items }: { items: ExerciseItem[] }) {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [checked, setChecked] = useState<Record<number, boolean>>({})

  const handleSelect = (idx: number, option: string) => {
    if (checked[idx] !== undefined) return
    setAnswers((prev) => ({ ...prev, [idx]: option }))
    setChecked((prev) => ({ ...prev, [idx]: option === items[idx].answer }))
  }

  return (
    <div className="cc1-exercise">
      <div className="cc1-quiz-header">
        <span className="cc1-quiz-icon">✏️</span>
        <span>选一选</span>
      </div>
      {items.map((item, idx) => (
        <div key={idx} className="cc1-exercise-item">
          <p className="cc1-exercise-sentence">
            {item.sentence.split(item.blank).map((part, pi) => (
              <span key={pi}>
                {part}
                {pi < item.sentence.split(item.blank).length - 1 && (
                  <span
                    className={`cc1-exercise-blank ${
                      answers[idx]
                        ? checked[idx]
                          ? 'correct'
                          : 'incorrect'
                        : ''
                    }`}
                  >
                    {answers[idx] || '＿＿＿'}
                  </span>
                )}
              </span>
            ))}
          </p>
          <div className="cc1-exercise-options">
            {item.options.map((opt) => (
              <button
                key={opt}
                className={`cc1-exercise-opt ${
                  answers[idx] === opt
                    ? checked[idx]
                      ? 'correct'
                      : 'incorrect'
                    : ''
                } ${answers[idx] && answers[idx] !== opt && opt === item.answer ? 'show-correct' : ''}`}
                onClick={() => handleSelect(idx, opt)}
                disabled={checked[idx] !== undefined}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function GrammarCardList({
  cards,
}: {
  cards: GrammarCard[]
}) {
  return (
    <div className="cc1-grammar-cards">
      {cards.map((card, idx) => (
        <div key={idx} className="cc1-grammar-card">
          <div className="cc1-grammar-word-row">
            <span className="cc1-grammar-word">{card.word}</span>
            <AudioButton audioKey={`word_${card.word}`} />
          </div>
          <div className="cc1-grammar-pinyin">{card.pinyin}</div>
          <div className="cc1-grammar-meaning">{card.meaning}</div>
          {card.example && (
            <div className="cc1-grammar-example">
              <span className="cc1-grammar-example-label">例：</span>
              {card.example}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ============================================================
// Page Turn Arrows
// ============================================================

function PageArrows({ onPrev, onNext }: { onPrev?: () => void; onNext?: () => void }) {
  const [pos, setPos] = useState({ top: 0, left: 0, right: 0 })

  useEffect(() => {
    const update = () => {
      const vh = window.visualViewport?.height ?? window.innerHeight
      const top = Math.round(vh / 2 - 32)
      // Find content container to align arrows to its edges
      const container = document.querySelector('.page-container')
      if (container) {
        const rect = container.getBoundingClientRect()
        setPos({ top, left: Math.round(rect.left + 4), right: Math.round(window.innerWidth - rect.right + 4) })
      } else {
        setPos({ top, left: 4, right: 4 })
      }
    }
    update()
    const vv = window.visualViewport
    if (vv) {
      vv.addEventListener('resize', update)
      return () => vv.removeEventListener('resize', update)
    }
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return createPortal(
    <>
      {onPrev && (
        <button
          className="cc1-edge-arrow"
          style={{ top: pos.top, left: pos.left }}
          onClick={onPrev}
          aria-label="上一页"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
      )}
      {onNext && (
        <button
          className="cc1-edge-arrow"
          style={{ top: pos.top, right: pos.right }}
          onClick={onNext}
          aria-label="下一页"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18" /></svg>
        </button>
      )}
    </>,
    document.body
  )
}

// ============================================================
// Section Detail View
// ============================================================

function SectionDetail({
  section,
  onBack,
  onWordTap,
}: {
  section: Section
  onBack: () => void
  onWordTap: (word: string, def: WordDef) => void
}) {
  useEffect(() => {
    markSectionVisited(section.id)
    window.scrollTo({ top: 0 })
  }, [section.id])

  return (
    <div className="cc1-section-detail">
      {/* Section header */}
      <div className="cc1-detail-header">
        <button className="cc1-back-btn" onClick={onBack} aria-label="返回">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="cc1-detail-title-block">
          <span className="cc1-detail-icon">{section.icon}</span>
          <div>
            <div className="cc1-detail-title">{section.title}</div>
            <div className="cc1-detail-subtitle">{section.subtitle}</div>
          </div>
        </div>
      </div>

      {/* Page images */}
      <div className="cc1-detail-images">
        {section.pages.map((p) => (
          <img
            key={p}
            src={`/images/cc1/page-${String(p).padStart(2, '0')}.jpg`}
            alt={`第${p}页`}
            className="cc1-detail-img"
            loading="lazy"
          />
        ))}
      </div>

      {/* Cover section */}
      {section.type === 'cover' && section.coverText && (
        <div className="cc1-content-card">
          <div className="cc1-content-card-header">
            <h3>愿望</h3>
            <AudioButton audioKey="cover_0" label="朗读全文" />
          </div>
          <p className="cc1-story-paragraph">
            <InteractiveText text={section.coverText} onWordTap={onWordTap} />
          </p>
        </div>
      )}

      {/* Story paragraphs */}
      {(section.type === 'story' || section.type === 'writing') && section.paragraphs && (
        <div className="cc1-content-card">
          <div className="cc1-content-card-header">
            <h3>{section.subtitle}</h3>
            <AudioButton
              audioKeys={section.paragraphs.map((_, idx) => `${section.id}_${idx}`)}
              label="朗读全文"
            />
          </div>
          {section.paragraphs.map((para, idx) => (
            <div key={idx} className="cc1-paragraph-block">
              <div className="cc1-para-row">
                <p className="cc1-story-paragraph">
                  <InteractiveText text={para.text} onWordTap={onWordTap} />
                </p>
                <AudioButton audioKey={`${section.id}_${idx}`} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Writing guide steps */}
      {section.type === 'writing' && section.writingGuide && (
        <div className="cc1-content-card">
          <h3 className="cc1-content-card-title">写作步骤</h3>
          {section.writingGuide.map((step, idx) => (
            <div key={idx} className="cc1-writing-step">
              <span className="cc1-step-num">{idx + 1}</span>
              <p>{step}</p>
              <AudioButton audioKey={`${section.id}_${idx + (section.paragraphs?.length ?? 0)}`} />
            </div>
          ))}
        </div>
      )}

      {/* Grammar cards */}
      {section.grammarCards && section.grammarCards.length > 0 && (
        <div className="cc1-content-card">
          <h3 className="cc1-content-card-title">词语学习</h3>
          <GrammarCardList cards={section.grammarCards} />
        </div>
      )}

      {/* Language section paragraphs */}
      {section.type === 'language' && section.paragraphs && (
        <div className="cc1-content-card">
          <div className="cc1-content-card-header">
            <h3>{section.subtitle}</h3>
            <AudioButton
              audioKeys={section.paragraphs.map((_, idx) => `${section.id}_${idx}`)}
              label="朗读全文"
            />
          </div>
          {section.paragraphs.map((para, idx) => (
            <div key={idx} className="cc1-paragraph-block">
              <div className="cc1-para-row">
                <p className="cc1-story-paragraph">
                  <InteractiveText text={para.text} onWordTap={onWordTap} />
                </p>
                <AudioButton audioKey={`${section.id}_${idx}`} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fill-in-the-blank exercises */}
      {section.exerciseItems && section.exerciseItems.length > 0 && (
        <FillBlankExercise items={section.exerciseItems} />
      )}

      {/* Comic panels */}
      {section.type === 'comic' && section.comicPanels && (
        <div className="cc1-content-card">
          <h3 className="cc1-content-card-title">故事内容</h3>
          {section.comicPanels.map((panel, idx) => (
            <div key={idx} className="cc1-comic-panel">
              <span className="cc1-comic-num">{idx + 1}</span>
              <div className="cc1-comic-text-block">
                <p className="cc1-comic-text">
                  <InteractiveText text={panel} onWordTap={onWordTap} />
                </p>
                <AudioButton audioKey={`${section.id}_${idx}`} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Puzzle items */}
      {section.type === 'puzzle' && section.puzzleItems && (
        <div className="cc1-content-card">
          <h3 className="cc1-content-card-title">趣味挑战</h3>
          {section.puzzleItems.map((item, idx) => (
            <div key={idx} className="cc1-puzzle-item">
              <span className="cc1-puzzle-icon">
                {['🔢', '🎂', '🐟'][idx] || '🧩'}
              </span>
              <p>{item}</p>
              <AudioButton audioKey={`${section.id}_${idx}`} />
            </div>
          ))}
          <p className="cc1-puzzle-hint">请看上面的图片完成挑战哦！</p>
        </div>
      )}

      {/* Quiz */}
      {section.quiz && (
        <QuizComponent quiz={section.quiz} sectionId={section.id} />
      )}

    </div>
  )
}

// ============================================================
// Main Component
// ============================================================

function CC1MagazinePage() {
  const [activeSection, setActiveSection] = useState<string | null>(sections[0].id)
  const [visitedSections, setVisitedSections] = useState<string[]>(getVisitedSections)
  const [quizResults, setQuizResults] = useState<Record<string, boolean>>(getQuizResults)
  const [lookedUpWords, setLookedUpWords] = useState<string[]>(getStoredWords)

  // Dictionary drawer state
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedWord, setSelectedWord] = useState<{ word: string; def: WordDef } | null>(null)

  const searchInputRef = useRef<HTMLInputElement>(null)

  // Refresh progress on return to section list
  useEffect(() => {
    if (!activeSection) {
      setVisitedSections(getVisitedSections())
      setQuizResults(getQuizResults())
    }
  }, [activeSection])

  // Handle word tap from interactive text
  const handleWordTap = useCallback((word: string, def: WordDef) => {
    setSelectedWord({ word, def })
    storeWord(word)
    setLookedUpWords(getStoredWords())
  }, [])

  // Filtered word list for drawer
  const filteredWords = useMemo(() => {
    const entries = Object.entries(wordDefinitions)
    if (!searchQuery) return entries
    const q = searchQuery.toLowerCase()
    return entries.filter(
      ([word, def]) =>
        word.includes(q) ||
        def.pinyin.toLowerCase().includes(q) ||
        def.english.toLowerCase().includes(q)
    )
  }, [searchQuery])

  // iOS keyboard fix for drawer
  useEffect(() => {
    if (!drawerOpen) return
    const vv = window.visualViewport
    if (!vv) return

    const handleResize = () => {
      const drawer = document.getElementById('cc1-drawer')
      if (drawer) {
        const offset = window.innerHeight - vv.height
        drawer.style.bottom = `${offset}px`
      }
    }

    vv.addEventListener('resize', handleResize)
    return () => {
      vv.removeEventListener('resize', handleResize)
      const drawer = document.getElementById('cc1-drawer')
      if (drawer) drawer.style.bottom = '0px'
    }
  }, [drawerOpen])

  const currentSectionIndex = activeSection
    ? sections.findIndex((s) => s.id === activeSection)
    : -1
  const currentSection = currentSectionIndex >= 0 ? sections[currentSectionIndex] : null
  const prevSection = currentSectionIndex > 0 ? sections[currentSectionIndex - 1] : null
  const nextSection = currentSectionIndex >= 0 && currentSectionIndex < sections.length - 1 ? sections[currentSectionIndex + 1] : null

  const goToSection = (id: string) => {
    stopAudio()
    setActiveSection(id)
    window.scrollTo({ top: 0 })
  }

  const totalWords = Object.keys(wordDefinitions).length
  const sectionsWithQuiz = sections.filter((s) => s.quiz)
  const quizzesCompleted = sectionsWithQuiz.filter((s) => quizResults[s.id] !== undefined).length

  return (
    <div className="cc1-container">
      {currentSection ? (
        <>
          <SectionDetail
            section={currentSection}
            onBack={() => {
              setActiveSection(null)
              window.scrollTo({ top: 0 })
            }}
            onWordTap={handleWordTap}
          />
          <PageArrows
            onPrev={prevSection ? () => goToSection(prevSection.id) : undefined}
            onNext={nextSection ? () => goToSection(nextSection.id) : undefined}
          />
        </>
      ) : (
        <>
          {/* Magazine header */}
          <div className="cc1-mag-header">
            <div className="cc1-mag-title-row">
              <h1 className="cc1-mag-title">知识画报</h1>
              <span className="cc1-mag-badge">第1期</span>
            </div>
            <p className="cc1-mag-sub">P3 华文 · 知识画报 Issue 1</p>
            <div className="cc1-mag-stats">
              <span className="cc1-mag-stat">
                已读 {visitedSections.length}/{sections.length}
              </span>
              <span className="cc1-mag-stat">
                测验 {quizzesCompleted}/{sectionsWithQuiz.length}
              </span>
              <span className="cc1-mag-stat">
                词汇 {lookedUpWords.length}/{totalWords}
              </span>
            </div>
          </div>

          {/* Section cards */}
          <div className="cc1-section-list">
            {sections.map((section) => {
              const visited = visitedSections.includes(section.id)
              const quizDone = quizResults[section.id] !== undefined
              return (
                <button
                  key={section.id}
                  className={`cc1-section-card ${visited ? 'visited' : ''}`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <span className="cc1-section-icon">{section.icon}</span>
                  <div className="cc1-section-info">
                    <div className="cc1-section-name">{section.title}</div>
                    <div className="cc1-section-sub">{section.subtitle}</div>
                    <div className="cc1-section-pages">
                      第{section.pages.join('-')}页
                    </div>
                  </div>
                  <div className="cc1-section-badges">
                    {visited && <span className="cc1-badge-visited">已读</span>}
                    {section.quiz && quizDone && (
                      <span className="cc1-badge-quiz">
                        {quizResults[section.id] ? '✓' : '✗'}
                      </span>
                    )}
                  </div>
                  <svg className="cc1-section-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              )
            })}
          </div>
        </>
      )}

      {/* FAB dictionary button */}
      {!drawerOpen && (
        <button
          className="cc1-fab"
          onClick={() => setDrawerOpen(true)}
          aria-label="打开词典"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            <path d="M8 7h8M8 11h6" />
          </svg>
        </button>
      )}

      {/* Bottom drawer */}
      <div
        id="cc1-drawer"
        className={`cc1-drawer ${drawerOpen ? 'open' : ''}`}
      >
        <div className="cc1-drawer-handle" onClick={() => setDrawerOpen(false)}>
          <div className="cc1-drawer-bar" />
        </div>

        <div className="cc1-search-row">
          <input
            ref={searchInputRef}
            type="text"
            className="cc1-search-input"
            placeholder="搜索词语 / pinyin / english..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="cc1-search-clear" onClick={() => setSearchQuery('')}>
              ✕
            </button>
          )}
        </div>

        <div className="cc1-word-list">
          {filteredWords.length === 0 ? (
            <div className="cc1-no-results">没有找到词语</div>
          ) : (
            filteredWords.map(([word, def]) => (
              <button
                key={word}
                className={`cc1-word-item ${lookedUpWords.includes(word) ? 'looked-up' : ''}`}
                onClick={() => handleWordTap(word, def)}
              >
                <span className="cc1-word-chinese">{word}</span>
                <span className="cc1-word-pinyin">{def.pinyin}</span>
                <span className="cc1-word-english">{def.english}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Word popup */}
      {selectedWord && (
        <div className="cc1-popup-overlay" onClick={() => setSelectedWord(null)}>
          <div className="cc1-popup" onClick={(e) => e.stopPropagation()}>
            <button className="cc1-popup-close" onClick={() => setSelectedWord(null)}>
              ✕
            </button>
            <div className="cc1-popup-word">{selectedWord.word}</div>
            <div className="cc1-popup-pinyin">{selectedWord.def.pinyin}</div>
            <div className="cc1-popup-english">{selectedWord.def.english}</div>
            <div className="cc1-popup-explanation">{selectedWord.def.explanation}</div>
            <div className="cc1-popup-pages">
              出现在：
              {selectedWord.def.pages.map((p) => (
                <button
                  key={p}
                  className="cc1-popup-page-link"
                  onClick={() => {
                    // Find the section that contains this page
                    const targetSection = sections.find((s) => s.pages.includes(p))
                    if (targetSection) {
                      setSelectedWord(null)
                      setDrawerOpen(false)
                      setActiveSection(targetSection.id)
                    }
                  }}
                >
                  第{p}页
                </button>
              ))}
            </div>
            <button
              className="cc1-popup-speak"
              onClick={() => playWordAudio(selectedWord.word)}
              aria-label="朗读"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
              朗读
            </button>
          </div>
        </div>
      )}

      {/* Backdrop when drawer is open */}
      {drawerOpen && <div className="cc1-backdrop" onClick={() => setDrawerOpen(false)} />}
    </div>
  )
}
