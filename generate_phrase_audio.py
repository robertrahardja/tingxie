#!/usr/bin/env python3
"""
Download Chinese audio for phrase matching page using Google Translate TTS
"""

import os
import time
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.parse import quote

PHRASES = [
    "很多颜色",
    "颜色鲜艳",
    "五颜六色",
    "学习成绩",
    "合作伙伴",
    "工作伙伴",
    "很多按钮",
    "电梯按钮",
    "改掉恶习",
    "改掉坏毛病",
    "改掉恶习惯",
    "马上睡觉",
    "上床睡觉",
    "智力超人",
    "养成习惯",
    "良好习惯",
    "生活习惯",
    "上学迟到",
    "总是迟到",
    "准时到达",
    "准时出发",
    "一根吸管",
    "使用吸管",
    "形状好看",
    "各种形状"
]

def download_google_tts(phrase):
    """Download audio from Google Translate"""
    audio_dir = Path("audio")
    audio_dir.mkdir(exist_ok=True)

    filename = f"audio/{phrase}.mp3"

    if os.path.exists(filename):
        print(f"✓ {phrase} - already exists")
        return filename

    try:
        # Google Translate TTS URL
        url = f"https://translate.google.com/translate_tts?ie=UTF-8&q={quote(phrase)}&tl=zh-CN&client=tw-ob&ttsspeed=0.5"

        print(f"⏳ {phrase}...", end=" ", flush=True)

        req = Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })

        with urlopen(req, timeout=10) as response:
            data = response.read()

            if len(data) > 1000:  # Valid MP3 should be at least 1KB
                with open(filename, 'wb') as f:
                    f.write(data)
                print(f"✓ ({len(data)} bytes)")
                return filename
            else:
                print(f"✗ (invalid file size: {len(data)})")
                return None

    except Exception as e:
        print(f"✗ ({str(e)[:50]})")
        return None

def main():
    print("Downloading phrase audio files from Google Translate...\n")

    success_count = 0
    failed = []

    for phrase in PHRASES:
        result = download_google_tts(phrase)
        if result:
            success_count += 1
        else:
            failed.append(phrase)
        time.sleep(0.8)  # Rate limiting

    print(f"\n✓ Done! Successfully downloaded {success_count}/{len(PHRASES)} files")

    if failed:
        print(f"\n✗ Failed phrases: {', '.join(failed)}")

if __name__ == "__main__":
    main()
