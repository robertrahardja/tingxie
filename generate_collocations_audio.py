#!/usr/bin/env python3
import os
import time
import json
import requests

def generate_audio(text, filename):
    """Generate audio file using TTS service"""
    try:
        # Using ttsmp3.com API (free, no auth required)
        url = f"https://ttsmp3.com/makemp3_new.php"

        # Request parameters
        data = {
            'msg': text,
            'lang': 'zh-CN',
            'source': 'ttsmp3'
        }

        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }

        response = requests.post(url, data=data, headers=headers, timeout=10)

        if response.status_code == 200:
            # Parse the response to get the MP3 URL
            result = response.json()
            if 'URL' in result:
                mp3_url = result['URL']

                # Download the MP3 file
                mp3_response = requests.get(mp3_url, timeout=10)
                if mp3_response.status_code == 200:
                    with open(filename, 'wb') as f:
                        f.write(mp3_response.content)
                    return True

        return False
    except Exception as e:
        print(f"Error generating audio for {text}: {e}")
        return False

# Load word collocations from JSON
print("Loading word collocations from JSON...")
with open('public/data/tingxie/word_collocations.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

words = [word['simplified'] for word in data['vocabulary']]
print(f"Found {len(words)} words to generate audio for")

# Generate audio files
print("\nGenerating audio files...")
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
    if generate_audio(word, filename):
        successful += 1
        print(f"✓")
        time.sleep(0.5)  # Rate limiting
    else:
        failed.append(word)
        print(f"✗")

print(f"\n{'='*50}")
print(f"✓ Successfully generated: {successful}")
print(f"⊘ Skipped (already exist): {skipped}")
print(f"✗ Failed: {len(failed)}")
print(f"{'='*50}")

if failed:
    print(f"\nFailed words:")
    for word in failed:
        print(f"  - {word}")
else:
    print("\n✓ All audio files generated successfully!")
