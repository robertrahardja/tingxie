#!/usr/bin/env python3
"""
Make every word on /keben/<lesson> tappable, the same way
build_zonghe_words.py does it for /zonghe/<week>: segment each text the page
shows into words (jieba) and build a pinyin + English entry for every word.

Writes public/data/p3hcl/keben_<lesson>_words.json:
    { "seg":  { "<exact text>": ["他", "在", "地上", "挖", …] },
      "dict": { "挖": { "py": "wā", "en": "to dig" }, … } }

The dictionary machinery (CC-CEDICT, OVERRIDES, gloss cleaning) is imported
from build_zonghe_words.py so there is only one copy of it.

Usage:
    ~/.local/share/mise/installs/python/3.14.6/bin/python scripts/build_keben_words.py
"""

import json
import sys
from pathlib import Path

import jieba

sys.path.insert(0, str(Path(__file__).resolve().parent))

from build_zonghe_words import (  # noqa: E402
    DATA,
    HAN,
    Dict,
    load_cedict,
    seg_plain,
)

# Words jieba splits badly in this lesson, plus the names in the story.
EXTRA_WORDS = [
    "看漫画", "偷东西", "全身发抖", "吓了一跳", "钻进怀里", "冒出冷汗",
    "忍不住", "不以为然", "哈哈大笑", "小偷", "漫画", "发抖", "逃走",
    "哎呀", "简单", "冷汗", "怀里", "床单", "年级", "球拍", "拍球",
    "牙刷", "刷牙", "女儿", "儿女", "少年", "年少", "蜜蜂", "蜂蜜",
    "牛奶", "奶牛", "色彩", "彩色", "代替", "替代", "演讲", "讲演",
    "故事", "事故", "上马", "马上", "读字条", "字条", "青菜", "鸡鸭",
    "鱼虾", "官员", "欢乐伙伴", "伙伴", "丽丽", "明华", "课室",
    "听一听", "说一说", "读一读", "写一写", "学一学", "用一用",
    "转啊转", "追啊追", "跳啊跳", "飞啊飞", "方块", "童年", "舞台",
    "旅程", "列车", "乐园", "最高峰", "精彩", "陪伴", "耶恩",
]

# Hand-written glosses for this lesson; these win over CC-CEDICT.
OVERRIDES = {
    "丽丽": ("Lì li", "Lili (girl's name)"),
    "明华": ("Míng huá", "Minghua (boy's name)"),
    "耶恩": ("Yē ēn", "Ye'en (that's you!)"),
    "字条": ("zì tiáo", "a short written note"),
    "读字条": ("dú zì tiáo", "Reading the Note (title)"),
    "不以为然": ("bù yǐ wéi rán", "to not agree; to think it is not right"),
    "忍不住": ("rěn bú zhù", "cannot help doing something"),
    "哎呀": ("āi yā", "oh dear! (surprise)"),
    "哈哈": ("hā hā", "ha-ha (sound of laughing)"),
    "冒出冷汗": ("mào chū lěng hàn", "to break out in a cold sweat"),
    "钻进怀里": ("zuān jìn huái lǐ", "to burrow into someone's arms"),
    "吓了一跳": ("xià le yí tiào", "to be startled"),
    "全身发抖": ("quán shēn fā dǒu", "to tremble all over"),
    "看漫画": ("kàn màn huà", "to read comics"),
    "偷东西": ("tōu dōng xi", "to steal things"),
    "欢乐伙伴": ("huān lè huǒ bàn", "joyful companions"),
    "方块": ("fāng kuài", "a square (here: a Chinese character)"),
    "课室": ("kè shì", "classroom"),
    "鸡鸭": ("jī yā", "chicken and duck"),
    "鱼虾": ("yú xiā", "fish and prawns"),
    "青菜": ("qīng cài", "green vegetables"),
    "官员": ("guān yuán", "an official"),
    "球拍": ("qiú pāi", "a racket (bat for hitting a ball)"),
    "拍球": ("pāi qiú", "to bounce a ball"),
    "奶牛": ("nǎi niú", "a dairy cow"),
    "年少": ("nián shào", "young in age"),
    "最高峰": ("zuì gāo fēng", "the highest peak"),
    "转啊转": ("zhuàn a zhuàn", "turning and turning"),
    "追啊追": ("zhuī a zhuī", "chasing and chasing"),
    "跳啊跳": ("tiào a tiào", "jumping and jumping"),
    "飞啊飞": ("fēi a fēi", "flying and flying"),
    "蜜蜂": ("mì fēng", "a bee"),
    "蜂蜜": ("fēng mì", "honey"),
    "牛奶": ("niú nǎi", "milk"),
    "女儿": ("nǚ ér", "daughter"),
    "儿女": ("ér nǚ", "sons and daughters; children"),
    "少年": ("shào nián", "a teenager; a youngster"),
    "刷牙": ("shuā yá", "to brush one's teeth"),
    "牙刷": ("yá shuā", "a toothbrush"),
    # single characters this lesson tests; CC-CEDICT has no short gloss for them
    "忍": ("rěn", "to bear; to put up with"),
    "简": ("jiǎn", "simple (as in 简单)"),
    "单": ("dān", "single; a sheet (as in 床单)"),
    "级": ("jí", "grade; level (as in 年级)"),
}


