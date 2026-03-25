#!/usr/bin/env python3
"""
Extract P1-P3 curriculum vocabulary from the seed SQL file and generate
a JSON data file for the tingxie app.
"""
import json
import re
import sys
from pathlib import Path

SEED_SQL = Path.home() / "Projects/startech/chinese_edu_sass/scripts/curriculum_words_seed.sql"
TINGXIE_VOCAB = Path(__file__).resolve().parent.parent / "public/data/tingxie/tingxie_vocabulary.json"
OUTPUT = Path(__file__).resolve().parent.parent / "public/data/curriculum_p1_p3.json"

def parse_seed_sql():
    """Parse INSERT statements from the seed SQL."""
    words = []
    with open(SEED_SQL) as f:
        for line in f:
            if not line.startswith("INSERT OR IGNORE INTO curriculum_words"):
                continue
            # Extract the VALUES portion
            m = re.search(r"VALUES \((.+)\);$", line.strip())
            if not m:
                continue
            vals_str = m.group(1)
            # Parse values - handle quoted strings and numbers
            vals = []
            i = 0
            while i < len(vals_str):
                c = vals_str[i]
                if c == "'":
                    # Find closing quote, handling escaped quotes
                    j = i + 1
                    while j < len(vals_str):
                        if vals_str[j] == "'" and (j + 1 >= len(vals_str) or vals_str[j + 1] != "'"):
                            break
                        if vals_str[j] == "'" and j + 1 < len(vals_str) and vals_str[j + 1] == "'":
                            j += 2
                            continue
                        j += 1
                    vals.append(vals_str[i + 1:j].replace("''", "'"))
                    i = j + 1
                elif c in ' ,':
                    i += 1
                elif c.isdigit() or c == '-':
                    j = i + 1
                    while j < len(vals_str) and (vals_str[j].isdigit() or vals_str[j] == '.'):
                        j += 1
                    vals.append(int(vals_str[i:j]) if '.' not in vals_str[i:j] else float(vals_str[i:j]))
                    i = j
                elif vals_str[i:i+4] == 'NULL':
                    vals.append(None)
                    i += 4
                else:
                    i += 1

            if len(vals) >= 14:
                # id, simplified, traditional, pinyin, english, char_count, intro_level, intro_level_num, intro_source, hsk_level, frequency_rank, all_chars_moe, total_exam_count, source_count
                words.append({
                    'id': vals[0],
                    'simplified': vals[1],
                    'traditional': vals[2],
                    'pinyin': vals[3],
                    'english': vals[4],
                    'char_count': vals[5],
                    'intro_level': vals[6],
                    'intro_level_num': vals[7],
                    'intro_source': vals[8],
                    'hsk_level': vals[9],
                    'frequency_rank': vals[10],
                    'all_chars_moe': vals[11],
                    'total_exam_count': vals[12],
                    'source_count': vals[13],
                })
    return words


def load_existing_words():
    """Load existing tingxie words to exclude."""
    existing = set()
    with open(TINGXIE_VOCAB) as f:
        data = json.load(f)
    for row in data['vocabulary']:
        for w in row['words']:
            existing.add(w['simplified'])
    return existing


def main():
    all_words = parse_seed_sql()
    print(f"Parsed {len(all_words)} total words from seed SQL")

    existing = load_existing_words()
    print(f"Existing tingxie words: {len(existing)}")

    # Filter: P1-P3, multi-char, all chars in MOE, has pinyin+english, not already in tingxie
    filtered = [
        w for w in all_words
        if w['intro_level_num'] <= 3
        and w['char_count'] >= 2
        and w['all_chars_moe'] == 1
        and w['pinyin'] and w['pinyin'] != ''
        and w['english'] and w['english'] != ''
        and w['simplified'] not in existing
    ]
    print(f"Filtered P1-P3 multi-char words (excl existing): {len(filtered)}")

    # Sort by level, then by exam frequency (most common first)
    filtered.sort(key=lambda w: (w['intro_level_num'], -w['total_exam_count']))

    # Group into rows of 10 words, organized by level
    output = {
        "title": "P1-P3 课程词语",
        "description": "Primary 1 to Primary 3 curriculum vocabulary extracted from MOE character lists and exam papers",
        "levels": {}
    }

    for level in ['P1', 'P2', 'P3']:
        level_words = [w for w in filtered if w['intro_level'] == level]
        rows = []
        row_num = 1
        for i in range(0, len(level_words), 10):
            chunk = level_words[i:i+10]
            row = {
                "row": row_num,
                "words": []
            }
            for w in chunk:
                word_entry = {
                    "simplified": w['simplified'],
                    "traditional": w['traditional'] if w['traditional'] else w['simplified'],
                    "pinyin": w['pinyin'],
                    "english": w['english'].split(';')[0].strip(),  # First definition only
                    "audio": f"audio/{w['simplified']}.mp3",
                    "exam_frequency": w['total_exam_count'],
                    "hsk_level": w['hsk_level'],
                }
                row["words"].append(word_entry)
            rows.append(row)
            row_num += 1
        output["levels"][level] = {
            "word_count": len(level_words),
            "row_count": len(rows),
            "rows": rows
        }
        print(f"  {level}: {len(level_words)} words in {len(rows)} rows")

    with open(OUTPUT, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print(f"\nWrote {OUTPUT}")
    print(f"Total words: {sum(v['word_count'] for v in output['levels'].values())}")


if __name__ == '__main__':
    main()
