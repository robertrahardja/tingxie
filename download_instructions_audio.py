#!/usr/bin/env python3
"""
Download Chinese audio for instruction terms using Google Translate TTS
"""

import os
import time
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.parse import quote

# All instruction terms
instruction_terms = [
    "字词学习",
    "序号",
    "识写字词",
    "识读字词",
    "解释",
    "构词",
    "搭配",
    "例句",
    "读一读",
    "词语搭配",
    "听写词语",
    "语文应用",
    "从所提供的选项中选出正确的答案",
    "本页得分",
    "选出适当的词语",
    "把代表它的数字填写在括号里",
    "改写句子",
    "把两个句子合并成一个完整的句子",
    "加上适当的标点符号",
    "组句成段",
    "按正确的顺序将句子排列出来",
    "在括号里写上序号",
    "阅读计划",
    "阅读作品",
    "阅读时间",
    "分钟",
    "考查情况",
    "考查标准",
    "请家长在以上的时间栏里签名",
    "阅读，是生命的源泉",
    "看图说话",
    "描述图片",
    "感受",
    "看法",
    "原因",
    "如果",
]

def download_google_tts(word):
    """Download audio from Google Translate"""
    audio_dir = Path("audio")
    audio_dir.mkdir(exist_ok=True)

    filename = f"audio/{word}.mp3"

    if os.path.exists(filename):
        print(f"✓ {word} - already exists")
        return filename

    try:
        # Google Translate TTS URL
        url = f"https://translate.google.com/translate_tts?ie=UTF-8&q={quote(word)}&tl=zh-CN&client=tw-ob&ttsspeed=0.5"

        print(f"⏳ {word}...", end=" ", flush=True)

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
    print("Downloading audio for instruction terms...\n")
    print(f"Found {len(instruction_terms)} terms to download\n")

    success = 0
    failed = 0

    for word in instruction_terms:
        result = download_google_tts(word)
        if result:
            success += 1
        else:
            failed += 1
        time.sleep(0.8)  # Rate limiting

    print(f"\n✓ Done! Success: {success}, Failed: {failed}")

if __name__ == "__main__":
    main()
