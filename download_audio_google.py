#!/usr/bin/env python3
"""
Download high-quality audio from Google Translate TTS
"""

import os
import json
import subprocess
import time
from urllib.parse import quote

def load_vocabulary():
    """Load all unique words from tingxie_vocabulary.json"""
    with open('data/tingxie/tingxie_vocabulary.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    words = {}
    for row in data['vocabulary']:
        for word_entry in row['words']:
            simplified = word_entry['simplified']
            if simplified not in words:
                words[simplified] = word_entry

    return words

def download_google_audio(text, filename):
    """Download audio from Google Translate TTS"""
    try:
        # Google Translate TTS URL
        encoded_text = quote(text)
        url = f"https://translate.google.com/translate_tts?ie=UTF-8&tl=zh-CN&client=tw-ob&q={encoded_text}"

        headers = [
            '-H', 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            '-H', 'Referer: https://translate.google.com/',
        ]

        cmd = ['curl', '-s'] + headers + ['-o', filename, url]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=15)

        if result.returncode == 0 and os.path.exists(filename):
            # Check if file is valid audio (not HTML error)
            with open(filename, 'rb') as f:
                header = f.read(4)
                # MP3 files start with:
                # - 0xFF 0xFB or 0xFF 0xFA (MPEG frame sync)
                # - 0xFF 0xF3 or 0xFF 0xF2 (MPEG frame sync variant)
                # - 0x49 0x44 0x33 (ID3 tag)
                if (header.startswith(b'ID3') or
                    header[:2] in [b'\xff\xfb', b'\xff\xfa', b'\xff\xf3', b'\xff\xf2']):
                    return True
                elif header.startswith(b'<'):  # HTML error response
                    os.remove(filename)
                    return False
                else:
                    # Unknown format, but file exists - keep it
                    return True
        return False

    except Exception as e:
        print(f"✗ Error downloading {text}: {e}")
        return False

def main():
    audio_dir = "audio"
    os.makedirs(audio_dir, exist_ok=True)

    # Load vocabulary
    words = load_vocabulary()
    print(f"Found {len(words)} unique words to download")

    success_count = 0
    fail_count = 0
    skip_count = 0

    for i, (simplified, word_entry) in enumerate(words.items(), 1):
        filename = os.path.join(audio_dir, f"{simplified}.mp3")

        # Skip if file already exists and is valid MP3
        if os.path.exists(filename):
            with open(filename, 'rb') as f:
                header = f.read(4)
                if header.startswith(b'ID3') or header[:2] in [b'\xff\xfb', b'\xff\xfa']:
                    skip_count += 1
                    if i % 50 == 0:
                        print(f"[{i}/{len(words)}] Skipping existing MP3: {simplified}")
                    continue
                else:
                    # Not valid MP3, re-download
                    print(f"[{i}/{len(words)}] Re-downloading (not MP3): {simplified}")
                    os.remove(filename)

        # Download from Google
        if download_google_audio(simplified, filename):
            success_count += 1
            if i % 50 == 0:
                print(f"[{i}/{len(words)}] ✓ Downloaded: {simplified}")
        else:
            fail_count += 1
            if i % 50 == 0 or i <= 10:
                print(f"[{i}/{len(words)}] ✗ Failed: {simplified}")

        # Rate limiting - be nice to Google's servers
        time.sleep(0.3)

    print(f"\n=== Summary ===")
    print(f"Total words: {len(words)}")
    print(f"Downloaded: {success_count}")
    print(f"Failed: {fail_count}")
    print(f"Skipped (already MP3): {skip_count}")

    if fail_count > 0:
        print(f"\nNote: {fail_count} files could not be downloaded.")
        print("Google Translate TTS may have rate limits or connectivity issues.")

if __name__ == '__main__':
    main()
