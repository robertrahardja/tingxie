#!/usr/bin/env python3
"""
Append tingxie row 99 (12 words from the school's latest 听写 sheet) to
public/data/tingxie/tingxie_vocabulary.json, preserving the file's
existing 2-space JSON formatting.

Usage:
    python3 scripts/add_row99_words.py
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "public" / "data" / "tingxie" / "tingxie_vocabulary.json"
ROW = 99

# simplified, traditional, pinyin (as printed on the sheet), english
WORDS = [
    ("环境",       "環境",       "huán jìng",        "environment"),
    ("打招呼",     "打招呼",     "dǎ zhāo hu",      "to greet"),
    ("缩手",       "縮手",       "suō shǒu",        "to draw back one's hand"),
    ("人人有责",   "人人有責",   "rén rén yǒu zé",  "everyone has a responsibility"),
    ("设计",       "設計",       "shè jì",          "to design; design"),
    ("其中",       "其中",       "qí zhōng",        "among them, within"),
    ("塑料袋",     "塑料袋",     "sù liào dài",     "plastic bag"),
    ("信封",       "信封",       "xìn fēng",        "envelope"),
    ("必须",       "必須",       "bì xū",           "must, have to"),
    ("印度",       "印度",       "yìn dù",          "India"),
    ("任务",       "任務",       "rèn wù",          "task, mission"),
    ("竖起大拇指", "豎起大拇指", "shù qǐ dà mǔ zhǐ", "to give a thumbs up"),
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
