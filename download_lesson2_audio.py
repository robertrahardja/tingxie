#!/usr/bin/env python3
"""
Download Chinese audio for Lesson 2 vocabulary using Google Translate TTS
"""

import os
import time
import json
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.parse import quote

def load_lesson_words():
    """Load words from lesson2.json"""
    with open('data/lessons/lesson2.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    words = []

    # Get words from shiXieZiCi (识写字词)
    if 'shiXieZiCi' in data['sections']:
        for word in data['sections']['shiXieZiCi']['words']:
            words.append(word['simplified'])

    # Get words from shiDuZiCi (识读字词)
    if 'shiDuZiCi' in data['sections']:
        for word in data['sections']['shiDuZiCi']['words']:
            words.append(word['simplified'])

    # Get words from tingXieCiYu (听写词语) - these might be phrases
    if 'tingXieCiYu' in data['sections']:
        for word in data['sections']['tingXieCiYu']['words']:
            words.append(word['chinese'])

    return list(set(words))  # Remove duplicates

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
    print("Loading Lesson 2 vocabulary...\n")
    words = load_lesson_words()
    print(f"Found {len(words)} unique words/phrases to download\n")

    print("Downloading audio files from Google Translate...\n")

    success = 0
    failed = 0

    for word in sorted(words):
        result = download_google_tts(word)
        if result:
            success += 1
        else:
            failed += 1
        time.sleep(0.8)  # Rate limiting

    print(f"\n✓ Done! Success: {success}, Failed: {failed}")

if __name__ == "__main__":
    main()
