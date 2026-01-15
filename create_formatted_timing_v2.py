#!/usr/bin/env python3
"""
Improved version: Map word-level timing to original formatted text
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

# Combine all paragraphs into one string (for matching)
all_text = ''.join(original_paragraphs)
# Remove punctuation for matching with transcription
text_no_punct = ''.join(c for c in all_text if c not in '，。、""！？（）')

print(f"Original text (no punctuation): {len(text_no_punct)} chars")
print(f"First 50 chars: {text_no_punct[:50]}")

# Load timing data
with open('audio/koushi/P3HCL_3_timing.json', 'r', encoding='utf-8') as f:
    timing_data = json.load(f)

words = timing_data['words']
print(f"\nWhisper words: {len(words)} words")

# Reconstruct the transcribed text (no punctuation)
transcribed = ''.join(w['word'] for w in words)
print(f"Transcribed text: {len(transcribed)} chars")
print(f"First 50 chars: {transcribed[:50]}")

# Find where the actual content starts in the transcription
# Skip the intro "阅读计划介绍我的物品"
intro_text = "阅读计划介绍我的物品"
transcribed_without_intro = transcribed[len(intro_text):]
print(f"\nAfter removing intro: {len(transcribed_without_intro)} chars")
print(f"First 50 chars: {transcribed_without_intro[:50]}")

# Find the word index where content starts
word_idx = 0
chars_count = 0
while chars_count < len(intro_text) and word_idx < len(words):
    chars_count += len(words[word_idx]['word'])
    word_idx += 1

print(f"\nContent starts at word index: {word_idx}")
print(f"Starting word: '{words[word_idx]['word']}' at {words[word_idx]['start']:.2f}s")

# Now map each character in original text to timing
result_paragraphs = []

text_idx = 0  # Index in text_no_punct (original without punctuation)

for para in original_paragraphs:
    para_chars = []

    for char in para:
        if char in '，。、""！？（）':
            # Punctuation - use same timing as previous char (zero duration)
            if para_chars:
                prev = para_chars[-1]
                para_chars.append({
                    'char': char,
                    'start': prev['end'],
                    'end': prev['end']  # Zero duration for punctuation
                })
            else:
                para_chars.append({
                    'char': char,
                    'start': 0,
                    'end': 0
                })
        else:
            # Regular character - find matching word
            if word_idx < len(words):
                word = words[word_idx]
                word_text = word['word']

                # For multi-char words, calculate per-character timing
                if len(word_text) > 1:
                    # Find which character in the word this is
                    word_start_idx = transcribed_without_intro.find(word_text, text_idx - len(intro_text))
                    if word_start_idx != -1:
                        char_pos_in_word = (text_idx - len(intro_text)) - word_start_idx
                        if 0 <= char_pos_in_word < len(word_text):
                            duration = word['end'] - word['start']
                            char_duration = duration / len(word_text)
                            start_time = word['start'] + (char_pos_in_word * char_duration)
                            end_time = start_time + char_duration

                            para_chars.append({
                                'char': char,
                                'start': start_time,
                                'end': end_time
                            })

                            # Move to next word if we finished this one
                            if char_pos_in_word == len(word_text) - 1:
                                word_idx += 1
                        else:
                            # Fallback
                            para_chars.append({
                                'char': char,
                                'start': word['start'],
                                'end': word['end']
                            })
                            word_idx += 1
                    else:
                        # Fallback
                        para_chars.append({
                            'char': char,
                            'start': word['start'],
                            'end': word['end']
                        })
                        word_idx += 1
                else:
                    # Single character word
                    para_chars.append({
                        'char': char,
                        'start': word['start'],
                        'end': word['end']
                    })
                    word_idx += 1

                text_idx += 1
            else:
                # Ran out of timing - use last timing + offset
                if para_chars:
                    prev = para_chars[-1]
                    para_chars.append({
                        'char': char,
                        'start': prev['end'],
                        'end': prev['end'] + 0.1
                    })
                else:
                    para_chars.append({
                        'char': char,
                        'start': 0,
                        'end': 0.1
                    })

    result_paragraphs.append({
        'text': para,
        'chars': para_chars
    })

# Save result
output = {'paragraphs': result_paragraphs}

with open('audio/koushi/P3HCL_3_formatted_timing.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"\n✅ Formatted timing data created!")
print(f"   Paragraphs: {len(result_paragraphs)}")
print(f"   Total characters: {sum(len(p['chars']) for p in result_paragraphs)}")

# Show first few characters of first paragraph
print(f"\n   First paragraph starts at: {result_paragraphs[0]['chars'][0]['start']:.2f}s")
print(f"   First 5 chars with timing:")
for i, c in enumerate(result_paragraphs[0]['chars'][:5]):
    print(f"     '{c['char']}': {c['start']:.2f}s - {c['end']:.2f}s")
