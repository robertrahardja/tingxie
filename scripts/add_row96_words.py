#!/usr/bin/env python3
"""
Append tingxie row 96 (16 words from the school's latest 听写 sheet) to
public/data/tingxie/tingxie_vocabulary.json, preserving the file's
existing 2-space JSON formatting.

Usage:
    python3 scripts/add_row96_words.py
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "public" / "data" / "tingxie" / "tingxie_vocabulary.json"
ROW = 96

# simplified, traditional, pinyin (as printed on the sheet), english
WORDS = [
    ("一直",   "一直",   "yì zhí",          "always, all along; straight ahead"),
    ("环保袋", "環保袋", "huán bǎo dài",    "reusable (eco-friendly) shopping bag"),
    ("停车场", "停車場", "tíng chē chǎng",  "car park"),
    ("兴奋",   "興奮",   "xīng fèn",        "excited"),
    ("世界",   "世界",   "shì jiè",         "world"),
    ("弯弯",   "彎彎",   "wān wān",         "curved, crescent-shaped (e.g. 弯弯的月亮)"),
    ("国旗",   "國旗",   "guó qí",          "national flag"),
    ("唱国歌", "唱國歌", "chàng guó gē",    "to sing the national anthem"),
    ("礼物",   "禮物",   "lǐ wù",           "gift, present"),
    ("亮晶晶", "亮晶晶", "liàng jīng jīng", "sparkling, glittering"),
    ("新加坡", "新加坡", "xīn jiā pō",      "Singapore"),
    ("养着",   "養著",   "yǎng zhe",        "keeping, raising (a pet or plant)"),
    ("尽力",   "盡力",   "jìn lì",          "to do one's best, to try one's hardest"),
    ("指着",   "指著",   "zhǐ zhe",         "pointing at"),
    ("森林",   "森林",   "sēn lín",         "forest"),
    ("沙滩",   "沙灘",   "shā tān",         "sandy beach"),
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
