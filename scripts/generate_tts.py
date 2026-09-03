#!/usr/bin/env python3
"""
Pre-generate MP3 clips (edge-tts) for every playable string in the
综合练习 pages, so audio never depends on the device having a Chinese
speech-synthesis voice.

Files go to public/audio/tts/<sha256(text)[:16]>.mp3 — the same key that
src/lib/tts.ts computes at runtime.

Covered: word-list words and collocations (words_w34_w40.json) and, for
each zonghe_<week>.json, every completed sentence, rewrite answer, reading
passage line and oral-practice sentence.

Usage:
    ~/.local/share/mise/installs/python/3.14.6/bin/python scripts/generate_tts.py
"""

import asyncio
import hashlib
import json
import re
import sys
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "public" / "data" / "p3hcl"
OUT = ROOT / "public" / "audio" / "tts"
VOICE = "zh-CN-XiaoxiaoNeural"
RATE = "-15%"
CONCURRENCY = 6


def key(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]


def fill(text: str, answer: str) -> str:
    """Fill blanks; a paired connector like 因为……所以…… fills two blanks."""
    parts = [p for p in answer.split("……") if p] if "……" in answer else [answer]
    if len(parts) > 1 and text.count("____") >= len(parts):
        for p in parts:
            text = text.replace("____", p, 1)
        return text
    return text.replace("____", answer, 1)


def collect() -> set[str]:
    texts: set[str] = set()

    def add(t):
        if t and str(t).strip():
            texts.add(str(t).strip())

    words = json.loads((DATA / "words_w34_w40.json").read_text())
    for wk in words["weeks"]:
        for w in wk["words"]:
            add(w["w"].replace("…", ""))
            for c in (w.get("c") or "").split("/"):
                add(c.strip())

    for f in sorted(DATA.glob("zonghe_*.json")):
        z = json.loads(f.read_text())
        for sec in z["sections"]:
            for g in sec.get("groups", []):
                bank = g.get("bank") or []
                by_n = {q["n"]: q for q in g.get("questions", [])}

                def filled_line(line: str) -> str:
                    # 【49】 -> the answer word for Q49 (matches spokenLine() in the page)
                    return re.sub(
                        r"【(\d+)】",
                        lambda m: bank[by_n[int(m.group(1))]["answer"] - 1]
                        if int(m.group(1)) in by_n and bank
                        else "",
                        line,
                    )

                for line in g.get("passage", []):
                    add(filled_line(line))
                for w in bank:  # bank buttons speak the bare word
                    add(w)
                for q in g.get("questions", []):
                    opts = q.get("options") or bank
                    for o in opts:  # practice mode speaks the tapped option
                        add(o)
                    ans = opts[q["answer"] - 1] if opts and q.get("answer") else ""
                    if q.get("text"):
                        if "____" in q["text"]:
                            add(fill(q["text"], ans))
                        else:
                            add(q["text"])
            for it in sec.get("items", []):
                add(it.get("answer"))
                for o in it.get("original", []):
                    add(o)
                for s in it.get("sentences", []):
                    add(s["zh"])
                for v in it.get("vocab", []):
                    add(v["w"])
    return texts


async def gen(text: str, sem: asyncio.Semaphore):
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


async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    texts = sorted(collect())
    print(f"{len(texts)} unique strings")
    sem = asyncio.Semaphore(CONCURRENCY)
    results = await asyncio.gather(*(gen(t, sem) for t in texts))
    print(f"generated {sum(1 for r in results if r)} new clips")
    manifest = {key(t): t for t in texts}
    (OUT / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=0), encoding="utf-8"
    )


if __name__ == "__main__":
    asyncio.run(main())
