#!/usr/bin/env python3
"""
Script to add new tingxie words with pinyin, English meanings, and audio
"""

import json
import os
import urllib.request
import urllib.error
import urllib.parse
import time
from pathlib import Path

# New words from the screenshot
NEW_WORDS = [
    {"simplified": "姓名", "number": 1},
    {"simplified": "肥瘦", "number": 2},
    {"simplified": "意思", "number": 3},
    {"simplified": "懂事", "number": 4},
    {"simplified": "聪明", "number": 5},
    {"simplified": "头发卷卷", "number": 6},
    {"simplified": "因为", "number": 7},
    {"simplified": "语言", "number": 8},
    {"simplified": "谈天", "number": 9},
    {"simplified": "相信", "number": 10},
    {"simplified": "一定", "number": 11},
    {"simplified": "矮小", "number": 12},
    {"simplified": "姐姐", "number": 13},
    {"simplified": "后退", "number": 14},
    {"simplified": "问题奇怪", "number": 15},
]

# Pinyin and English meanings (manually verified)
WORD_DATA = {
    "姓名": {"pinyin": "xìng míng", "english": "name", "traditional": "姓名"},
    "肥瘦": {"pinyin": "féi shòu", "english": "fat or thin", "traditional": "肥瘦"},
    "意思": {"pinyin": "yì si", "english": "meaning", "traditional": "意思"},
    "懂事": {"pinyin": "dǒng shi", "english": "sensible, mature", "traditional": "懂事"},
    "聪明": {"pinyin": "cōng míng", "english": "intelligent, clever", "traditional": "聰明"},
    "头发卷卷": {"pinyin": "tóu fa juǎn juǎn", "english": "curly hair", "traditional": "頭髮卷卷"},
    "因为": {"pinyin": "yīn wèi", "english": "because", "traditional": "因為"},
    "语言": {"pinyin": "yǔ yán", "english": "language", "traditional": "語言"},
    "谈天": {"pinyin": "tán tiān", "english": "to chat, to talk", "traditional": "談天"},
    "相信": {"pinyin": "xiāng xìn", "english": "to believe, to trust", "traditional": "相信"},
    "一定": {"pinyin": "yī dìng", "english": "definitely, certainly", "traditional": "一定"},
    "矮小": {"pinyin": "ǎi xiǎo", "english": "short and small", "traditional": "矮小"},
    "姐姐": {"pinyin": "jiě jie", "english": "older sister", "traditional": "姐姐"},
    "后退": {"pinyin": "hòu tuì", "english": "to retreat, to step back", "traditional": "後退"},
    "问题奇怪": {"pinyin": "wèn tí qí guài", "english": "strange questions", "traditional": "問題奇怪"},
}

def download_audio(word, max_retries=3):
    """Download audio from Google Translate TTS"""
    audio_dir = Path("audio")
    audio_dir.mkdir(exist_ok=True)

    filename = f"audio/{word}.mp3"

    # Skip if already exists
    if os.path.exists(filename):
        print(f"✓ Audio already exists: {filename}")
        return filename

    # Try multiple methods
    for attempt in range(max_retries):
        try:
            # Using ttsMP3.com API with proper URL encoding
            text_encoded = urllib.parse.quote(word)
            url = f"https://ttsmp3.com/api/convert?text={text_encoded}&lang=zh-cn&rate=0.6&vocals=0&emotion=1"

            print(f"Downloading audio for '{word}'... (attempt {attempt + 1}/{max_retries})")
            req = urllib.request.Request(
                url,
                headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            )

            with urllib.request.urlopen(req, timeout=10) as response:
                data = response.read()

                # Check if it's a valid MP3 (starts with ID3 or FF tag)
                if len(data) > 10 and (data[:3] == b'ID3' or data[:2] == b'\xff\xfb'):
                    with open(filename, 'wb') as f:
                        f.write(data)
                    print(f"✓ Downloaded: {filename} ({len(data)} bytes)")
                    return filename
                else:
                    print(f"✗ Invalid audio file (not MP3)")

        except urllib.error.HTTPError as e:
            print(f"✗ HTTP Error {e.code}: {e.reason}")
        except urllib.error.URLError as e:
            print(f"✗ URL Error: {e.reason}")
        except Exception as e:
            print(f"✗ Error: {str(e)}")

        if attempt < max_retries - 1:
            wait_time = 2 ** attempt
            print(f"  Retrying in {wait_time}s...")
            time.sleep(wait_time)

    print(f"⚠ Failed to download audio for '{word}' after {max_retries} attempts")
    return filename  # Return expected filename anyway

def update_vocabulary_json():
    """Update the main vocabulary JSON file"""
    vocab_file = "data/tingxie/tingxie_vocabulary.json"

    # Read existing vocabulary
    with open(vocab_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Find or create the row for new words (row 3)
    row_3_exists = any(item['row'] == 3 for item in data['vocabulary'])

    if not row_3_exists:
        # Add new row 3
        new_row = {"row": 3, "words": []}
        data['vocabulary'].append(new_row)
    else:
        new_row = next(item for item in data['vocabulary'] if item['row'] == 3)

    # Add new words to row 3
    for word_info in NEW_WORDS:
        simplified = word_info['simplified']

        if simplified not in WORD_DATA:
            print(f"⚠ Skipping '{simplified}' - no data found")
            continue

        details = WORD_DATA[simplified]

        word_obj = {
            "simplified": simplified,
            "traditional": details['traditional'],
            "pinyin": details['pinyin'],
            "english": details['english'],
            "audio": f"audio/{simplified}.mp3",
            "important": True  # New words are important
        }

        # Check if word already exists
        if not any(w['simplified'] == simplified for w in new_row['words']):
            new_row['words'].append(word_obj)
            print(f"Added: {simplified} ({details['pinyin']})")

    # Write updated vocabulary
    with open(vocab_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\n✓ Updated {vocab_file}")

def main():
    print("Adding new tingxie words...\n")

    # Download audio files
    print("Step 1: Downloading audio files")
    print("=" * 50)
    for word in WORD_DATA.keys():
        download_audio(word)
        time.sleep(0.5)  # Rate limiting

    print("\nStep 2: Updating vocabulary.json")
    print("=" * 50)
    update_vocabulary_json()

    print("\n✓ Done!")
    print("\nNew words added:")
    for simplified, details in WORD_DATA.items():
        print(f"  {simplified} - {details['pinyin']} - {details['english']}")

if __name__ == "__main__":
    main()
