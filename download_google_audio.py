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
    "食堂": "shí táng - canteen, cafeteria",
    "走路": "zǒu lù - to walk",
    "眼镜": "yǎn jìng - glasses, spectacles",
    "休息": "xiū xi - to rest",
    "碰到": "pèng dào - to bump into, to encounter",
    "赔钱": "péi qián - to compensate, to pay damages",
    "生病": "shēng bìng - to be sick, to fall ill",
    "脱": "tuō - to take off, to remove",
    "搬动": "bān dòng - to move (something)",
    "电视": "diàn shì - television",
    "轻轻": "qīng qīng - gently, lightly, softly",
    "灵机一动": "líng jī yī dòng - to have a sudden inspiration",
    "留下一张便条": "liú xià yī zhāng biàn tiáo - to leave a note",
    "轻手轻脚": "qīng shǒu qīng jiǎo - quietly, stealthily, on tiptoe",
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
