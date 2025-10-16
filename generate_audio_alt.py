#!/usr/bin/env python3
import os
import time
import json
import requests
from urllib.parse import quote

# Load vocabulary from JSON file
def load_vocabulary():
    """Load all unique words from tingxie_vocabulary.json"""
    with open('data/tingxie/tingxie_vocabulary.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    words = set()
    for row in data['vocabulary']:
        for word_entry in row['words']:
            words.add(word_entry['simplified'])

    return sorted(list(words))

def generate_audio_google(text, filename):
    """Generate audio file using Google Translate TTS"""
    try:
        # Using Google Translate TTS (unofficial)
        encoded_text = quote(text)
        url = f"https://translate.google.com/translate_tts?ie=UTF-8&tl=zh-CN&client=tw-ob&q={encoded_text}"

        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Referer': 'https://translate.google.com/'
        }

        response = requests.get(url, headers=headers, timeout=10)

        if response.status_code == 200 and len(response.content) > 1000:
            with open(filename, 'wb') as f:
                f.write(response.content)
            return True
        return False
    except Exception as e:
        print(f"  Error: {e}")
        return False

# Load vocabulary from JSON
print("Loading vocabulary from JSON...")
vocabulary = load_vocabulary()
print(f"Found {len(vocabulary)} unique words\n")

# Generate audio files for all vocabulary
print("Generating audio files using Google TTS...")
os.makedirs('audio', exist_ok=True)

successful = 0
failed = []
skipped = 0

for i, word in enumerate(vocabulary, 1):
    filename = f"audio/{word}.mp3"
    if os.path.exists(filename):
        skipped += 1
        continue

    print(f"[{i}/{len(vocabulary)}] {word}...", end=" ")

    if generate_audio_google(word, filename):
        successful += 1
        print("✓")
    else:
        failed.append(word)
        print("✗")

    # Small delay to avoid rate limiting
    time.sleep(0.3)

print(f"\nCompleted:")
print(f"  - Skipped (already exist): {skipped}")
print(f"  - Successfully generated: {successful}")
print(f"  - Failed: {len(failed)}")
print(f"  - Total: {skipped + successful}/{len(vocabulary)}")

if failed:
    print(f"\nFailed words ({len(failed)}): {', '.join(failed)}")
