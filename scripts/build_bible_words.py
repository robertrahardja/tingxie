#!/usr/bin/env python3
"""
Make every word on /bible/proverbs/<chapter> tappable: segment each verse
(jieba) and build a dictionary (pinyin + English) for every word.

Same shape, and the same gloss order, as scripts/build_zonghe_words.py:
the OVERRIDES below, then CC-CEDICT (CC BY-SA 4.0), then a word composed from
its characters ("穷 poor + 乏 lacking").

箴言 is semi-classical, so CC-CEDICT misses ~30% of the word types here
(11% of tokens) — 我儿, 训诲, 穷乏, 必致 and friends. Those are what OVERRIDES
is for; without them a child taps 我儿 and reads "我 I + 儿 child".

Writes public/data/bible/proverbs_<n>_words.json:
    { "seg":  { "<exact verse text>": ["敬畏","耶和华","是",…] },
      "dict": { "耶和华": { "py": "Yē hé huá", "en": "the LORD (God's name)" }, … } }

Usage (needs jieba + pypinyin; CC-CEDICT is downloaded on first run):
    ~/.local/share/mise/installs/python/3.14.6/bin/python scripts/build_bible_words.py [chapters…]
"""

import gzip
import json
import re
import sys
import urllib.request
from pathlib import Path

import jieba
from pypinyin import Style, lazy_pinyin
from pypinyin.contrib.tone_convert import to_tone

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "public" / "data" / "bible"
CEDICT = Path.home() / ".cache" / "tingxie" / "cedict.txt.gz"
CEDICT_URL = "https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.txt.gz"

HAN = re.compile(r"[一-鿿]")

# Names and biblical compounds jieba splits or CC-CEDICT spells for adults.
EXTRA_WORDS = [
    "耶和华", "所罗门", "以色列", "训诲", "我儿", "愚妄人", "少年人", "聪明人",
    "穷乏", "必致", "明哲", "争竞", "贻羞", "存记", "坚立", "善报", "恶道",
    "外女", "淫妇", "众子", "之子", "城门口", "受罚", "必受", "必蒙", "所行",
    "行恶", "口中", "不肯", "使人", "人必", "谋略", "法则", "正直", "公平",
    "仁义", "知识", "智慧", "通达", "言语", "开端", "谨守", "诫命", "才德",
]

