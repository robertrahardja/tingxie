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
    "小偷": "xiǎo tōu - thief",
    "桌子": "zhuō zi - table",
    "逃走": "táo zǒu - to flee",
    "吓得发抖": "xià dé fā dǒu - to tremble with fright",
    "同班": "tóng bān - same class",
    "课室": "kè shì - classroom",
    "挖掉": "wā diào - to dig out",
    "肚皮": "dù pí - belly",
    "哈哈大笑": "hā hā dà xiào - to laugh heartily",
    "简单": "jiǎn dān - simple",
    "练习": "liàn xí - to practice",
    "怀里": "huái lǐ - in one's arms",
    "闹笑话": "nào xiào huà - to make a fool of oneself",
    "不敢": "bù gǎn - to not dare",
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
