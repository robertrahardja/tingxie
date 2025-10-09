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
            import json
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
    if generate_audio(word, filename):
        successful += 1
        print(f"✓ Generated {filename}")
    else:
        failed.append(word)
        print(f"✗ Failed to generate audio for {word}")

    # Small delay to avoid rate limiting
    time.sleep(0.5)

print(f"\nCompleted: {successful}/{len(vocabulary)} audio files generated")
if failed:
    print(f"Failed words: {', '.join(failed)}")