# Kid-level glosses; these win over CC-CEDICT. Ordered roughly by how often
# the word appears in 箴言 (measured over all 913 verses).
OVERRIDES = {
    # — the ones CC-CEDICT does not have at all —
    "我儿": ("wǒ ér", "my son (the teacher speaking to a young learner)"),
    "训诲": ("xùn huì", "teaching; instruction"),
    "穷乏": ("qióng fá", "poor and in need"),
    "必致": ("bì zhì", "will surely lead to"),
    "人必": ("rén bì", "a person will surely …"),
    "使人": ("shǐ rén", "makes a person …"),
    "所行": ("suǒ xíng", "what someone does; their ways"),
    "争竞": ("zhēng jìng", "to quarrel; to fight over"),
    "不肯": ("bù kěn", "unwilling to"),
    "明哲": ("míng zhé", "wise and understanding"),
    "聪明人": ("cōng míng rén", "a wise person"),
    "口中": ("kǒu zhōng", "in one's mouth; what one says"),
    "受罚": ("shòu fá", "to be punished"),
    "必受": ("bì shòu", "will surely receive"),
    "之子": ("zhī zǐ", "the child of …"),
    "必蒙": ("bì méng", "will surely be given"),
    "行恶": ("xíng è", "to do evil"),
    "城门口": ("chéng mén kǒu", "the city gate (where elders met)"),
    "存记": ("cún jì", "to keep in mind; to remember"),
    "外女": ("wài nǚ", "a strange woman; an outsider"),
    "众子": ("zhòng zǐ", "sons; children"),
    "贻羞": ("yí xiū", "to bring shame"),
    "坚立": ("jiān lì", "to stand firm; to be established"),
    "善报": ("shàn bào", "a good reward"),
    "恶道": ("è dào", "an evil path"),
    "愚妄人": ("yú wàng rén", "a foolish person who will not learn"),
    # — words CC-CEDICT has, but glossed for an adult reader —
    "耶和华": ("Yē hé huá", "the LORD (God's name in the Bible)"),
    "所罗门": ("Suǒ luó mén", "Solomon (the king who wrote these sayings)"),
    "以色列": ("Yǐ sè liè", "Israel"),
    "大卫": ("Dà wèi", "David (Solomon's father, a king)"),
    # — names, which character-composition mangles badly (亚古珥 became
    #   "亚 Asia + 古 ancient + 珥 ear ornament") —
    "亚古珥": ("Yà gǔ ěr", "Agur (who wrote chapter 30)"),
    "雅基": ("Yǎ jī", "Jakeh (Agur's father)"),
    "以铁": ("Yǐ tiě", "Ithiel (a man Agur spoke to)"),
    "伊铁": ("Yī tiě", "Ithiel (a man Agur spoke to)"),
    "乌甲": ("Wū jiǎ", "Ucal (a man Agur spoke to)"),
    "利慕伊勒": ("Lì mù yī lè", "Lemuel (the king in chapter 31)"),
    "利慕": ("Lì mù", "Lemuel (the king in chapter 31)"),
    "伊勒": ("Yī lè", "part of the name Lemuel"),
    "希西家": ("Xī xī jiā", "Hezekiah (a king of Judah)"),
    "希西": ("Xī xī", "part of the name Hezekiah"),
    "犹大": ("Yóu dà", "Judah (the southern kingdom)"),
    "阴间": ("yīn jiān", "the place of the dead"),
    "箴言": ("zhēn yán", "wise sayings (the name of this book)"),
    "智慧": ("zhì huì", "wisdom; being wise"),
    "通达": ("tōng dá", "understanding; seeing clearly"),
    "谋略": ("móu lüè", "good planning; knowing what to do"),
    "敬畏": ("jìng wèi", "to respect deeply (with awe)"),
    "谨守": ("jǐn shǒu", "to keep carefully"),
    "诫命": ("jiè mìng", "a command; a rule to follow"),
    "法则": ("fǎ zé", "a rule; a teaching"),
    "正直": ("zhèng zhí", "honest and upright"),
    "仁义": ("rén yì", "kindness and doing right"),
    "公平": ("gōng píng", "fair; treating people right"),
    "言语": ("yán yǔ", "words; what people say"),
    "开端": ("kāi duān", "the beginning; where it starts"),
    "愚昧": ("yú mèi", "foolish; not wanting to learn"),
    "愚人": ("yú rén", "a foolish person"),
    "藐视": ("miǎo shì", "to look down on"),
    "离弃": ("lí qì", "to leave behind; to abandon"),
    "才德": ("cái dé", "capable and good"),
    "少年人": ("shào nián rén", "a young person"),
    "银子": ("yín zi", "silver (money)"),
    "精金": ("jīng jīn", "pure gold"),
    "强如": ("qiáng rú", "better than"),
    "胜过": ("shèng guò", "to be better than"),
    "为人": ("wéi rén", "how a person behaves"),
    # — real words of 箴言 that no dictionary has (chapter 1) —
    "灵明": ("líng míng", "clever; quick to understand"),
    "华冠": ("huá guān", "a beautiful crown"),
    "流人": ("liú rén", "to shed someone's blood; to kill"),
    "之血": ("zhī xuè", "the blood of …"),
    "己血": ("jǐ xuè", "one's own blood"),
    "己身": ("jǐ shēn", "one's own self"),
    "己命": ("jǐ mìng", "one's own life"),
    "之路": ("zhī lù", "the road of …; the way of …"),
    "之心": ("zhī xīn", "the heart of …"),
    "之命": ("zhī mìng", "the life of …"),
    "财者": ("cái zhě", "the one who has the money"),
    "恳切": ("kěn qiè", "earnestly; really meaning it"),
    "自结": ("zì jié", "what one grew oneself"),
    "自设": ("zì shè", "what one planned oneself"),
    "背道": ("bèi dào", "to turn away from the right path"),
    "囫囵": ("hú lún", "whole; all in one piece"),
    "亵慢": ("xiè màn", "to mock; to sneer at what is good"),
    "愚顽": ("yú wán", "stubborn and foolish"),
    "劝戒": ("quàn jiè", "advice; a warning meant to help"),
    "责备": ("zé bèi", "to correct someone; to tell them off"),
    "智谋": ("zhì móu", "wise planning"),
    "譬喻": ("pì yù", "a word picture; a comparison"),
    "谜语": ("mí yǔ", "a riddle"),
    "言词": ("yán cí", "words; sayings"),
    "学问": ("xué wèn", "learning; knowledge"),
    "囊袋": ("náng dài", "a money bag"),
    "网罗": ("wǎng luó", "a net for catching birds"),
    "埋伏": ("mái fú", "to hide and wait to attack"),
    "蹲伏": ("dūn fú", "to crouch down and hide"),
    "贪恋": ("tān liàn", "to be greedy for"),
    "财利": ("cái lì", "money and profit"),
    "阴间": ("yīn jiān", "the place of the dead"),
    "宽阔": ("kuān kuò", "wide and open"),
    "嗤笑": ("chī xiào", "to laugh at someone unkindly"),
    "浇灌": ("jiāo guàn", "to pour out (like watering a plant)"),
    "安然": ("ān rán", "safely; without worry"),
    "灾祸": ("zāi huò", "disaster; something very bad"),
    "安逸": ("ān yì", "taking it easy; not caring"),
    # — chapters 2–4 —
    "呼求": ("hū qiú", "to call out for; to cry out asking"),
    "扬声": ("yáng shēng", "to raise your voice; to call out loudly"),
    "护庇": ("hù bì", "to shelter and protect"),
    "死地": ("sǐ dì", "a place of death"),
    "拔出": ("bá chū", "to pull up by the roots"),
    "年数": ("nián shù", "the number of years; how long you live"),
    "加给": ("jiā gěi", "to add to (someone)"),
    "心版": ("xīn bǎn", "the heart, pictured as a writing tablet"),
    "百骨": ("bǎi gǔ", "all your bones; deep inside the body"),
    "初熟": ("chū shú", "the first crop to ripen; the first and best"),
    "仓房": ("cāng fáng", "a storeroom for grain"),
    "酒榨": ("jiǔ zhà", "a wine press (where grapes are squeezed)"),
    "盈溢": ("yíng yì", "to overflow; to be more than full"),
    "持定": ("chí dìng", "to hold on to firmly"),
    "持守": ("chí shǒu", "to keep holding on to"),
    "荣冕": ("róng miǎn", "a crown of glory"),
    "华冠": ("huá guān", "a beautiful crown"),
    "日午": ("rì wǔ", "midday; noon"),
    "果效": ("guǒ xiào", "the result; what comes out of it"),
    "修平": ("xiū píng", "to smooth out; to make level"),
    "乖谬": ("guāi miù", "twisted; saying what is not right"),
    "乖僻": ("guāi pì", "twisted and stubborn"),
    "邪僻": ("xié pì", "crooked; not honest"),
    "网罗": ("wǎng luó", "a trap; a net"),
    "盟约": ("méng yuē", "a solemn promise"),
    "配偶": ("pèi ǒu", "a husband or wife"),
    "奸诈": ("jiān zhà", "sly and cheating"),
    "剪除": ("jiǎn chú", "to cut off; to remove completely"),
    "讥诮": ("jī qiào", "to sneer at; to mock"),
    "谦卑": ("qiān bēi", "humble; not proud"),
    "咒诅": ("zhòu zǔ", "a curse"),
    "憎恶": ("zēng wù", "to hate strongly"),
    "尊荣": ("zūn róng", "honour; being looked up to"),
    "羞辱": ("xiū rǔ", "shame; disgrace"),
    "延年益寿": ("yán nián yì shòu", "to live a longer life"),
    "娇儿": ("jiāo ér", "a much-loved child"),
    "孝子": ("xiào zǐ", "a son who honours his parents"),
    "良药": ("liáng yào", "good medicine"),
    "甘露": ("gān lù", "sweet dew"),
    "深渊": ("shēn yuān", "the deep waters"),
    "美饰": ("měi shì", "something beautiful to wear"),
    "强暴": ("qiáng bào", "violence; being cruel and forceful"),
    "嫉妒": ("jí dù", "to be jealous of"),
    # — chapters 5–9 —
    "茵蔯": ("yīn chén", "wormwood (a very bitter plant)"),
    "两刃": ("liǎng rèn", "two-edged (sharp on both sides)"),
    "踏住": ("tà zhù", "to step onto; to take hold of"),
    "变迁": ("biàn qiān", "to keep changing"),
    "劳碌": ("láo lù", "to work hard; hard work"),
    "消毁": ("xiāo huǐ", "to waste away; to be worn out"),
    "悲叹": ("bēi tàn", "to groan sadly"),
    "师傅": ("shī fu", "a teacher; a master"),
    "泉源": ("quán yuán", "a spring of water"),
    "涨溢": ("zhǎng yì", "to overflow"),
    "麀鹿": ("yōu lù", "a doe (female deer)"),
    "恋慕": ("liàn mù", "to long for"),
    "罪孽": ("zuì niè", "wrongdoing; sin"),
    "绳索": ("shéng suǒ", "ropes"),
    "缠绕": ("chán rào", "to wind around; to tie up"),
    "作保": ("zuò bǎo", "to promise to pay someone else's debt"),
    "击掌": ("jī zhǎng", "to clap hands on a deal (like shaking hands)"),
    "自卑": ("zì bēi", "to make yourself humble"),
    "恳求": ("kěn qiú", "to beg earnestly"),
    "打盹": ("dǎ dǔn", "to doze; to nod off"),
    "捕鸟": ("bǔ niǎo", "to catch birds"),
    "懒惰": ("lǎn duò", "lazy"),
    "蚂蚁": ("mǎ yǐ", "an ant"),
    "元帅": ("yuán shuài", "a commander"),
    "官长": ("guān zhǎng", "an officer; someone in charge"),
    "聚敛": ("jù liǎn", "to gather up and store"),
    "粮食": ("liáng shi", "food; grain"),
    "缺乏": ("quē fá", "going without; not having enough"),
    "无赖": ("wú lài", "a good-for-nothing person"),
    "恶徒": ("è tú", "a troublemaker; a bad person"),
    "示意": ("shì yì", "to signal; to hint"),
    "点划": ("diǎn huà", "to point and gesture"),
    "恶谋": ("è móu", "a wicked plan"),
    "布散": ("bù sàn", "to spread around"),
    "纷争": ("fēn zhēng", "quarrelling; fighting"),
    "顷刻": ("qǐng kè", "in a moment; very suddenly"),
    "败坏": ("bài huài", "to be ruined"),
    "高傲": ("gāo ào", "proud; looking down on others"),
    "撒谎": ("sā huǎng", "to tell lies"),
    "无辜": ("wú gū", "innocent; having done nothing wrong"),
    "图谋": ("tú móu", "to plot; to plan secretly"),
    "谎言": ("huǎng yán", "a lie"),
    "见证": ("jiàn zhèng", "a witness (someone who tells what they saw)"),
    "谄媚": ("chǎn mèi", "flattering; sweet-talking to get something"),
    "勾引": ("gōu yǐn", "to lure; to tempt someone"),
    "搋火": ("chuāi huǒ", "to scoop fire into your clothes"),
    "火炭": ("huǒ tàn", "burning coals"),
    "偷窃": ("tōu qiè", "to steal"),
    "充饥": ("chōng jī", "to stop being hungry"),
    "偿还": ("cháng huán", "to pay back"),
    "凌辱": ("líng rǔ", "to be shamed and insulted"),
    "羞耻": ("xiū chǐ", "shame"),
    "嫉恨": ("jí hèn", "jealous anger"),
    "烈怒": ("liè nù", "burning anger"),
    "赎价": ("shú jià", "a payment to make up for something"),
    "干休": ("gān xiū", "to let the matter drop"),
    "瞳人": ("tóng rén", "the pupil of the eye (something precious)"),
    "姊妹": ("zǐ mèi", "a sister"),
    "窗棂": ("chuāng líng", "the lattice of a window"),
    "愚蒙": ("yú méng", "simple; not knowing much yet"),
    "打扮": ("dǎ ban", "the way someone dresses up"),
    "诡诈": ("guǐ zhà", "sly; tricky"),
    "喧嚷": ("xuān rǎng", "loud and noisy"),
    "约束": ("yuē shù", "rules that hold someone in"),
    "蹲伏": ("dūn fú", "to crouch and wait"),
    "巧言": ("qiǎo yán", "clever, smooth talk"),
    "宰杀": ("zǎi shā", "to kill (an animal)"),
    "锁链": ("suǒ liàn", "chains"),
    "刑罚": ("xíng fá", "punishment"),
    "雀鸟": ("què niǎo", "a small bird"),
    "迷途": ("mí tú", "a path that leads you astray"),
    "杀戮": ("shā lù", "killing"),
    "仆倒": ("pū dǎo", "to fall down"),
    "会悟": ("huì wù", "to come to understand"),
    "弯曲": ("wān qū", "bent; not straight"),
    "狂妄": ("kuáng wàng", "showing off; thinking too much of yourself"),
    "货财": ("huò cái", "goods and riches"),
    "府库": ("fǔ kù", "a storehouse for treasure"),
    "造化": ("zào huà", "creating; making the world"),
    "太初": ("tài chū", "the very beginning"),
    "亘古": ("gèn gǔ", "from the oldest times"),
    "奠定": ("diàn dìng", "to set firmly in place"),
    "穹苍": ("qióng cāng", "the sky above"),
    "渊源": ("yuān yuán", "the deep springs of water"),
    "沧海": ("cāng hǎi", "the wide sea"),
    "界限": ("jiè xiàn", "a limit; how far something may go"),
    "根基": ("gēn jī", "the foundation; what something is built on"),
    "工师": ("gōng shī", "a master builder"),
    "踊跃": ("yǒng yuè", "to jump for joy"),
    "门框": ("mén kuàng", "a door frame"),
    "恩惠": ("ēn huì", "kindness given freely"),
    "凿成": ("záo chéng", "to carve out (of stone)"),
    "柱子": ("zhù zi", "a pillar holding up a roof"),
    "牲畜": ("shēng chù", "farm animals"),
    "旨酒": ("zhǐ jiǔ", "good wine"),
    "设摆": ("shè bǎi", "to set out (a table)"),
    "筵席": ("yán xí", "a feast"),
    "使女": ("shǐ nǚ", "a servant girl"),
    "指斥": ("zhǐ chì", "to tell someone off"),
    "辱骂": ("rǔ mà", "insults"),
    "玷污": ("diàn wū", "to be stained; to be spoiled"),
    "至圣者": ("zhì shèng zhě", "the Holy One (God)"),
    "担当": ("dān dāng", "to carry it yourself"),
    "阴魂": ("yīn hún", "the spirits of the dead"),
    # — chapters 5–9 leftovers —
    "至终": ("zhì zhōng", "in the end; at last"),
    "母鹿": ("mǔ lù", "a female deer"),
    "圣会": ("shèng huì", "the gathered people; the assembly"),
    "缠住": ("chán zhù", "to be tangled up; to be caught"),
    "六样": ("liù yàng", "six kinds; six things"),
    "七样": ("qī yàng", "seven kinds; seven things"),
    "恶计": ("è jì", "a wicked plan"),
    "巷口": ("xiàng kǒu", "the entrance to a lane"),
    "银囊": ("yín náng", "a money bag"),
    "道旁": ("dào páng", "beside the road"),
    "城门洞": ("chéng mén dòng", "the gateway of the city"),
    "高银": ("gāo yín", "the finest silver"),
    "渊面": ("yuān miàn", "the surface of the deep sea"),
    # — chapters 10–14 —
    "福祉": ("fú zhǐ", "blessing; good things"),
    "朽烂": ("xiǔ làn", "to rot away"),
    "蒙蔽": ("méng bì", "to cover over; to hide"),
    "挑启": ("tiǎo qǐ", "to stir up; to start"),
    "争端": ("zhēng duān", "a quarrel"),
    "遮掩": ("zhē yǎn", "to cover over; to forgive"),
    "刑杖": ("xíng zhàng", "a stick used for punishment"),
    "积存": ("jī cún", "to store up"),
    "富户": ("fù hù", "a rich household"),
    "坚城": ("jiān chéng", "a strong walled city"),
    "进项": ("jìn xiàng", "money coming in; income"),
    "失迷": ("shī mí", "to lose the way"),
    "怨恨": ("yuàn hèn", "a grudge; bitter feeling"),
    "谗谤": ("chán bàng", "saying bad things about people"),
    "教养": ("jiào yǎng", "to feed and bring up"),
    "忧虑": ("yōu lǜ", "worry"),
    "戏耍": ("xì shuǎ", "playing about; treating as a joke"),
    "应允": ("yìng yǔn", "to be granted; to be said yes to"),
    "暴风": ("bào fēng", "a storm wind"),
    "灭没": ("miè mò", "to come to nothing"),
    "保障": ("bǎo zhàng", "a safe stronghold"),
    "作孽": ("zuò niè", "to do wrong"),
    "挪移": ("nuó yí", "to be moved away"),
    "滋生": ("zī shēng", "to grow; to produce"),
    "割断": ("gē duàn", "to be cut off"),
    "天平": ("tiān píng", "a weighing scale"),
    "法码": ("fǎ mǎ", "the weights used on a scale"),
    "谦逊": ("qiān xùn", "humble"),
    "纯正": ("chún zhèng", "honest all the way through"),
    "资财": ("zī cái", "money and belongings"),
    "拯救": ("zhěng jiù", "to rescue"),
    "灭绝": ("miè jué", "to be wiped out"),
    "患难": ("huàn nàn", "trouble; hard times"),
    "虔敬": ("qián jìng", "God-fearing; devoted"),
    "倾覆": ("qīng fù", "to be overturned"),
    "静默": ("jìng mò", "to stay quiet"),
    "泄漏": ("xiè lòu", "to let a secret out"),
    "密事": ("mì shì", "a secret"),
    "遮隐": ("zhē yǐn", "to keep something hidden"),
    "谋士": ("móu shì", "an adviser"),
    "败落": ("bài luò", "to fall apart"),
    "亏损": ("kuī sǔn", "loss; being worse off"),
    "恩德": ("ēn dé", "kindness"),
    "仁慈": ("rén cí", "kind-hearted"),
    "扰害": ("rǎo hài", "to bring trouble on"),
    "虚浮": ("xū fú", "empty; not real"),
    "工价": ("gōng jià", "wages; what work earns"),
    "恒心": ("héng xīn", "keeping at it steadily"),
    "后裔": ("hòu yì", "children and grandchildren"),
    "美貌": ("měi mào", "good looks"),
    "见识": ("jiàn shi", "good sense"),
    "金环": ("jīn huán", "a gold ring"),
    "施散": ("shī sàn", "to give away freely"),
    "吝惜": ("lìn xī", "to hold back stingily"),
    "丰裕": ("fēng yù", "plenty; more than enough"),
    "滋润": ("zī rùn", "to water; to refresh"),
    "屯粮": ("tún liáng", "to hoard grain"),
    "倚仗": ("yǐ zhàng", "to lean on; to depend on"),
    "发旺": ("fā wàng", "to flourish; to grow well"),
    "清风": ("qīng fēng", "wind (that is, nothing at all)"),
    "慧心": ("huì xīn", "a wise heart"),
    "畜类": ("chù lèi", "an animal (used as an insult)"),
    "诡计": ("guǐ jì", "a sly trick"),
    "动摇": ("dòng yáo", "to be shaken"),
    "冠冕": ("guān miǎn", "a crown"),
    "思念": ("sī niàn", "thoughts"),
    "计谋": ("jì móu", "a plan"),
    "言论": ("yán lùn", "the things someone says"),
    "轻贱": ("qīng jiàn", "looked down on"),
    "顾惜": ("gù xī", "to care for"),
    "怜悯": ("lián mǐn", "to feel sorry for and help"),
    "耕种": ("gēng zhòng", "to farm; to plant"),
    "饱食": ("bǎo shí", "to eat until full"),
    "追随": ("zhuī suí", "to follow after"),
    "报应": ("bào yìng", "what comes back to you"),
    "劝教": ("quàn jiào", "advice"),
    "恼怒": ("nǎo nù", "anger"),
    "忍辱": ("rěn rǔ", "to put up with being shamed"),
    "浮躁": ("fú zào", "hasty; speaking without thinking"),
    "和睦": ("hé mù", "getting along peacefully"),
    "祸患": ("huò huàn", "trouble; disaster"),
    "彰显": ("zhāng xiǎn", "to show plainly"),
    "殷勤": ("yīn qín", "hard-working"),
    "服苦": ("fú kǔ", "to be put to hard labour"),
    "良言": ("liáng yán", "a kind word"),
    "臭名": ("chòu míng", "a bad name"),
    "惭愧": ("cán kuì", "ashamed"),
    "威吓": ("wēi hè", "a threat"),
    "争竞": ("zhēng jìng", "quarrelling"),
    "劝言": ("quàn yán", "advice"),
    "积蓄": ("jī xù", "to save up"),
    "迟延": ("chí yán", "delayed; slow in coming"),
    "训言": ("xùn yán", "a word of teaching"),
    "崎岖": ("qí qū", "rough and hard to walk"),
    "张扬": ("zhāng yáng", "to show off"),
    "使者": ("shǐ zhě", "a messenger"),
    "使臣": ("shǐ chén", "an envoy; a trusted messenger"),
    "忠信": ("zhōng xìn", "faithful and trustworthy"),
    "弃绝": ("qì jué", "to throw away; to refuse"),
    "甘甜": ("gān tián", "sweet"),
    "作伴": ("zuò bàn", "to keep company with"),
    "追赶": ("zhuī gǎn", "to chase after"),
    "遗留": ("yí liú", "to leave behind for others"),
    "产业": ("chǎn yè", "property passed down"),
    "肚腹": ("dù fù", "the stomach"),
    "家室": ("jiā shì", "a household; a family home"),
    "拆毁": ("chāi huǐ", "to pull down"),
    "槽头": ("cáo tóu", "the feeding trough"),
    "土产": ("tǔ chǎn", "crops from the land"),
    "苦楚": ("kǔ chǔ", "pain; bitterness"),
    "帐棚": ("zhàng peng", "a tent"),
    "兴盛": ("xīng shèng", "to do well; to thrive"),
    "愁苦": ("chóu kǔ", "sadness"),
    "背道": ("bèi dào", "to turn away from the right path"),
    "谨慎": ("jǐn shèn", "careful"),
    "狂傲": ("kuáng ào", "wildly proud"),
    "自恃": ("zì shì", "too sure of yourself"),
    "俯伏": ("fǔ fú", "to bow down low"),
    "避难所": ("bì nàn suǒ", "a safe place to shelter"),
    "衰败": ("shuāi bài", "to grow weak and fall"),
    "暴躁": ("bào zào", "quick-tempered"),
    "欺压": ("qī yā", "to bully and push down"),
    "贫寒": ("pín hán", "poor"),
    "辱没": ("rǔ mò", "to insult; to bring shame on"),
    "邦国": ("bāng guó", "a nation"),
    "臣子": ("chén zǐ", "an official serving a king"),
    "震怒": ("zhèn nù", "great anger"),
    "投靠": ("tóu kào", "somewhere to turn for safety"),
    # — chapters 10–14 leftovers —
    "违弃": ("wéi qì", "to turn your back on; to refuse"),
    "多言多语": ("duō yán duō yǔ", "talking too much"),
    "薰目": ("xūn mù", "to sting the eyes (of smoke)"),
    "义种": ("yì zhǒng", "seed of what is right (good deeds planted)"),
    "猪鼻": ("zhū bí", "a pig's nose"),
    "青叶": ("qīng yè", "a green leaf"),
    "受报": ("shòu bào", "to get back what you deserve"),
    "站得住": ("zhàn de zhù", "to keep standing; to hold firm"),
    "美福": ("měi fú", "good things; blessing"),
    "真话": ("zhēn huà", "the truth"),
    "满受": ("mǎn shòu", "to get a full share of"),
    "得保": ("dé bǎo", "to be kept safe"),
    "加增": ("jiā zēng", "to grow more and more"),
    "牛力": ("niú lì", "the strength of an ox"),
    "己道": ("jǐ dào", "one's own way of living"),
    "大显": ("dà xiǎn", "to show plainly and greatly"),
    "忿怒": ("fèn nù", "anger"),
    "过错": ("guò cuò", "a mistake; a wrong"),
    "指望": ("zhǐ wàng", "what someone is hoping for"),
    "心愿": ("xīn yuàn", "what the heart wishes for"),
    # — chapters 15–19 —
    "柔和": ("róu hé", "gentle; soft"),
    "消退": ("xiāo tuì", "to fade away; to die down"),
    "暴戾": ("bào lì", "harsh and fierce"),
    "触动": ("chù dòng", "to set off; to stir up"),
    "温良": ("wēn liáng", "gentle and kind"),
    "心碎": ("xīn suì", "a broken heart"),
    "鉴察": ("jiàn chá", "to watch closely"),
    "播扬": ("bō yáng", "to spread around"),
    "献祭": ("xiàn jì", "to offer a sacrifice to God"),
    "祈祷": ("qí dǎo", "to pray"),
    "祷告": ("dǎo gào", "prayer"),
    "严刑": ("yán xíng", "hard punishment"),
    "困苦": ("kùn kǔ", "suffering; having a hard time"),
    "欢畅": ("huān chàng", "cheerful; light-hearted"),
    "丰筵": ("fēng yán", "a rich feast"),
    "素菜": ("sù cài", "vegetables (a plain meal)"),
    "肥牛": ("féi niú", "a fattened ox (a rich meal)"),
    "荆棘": ("jīng jí", "thorn bushes"),
    "篱笆": ("lí ba", "a fence"),
    "商议": ("shāng yì", "to talk something over together"),
    "应对": ("yìng duì", "the answer someone gives"),
    "寡妇": ("guǎ fù", "a widow"),
    "地界": ("dì jiè", "the boundary of someone's land"),
    "贿赂": ("huì lù", "a bribe"),
    "思量": ("sī liang", "to think carefully about"),
    "衡量": ("héng liáng", "to weigh up; to judge"),
    "交托": ("jiāo tuō", "to hand over; to entrust"),
    "筹算": ("chóu suàn", "to plan out"),
    "谋算": ("móu suàn", "planning"),
    "仇敌": ("chóu dí", "an enemy"),
    "掳物": ("lǔ wù", "things taken in war"),
    "甜言": ("tián yán", "sweet, kind words"),
    "惩治": ("chéng zhì", "to punish"),
    "蜂房": ("fēng fáng", "a honeycomb"),
    "胃口": ("wèi kǒu", "appetite; hunger"),
    "口腹": ("kǒu fù", "the mouth and stomach; hunger"),
    "催逼": ("cuī bī", "to push someone on"),
    "匪徒": ("fěi tú", "a worthless troublemaker"),
    "烧焦": ("shāo jiāo", "burnt"),
    "播散": ("bō sàn", "to scatter; to spread"),
    "离间": ("lí jiàn", "to split people apart"),
    "密友": ("mì yǒu", "a close friend"),
    "诱惑": ("yòu huò", "to tempt"),
    "白发": ("bái fà", "grey hair"),
    "勇士": ("yǒng shì", "a brave soldier"),
    "治服": ("zhì fú", "to bring under control"),
    "熬炼": ("áo liàn", "to test by heating; to refine"),
    "炼银": ("liàn yín", "to refine silver"),
    "炼金": ("liàn jīn", "to refine gold"),
    "幸灾乐祸": ("xìng zāi lè huò", "to be glad when someone else has trouble"),
    "馈送": ("kuì sòng", "to give a present"),
    "宝玉": ("bǎo yù", "a precious jewel"),
    "挑错": ("tiāo cuò", "to keep bringing up someone's mistakes"),
    "背叛": ("bèi pàn", "to rebel; to turn against"),
    "严厉": ("yán lì", "stern; harsh"),
    "崽子": ("zǎi zi", "a cub; a baby animal"),
    "母熊": ("mǔ xióng", "a mother bear"),
    "价银": ("jià yín", "money to pay for something"),
    "过犯": ("guò fàn", "doing wrong"),
    "是非": ("shì fēi", "quarrels; trouble between people"),
    "枯干": ("kū gān", "dried up"),
    "颠倒": ("diān dǎo", "to turn upside down; to twist"),
    "地极": ("dì jí", "the far ends of the earth"),
    "愁烦": ("chóu fán", "worry and sadness"),
    "忧苦": ("yōu kǔ", "sorrow"),
    "忧伤": ("yōu shāng", "grief; a crushed feeling"),
    "君子": ("jūn zǐ", "an honourable person"),
    "寡少": ("guǎ shǎo", "few; using only a little"),
    "寡合": ("guǎ hé", "keeping apart from others"),
    "恼恨": ("nǎo hèn", "to be angry at; to resent"),
    "心意": ("xīn yì", "what someone is thinking"),
    "瞻徇": ("zhān xùn", "to show favour unfairly"),
    "情面": ("qíng miàn", "favour shown because of who someone is"),
    "偏断": ("piān duàn", "to judge unfairly"),
    "案件": ("àn jiàn", "a case brought to be judged"),
    "鞭打": ("biān dǎ", "a beating"),
    "心腹": ("xīn fù", "deep inside a person"),
    "懈怠": ("xiè dài", "slack; not trying"),
    "浪费": ("làng fèi", "to waste"),
    "坚固": ("jiān gù", "strong; firm"),
    "高墙": ("gāo qiáng", "a high wall"),
    "疾病": ("jí bìng", "illness"),
    "承当": ("chéng dāng", "to bear; to carry"),
    "高位": ("gāo wèi", "an important position"),
    "情由": ("qíng yóu", "the reasons for something"),
    "实情": ("shí qíng", "what really happened"),
    "掣签": ("chè qiān", "to draw lots (to decide something)"),
    "解散": ("jiě sàn", "to break up; to separate"),
    "结怨": ("jié yuàn", "to fall out with someone"),
    "坚寨": ("jiān zhài", "a fortress"),
    "门闩": ("mén shuān", "the bar that locks a gate"),
    "贤妻": ("xián qī", "a good wife"),
    "贤慧": ("xián huì", "wise and good (of a woman)"),
    "哀求": ("āi qiú", "to beg"),
    "滥交": ("làn jiāo", "making friends carelessly"),
    "亲密": ("qīn mì", "close"),
    "倾败": ("qīng bài", "to ruin; to bring down"),
    "抱怨": ("bào yuàn", "to complain"),
    "恩情": ("ēn qíng", "kindness; a favour"),
    "宴乐": ("yàn lè", "feasting and enjoying yourself"),
    "宽恕": ("kuān shù", "to forgive"),
    "过失": ("guò shī", "a mistake"),
    "吼叫": ("hǒu jiào", "to roar"),
    "争吵": ("zhēng chǎo", "quarrelling"),
    "滴漏": ("dī lòu", "dripping without stopping"),
    "祖宗": ("zǔ zōng", "parents and grandparents before you"),
    "沉睡": ("chén shuì", "deep sleep"),
    "轻忽": ("qīng hū", "to take no care over"),
    "善行": ("shàn xíng", "a good deed"),
    "爱慕": ("ài mù", "to admire and like"),
    "恒久": ("héng jiǔ", "lasting a long time"),
    "撤回": ("chè huí", "to take back"),
    "虐待": ("nüè dài", "to treat cruelly"),
    "撵出": ("niǎn chū", "to drive out"),
    "致辱": ("zhì rǔ", "to bring disgrace"),
    "管辖": ("guǎn xiá", "to be in charge of"),
    "相宜": ("xiāng yí", "fitting; suitable"),
    "止息": ("zhǐ xī", "to stop; to bring to an end"),
    "争闹": ("zhēng nào", "a noisy quarrel"),
    "顺利": ("shùn lì", "going smoothly"),
    "涌流": ("yǒng liú", "flowing out strongly"),
    "显露": ("xiǎn lù", "to show; to reveal"),
    "忍耐": ("rěn nài", "to put up with; to endure"),
    "逃脱": ("táo tuō", "to get away"),
    "爱惜": ("ài xī", "to treasure; to look after"),
    # — chapters 15–19 leftovers —
    "设筵": ("shè yán", "to lay on a feast"),
    "满屋": ("mǎn wū", "a houseful"),
    "干饼": ("gān bǐng", "a dry piece of bread"),
    "相安": ("xiāng ān", "at peace with each other"),
    "戏笑": ("xì xiào", "to laugh at; to make fun of"),
    "奉差": ("fèng chāi", "to be sent on an errand"),
    "传舌人": ("chuán shé rén", "a gossip"),
    "奔入": ("bēn rù", "to run into"),
    "强胜": ("qiáng shèng", "strong; powerful"),
    "时雨": ("shí yǔ", "rain that comes at just the right time"),
    "脸光": ("liǎn guāng", "a face that lights up"),
    "善发": ("shàn fā", "to use well; to bring out well"),
    "汲引": ("jí yǐn", "to draw out (like water from a well)"),
    # — chapters 20–24 —
    "浓酒": ("nóng jiǔ", "strong drink"),
    "错误": ("cuò wù", "to go wrong; a mistake"),
    "惹动": ("rě dòng", "to stir up; to provoke"),
    "冬寒": ("dōng hán", "winter cold"),
    "讨饭": ("tǎo fàn", "to beg for food"),
    "怀藏": ("huái cáng", "to keep hidden inside"),
    "述说": ("shù shuō", "to tell; to talk about"),
    "驱散": ("qū sàn", "to scatter; to drive away"),
    "洁净": ("jié jìng", "clean; pure"),
    "升斗": ("shēng dǒu", "measuring cups for grain"),
    "本性": ("běn xìng", "what someone is really like"),
    "贪睡": ("tān shuì", "to love sleeping too much"),
    "自夸": ("zì kuā", "to boast"),
    "贵重": ("guì zhòng", "valuable"),
    "虚谎": ("xū huǎng", "lies; cheating"),
    "尘沙": ("chén shā", "dust and grit"),
    "结交": ("jié jiāo", "to make friends with"),
    "咒骂": ("zhòu mà", "to curse at"),
    "漆黑": ("qī hēi", "pitch dark"),
    "冒失": ("mào shī", "carelessly; without thinking"),
    "圣物": ("shèng wù", "something promised to God"),
    "许愿": ("xǔ yuàn", "to make a promise to God"),
    "查问": ("chá wèn", "to ask questions about"),
    "簸散": ("bǒ sàn", "to sort out and scatter (like winnowing grain)"),
    "碌碡": ("liù zhou", "a stone roller for threshing grain"),
    "滚轧": ("gǔn yà", "to roll over"),
    "强壮": ("qiáng zhuàng", "strong"),
    "鞭伤": ("biān shāng", "the mark left by a beating"),
    "陇沟": ("lǒng gōu", "a channel dug for water"),
    "流转": ("liú zhuǎn", "to flow this way and that"),
    "悦纳": ("yuè nà", "to accept gladly"),
    "发达": ("fā dá", "to do well; to prosper"),
    "筹划": ("chóu huà", "to plan carefully"),
    "急躁": ("jí zào", "rushing; impatient"),
    "浮云": ("fú yún", "a drifting cloud (something that does not last)"),
    "扫除": ("sǎo chú", "to sweep away"),
    "负罪": ("fù zuì", "guilty"),
    "怜恤": ("lián xù", "to show pity"),
    "塞耳": ("sāi ěr", "to block your ears"),
    "呼吁": ("hū yù", "to call out for help"),
    "挽回": ("wǎn huí", "to turn back; to calm down"),
    "秉公": ("bǐng gōng", "to act fairly"),
    "迷离": ("mí lí", "to wander off"),
    "膏油": ("gāo yóu", "oil (a sign of comfort and riches)"),
    "坚垒": ("jiān lěi", "a strong fort"),
    "贪得无厌": ("tān dé wú yàn", "never satisfied; always wanting more"),
    "施舍": ("shī shě", "to give to those in need"),
    "祭物": ("jì wù", "an offering brought to God"),
    "恶意": ("è yì", "a bad intention"),
    "真情": ("zhēn qíng", "the true facts"),
    "长存": ("cháng cún", "to last a long time"),
    "敌挡": ("dí dǎng", "to stand against"),
    "得胜": ("dé shèng", "to win"),
    "美名": ("měi míng", "a good name; a good reputation"),
    "恩宠": ("ēn chǒng", "being well liked and favoured"),
    "藏躲": ("cáng duǒ", "to hide"),
    "赏赐": ("shǎng cì", "a reward"),
    "欠债": ("qiàn zhài", "to owe money"),
    "债主": ("zhài zhǔ", "the person you owe money to"),
    "逞怒": ("chěng nù", "to let anger loose"),
    "废掉": ("fèi diào", "to be broken; to be done away with"),
    "慈善": ("cí shàn", "kind and generous"),
    "消除": ("xiāo chú", "to get rid of"),
    "清心": ("qīng xīn", "a pure heart"),
    "恩言": ("ēn yán", "kind words"),
    "眷顾": ("juàn gù", "to watch over with care"),
    "深坑": ("shēn kēng", "a deep pit"),
    "迷住": ("mí zhù", "to be stuck fast in"),
    "赶除": ("gǎn chú", "to drive out"),
    "利己": ("lì jǐ", "to benefit yourself"),
    "领会": ("lǐng huì", "to take in; to understand"),
    "咬定": ("yǎo dìng", "to hold firmly (in your speech)"),
    "特特": ("tè tè", "specially"),
    "指教": ("zhǐ jiào", "to teach; to show how"),
    "实理": ("shí lǐ", "what is really true"),
    "回复": ("huí fù", "to reply"),
    "抢夺": ("qiǎng duó", "to snatch away"),
    "辨屈": ("biàn qū", "to speak up for someone treated unfairly"),
    "夺取": ("duó qǔ", "to take by force"),
    "效法": ("xiào fǎ", "to copy someone's ways"),
    "先祖": ("xiān zǔ", "ancestors"),
    "下贱": ("xià jiàn", "low; of no importance"),
    "坐席": ("zuò xí", "to sit down at a meal"),
    "留意": ("liú yì", "to pay attention"),
    "贪食": ("tān shí", "greedy for food"),
    "喉咙": ("hóu lóng", "the throat"),
    "哄人": ("hǒng rén", "meant to fool you"),
    "定睛": ("dìng jīng", "to stare fixedly"),
    "虚无": ("xū wú", "empty; not really there"),
    "翅膀": ("chì bǎng", "wings"),
    "恶眼": ("è yǎn", "a stingy, grudging eye"),
    "美味": ("měi wèi", "tasty food"),
    "相背": ("xiāng bèi", "turned away from you"),
    "甘美": ("gān měi", "sweet and pleasant"),
    "落空": ("luò kōng", "to come to nothing"),
    "侵入": ("qīn rù", "to move in on"),
    "孤儿": ("gū ér", "a child with no parents"),
    "救赎主": ("jiù shú zhǔ", "the one who buys someone back and protects them"),
    "灵魂": ("líng hún", "the soul; a person's life"),
    "心肠": ("xīn cháng", "deep inside; how someone feels"),
    "断绝": ("duàn jué", "to be cut off"),
    "正道": ("zhèng dào", "the right road"),
    "破烂": ("pò làn", "ragged; worn out"),
    "窄阱": ("zhǎi jǐng", "a narrow pit you cannot climb out of"),
    "争斗": ("zhēng dòu", "fighting"),
    "哀叹": ("āi tàn", "complaining and sighing"),
    "红赤": ("hóng chì", "red"),
    "流连": ("liú lián", "to linger; to stay too long"),
    "调和": ("tiáo hé", "mixed together"),
    "闪烁": ("shǎn shuò", "to sparkle"),
    "下咽": ("xià yàn", "to go down the throat"),
    "舒畅": ("shū chàng", "smooth and pleasant"),
    "毒蛇": ("dú shé", "a poisonous snake"),
    "异怪": ("yì guài", "strange things"),
    "桅杆": ("wéi gān", "the mast of a ship"),
    "清醒": ("qīng xǐng", "to wake up; to be clear-headed"),
    "起意": ("qǐ yì", "to take a liking to the idea"),
    "谈论": ("tán lùn", "to talk about"),
    "奸人": ("jiān rén", "a scheming troublemaker"),
    "胆怯": ("dǎn qiè", "to lose courage"),
    "微小": ("wēi xiǎo", "very small"),
    "解救": ("jiě jiù", "to rescue"),
    "拦阻": ("lán zǔ", "to hold back; to stop"),
    "毁坏": ("huǐ huài", "to wreck"),
    "安居": ("ān jū", "to live safely"),
    "兴起": ("xīng qǐ", "to get up again"),
    "反复无常": ("fǎn fù wú cháng", "always changing; not to be relied on"),
    "万民": ("wàn mín", "all the people"),
    "列邦": ("liè bāng", "all the nations"),
    "工料": ("gōng liào", "materials for the work"),
    "整齐": ("zhěng qí", "in good order"),
    "欺骗": ("qī piàn", "to trick; to cheat"),
    "报复": ("bào fù", "to pay someone back"),
    "葡萄园": ("pú táo yuán", "a vineyard"),
    "地皮": ("dì pí", "the ground"),
    "刺草": ("cì cǎo", "prickly weeds"),
    "石墙": ("shí qiáng", "a stone wall"),
    "坍塌": ("tān tā", "to fall down"),
    "兵器": ("bīng qì", "weapons"),
    "强盗": ("qiáng dào", "a robber"),
    # — chapters 20–24 leftovers —
    "深水": ("shēn shuǐ", "deep water"),
    "诸恶": ("zhū è", "every kind of evil"),
    "脱净": ("tuō jìng", "to be completely free of"),
    "买物": ("mǎi wù", "to buy something"),
    "自陷": ("zì xiàn", "to trap yourself"),
    "立稳": ("lì wěn", "to stand firm"),
    "取死": ("qǔ sǐ", "to bring death on yourself"),
    "受祸": ("shòu huò", "to come to harm"),
    "大财": ("dà cái", "great riches"),
    "听受": ("tīng shòu", "to listen and take in"),
    "休仗": ("xiū zhàng", "stop relying on"),
    "那点": ("nà diǎn", "that little bit"),
    "加力": ("jiā lì", "to grow stronger"),
    "极高": ("jí gāo", "very high up"),
    "下滴": ("xià dī", "dripping down"),
    "七次": ("qī cì", "seven times"),
    "田面": ("tián miàn", "the surface of the field"),
    # — chapters 25–28 —
    "誊录": ("téng lù", "to copy out"),
    "隐秘": ("yǐn mì", "to keep hidden"),
    "察清": ("chá qīng", "to search out and make clear"),
    "测不透": ("cè bu tòu", "too deep to work out"),
    "渣滓": ("zhā zǐ", "the bits left over; waste"),
    "银匠": ("yín jiàng", "a silversmith"),
    "器皿": ("qì mǐn", "a bowl or dish"),
    "妄自尊大": ("wàng zì zūn dà", "to push yourself forward; to act important"),
    "觐见": ("jìn jiàn", "to be brought before a king"),
    "退下": ("tuì xià", "to be moved down; to step back"),
    "争讼": ("zhēng sòng", "to take someone to court"),
    "辩论": ("biàn lùn", "to argue a case"),
    "合宜": ("hé yí", "fitting; just right"),
    "苹果": ("píng guǒ", "an apple"),
    "网子": ("wǎng zi", "a woven basket or setting"),
    "耳环": ("ěr huán", "an earring"),
    "妆饰": ("zhuāng shì", "a lovely ornament"),
    "冰雪": ("bīng xuě", "ice and snow"),
    "凉气": ("liáng qì", "coolness"),
    "空夸": ("kōng kuā", "to boast about nothing"),
    "赠送": ("zèng sòng", "to give as a present"),
    "恒常": ("héng cháng", "steady; keeping on"),
    "劝动": ("quàn dòng", "to win someone over"),
    "折断": ("zhé duàn", "to break"),
    "呕吐": ("ǒu tù", "to be sick"),
    "厌烦": ("yàn fán", "to get tired of"),
    "大槌": ("dà chuí", "a heavy hammer"),
    "利刀": ("lì dāo", "a sharp knife"),
    "快箭": ("kuài jiàn", "a swift arrow"),
    "忠诚": ("zhōng chéng", "loyal and true"),
    "骨缝": ("gǔ fèng", "a joint in the bone"),
    "炭火": ("tàn huǒ", "burning coals"),
    "怒容": ("nù róng", "an angry face"),
    "退缩": ("tuì suō", "to give way; to back down"),
    "考究": ("kǎo jiū", "to go looking for"),
    "制伏": ("zhì fú", "to keep under control"),
    "城邑": ("chéng yì", "a town"),
    "墙垣": ("qiáng yuán", "a city wall"),
    "麻雀": ("má què", "a sparrow"),
    "燕子": ("yàn zi", "a swallow"),
    "翻飞": ("fān fēi", "to dart about in the air"),
    "鞭子": ("biān zi", "a whip"),
    "辔头": ("pèi tóu", "a bridle for a horse"),
    "勒驴": ("lè lǘ", "to rein in a donkey"),
    "瘸子": ("qué zi", "someone who cannot walk properly"),
    "空存": ("kōng cún", "hanging useless"),
    "石子": ("shí zǐ", "a small stone"),
    "机弦": ("jī xián", "a sling (for throwing stones)"),
    "醉汉": ("zuì hàn", "a drunk person"),
    "弓箭手": ("gōng jiàn shǒu", "an archer"),
    "枢纽": ("shū niǔ", "a hinge"),
    "劳乏": ("láo fá", "too much trouble; tiring"),
    "善于": ("shàn yú", "good at"),
    "激动": ("jī dòng", "to be stirred up"),
    "揪住": ("jiū zhù", "to grab hold of"),
    "欺凌": ("qī líng", "to bully"),
    "疯狂": ("fēng kuáng", "mad; wild"),
    "抛掷": ("pāo zhì", "to throw about"),
    "火把": ("huǒ bǎ", "a burning torch"),
    "利箭": ("lì jiàn", "a sharp arrow"),
    "煽惑": ("shān huò", "to stir up trouble"),
    "余火": ("yú huǒ", "coals still glowing"),
    "银渣": ("yín zhā", "the waste left from silver"),
    "瓦器": ("wǎ qì", "a clay pot"),
    "粉饰": ("fěn shì", "to cover over; to make look nice"),
    "甜言蜜语": ("tián yán mì yǔ", "sweet talk meant to win you over"),
    "陷坑": ("xiàn kēng", "a pit dug as a trap"),
    "压伤": ("yā shāng", "to crush and hurt"),
    "夸奖": ("kuā jiǎng", "to praise"),
    "沙土": ("shā tǔ", "sand"),
    "狂澜": ("kuáng lán", "a raging flood"),
    "伤痕": ("shāng hén", "a wound"),
    "多余": ("duō yú", "not to be trusted; more than is meant"),
    "苦物": ("kǔ wù", "something bitter"),
    "本处": ("běn chù", "the place where one belongs"),
    "飘流": ("piāo liú", "to wander"),
    "离窝": ("lí wō", "to leave the nest"),
    "游飞": ("yóu fēi", "to fly about"),
    "香料": ("xiāng liào", "sweet-smelling spices"),
    "遭难": ("zāo nàn", "to meet with trouble"),
    "相近": ("xiāng jìn", "near by"),
    "清晨": ("qīng chén", "early morning"),
    "抓油": ("zhuā yóu", "to grab oil (it slips away)"),
    "无花果": ("wú huā guǒ", "a fig"),
    "敬奉": ("jìng fèng", "to serve faithfully"),
    "相符": ("xiāng fú", "to match; to be the same"),
    "满足": ("mǎn zú", "satisfied; having enough"),
    "试炼": ("shì liàn", "to test"),
    "打碎": ("dǎ suì", "to smash up"),
    "麦子": ("mài zi", "wheat"),
    "详细": ("xiáng xì", "in full detail"),
    "羊群": ("yáng qún", "a flock of sheep"),
    "景况": ("jǐng kuàng", "how things are"),
    "料理": ("liào lǐ", "to look after"),
    "牛群": ("niú qún", "a herd of cattle"),
    "万代": ("wàn dài", "for ever; for all generations"),
    "干草": ("gān cǎo", "dry grass; hay"),
    "嫩草": ("nèn cǎo", "young green grass"),
    "菜蔬": ("cài shū", "plants that can be eaten"),
    "收敛": ("shōu liǎn", "to be gathered in"),
    "羊羔": ("yáng gāo", "a lamb"),
    "山羊": ("shān yáng", "a goat"),
    "家眷": ("jiā juàn", "the people of your household"),
    "婢女": ("bì nǚ", "a servant girl"),
    "追赶": ("zhuī gǎn", "to chase"),
    "逃跑": ("táo pǎo", "to run away"),
    "胆壮": ("dǎn zhuàng", "brave; bold"),
    "罪过": ("zuì guò", "wrongdoing"),
    "更换": ("gēng huàn", "to be changed one after another"),
    "长存": ("cháng cún", "to last a long time"),
    "贫民": ("pín mín", "poor people"),
    "暴雨": ("bào yǔ", "a heavy rainstorm"),
    "冲没": ("chōng mò", "to wash away"),
    "律法": ("lǜ fǎ", "the law; God's rules"),
    "厚利": ("hòu lì", "charging too much interest"),
    "转耳": ("zhuǎn ěr", "to turn your ear away"),
    "福分": ("fú fèn", "a good share; blessing"),
    "查透": ("chá tòu", "to see right through"),
    "得志": ("dé zhì", "to do well; to succeed"),
    "躲藏": ("duǒ cáng", "to hide"),
    "亨通": ("hēng tōng", "to go well"),
    "承认": ("chéng rèn", "to admit"),
    "刚硬": ("gāng yìng", "hard; stubborn"),
    "暴虐": ("bào nüè", "cruel"),
    "辖制": ("xiá zhì", "to rule harshly over"),
    "觅食": ("mì shí", "hunting for food"),
    "贪财": ("tān cái", "greedy for money"),
    "枉法": ("wǎng fǎ", "to break the law"),
    "同类": ("tóng lèi", "the same kind"),
    "贪婪": ("tān lán", "greedy"),
    "自是": ("zì shì", "sure you are right"),
    "急速": ("jí sù", "in a great hurry"),
    # — chapters 29–31 —
    "责罚": ("zé fá", "to be told off and punished"),
    "颈项": ("jǐng xiàng", "the neck"),
    "掌权": ("zhǎng quán", "to be in charge"),
    "叹息": ("tàn xī", "to sigh; to groan"),
    "索要": ("suǒ yào", "to demand"),
    "查明": ("chá míng", "to find out the truth of"),
    "通城": ("tōng chéng", "the whole city"),
    "众怒": ("zhòng nù", "everyone's anger"),
    "索取": ("suǒ qǔ", "to try to take"),
    "臣仆": ("chén pú", "the officials who serve a ruler"),
    "光照": ("guāng zhào", "to give light to"),
    "放纵": ("fàng zòng", "left to do whatever he likes"),
    "羞愧": ("xiū kuì", "ashamed"),
    "安息": ("ān xī", "rest; peace"),
    "异象": ("yì xiàng", "a vision; what God shows people"),
    "放肆": ("fàng sì", "to run wild"),
    "娇养": ("jiāo yǎng", "to spoil; to pamper"),
    "卑下": ("bēi xià", "brought low"),
    "盗贼": ("dào zéi", "a thief"),
    "分赃": ("fēn zāng", "to share out stolen things"),
    "发誓": ("fā shì", "to swear an oath"),
    "为非作歹": ("wéi fēi zuò dǎi", "to do wrong again and again"),
    "憎嫌": ("zēng xián", "to find hateful"),
    "蠢笨": ("chǔn bèn", "stupid"),
    "掌握": ("zhǎng wò", "to hold in your hands"),
    "四极": ("sì jí", "the four far ends of the earth"),
    "炼净": ("liàn jìng", "made pure by fire"),
    "投靠": ("tóu kào", "to turn to for safety"),
    "盾牌": ("dùn pái", "a shield"),
    "加添": ("jiā tiān", "to add to"),
    "虚假": ("xū jiǎ", "false; not true"),
    "饮食": ("yǐn shí", "food and drink"),
    "亵渎": ("xiè dú", "to treat something holy with no respect"),
    "一宗": ("yī zōng", "one kind of people"),
    "污秽": ("wū huì", "dirt; filth"),
    "吞灭": ("tūn miè", "to swallow up"),
    "蚂蟥": ("mǎ huáng", "a leech"),
    "石胎": ("shí tāi", "a womb that has no child"),
    "乌鸦": ("wū yā", "a crow"),
    "鹰雏": ("yīng chú", "a young eagle"),
    "奇妙": ("qí miào", "wonderful; amazing"),
    "磐石": ("pán shí", "a big rock"),
    "交合": ("jiāo hé", "coming together (as husband and wife)"),
    "震动": ("zhèn dòng", "to shake"),
    "丑恶": ("chǒu è", "hateful; ugly in character"),
    "出嫁": ("chū jià", "to get married (of a woman)"),
    "接续": ("jiē xù", "to take over from"),
    "主母": ("zhǔ mǔ", "the lady of the house"),
    "小物": ("xiǎo wù", "small creatures"),
    "沙番": ("shā fān", "a rock badger (a small animal that lives in cliffs)"),
    "软弱": ("ruǎn ruò", "weak"),
    "蝗虫": ("huáng chóng", "a locust"),
    "分队": ("fēn duì", "in groups; in ranks"),
    "守宫": ("shǒu gōng", "a lizard"),
    "王宫": ("wáng gōng", "a king's palace"),
    "威武": ("wēi wǔ", "grand; impressive"),
    "百兽": ("bǎi shòu", "all the animals"),
    "猛烈": ("měng liè", "fierce"),
    "躲避": ("duǒ bì", "to turn aside; to get out of the way"),
    "猎狗": ("liè gǒu", "a hunting dog"),
    "自高自傲": ("zì gāo zì ào", "full of yourself"),
    "恶念": ("è niàn", "a bad thought"),
    "捂口": ("wǔ kǒu", "to put your hand over your mouth"),
    "牛奶": ("niú nǎi", "milk"),
    "奶油": ("nǎi yóu", "butter"),
    "鼻子": ("bí zi", "a nose"),
    "精力": ("jīng lì", "strength; energy"),
    "律例": ("lǜ lì", "the rules; the law"),
    "将亡": ("jiāng wáng", "about to die"),
    "清酒": ("qīng jiǔ", "wine"),
    "苦心": ("kǔ xīn", "a heavy heart"),
    "哑巴": ("yǎ ba", "someone who cannot speak"),
    "孤独": ("gū dú", "alone with nobody to help"),
    "伸冤": ("shēn yuān", "to stand up for someone treated unfairly"),
    "价值": ("jià zhí", "worth; value"),
    "羊绒": ("yáng róng", "wool"),
    "商船": ("shāng chuán", "a trading ship"),
    "黎明": ("lí míng", "daybreak"),
    "分派": ("fēn pài", "to give out the work"),
    "栽种": ("zāi zhòng", "to plant"),
    "束腰": ("shù yāo", "to tie up your clothes ready for work"),
    "膀臂": ("bǎng bì", "arms"),
    "捻线竿": ("niǎn xiàn gān", "a stick for spinning thread"),
    "纺线车": ("fǎng xiàn chē", "a spindle for making thread"),
    "周济": ("zhōu jì", "to help someone in need"),
    "帮补": ("bāng bǔ", "to help out"),
    "朱红": ("zhū hóng", "bright red"),
    "绣花": ("xiù huā", "embroidered"),
    "细麻": ("xì má", "fine linen cloth"),
    "紫色": ("zǐ sè", "purple"),
    "长老": ("zhǎng lǎo", "the older leaders of a town"),
    "衣裳": ("yī shang", "clothes"),
    "腰带": ("yāo dài", "a belt"),
    "商家": ("shāng jiā", "a trader"),
    "威仪": ("wēi yí", "dignity"),
    "喜笑": ("xǐ xiào", "to laugh happily"),
    "家务": ("jiā wù", "the work of the household"),
    "闲饭": ("xián fàn", "food you did not work for"),
    "称赞": ("chēng zàn", "to praise"),
    "艳丽": ("yàn lì", "good-looking"),
    "美容": ("měi róng", "beauty"),
    "妇女": ("fù nǚ", "a woman"),
    "操作": ("cāo zuò", "the work done with your hands"),
    # grammar words, same style as the zonghe list
    "的": ("de", "'s / of (joins a describing word to a noun)"),
    "了": ("le", "(action done / something changed)"),
    "必": ("bì", "surely will"),
    "乃": ("nǎi", "is; truly is (old word)"),
    "惟": ("wéi", "only; but"),
    "其": ("qí", "his; her; its"),
    "之": ("zhī", "'s; of (old word)"),
}

