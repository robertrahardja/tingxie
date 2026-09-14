#!/usr/bin/env python3
"""
Pre-generate MP3 clips (edge-tts) for every playable string on the Bible
reading pages, so audio never depends on the device having a Chinese
speech-synthesis voice.

Files go to public/audio/tts/<sha256(text)[:16]>.mp3 — the same key that
src/lib/tts.ts computes at runtime, and the same folder the 综合练习 clips
use, so a word shared with those pages is only ever generated once.

Covered, per chapter: every verse, and every word in the chapter's word bank.

Usage:
    ~/.local/share/mise/installs/python/3.14.6/bin/python scripts/generate_bible_tts.py [chapters…]
"""

import asyncio
import hashlib
import json
import sys
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "public" / "data" / "bible"
OUT = ROOT / "public" / "audio" / "tts"
VOICE = "zh-CN-XiaoxiaoNeural"
RATE = "-15%"
CONCURRENCY = 6
BOOK = "proverbs"


def key(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]


def collect(chapters: list[int]) -> set[str]:
    texts: set[str] = set()
    for ch in chapters:
        f = DATA / f"{BOOK}_{ch}.json"
        if not f.exists():
            print(f"  ch {ch}: no {f.name}, skipping", file=sys.stderr)
            continue
        for v in json.loads(f.read_text(encoding="utf-8"))["verses"]:
            if v["zh"].strip():
                texts.add(v["zh"].strip())
        wf = DATA / f"{BOOK}_{ch}_words.json"
        if wf.exists():
            for w in json.loads(wf.read_text(encoding="utf-8"))["dict"]:
                if w.strip():
                    texts.add(w.strip())
    return texts


async def gen(text: str, sem: asyncio.Semaphore) -> bool:
    path = OUT / f"{key(text)}.mp3"
    if path.exists() and path.stat().st_size > 500:
        return False
    async with sem:
        for attempt in range(3):
            try:
                await edge_tts.Communicate(text, VOICE, rate=RATE).save(str(path))
                if path.stat().st_size > 500:
                    return True
            except Exception as e:  # noqa: BLE001
                print(f"  retry {attempt + 1} for {text!r}: {e}", file=sys.stderr)
                await asyncio.sleep(1.5)
        print(f"FAILED: {text!r}", file=sys.stderr)
        return False


async def main() -> None:
    chapters = [int(a) for a in sys.argv[1:]] or list(range(1, 32))
    OUT.mkdir(parents=True, exist_ok=True)
    texts = sorted(collect(chapters))
    print(f"{len(texts)} unique strings")
    sem = asyncio.Semaphore(CONCURRENCY)
    results = await asyncio.gather(*(gen(t, sem) for t in texts))
    print(f"generated {sum(1 for r in results if r)} new clips")


if __name__ == "__main__":
    asyncio.run(main())
