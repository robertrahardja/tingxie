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
    "伸进": "shēn jìn - to stretch/reach into",
    "鼻子": "bí zi - nose",
    "救护车": "jiù hù chē - ambulance",
    "篮子": "lán zi - basket",
    "不停": "bù tíng - non-stop, continuously",
    "满": "mǎn - full",
    "升": "shēng - to rise, to ascend",
    "回答问题": "huí dá wèn tí - to answer a question",
    "手拉手": "shǒu lā shǒu - hand in hand",
    "船": "chuán - boat, ship",
    "重量": "zhòng liàng - weight",
    "夸": "kuā - to praise, to boast",
    "竹竿": "zhú gān - bamboo pole",
    "称一称": "chēng yī chēng - to weigh (something)",
    "下沉": "xià chén - to sink",
    "墙壁": "qiáng bì - wall",
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