# jieba splits that are wrong for this text. 箴言 leans on 必/我/这/自 + verb,
# which jieba happily glues into "words" that no dictionary knows, so the
# gloss falls through to "必 surely will + 杀 to kill". Split them instead.
DEL_WORDS = [
    "王大卫", "使人", "人必",
    "必吃", "必杀", "必呼求", "必害己", "自害己", "我要", "我必", "这要",
    "反轻弃", "当因", "设在", "吞下", "下坑", "自流", "夺去", "得享",
    "自流己", "乃夺", "恳切地",
    "王簸", "恶报恶", "随吞下", "向天飞", "岂不知", "初速", "主大有",
    "转过", "看着", "写给", "常去", "若存", "请吃", "放在", "来献",
    "国位", "好酒", "马是", "更蒙", "吹来吹去", "拿刀", "如鹰", "飞去",
    "如蛇", "寻酒", "躺卧", "速来", "坐在", "如刀", "如杖", "如水",
]

SKIP_GLOSS = ("CL:", "variant of", "see ", "also written", "old variant", "used in", "abbr. for", "surname ")

# 箴言 is terse and semi-classical, so jieba constantly glues a grammar word
# onto its neighbour: 必如, 人必得, 之财, 使义, 口必. None of those are words,
# no dictionary has them, and they used to fall through to character-by-
# character composition ("必 surely will + 如 as"). Rather than list every one
# in DEL_WORDS, peel these off any token no dictionary knows — it generalises
# to the chapters nobody has inspected by hand.
# 箴言 also counts constantly ("有三样…共有四样", 七倍, 两个) and stacks 之
# between nouns (天之高, 地之厚, 血之罪), which jieba glues the same way.
PEEL_HEAD = (
    "必我这你他她其之所乃就要能可有无不多同当因以为使人义"
    "手口心舌致合用求谋作民吐反只且便"
    "一两三四五六七八九十百千"
)
PEEL_TAIL = (
    "必我这你他她其之所乃就要能可有无不多同当因以为得中里上下人义"
    "手口心舌致合用求谋作民吐"
    "样个倍件宗次高厚"
)


