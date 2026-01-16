#!/usr/bin/env python3
"""
Download Chinese audio for radicals using Google Translate TTS
with slower speed for better clarity
"""

import os
import time
import json
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.parse import quote

def download_google_tts(word, output_path):
    """Download audio from Google Translate TTS with slow speed"""
    if os.path.exists(output_path):
        print(f"  ✓ {word} - already exists")
        return output_path

    try:
        # Google Translate TTS URL with normal speed (same as tingxie)
        url = f"https://translate.google.com/translate_tts?ie=UTF-8&q={quote(word)}&tl=zh-CN&client=tw-ob&ttsspeed=0.5"

        print(f"  ⏳ {word}...", end=" ", flush=True)

        req = Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Referer': 'https://translate.google.com/'
        })

        with urlopen(req, timeout=15) as response:
            data = response.read()

            if len(data) > 1000:  # Valid MP3 should be at least 1KB
                with open(output_path, 'wb') as f:
                    f.write(data)
                print(f"✓ ({len(data)} bytes)")
                return output_path
            else:
                print(f"✗ (invalid file size: {len(data)})")
                return None

    except Exception as e:
        print(f"✗ ({str(e)[:50]})")
        return None

def main():
    print("Downloading audio files for Chinese radicals (Google TTS - normal speed)...\n")

    # Create audio/radicals directory
    audio_dir = Path("audio/radicals")
    audio_dir.mkdir(parents=True, exist_ok=True)

    # Load radicals data
    with open("data/radicals/radicals.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    radicals = data["radicals"]
    total = len(radicals)
    success = 0
    failed = []

    print(f"Found {total} radicals to process\n")

    for i, radical in enumerate(radicals, 1):
        char = radical["radical"]
        pinyin = radical["pinyin"]
        meaning = radical["meaning"]

        print(f"[{i}/{total}] #{radical['number']} {char} ({pinyin} - {meaning})")

        output_path = audio_dir / f"{char}.mp3"
        result = download_google_tts(char, str(output_path))

        if result:
            success += 1
        else:
            failed.append(char)

        time.sleep(1.0)  # Rate limiting - slower to avoid blocking

    print(f"\n{'='*50}")
    print(f"Download complete!")
    print(f"  Success: {success}/{total}")

    if failed:
        print(f"  Failed: {len(failed)}")
        print(f"  Failed characters: {', '.join(failed)}")

    print("\n✓ Done!")

if __name__ == "__main__":
    main()
