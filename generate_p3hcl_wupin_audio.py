#!/usr/bin/env python3
"""
Generate audio files for P3HCL 物品 vocabulary
Downloads MP3 files from Google Translate TTS for each vocabulary word
"""

import json
import os
import urllib.request
import urllib.parse
import time

def download_audio(text, output_path):
    """Download audio from Google Translate TTS"""
    # Google Translate TTS endpoint
    base_url = "https://translate.google.com/translate_tts"

    params = {
        'ie': 'UTF-8',
        'q': text,
        'tl': 'zh-CN',  # Chinese (Simplified)
        'client': 'tw-ob',
        'ttsspeed': '0.8'  # Slightly slower for learning
    }

    url = f"{base_url}?{urllib.parse.urlencode(params)}"

    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }

    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response:
            audio_data = response.read()

        with open(output_path, 'wb') as f:
            f.write(audio_data)

        print(f"✓ Downloaded: {text} -> {output_path}")
        return True

    except Exception as e:
        print(f"✗ Failed to download {text}: {e}")
        return False

def main():
    # Load vocabulary JSON
    vocab_file = 'data/p3hcl-wupin-vocabulary.json'

    with open(vocab_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Create output directory
    output_dir = 'audio/p3hcl-wupin'
    os.makedirs(output_dir, exist_ok=True)

    print(f"Starting audio generation for {len(data['vocabulary'])} words...")
    print(f"Output directory: {output_dir}")
    print("-" * 60)

    success_count = 0
    skip_count = 0
    fail_count = 0

    for item in data['vocabulary']:
        simplified = item['simplified']
        output_path = os.path.join(output_dir, f"{simplified}.mp3")

        # Skip if file already exists
        if os.path.exists(output_path):
            print(f"⊙ Skipped (exists): {simplified}")
            skip_count += 1
            continue

        # Download audio
        if download_audio(simplified, output_path):
            success_count += 1
        else:
            fail_count += 1

        # Be polite to Google's servers
        time.sleep(0.5)

    print("-" * 60)
    print(f"Summary:")
    print(f"  ✓ Successfully downloaded: {success_count}")
    print(f"  ⊙ Skipped (already exists): {skip_count}")
    print(f"  ✗ Failed: {fail_count}")
    print(f"  Total: {success_count + skip_count + fail_count}")

if __name__ == '__main__':
    main()
