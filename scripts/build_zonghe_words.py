#!/usr/bin/env python3
"""
Make every word on /zonghe/<week> tappable: segment each text the page shows
into words (jieba) and build a dictionary (pinyin + English) for every word.

Writes public/data/p3hcl/zonghe_<week>_words.json:
    { "seg":  { "<exact text>": ["我认为", "在", "鞋店", "里", …] },
      "dict": { "鞋店": { "py": "xié diàn", "en": "shoe shop" }, … } }

Meanings come, in this order, from: the OVERRIDES below, the glosses already
written in the week's JSON (oral vocab) and words_w34_w40.json, CC-CEDICT
(CC BY-SA 4.0, https://www.mdbg.net/chinese/dictionary?page=cedict), and
finally a word composed from its characters ("鞋 shoe + 店 shop").

Usage (needs jieba + pypinyin; CC-CEDICT is downloaded on first run):
    ~/.local/share/mise/installs/python/3.14.6/bin/python scripts/build_zonghe_words.py
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
DATA = ROOT / "public" / "data" / "p3hcl"
CEDICT = Path.home() / ".cache" / "tingxie" / "cedict.txt.gz"
CEDICT_URL = "https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.txt.gz"

HAN = re.compile(r"[一-鿿]")
MARK = re.compile(r"【\d+】")

# Words jieba tends to split, plus names, kept whole.
EXTRA_WORDS = [
    "我认为", "公德心", "鞋店", "冰淇淋", "蚊虫", "池塘", "树荫", "国际象棋", "课外活动",
    "言行举止", "思维能力", "专注力", "不分上下", "一次又一次", "满头大汗", "乐于助人",
    "后果不堪设想", "不堪设想", "津津有味", "物归原主", "占为己有", "助人为快乐之本",
    "伸出援助之手", "乐开了花", "拼命地", "绑着", "马尾", "环境卫生", "公共场所",
    "公共规则", "清洁工人", "乱涂乱画", "一时的", "点了点头", "乖乖地", "好宝宝",
    "乐乐", "小文", "小华", "小明", "小安", "小胖", "康康", "欢欢", "耶恩", "老爷爷",
    "级任老师", "胡姬花园", "富士山", "黄老师", "林老师", "青青小学", "天天旅行社",
]

# Simple P3-level glosses; these win over CC-CEDICT.
OVERRIDES = {
    "的": ("de", "'s / of (joins a describing word to a noun)"),
    "了": ("le", "(action done / something changed)"),
    "地": ("de", "-ly (joins a describing word to an action)"),
    "得": ("de", "(so … that; how well something is done)"),
    "着": ("zhe", "-ing (action going on)"),
    "吗": ("ma", "? (question word)"),
    "吧": ("ba", "(suggestion: let's …)"),
    "啦": ("la", "(exclamation)"),
    "啊": ("a", "(exclamation)"),
    "呢": ("ne", "(question / and what about …)"),
    "把": ("bǎ", "(take … and …)"),
    "被": ("bèi", "by (something was done to …)"),
    "我认为": ("wǒ rèn wéi", "I think that …"),
    "乐乐": ("Lè le", "Lele (girl's name)"),
    "小文": ("Xiǎo wén", "Xiaowen (name)"),
    "小华": ("Xiǎo huá", "Xiaohua (name)"),
    "小明": ("Xiǎo míng", "Xiaoming (name)"),
    "小安": ("Xiǎo ān", "Xiao'an (name)"),
    "小胖": ("Xiǎo pàng", "Fatty (nickname)"),
    "康康": ("Kāng kang", "Kangkang (name)"),
    "欢欢": ("Huān huan", "Huanhuan (name)"),
    "耶恩": ("Yē ēn", "Ye'en (that's you!)"),
    "鞋店": ("xié diàn", "shoe shop"),
    "蚊虫": ("wén chóng", "mosquitoes and insects"),
    "言行举止": ("yán xíng jǔ zhǐ", "words and behaviour"),
    "思维能力": ("sī wéi néng lì", "thinking ability"),
    "专注力": ("zhuān zhù lì", "concentration"),
    "课外活动": ("kè wài huó dòng", "co-curricular activities"),
    "环境卫生": ("huán jìng wèi shēng", "environmental hygiene"),
    "公共规则": ("gōng gòng guī zé", "public rules"),
    "清洁工人": ("qīng jié gōng rén", "cleaners"),
    "乱涂乱画": ("luàn tú luàn huà", "to scribble and doodle"),
    "一时的": ("yī shí de", "a moment's"),
    "乐开了花": ("lè kāi le huā", "overjoyed (heart blooming with joy)"),
    "老爷爷": ("lǎo yé ye", "old man (grandpa)"),
    "级任老师": ("jí rèn lǎo shī", "form teacher"),
    "胡姬花园": ("hú jī huā yuán", "Orchid Garden"),
    "拼命地": ("pīn mìng de", "with all one's might"),
    "点了点头": ("diǎn le diǎn tóu", "nodded"),
    "乖乖地": ("guāi guāi de", "obediently"),
    "好宝宝": ("hǎo bǎo bao", "good child"),
    "绑着": ("bǎng zhe", "tied (wearing)"),
    "马尾": ("mǎ wěi", "ponytail"),
    "一次又一次": ("yī cì yòu yī cì", "again and again"),
    "满头大汗": ("mǎn tóu dà hàn", "head dripping with sweat"),
    "不堪设想": ("bù kān shè xiǎng", "too dreadful to imagine"),
    "后果不堪设想": ("hòu guǒ bù kān shè xiǎng", "the consequences would be unthinkable"),
    "不应该": ("bù yīng gāi", "should not"),
    "引来": ("yǐn lái", "to attract; to bring (something) along"),
    "捉鱼": ("zhuō yú", "to catch fish"),
    "伸进": ("shēn jìn", "to reach into"),
    "好主意": ("hǎo zhǔ yi", "good idea"),
    "各题": ("gè tí", "each question"),
    "一位": ("yī wèi", "one (person, polite)"),
    "四个": ("sì gè", "four"),
    "选出": ("xuǎn chū", "to pick out; to choose"),
    "用不到": ("yòng bu dào", "not needed; not used"),
    "跳到": ("tiào dào", "to jump to"),
    "小象": ("Xiǎo xiàng", "Little Elephant (name)"),
    "看图": ("kàn tú", "look at the picture"),
    "抹汗": ("mǒ hàn", "to wipe away sweat"),
    "先写": ("xiān xiě", "wrote first"),
    "后改成": ("hòu gǎi chéng", "then changed to"),
}

# jieba words that are wrong for this level of text (把手 = handle, but here 把 + 手).
DEL_WORDS = ["把手", "生病了", "拿了", "买了"]

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


def collect_glosses(week_json: dict, words_json: dict) -> dict[str, tuple[str, str]]:
    """Glosses already written by hand in the data files."""
    g: dict[str, tuple[str, str]] = {}
    for wk in words_json["weeks"]:
        for w in wk["words"]:
            g.setdefault(w["w"].replace("…", ""), (w["py"], w["en"]))
    for sec in week_json["sections"]:
        for it in sec.get("items", []):
            for v in it.get("vocab", []):
                g.setdefault(v["w"], (v["py"], v["en"]))
    return g


class Dict:
    def __init__(self, cedict, hand):
        self.cedict = cedict
        self.hand = hand
        self.out: dict[str, dict[str, str]] = {}

    def lookup(self, word: str) -> tuple[str, str] | None:
        if word in OVERRIDES:
            return OVERRIDES[word]
        if word in self.hand:
            return self.hand[word]
        entries = self.cedict.get(word)
        if not entries:
            return None
        want = norm_py(pinyin_numbers(word))
        chosen = next((e for e in entries if norm_py(e[0]) == want), None)
        # prefer an entry with a usable gloss
        if chosen is None or not clean_glosses(chosen[1]):
            chosen = next((e for e in entries if clean_glosses(e[1])), entries[0])
        return marks(chosen[0]), clean_glosses(chosen[1])

    def first_sense(self, part: str) -> str:
        hit = self.lookup(part)
        if hit is None and len(part) > 1:
            hit = self.compose_word(part)
        sense = (hit[1] if hit else "").split(";")[0].strip()
        return re.sub(r"\s*\([^)]*\)", "", sense).strip()

    def compose_word(self, word: str) -> tuple[str, str]:
        """A single word that no dictionary knows: gloss it character by character."""
        pys = [pinyin_of(c) for c in word]
        ens = [f"{c} {self.first_sense(c)}".strip() for c in word]
        return " ".join(pys), " + ".join(ens)

    def compose_phrase(self, phrase: str) -> tuple[str, str]:
        """A whole option / bank clause made of several words. Only a paired
        connector (因为……所以……) gets a gloss; the page lets her tap the words."""
        tokens = [t for t in jieba.lcut(phrase) if t.strip()]
        py = " ".join(
            pinyin_of(t) if HAN.search(t) else t.replace("……", "…") for t in tokens
        )
        en = ""
        if "……" in phrase:
            en = " ".join(
                self.first_sense(t) if HAN.search(t) else "…" for t in tokens if t.strip()
            )
        return py, en

    def add(self, word: str) -> None:
        if not HAN.search(word) or word in self.out:
            return
        hit = self.lookup(word)
        if hit is None:
            tokens = [t for t in jieba.lcut(word) if t.strip()]
            if len(word) == 1:
                hit = (pinyin_of(word), "")
            elif len(tokens) == 1:
                hit = self.compose_word(word)
            else:
                hit = self.compose_phrase(word)
        self.out[word] = {"py": hit[0], "en": hit[1]}


def fill(text: str, answer: str) -> str:
    """Same rule as the page: a paired connector like 因为……所以…… fills two blanks."""
    parts = [p for p in answer.split("……") if p] if "……" in answer else [answer]
    if len(parts) > 1 and text.count("____") >= len(parts):
        for p in parts:
            text = text.replace("____", p, 1)
        return text
    return text.replace("____", answer, 1)


def seg_plain(text: str) -> list[str]:
    return [t for t in jieba.lcut(text) if t != ""]


def seg_filled(text: str, answer: str) -> tuple[str, list[str]]:
    """Segment a blank-filled question so that token boundaries follow the answer."""
    parts = [p for p in answer.split("……") if p] if "……" in answer else [answer]
    if not (len(parts) > 1 and text.count("____") >= len(parts)):
        parts = [answer]
    pieces = text.split("____")
    tokens: list[str] = []
    filled = ""
    for i, piece in enumerate(pieces):
        if piece:
            tokens += seg_plain(piece)
            filled += piece
        if i < len(pieces) - 1:
            if i < len(parts):
                tokens.append(parts[i])
                filled += parts[i]
            else:
                tokens.append("____")
                filled += "____"
    return filled, tokens


def build(week_path: Path, words_json: dict, cedict) -> None:
    z = json.loads(week_path.read_text(encoding="utf-8"))
    hand = collect_glosses(z, words_json)
    d = Dict(cedict, hand)
    seg: dict[str, list[str]] = {}

    def add_text(t: str | None) -> None:
        if not t or not HAN.search(t):
            return
        t = t.strip()
        if t not in seg:
            seg[t] = seg_plain(t)
            for tok in seg[t]:
                d.add(tok)

    def add_unit(t: str | None) -> None:
        """A whole option / bank word / vocab: one dictionary entry, plus its tokens."""
        if not t or not HAN.search(t):
            return
        d.add(t.strip())
        add_text(t)

    # the 字词表 tab: every word and collocation is tappable too
    for wk in words_json["weeks"]:
        for w in wk["words"]:
            add_unit(w["w"].replace("…", ""))
            for c in (w.get("c") or "").split("/"):
                add_unit(c.strip())

    add_text(z.get("note"))
    for sec in z["sections"]:
        for k in ("title", "instruction", "imageCaption", "audioCaption"):
            add_text(sec.get(k))
        for p in sec.get("parts", []):
            add_text(p.get("label"))
        for g in sec.get("groups", []):
            add_text(g.get("label"))
            add_text(g.get("unused"))
            for line in g.get("passage", []):
                for piece in MARK.split(line):
                    add_text(piece)
            bank = g.get("bank") or []
            for w in bank:
                add_unit(w)
            for q in g.get("questions", []):
                opts = q.get("options") or bank
                for o in opts:
                    add_unit(o)
                ans = opts[q["answer"] - 1] if opts and q.get("answer") else ""
                text = q.get("text", "")
                if "____" in text and ans:
                    filled, toks = seg_filled(text, ans)
                    seg[filled] = toks
                    for tok in toks:
                        d.add(tok)
                else:
                    add_text(text)
                add_text(q.get("why"))
                add_text(q.get("model"))
        for it in sec.get("items", []):
            add_text(it.get("imageCaption"))
            for o in it.get("original", []):
                add_text(o)
            add_text(it.get("answer"))
            add_text(it.get("why"))
            for s in it.get("sentences", []):
                add_text(s["zh"])
            for v in it.get("vocab", []):
                add_unit(v["w"])

    out = DATA / f"{week_path.stem}_words.json"
    out.write_text(
        json.dumps({"seg": seg, "dict": d.out}, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    missing = [w for w, e in d.out.items() if not e["en"] and len(w) <= 4]
    print(f"{out.name}: {len(seg)} texts, {len(d.out)} words, {len(missing)} short words "
          f"without a gloss {missing[:12]}")


def main() -> None:
    jieba.setLogLevel(60)
    words_json = json.loads((DATA / "words_w34_w40.json").read_text(encoding="utf-8"))
    for wk in words_json["weeks"]:
        for w in wk["words"]:
            ww = w["w"].replace("…", "")
            if HAN.search(ww):
                jieba.add_word(ww)
            for c in (w.get("c") or "").split("/"):
                if HAN.search(c.strip()):
                    jieba.add_word(c.strip())
    for w in EXTRA_WORDS:
        jieba.add_word(w)
    for w in DEL_WORDS:
        jieba.del_word(w)
    weeks = sorted(DATA.glob("zonghe_*.json"))
    weeks = [p for p in weeks if not p.stem.endswith("_words")]
    cedict = load_cedict()
    for p in weeks:
        z = json.loads(p.read_text(encoding="utf-8"))
        for sec in z["sections"]:
            for g in sec.get("groups", []):
                for w in (g.get("bank") or []):
                    # short bank entries are words (贴在, 弄脏); long ones are clauses
                    if HAN.search(w) and "…" not in w and len(w) <= 4:
                        jieba.add_word(w)
                for q in g.get("questions", []):
                    for o in q.get("options") or []:
                        if HAN.search(o) and "…" not in o and len(o) <= 4:
                            jieba.add_word(o)
            for it in sec.get("items", []):
                for v in it.get("vocab", []):
                    jieba.add_word(v["w"])
    for p in weeks:
        build(p, words_json, cedict)


if __name__ == "__main__":
    main()
