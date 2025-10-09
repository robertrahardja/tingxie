#!/usr/bin/env python3
import os
import time
import requests
from urllib.parse import quote

# New tingxie vocabulary words from image
vocabulary = [
    "美丽", "新加坡", "合适", "年级", "兄弟",
    "大扫除", "时候", "表演", "拿着", "庆祝",
    "主人", "非常", "第一", "筷子", "伸出舌头",
    "排队", "从前", "然后", "每一页", "彩色笔",
    "哪里", "不远处", "很久", "已经", "向前直走",
    "回答问题", "明亮", "应该", "行人天桥", "互相",
    "奶茶", "星期天", "懂事", "找座位", "收拾",
    "医生", "卖菜", "种花", "坏人", "害怕"
]

# Remove duplicates
vocabulary = list(dict.fromkeys(vocabulary))

def generate_audio_shtooka(text, filename):
    """Generate audio file using Shtooka service"""
    try:
        # Using shtooka.net API
        encoded_text = quote(text)
        url = f"http://shtooka.net/speak/mandarin/{encoded_text}"

        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }

        response = requests.get(url, headers=headers, timeout=10)

        if response.status_code == 200 and len(response.content) > 1000:
            with open(filename, 'wb') as f:
                f.write(response.content)
            return True
        return False
    except Exception as e:
        print(f"Shtooka error for {text}: {e}")
        return False

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
        print(f"Google TTS error for {text}: {e}")
        return False

# Generate audio files for all vocabulary
print("Generating audio files...")
os.makedirs('audio', exist_ok=True)

successful = 0
failed = []

for word in vocabulary:
    filename = f"audio/{word}.mp3"
    if os.path.exists(filename):
        print(f"Skipping {word} - file already exists")
        successful += 1
        continue

    print(f"Generating audio for: {word}")

    # Try Google TTS first
    if generate_audio_google(word, filename):
        successful += 1
        print(f"✓ Generated {filename} (Google TTS)")
    # Fallback to Shtooka
    elif generate_audio_shtooka(word, filename):
        successful += 1
        print(f"✓ Generated {filename} (Shtooka)")
    else:
        failed.append(word)
        print(f"✗ Failed to generate audio for {word}")

    # Small delay to avoid rate limiting
    time.sleep(0.3)

print(f"\nCompleted: {successful}/{len(vocabulary)} audio files generated")
if failed:
    print(f"Failed words: {', '.join(failed)}")