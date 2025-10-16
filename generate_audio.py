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

        response = requests.post(url, data=data, headers=headers)

        if response.status_code == 200:
            # Parse the response to get the MP3 URL
            result = response.json()
            if 'URL' in result:
                mp3_url = result['URL']

                # Download the MP3 file
                mp3_response = requests.get(mp3_url)
                if mp3_response.status_code == 200:
                    with open(filename, 'wb') as f:
                        f.write(mp3_response.content)
                    return True

        return False
    except Exception as e:
        print(f"Error generating audio for {text}: {e}")
        return False

# Load vocabulary from JSON
print("Loading vocabulary from JSON...")
vocabulary = load_vocabulary()
print(f"Found {len(vocabulary)} unique words")

# Generate audio files for all vocabulary
print("\nGenerating audio files...")
os.makedirs('audio', exist_ok=True)

successful = 0
failed = []
skipped = 0

for word in vocabulary:
    filename = f"audio/{word}.mp3"
    if os.path.exists(filename):
        skipped += 1
        continue

    print(f"Generating audio for: {word}")
    if generate_audio(word, filename):
        successful += 1
        print(f"✓ Generated {filename}")
    else:
        failed.append(word)
        print(f"✗ Failed to generate audio for {word}")

    # Small delay to avoid rate limiting
    time.sleep(0.5)

print(f"\nCompleted:")
print(f"  - Skipped (already exist): {skipped}")
print(f"  - Successfully generated: {successful}")
print(f"  - Total: {skipped + successful}/{len(vocabulary)}")

if failed:
    print(f"\nFailed words ({len(failed)}): {', '.join(failed)}")
