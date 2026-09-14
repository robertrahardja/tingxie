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

English lines are written by hand in public/data/bible/proverbs_en.json
(kid-level, one per verse); any verse without one is emitted with "en": "".

Writes public/data/bible/proverbs_<n>.json:
    { "book": "箴言", "bookEn": "Proverbs", "chapter": 1, "chapters": 31,
      "verses": [ { "n": 1, "zh": "…", "en": "…" }, … ] }

Usage:
    python3 scripts/build_bible_text.py <path-to-cmn-cu89s_vpl.txt> [chapters…]
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


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    src = Path(sys.argv[1])
    want = {int(a) for a in sys.argv[2:]} or set(range(1, CHAPTERS + 1))

    english: dict[str, str] = {}
    if EN_FILE.exists():
        english = json.loads(EN_FILE.read_text(encoding="utf-8"))

    chapters: dict[int, list[dict]] = {}
    for lineno, raw in enumerate(src.read_text(encoding="utf-8").splitlines(), 1):
        if raw.strip() and not ANY_VERSE.match(raw):
            sys.exit(
                f"ABORT: {src.name}:{lineno} is not a verse line — this looks like the\n"
                f"HTML edition, which carries the 1988 section headings. Use *_vpl.zip.\n"
                f"  {raw[:80]}"
            )
        m = LINE.match(raw)
        if not m:
            continue
        ch, vs, text = int(m.group(1)), int(m.group(2)), clean(m.group(3))
        chapters.setdefault(ch, []).append(
            {"n": vs, "zh": text, "en": english.get(f"{ch}:{vs}", "")}
        )

    if not chapters:
        sys.exit(f"no {BOOK} lines in {src}")

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