def texts_of(k: dict):
    """Every Chinese string the page renders, in no particular order."""
    yield k.get("note")
    yield k.get("title")
    for w in k.get("revise", []):
        yield w["w"]
    for sec in k["sections"]:
        yield sec.get("title")
        yield sec.get("instruction")
        yield sec.get("gridNote")
        yield sec.get("orderNote")
        yield sec.get("resultNote")
        for it in sec.get("items", []):
            # pinyin / riddle / error / order / colour items
            for key in ("word", "clue", "answer", "why", "sentence", "correct", "text", "w", "picture"):
                yield it.get(key)
            for b in it.get("blanks", []):
                yield b.get("zi")
        for d in sec.get("distractors", []):
            yield d.get("w")
        for line in sec.get("passage", []):
            yield line
        key = sec.get("key")
        if key:
            yield key.get("title")
            yield key.get("note")
            for r in key.get("rows", []):
                yield r.get("who")
                yield r.get("zh")
        for q in sec.get("questions", []):
            yield q.get("q")
            yield q.get("answer")
            for s in q.get("sub", []):
                yield s.get("zh")
                yield s.get("why")
            for st in q.get("steps", []):
                yield st.get("full")
                yield st.get("blank")
                for e in st.get("extra", []):
                    yield e
        for verse in sec.get("verses", []):
            for line in verse:
                yield line
        for p in sec.get("patterns", []):
            yield p.get("given")
            yield p.get("note")
            for a in p.get("answers", []):
                yield a
        q = sec.get("question")
        if q:
            yield q.get("q")
            yield q.get("answer")
        for r in sec.get("rows", []):
            yield r.get("a")
            yield r.get("aMean")
            yield r.get("b")
            yield r.get("bMean")
        for m in sec.get("more", []):
            yield m.get("a")
            yield m.get("b")
            yield m.get("note")


def hand_glosses(k: dict) -> dict[str, tuple[str, str]]:
    """Glosses already written in the lesson JSON win over CC-CEDICT."""
    g: dict[str, tuple[str, str]] = {}
    for w in k.get("revise", []):
        g.setdefault(w["w"], (w["py"], w["en"]))
    for sec in k["sections"]:
        for it in sec.get("items", []):
            if it.get("answer") and it.get("py"):
                g.setdefault(it["answer"], (it["py"], it.get("en", "")))
            if it.get("w") and it.get("py"):
                g.setdefault(it["w"], (it["py"], it.get("en", "")))
            if it.get("word") and it.get("full"):
                g.setdefault(it["word"], (it["full"], it.get("en", "")))
            if it.get("right") and it.get("py"):
                g.setdefault(it["right"], (it["py"], ""))
        for d in sec.get("distractors", []):
            if d.get("w") and d.get("py"):
                g.setdefault(d["w"], (d["py"], d.get("en", "")))
        for r in sec.get("rows", []):
            g.setdefault(r["a"], (r["aPy"], r["aMean"]))
            g.setdefault(r["b"], (r["bPy"], r["bMean"]))
    return g


def build(path: Path, cedict) -> None:
    k = json.loads(path.read_text(encoding="utf-8"))
    d = Dict(cedict, hand_glosses(k))
    d.hand.update({w: v for w, v in OVERRIDES.items()})
    seg: dict[str, list[str]] = {}

    for t in texts_of(k):
        if not t or not HAN.search(str(t)):
            continue
        t = str(t).strip()
        # a single word (word list, table cell) also gets its own entry
        if len(t) <= 5 and len(seg_plain(t)) == 1:
            d.add(t)
        if t not in seg:
            seg[t] = seg_plain(t)
            for tok in seg[t]:
                d.add(tok)

    out = DATA / f"{path.stem}_words.json"
    out.write_text(
        json.dumps({"seg": seg, "dict": d.out}, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    missing = [w for w, e in d.out.items() if not e["en"] and len(w) <= 4]
    print(
        f"{out.name}: {len(seg)} texts, {len(d.out)} words, "
        f"{len(missing)} short words without a gloss {missing[:12]}"
    )


def main() -> None:
    jieba.setLogLevel(60)
    for w in EXTRA_WORDS:
        jieba.add_word(w)
    cedict = load_cedict()
    lessons = [p for p in sorted(DATA.glob("keben_*.json")) if not p.stem.endswith("_words")]
    if not lessons:
        print("no keben_*.json found", file=sys.stderr)
        return
    for p in lessons:
        build(p, cedict)


if __name__ == "__main__":
    main()
