#!/usr/bin/env python3
"""
Turn the eBible verse-per-line (VPL) Chinese Union Version into one JSON file
per chapter for /bible/proverbs/<chapter>.

Source: https://ebible.org/Scriptures/cmn-cu89s_vpl.zip  (新标点和合本, simplified)
The VPL archive is BIBLE TEXT ONLY — its own _about.htm states that all
"formatting, paragraph breaks, notes, introductions, noncanonical section
titles, etc., have been removed", which is what keeps this to the 1919 和合本
wording (public domain) plus punctuation. Do NOT swap in the HTML edition:
that one carries the 1988 section headings, which are not ours to ship.

Each verse carries two English lines, and the page labels which is which:

  "kjv"  the King James Version, from eBible's eng-kjv_vpl.zip. Public domain
         (the Crown letters patent restricts *printing* in the UK only, not a
         web page). This is a real translation.
  "en"   a plain-English paraphrase written by hand in proverbs_en.json, at
         P2/P3 reading level. NOT a translation and not authoritative — it
         exists because the KJV's archaic English is harder than the Chinese.

Never present "en" as scripture; the page marks it 简单说 / "in simple words".

Writes public/data/bible/proverbs_<n>.json:
    { "book": "箴言", "bookEn": "Proverbs", "chapter": 1, "chapters": 31,
      "verses": [ { "n": 1, "zh": "…", "kjv": "…", "en": "…" }, … ] }

Usage:
    python3 scripts/build_bible_text.py <cmn-cu89s_vpl.txt> <eng-kjv_vpl.txt> [chapters…]
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "data" / "bible"
EN_FILE = OUT / "proverbs_en.json"

BOOK = "PRO"
BOOK_ZH = "箴言"
BOOK_EN = "Proverbs"
CHAPTERS = 31

LINE = re.compile(rf"^{BOOK} (\d+):(\d+) (.*)$")
# Every line of a VPL archive is "BOOK C:V text". The HTML edition's 1988
# section headings sit on their own lines, so a line that is not a verse is
# how a wrong archive gives itself away — fail loudly rather than publish it.
# (Don't test heading *strings* against verse text: 所罗门的箴言 is genuinely
# the opening of 1:1, 10:1 and 25:1.)
ANY_VERSE = re.compile(r"^[A-Z0-9]{3} \d+:\d+ ")


def clean(text: str) -> str:
    """VPL pads poetic half-lines with runs of spaces; collapse them."""
    return re.sub(r"\s+", "", text).strip()


def clean_en(text: str) -> str:
    """
    KJV VPL markup, removed for a child reading it:
      ¶        paragraph mark, meaningless here
      [words]  words the 1611 translators supplied, italicised in print.
               Unwrapped rather than dropped — "A wise [man] will hear"
               reads as broken punctuation, and the convention carries
               nothing a P3 reader can use.
    """
    text = text.replace("¶", " ")
    text = re.sub(r"\[([^\]]*)\]", r"\1", text)
    return re.sub(r"\s+", " ", text).strip()


def read_vpl(src: Path, book: str) -> dict[tuple[int, int], str]:
    """{(chapter, verse): text} for one book of a verse-per-line archive."""
    out: dict[tuple[int, int], str] = {}
    line = re.compile(rf"^{book} (\d+):(\d+) (.*)$")
    for lineno, raw in enumerate(src.read_text(encoding="utf-8").splitlines(), 1):
        if raw.strip() and not ANY_VERSE.match(raw):
            sys.exit(
                f"ABORT: {src.name}:{lineno} is not a verse line — this looks like an\n"
                f"HTML edition, which carries section headings. Use *_vpl.zip.\n"
                f"  {raw[:80]}"
            )
        m = line.match(raw)
        if m:
            out[(int(m.group(1)), int(m.group(2)))] = m.group(3)
    return out


def main() -> None:
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    zh_src, kjv_src = Path(sys.argv[1]), Path(sys.argv[2])
    want = {int(a) for a in sys.argv[3:]} or set(range(1, CHAPTERS + 1))

    english: dict[str, str] = {}
    if EN_FILE.exists():
        english = json.loads(EN_FILE.read_text(encoding="utf-8"))

    zh = read_vpl(zh_src, BOOK)
    kjv = read_vpl(kjv_src, BOOK)
    if not zh:
        sys.exit(f"no {BOOK} lines in {zh_src}")
    if not kjv:
        sys.exit(f"no {BOOK} lines in {kjv_src}")

    chapters: dict[int, list[dict]] = {}
    for (ch, vs), text in sorted(zh.items()):
        chapters.setdefault(ch, []).append(
            {
                "n": vs,
                "zh": clean(text),
                "kjv": clean_en(kjv.get((ch, vs), "")),
                "en": english.get(f"{ch}:{vs}", ""),
            }
        )

    OUT.mkdir(parents=True, exist_ok=True)
    total = 0
    for ch in sorted(chapters):
        if ch not in want:
            continue
        verses = chapters[ch]
        (OUT / f"proverbs_{ch}.json").write_text(
            json.dumps(
                {
                    "book": BOOK_ZH,
                    "bookEn": BOOK_EN,
                    "chapter": ch,
                    "chapters": CHAPTERS,
                    "verses": verses,
                },
                ensure_ascii=False,
                indent=1,
            ),
            encoding="utf-8",
        )
        missing = sum(1 for v in verses if not v["en"])
        total += len(verses)
        print(f"  ch {ch:2d}: {len(verses):3d} verses" + (f"  ({missing} without English)" if missing else ""))
    print(f"{total} verses written to {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
