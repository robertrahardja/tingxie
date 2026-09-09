#!/usr/bin/env python3
"""
Download the missing pronunciation clips for tingxie row 96 from Google
Translate TTS into public/audio/<word>.mp3 (same source and format as the
existing clips: 24 kHz mono MP3). Words that already have a clip are skipped.

Usage:
    python3 scripts/download_row96_audio.py
"""

import time
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent.parent
AUDIO = ROOT / "public" / "audio"

WORDS = [
    "一直", "环保袋", "停车场", "兴奋", "世界", "弯弯", "国旗", "唱国歌",
    "礼物", "亮晶晶", "新加坡", "养着", "尽力", "指着", "森林", "沙滩",
]

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"


def download(word: str) -> None:
    out = AUDIO / f"{word}.mp3"
    if out.exists():
        print(f"✓ {word} - already exists")
        return
    url = (
        "https://translate.google.com/translate_tts?ie=UTF-8"
        f"&q={quote(word)}&tl=zh-CN&client=tw-ob&ttsspeed=0.5"
    )
    with urlopen(Request(url, headers={"User-Agent": UA}), timeout=20) as resp:
        data = resp.read()
    if len(data) < 1000 or not data.startswith((b"ID3", b"\xff\xfb", b"\xff\xf3", b"\xff\xf2")):
        raise SystemExit(f"✗ {word}: response does not look like an MP3 ({len(data)} bytes)")
    out.write_bytes(data)
    print(f"⬇ {word} - {len(data)} bytes")
    time.sleep(0.5)


def main() -> None:
    AUDIO.mkdir(parents=True, exist_ok=True)
    for w in WORDS:
        download(w)


if __name__ == "__main__":
    main()
