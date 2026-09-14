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
]

SKIP_GLOSS = ("CL:", "variant of", "see ", "also written", "old variant", "used in", "abbr. for", "surname ")


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
        for v in data["verses"]:
            text = v["zh"].strip()
            tokens = [t for t in jieba.lcut(text) if t]
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
