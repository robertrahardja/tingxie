#!/usr/bin/env python3
"""
Download Chinese audio for school vocabulary using Google Translate TTS
"""

import os
import time
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.parse import quote

# School vocabulary words - 9 sets
SCHOOL_WORDS = [
    # 听写一 - 家人
    "奶奶", "爷爷", "爸爸", "妈妈", "哥哥", "姐姐", "弟弟", "妹妹", "叔叔", "阿姨",
    # 听写二 - 亲戚
    "公公", "婆婆", "外公", "外婆", "伯伯", "舅舅", "姑姑", "表哥", "表姐", "堂弟",
    # 听写三 - 人物
    "老师", "同学", "朋友", "邻居", "医生", "护士", "警察", "司机", "工人", "农民",
    # 听写四 - 学校
    "学校", "教室", "操场", "食堂", "图书馆", "厕所", "办公室", "礼堂", "花园", "游泳池",
    # 听写五 - 文具
    "书包", "铅笔", "橡皮", "尺子", "本子", "课本", "水壶", "饭盒", "雨伞", "手表",
    # 听写六 - 时间
    "早上", "中午", "下午", "晚上", "今天", "明天", "昨天", "星期", "月", "年",
    # 听写七 - 天气
    "春天", "夏天", "秋天", "冬天", "太阳", "月亮", "星星", "云", "风", "雨",
    # 听写八 - 颜色
    "红色", "黄色", "蓝色", "绿色", "白色", "黑色", "紫色", "粉色", "橙色", "灰色",
    # 听写九 - 水果
    "苹果", "香蕉", "葡萄", "西瓜", "草莓", "橘子", "桃子", "梨", "芒果", "榴莲",
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
    print("Downloading school vocabulary audio files from Google Translate...\n")
    print(f"Total words: {len(SCHOOL_WORDS)}\n")

    success = 0
    failed = 0

    for word in SCHOOL_WORDS:
        result = download_google_tts(word)
        if result:
            success += 1
        else:
            failed += 1
        time.sleep(0.8)  # Rate limiting

    print(f"\n✓ Done! Success: {success}, Failed: {failed}")

if __name__ == "__main__":
    main()
