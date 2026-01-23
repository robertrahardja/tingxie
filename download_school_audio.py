#!/usr/bin/env python3
"""
Download Chinese audio for school tingxie sentences using Google Translate TTS
"""

import os
import time
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.parse import quote

# School tingxie sentences and phrases
SENTENCES = [
    # 听写一
    "保卫国家",
    "她们常常在一起玩成为了好朋友",
    "爸爸讲的故事真好听",
    "为了实现当医生的愿望我一定会努力学习",
    "老师发问时我第一个举手回答",

    # 听写二
    "弟弟常常问爸爸一些奇怪的问题",
    "我相信哥哥一定会把这件事做好",
    "我真的不明白这句话的意思",
    "今天风和日丽我兴高采烈地上学去",

    # 听写三
    "五颜六色",
    "小文买了一只蓝色的手表",
    "小丽是个好伙伴每天都和我一起回家",
    "小明早睡早起改掉了上学迟到的坏习惯",
    "每天早上闹钟一响我就起床",

    # 听写四
    "小猫找到妈妈向它跑去",
    "姐姐是个短头发的女孩",
    "阿姨的衣服好美啊",
    "听了老师的夸奖我的心里乐开了花",

    # 听写五
    "民众俱乐部",
    "我们可以看书或者画画",
    "吃完晚饭妈妈叫我扫地",
    "大家都准备好了我们出发吧",
    "巴士站就在我家附近",

    # 听写六
    "天黑了我们应该回家了",
    "小乐谢谢你扶我起来",
    "他撞倒了我我还没爬起来他就跑了",
    "听到这个坏消息我吓得脸色发白直冒冷汗",

    # 听写七
    "打破花盆",
    "他轻轻地推开房门",
    "他生病了所以没来上课",
    "妈妈留了一张便条给我",
    "你弄坏了他的眼镜应该赔钱",

    # 听写八
    "我先冲凉接着做功课",
    "老师开始上课了我们要专心听课",
    "我把桌椅排整齐后出了一身汗",
    "这件事情让我心乱如麻不知如何是好",

    # 听写九
    "想到办法",
    "他跳进河里救人",
    "我们知道这头大象的重量",
    "太阳慢慢地从海上升起",
    "这个问题太难了我们去问老师吧",
]

def download_google_tts(text):
    """Download audio from Google Translate"""
    audio_dir = Path("audio")
    audio_dir.mkdir(exist_ok=True)

    # Remove punctuation for filename
    clean_name = text.replace("，", "").replace("。", "").replace("！", "").replace("？", "").replace("、", "")
    filename = f"audio/{clean_name}.mp3"

    if os.path.exists(filename):
        print(f"✓ {text[:20]}... - already exists")
        return filename

    try:
        # Google Translate TTS URL
        url = f"https://translate.google.com/translate_tts?ie=UTF-8&q={quote(text)}&tl=zh-CN&client=tw-ob&ttsspeed=0.5"

        print(f"⏳ {text[:30]}...", end=" ", flush=True)

        req = Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })

        with urlopen(req, timeout=15) as response:
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
    print("Downloading school tingxie sentence audio files from Google Translate...\n")
    print(f"Total sentences: {len(SENTENCES)}\n")

    success = 0
    failed = 0

    for text in SENTENCES:
        result = download_google_tts(text)
        if result:
            success += 1
        else:
            failed += 1
        time.sleep(1.0)  # Rate limiting - longer delay for longer sentences

    print(f"\n✓ Done! Success: {success}, Failed: {failed}")

if __name__ == "__main__":
    main()
