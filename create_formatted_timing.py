#!/usr/bin/env python3
"""
Map word-level timing data back to the original formatted text with punctuation
"""

import json

# Original text with punctuation and paragraph breaks
original_paragraphs = [
    "我的水壶是蓝色的，它是圆柱形的，上面画着漂亮的冰雪女王。水壶的旁边有一条细长的带子。一按按钮，盖子就会弹开。一打开盖子，吸管就会弹起来。水壶是我的好伙伴，我天天都带着它上学。",
    "我的文具盒是长方形的，上面画着一辆车。文具盒的里面装着各种各样的文具，有铅笔、尺子、橡皮、还有卷笔刀等。文具盒是我学习的好伙伴，我天天都带着它上学。",
    '我的闹钟是黄色的，它是圆形的，上面还"长"着两个可爱的"耳朵"。闹钟的里面画着一只米老鼠，只要闹钟一响起，我就会按掉起床去上课。它每天早上都会准时叫我起床，是我生活中离不开的好朋友。',
    "我的书包是黑色的，它是一个新型的书包，上面画着一个蝙蝠侠。这个书包有很多隔层，其中一个大点的可以装书，中间的装本子，小点的装文具之类的，两边的网包可以放水壶或者其它杂西。这个书包的背带很宽，再加上海绵垫，背起来很舒服，还可以把书包绑在腰上，这样跑起来的时候，书包就不会左右晃动。它每天早上陪我上学，下午伴我回家，真是我学习上的好帮手。",
    "我的手表是粉红色的，它是爱心形的手表！它还有一个表盖，上面画着一只蝴蝶的图案。表盖旁边有一个按钮，一按按钮，表盖就会打开，我就能看到时间。自从有了这只手表，我每天早睡早起，准时上学。这只手表天天陪伴我，真是我的好伙伴。"
]

# Load timing data
with open('audio/koushi/P3HCL_3_timing.json', 'r', encoding='utf-8') as f:
    timing_data = json.load(f)

words = timing_data['words']

# Create character-level timing map
char_timing = []
word_index = 0

# Skip the first few words that are not part of the main text
# (e.g., "阅读计划 介绍我的物品")
skip_phrases = ["阅", "读", "计", "划", "介", "绍", "我的", "物", "品"]
for phrase in skip_phrases:
    if word_index < len(words) and words[word_index]['word'] == phrase:
        word_index += 1

# Process each paragraph
for para_idx, paragraph in enumerate(original_paragraphs):
    para_chars = []
    char_idx = 0

    while char_idx < len(paragraph):
        char = paragraph[char_idx]

        # Skip punctuation - use timing from adjacent word
        if char in '，。、""！？（）':
            if para_chars:
                # Use end time of previous character, with small duration
                prev_timing = para_chars[-1]
                para_chars.append({
                    'char': char,
                    'start': prev_timing['end'],
                    'end': prev_timing['end'] + 0.05
                })
            else:
                para_chars.append({'char': char, 'start': 0, 'end': 0.05})
            char_idx += 1
            continue

        # Try to match word from timing data
        if word_index < len(words):
            word_data = words[word_index]
            word_text = word_data['word']

            # Check if current position matches this word
            matched = False
            if paragraph[char_idx:char_idx+len(word_text)] == word_text:
                # Multi-character word (e.g., "我的", "水壶")
                duration = word_data['end'] - word_data['start']
                char_duration = duration / len(word_text)

                for i, c in enumerate(word_text):
                    para_chars.append({
                        'char': c,
                        'start': word_data['start'] + (i * char_duration),
                        'end': word_data['start'] + ((i + 1) * char_duration)
                    })

                char_idx += len(word_text)
                word_index += 1
                matched = True
            elif char == word_text:
                # Single character word
                para_chars.append({
                    'char': char,
                    'start': word_data['start'],
                    'end': word_data['end']
                })
                char_idx += 1
                word_index += 1
                matched = True

            if not matched:
                # Character doesn't match - might be transcription difference
                # Use approximate timing
                if para_chars:
                    prev = para_chars[-1]
                    para_chars.append({
                        'char': char,
                        'start': prev['end'],
                        'end': prev['end'] + 0.1
                    })
                else:
                    para_chars.append({'char': char, 'start': 0, 'end': 0.1})
                char_idx += 1
        else:
            # Ran out of timing data - approximate
            if para_chars:
                prev = para_chars[-1]
                para_chars.append({
                    'char': char,
                    'start': prev['end'],
                    'end': prev['end'] + 0.1
                })
            else:
                para_chars.append({'char': char, 'start': 0, 'end': 0.1})
            char_idx += 1

    char_timing.append(para_chars)

# Save formatted timing data
output = {
    'paragraphs': [
        {
            'text': para,
            'chars': chars
        }
        for para, chars in zip(original_paragraphs, char_timing)
    ]
}

with open('audio/koushi/P3HCL_3_formatted_timing.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print("✅ Formatted timing data created!")
print(f"   Paragraphs: {len(original_paragraphs)}")
print(f"   Total characters: {sum(len(p['chars']) for p in output['paragraphs'])}")