def peel(token: str, known) -> list[str]:
    """Split a glued token into the pieces a dictionary actually knows."""
    out: list[str] = []
    while len(token) > 1 and not known(token):
        if token[0] in PEEL_HEAD:
            out.append(token[0])
            token = token[1:]
            continue
        if token[-1] in PEEL_TAIL and known(token[:-1]):
            out.append(token[:-1])
            token = token[-1]
            continue
        break
    out.append(token)
    return [t for t in out if t]


def ensure_cedict() -> None:
    if CEDICT.exists():
        return
    CEDICT.parent.mkdir(parents=True, exist_ok=True)
    print("downloading CC-CEDICT …", file=sys.stderr)
    urllib.request.urlretrieve(CEDICT_URL, CEDICT)


def load_cedict() -> dict[str, list[tuple[str, list[str]]]]:
    ensure_cedict()
    d: dict[str, list[tuple[str, list[str]]]] = {}
    pat = re.compile(r"^(\S+) (\S+) \[([^\]]+)\] /(.+)/$")
    with gzip.open(CEDICT, "rt", encoding="utf-8") as f:
        for line in f:
            if line.startswith("#"):
                continue
            m = pat.match(line.strip())
            if not m:
                continue
            _trad, simp, py, glosses = m.groups()
            d.setdefault(simp, []).append((py.lower(), glosses.split("/")))
    return d


