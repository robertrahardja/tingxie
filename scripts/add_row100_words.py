#!/usr/bin/env python3
"""
Append tingxie row 100 (12 words from the school's latest 听写 sheet) to
public/data/tingxie/tingxie_vocabulary.json, preserving the file's
existing 2-space JSON formatting.

Usage:
    python3 scripts/add_row100_words.py
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "public" / "data" / "tingxie" / "tingxie_vocabulary.json"
ROW = 100

# simplified, traditional, pinyin (as printed on the sheet), english
WORDS = [
    ("散步",       "散步",       "sàn bù",          "to take a stroll"),
    ("强弱",       "強弱",       "qiáng ruò",       "strong and weak; strength"),
    ("钓鱼",       "釣魚",       "diào yú",         "to fish"),
    ("有始无终",   "有始無終",   "yǒu shǐ wú zhōng", "to start but not finish"),
    ("玩耍",       "玩耍",       "wán shuǎ",        "to play"),
    ("怀里",       "懷裡",       "huái lǐ",         "in one's arms; bosom"),
    ("感到",       "感到",       "gǎn dào",         "to feel"),
    ("半途而废",   "半途而廢",   "bàn tú ér fèi",   "to give up halfway"),
    ("农夫劳动",   "農夫勞動",   "nóng fū láo dòng", "the farmer works"),
    ("念",         "念",         "niàn",            "to read aloud; to miss"),
    ("传",         "傳",         "chuán",           "to pass on; to spread"),
    ("签名",       "簽名",       "qiān míng",       "to sign one's name; signature"),
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
