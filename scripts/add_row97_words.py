#!/usr/bin/env python3
"""
Append tingxie row 97 (16 words from the school's latest 听写 sheet) to
public/data/tingxie/tingxie_vocabulary.json, preserving the file's
existing 2-space JSON formatting.

Usage:
    python3 scripts/add_row97_words.py
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "public" / "data" / "tingxie" / "tingxie_vocabulary.json"
ROW = 97

# simplified, traditional, pinyin (as printed on the sheet), english
WORDS = [
    ("沿着",     "沿著",     "yán zhe",           "along, following (a path, river, wall)"),
    ("拍照片",   "拍照片",   "pāi zhào piàn",     "to take a photo"),
    ("讨论",     "討論",     "tǎo lùn",           "to discuss"),
    ("检查",     "檢查",     "jiǎn chá",          "to check, to inspect"),
    ("仍然",     "仍然",     "réng rán",          "still, as before"),
    ("急忙",     "急忙",     "jí máng",           "hurriedly, in a rush"),
    ("地图",     "地圖",     "dì tú",             "map"),
    ("眼睛圆圆", "眼睛圓圓", "yǎn jīng yuán yuán", "with big round eyes"),
    ("咬断",     "咬斷",     "yǎo duàn",          "to bite through, to bite off"),
    ("吃饱",     "吃飽",     "chī bǎo",           "to eat one's fill, to be full"),
    ("慢慢",     "慢慢",     "màn màn",           "slowly"),
    ("软软",     "軟軟",     "ruǎn ruǎn",         "soft, squishy"),
    ("笨重",     "笨重",     "bèn zhòng",         "bulky and heavy, cumbersome"),
    ("有趣",     "有趣",     "yǒu qù",            "interesting, fun"),
    ("打滚",     "打滾",     "dǎ gǔn",            "to roll around (on the ground)"),
    ("小偷",     "小偷",     "xiǎo tōu",          "thief"),
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
