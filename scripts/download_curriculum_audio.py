#!/usr/bin/env python3
"""
Download Google TTS audio for curriculum P1-P3 vocabulary words.
Skips words that already have audio files.
"""
import json
import os
import time
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.parse import quote

AUDIO_DIR = Path(__file__).resolve().parent.parent / "public" / "audio"
DATA_FILE = Path(__file__).resolve().parent.parent / "public" / "data" / "curriculum_p1_p3.json"


def download_google_tts(word: str) -> bool:
    """Download audio from Google Translate TTS. Returns True if successful."""
    AUDIO_DIR.mkdir(exist_ok=True)
    filepath = AUDIO_DIR / f"{word}.mp3"

    if filepath.exists() and filepath.stat().st_size > 1000:
        return True  # Already exists

    try:
        url = f"https://translate.google.com/translate_tts?ie=UTF-8&q={quote(word)}&tl=zh-CN&client=tw-ob&ttsspeed=0.5"
        req = Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        with urlopen(req, timeout=10) as response:
            data = response.read()
            if len(data) > 1000:
                with open(filepath, 'wb') as f:
                    f.write(data)
                return True
    except Exception as e:
        print(f"  FAIL: {word} - {str(e)[:60]}")
    return False


def main():
    with open(DATA_FILE) as f:
        data = json.load(f)

    all_words = set()
    for level_data in data['levels'].values():
        for row in level_data['rows']:
            for w in row['words']:
                all_words.add(w['simplified'])

    # Check which already exist
    existing = set()
    for w in all_words:
        fp = AUDIO_DIR / f"{w}.mp3"
        if fp.exists() and fp.stat().st_size > 1000:
            existing.add(w)

    needed = sorted(all_words - existing)
    print(f"Total curriculum words: {len(all_words)}")
    print(f"Already have audio: {len(existing)}")
    print(f"Need to download: {len(needed)}")

    if not needed:
        print("All audio files present!")
        return

    success = 0
    fail = 0
    for i, word in enumerate(needed):
        if download_google_tts(word):
            success += 1
        else:
            fail += 1

        if (i + 1) % 50 == 0:
            print(f"  Progress: {i+1}/{len(needed)} (ok:{success} fail:{fail})")

        time.sleep(0.5)  # Rate limiting

    print(f"\nDone! Downloaded: {success}, Failed: {fail}")


if __name__ == '__main__':
    main()
