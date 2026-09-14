#!/usr/bin/env python3
"""
Fold a batch of hand-written 简单说 lines into public/data/bible/proverbs_en.json.

Write a batch to public/data/bible/_batch_en.json as {"<ch>:<v>": "English"},
then run this. It merges, re-sorts by chapter and verse, and removes the batch
file — so the next batch starts from an empty slate and cannot silently
overwrite the previous one.

    python3 scripts/merge_bible_en.py
"""

import json
import sys
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "public" / "data" / "bible"
MAIN = DATA / "proverbs_en.json"
BATCH = DATA / "_batch_en.json"


def verse_key(k: str) -> tuple[int, int]:
    ch, vs = k.split(":")
    return int(ch), int(vs)


def main() -> None:
    if not BATCH.exists():
        sys.exit(f"no {BATCH.name} to merge")

    d = json.loads(MAIN.read_text(encoding="utf-8"))
    add = json.loads(BATCH.read_text(encoding="utf-8"))

    before = sum(1 for k in d if ":" in k)
    overwritten = sorted(set(add) & {k for k in d if ":" in k}, key=verse_key)
    d.update(add)

    comment = d.pop("_comment", None)
    keys = sorted((k for k in d if ":" in k), key=verse_key)
    out: dict[str, str] = {}
    if comment:
        out["_comment"] = comment
    out.update({k: d[k] for k in keys})

    MAIN.write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    BATCH.unlink()

    print(f"{before} -> {len(keys)} verses with English (+{len(keys) - before})")
    if overwritten:
        print(f"  replaced {len(overwritten)} existing: {' '.join(overwritten[:8])}")


if __name__ == "__main__":
    main()
