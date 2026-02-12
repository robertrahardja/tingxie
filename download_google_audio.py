#!/usr/bin/env python3
"""
Download Chinese audio using Google Translate TTS
"""

import os
import time
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.parse import quote

WORDS = {
    "对错": "duì cuò - right and wrong",
    "突然": "tū rán - suddenly",
    "原谅": "yuán liàng - to forgive",
    "弄破": "nòng pò - to break, to damage",
    "应该": "yīng gāi - should, ought to",
    "来不及": "lái bu jí - too late, not enough time",
    "像": "xiàng - to resemble, like",
    "跌倒": "diē dǎo - to fall down",
    "立刻扶起": "lì kè fú qǐ - immediately help up",
    "推开": "tuī kāi - to push away",
    "理睬": "lǐ cǎi - to pay attention to, to acknowledge",
    "扔": "rēng - to throw",
    "谢谢": "xiè xiè - thank you",
    "受伤": "shòu shāng - to be injured",
    "爬起来": "pá qǐ lái - to get up, to climb up",
    "不好意思": "bù hǎo yì si - embarrassed, sorry",
}

def download_google_tts(word):
    """Download audio from Google Translate"""
    audio_dir = Path("audio")
    audio_dir.mkdir(exist_ok=True)

    filename = f"audio/{word}.mp3"

    if os.path.exists(filename):
        print(f"✓ {word} - already exists")
        return filename

    try:
        # Google Translate TTS URL
        url = f"https://translate.google.com/translate_tts?ie=UTF-8&q={quote(word)}&tl=zh-CN&client=tw-ob&ttsspeed=0.5"

        print(f"⏳ {word}...", end=" ", flush=True)

        req = Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })

        with urlopen(req, timeout=10) as response:
            data = response.read()

            if len(data) > 1000:  # Valid MP3 should be at least 1KB
                with open(filename, 'wb') as f:
                    f.write(data)
                print(f"✓ ({len(data)} bytes)")
                return filename
            else:
                print(f"✗ (invalid file size: {len(data)})")
                return None

    except Exception as e:
        print(f"✗ ({str(e)[:50]})")
        return None

def main():
    print("Downloading audio files from Google Translate...\n")

    for word in WORDS.keys():
        download_google_tts(word)
        time.sleep(0.8)  # Rate limiting

    print("\n✓ Done!")

if __name__ == "__main__":
    main()