def norm_py(s: str) -> str:
    return s.lower().replace("u:", "ü").replace("v", "ü")


def marks(py_numbers: str) -> str:
    out = []
    for syl in py_numbers.split():
        syl = syl.replace("u:", "ü")
        if syl[-1:].isdigit():
            syl = syl[:-1] if syl[-1] == "5" else to_tone(syl)
        out.append(syl)
    return " ".join(out)


def pinyin_of(word: str) -> str:
    return " ".join(lazy_pinyin(word, style=Style.TONE))


def pinyin_numbers(word: str) -> str:
    return " ".join(lazy_pinyin(word, style=Style.TONE3, neutral_tone_with_five=True))


def clean_glosses(glosses: list[str]) -> str:
    keep = []
    for g in glosses:
        g = g.strip()
        if not g or g.startswith(SKIP_GLOSS) or g.startswith("fig."):
            continue
        g = re.sub(r"\s*\(.*?idiom.*?\)", "", g)
        g = re.sub(r"\s*\((?:in|of|e\.g\.|esp\.|lit\.)[^)]*\)", "", g)
        keep.append(g)
        if len(keep) == 3:
            break
    s = "; ".join(keep)
    return s if len(s) <= 72 else s[:72].rsplit(";", 1)[0]


class Dict:
    def __init__(self, cedict):
        self.cedict = cedict
        self.out: dict[str, dict[str, str]] = {}
        self.missing: list[str] = []

    def lookup(self, word: str) -> tuple[str, str] | None:
        if word in OVERRIDES:
            return OVERRIDES[word]
        entries = self.cedict.get(word)
        if not entries:
            return None
        want = norm_py(pinyin_numbers(word))
        chosen = next((e for e in entries if norm_py(e[0]) == want), None)
        if chosen is None or not clean_glosses(chosen[1]):
            chosen = next((e for e in entries if clean_glosses(e[1])), entries[0])
        return marks(chosen[0]), clean_glosses(chosen[1])

    def first_sense(self, part: str) -> str:
        hit = self.lookup(part)
        sense = (hit[1] if hit else "").split(";")[0].strip()
        return re.sub(r"\s*\([^)]*\)", "", sense).strip()

    def compose(self, word: str) -> tuple[str, str]:
        """No dictionary knows this word: gloss it character by character."""
        pys = [pinyin_of(c) for c in word]
        ens = [f"{c} {self.first_sense(c)}".strip() for c in word]
        return " ".join(pys), " + ".join(ens)

    def add(self, word: str) -> None:
        if word in self.out:
            return
        hit = self.lookup(word)
        if hit is None:
            if len(word) > 1:
                self.missing.append(word)
                hit = self.compose(word)
            else:
                hit = (pinyin_of(word), "")
        self.out[word] = {"py": hit[0], "en": hit[1]}


