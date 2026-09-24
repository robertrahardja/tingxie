#!/usr/bin/env python3
"""
Append tingxie row 98 (15 words from the school's latest 听写 sheet) to
public/data/tingxie/tingxie_vocabulary.json, preserving the file's
existing 2-space JSON formatting.

Usage:
    python3 scripts/add_row98_words.py
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "public" / "data" / "tingxie" / "tingxie_vocabulary.json"
ROW = 98

# simplified, traditional, pinyin (as printed on the sheet), english
WORDS = [
    ("课室",     "課室",     "kè shì",              "classroom"),
    ("漫画",     "漫畫",     "màn huà",             "comic, cartoon"),
    ("吓得逃走", "嚇得逃走", "xià de táo zǒu",      "to be so frightened that one runs away"),
    ("冒出冷汗", "冒出冷汗", "mào chū lěng hàn",    "to break out in a cold sweat"),
    ("掉",       "掉",       "diào",                "to drop, to fall"),
    ("练习",     "練習",     "liàn xí",             "to practise; exercise"),
    ("肚皮",     "肚皮",     "dù pí",               "belly, tummy"),
    ("数学简单", "數學簡單", "shù xué jiǎn dān",    "maths is easy"),
    ("泡泡",     "泡泡",     "pào pao",             "bubble"),
    ("立刻",     "立刻",     "lì kè",               "immediately, at once"),
    ("结果",     "結果",     "jié guǒ",             "result, outcome; as a result"),
    ("闹笑话",   "鬧笑話",   "nào xiào huà",        "to make a laughing stock of oneself"),
    ("不敢挖",   "不敢挖",   "bù gǎn wā",           "not daring to dig"),
    ("痛",       "痛",       "tòng",                "to hurt; painful"),
    ("跳舞",     "跳舞",     "tiào wǔ",             "to dance"),
]


def main() -> None:
    raw = DATA.read_text(encoding="utf-8")
    data = json.loads(raw)
    trailing_newline = raw.endswith("\n")
    assert json.dumps(data, ensure_ascii=False, indent=2) == raw.rstrip("\n"), (
        "unexpected JSON formatting; refusing to rewrite the file"
    )
    rows = data["vocabulary"]
    if any(r["row"] == ROW for r in rows):
        raise SystemExit(f"row {ROW} already exists")
    assert rows[-1]["row"] == ROW - 1, f"expected last row to be {ROW - 1}"

    rows.append({
        "row": ROW,
        "words": [
            {
                "simplified": s,
                "traditional": t,
                "pinyin": py,
                "english": en,
                "audio": f"audio/{s}.mp3",
                "important": True,
            }
            for s, t, py, en in WORDS
        ],
    })
    DATA.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + ("\n" if trailing_newline else ""),
        encoding="utf-8",
    )
    print(f"row {ROW} added with {len(WORDS)} words")


if __name__ == "__main__":
    main()
