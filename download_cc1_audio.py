#!/usr/bin/env python3
"""
Download Google TTS audio for CC1 magazine paragraphs and vocabulary.
"""

import os
import json
import subprocess
import time
from urllib.parse import quote

AUDIO_DIR = "public/audio/cc1"


def download_google_audio(text, filename):
    """Download audio from Google Translate TTS"""
    try:
        encoded_text = quote(text)
        url = f"https://translate.google.com/translate_tts?ie=UTF-8&tl=zh-CN&client=tw-ob&q={encoded_text}"

        headers = [
            '-H', 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            '-H', 'Referer: https://translate.google.com/',
        ]

        cmd = ['curl', '-s'] + headers + ['-o', filename, url]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)

        if result.returncode == 0 and os.path.exists(filename):
            size = os.path.getsize(filename)
            if size < 100:
                os.remove(filename)
                return False
            with open(filename, 'rb') as f:
                header = f.read(4)
                if header.startswith(b'<'):
                    os.remove(filename)
                    return False
            return True
        return False
    except Exception as e:
        print(f"  Error: {e}")
        return False


def main():
    os.makedirs(AUDIO_DIR, exist_ok=True)

    with open('cc1_audio_texts.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    paragraphs = data['paragraphs']
    vocab_words = data['vocab_words']

    # Build download list
    items = []
    for key, text in paragraphs.items():
        filename = os.path.join(AUDIO_DIR, f"{key}.mp3")
        items.append((filename, text, key))

    seen = set()
    for word in vocab_words:
        if word not in seen:
            seen.add(word)
            filename = os.path.join(AUDIO_DIR, f"word_{word}.mp3")
            items.append((filename, word, f"word_{word}"))

    total = len(items)
    print(f"Total audio files to generate: {total}")

    success = 0
    skipped = 0
    failed = 0

    for i, (filename, text, label) in enumerate(items, 1):
        if os.path.exists(filename) and os.path.getsize(filename) > 100:
            skipped += 1
            continue

        short = text[:40] + "..." if len(text) > 40 else text
        print(f"[{i}/{total}] {short}")

        if download_google_audio(text, filename):
            success += 1
        else:
            failed += 1
            print(f"  FAILED: {label}")

        time.sleep(0.4)

    print(f"\n=== Summary ===")
    print(f"Total: {total}")
    print(f"Downloaded: {success}")
    print(f"Skipped: {skipped}")
    print(f"Failed: {failed}")


if __name__ == '__main__':
    main()