def main() -> None:
    want = [int(a) for a in sys.argv[1:]] or list(range(1, 32))
    for w in EXTRA_WORDS:
        jieba.add_word(w)
    for w in DEL_WORDS:
        jieba.del_word(w)

    cedict = load_cedict()
    for ch in want:
        f = DATA / f"proverbs_{ch}.json"
        if not f.exists():
            print(f"  ch {ch}: no {f.name}, skipping", file=sys.stderr)
            continue
        data = json.loads(f.read_text(encoding="utf-8"))
        d = Dict(cedict)
        seg: dict[str, list[str]] = {}
        known = lambda w: w in OVERRIDES or w in cedict  # noqa: E731
        for v in data["verses"]:
            text = v["zh"].strip()
            tokens: list[str] = []
            for t in jieba.lcut(text):
                if not t:
                    continue
                tokens.extend(peel(t, known) if HAN.search(t) else [t])
            seg[text] = tokens
            for t in tokens:
                if HAN.search(t):
                    d.add(t)
        # a multi-character word is itself segmentable, so the sheet can list its parts
        for word in list(d.out):
            if len(word) > 1 and word not in seg:
                parts = [t for t in jieba.lcut(word) if t]
                if len(parts) > 1:
                    seg[word] = parts
                    for p in parts:
                        if HAN.search(p):
                            d.add(p)
        out = DATA / f"proverbs_{ch}_words.json"
        out.write_text(
            json.dumps({"seg": seg, "dict": d.out}, ensure_ascii=False, indent=0),
            encoding="utf-8",
        )
        print(f"  ch {ch:2d}: {len(seg)} texts, {len(d.out)} words"
              + (f", {len(d.missing)} composed: {' '.join(d.missing[:12])}" if d.missing else ""))


if __name__ == "__main__":
    main()
