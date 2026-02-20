#!/usr/bin/env python3
import os
import time
import json
import requests
import subprocess

def generate_audio_with_espeak(text, filename):
    """Generate audio file using espeak (offline)"""
    try:
        # Using espeak for text-to-speech
        subprocess.run([
            'espeak-ng',
            '-v', 'zh',
            '-w', filename,
            text
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return True
    except Exception as e:
        print(f"Error with espeak: {e}")
        return False

def generate_audio_with_google(text, filename):
    """Generate audio file using Google Translate API"""
    try:
        # Google Translate TTS endpoint
        url = "https://translate.google.com/translate_tts"
        params = {
            'client': 'tw-ob',
            'q': text,
            'tl': 'zh-CN',
            'total': 1,
            'idx': 0
        }

        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }

        response = requests.get(url, params=params, headers=headers, timeout=10)

        if response.status_code == 200 and len(response.content) > 1000:
            with open(filename, 'wb') as f:
                f.write(response.content)
            return True

        return False
    except Exception as e:
        print(f"Error with Google: {e}")
        return False

# Load word collocations from JSON
print("Loading word collocations from JSON...")
with open('public/data/tingxie/word_collocations.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

words = [word['simplified'] for word in data['vocabulary']]
print(f"Found {len(words)} words to generate audio for")

# Generate audio files
print("\nGenerating audio files (using Google Translate TTS)...")
os.makedirs('public/audio', exist_ok=True)

successful = 0
failed = []
skipped = 0

for idx, word in enumerate(words, 1):
    filename = f"public/audio/{word}.mp3"
    if os.path.exists(filename):
        print(f"[{idx}/{len(words)}] ✓ Skipping (exists): {word}")
        skipped += 1
        continue

    print(f"[{idx}/{len(words)}] Generating audio for: {word}...", end=" ", flush=True)
    if generate_audio_with_google(word, filename):
        successful += 1
        print(f"✓")
        time.sleep(0.3)  # Rate limiting
    else:
        failed.append(word)
        print(f"✗")

print(f"\n{'='*50}")
print(f"✓ Successfully generated: {successful}")
print(f"⊘ Skipped (already exist): {skipped}")
print(f"✗ Failed: {len(failed)}")
print(f"{'='*50}")

if failed:
    print(f"\nFailed words ({len(failed)}):")
    for word in failed:
        print(f"  - {word}")
else:
    print("\n✓ All audio files generated successfully!")
