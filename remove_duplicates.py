#!/usr/bin/env python3

import json

# Load the JSON file
with open('data/tingxie/tingxie_vocabulary.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Track seen words and remove duplicates
seen = set()
rows_to_update = []

for row in data['vocabulary']:
    new_words = []
    for word_entry in row['words']:
        word = word_entry['simplified']
        if word not in seen:
            seen.add(word)
            new_words.append(word_entry)
        else:
            print(f"Removing duplicate: {word} from row {row['row']}")

    row['words'] = new_words
    rows_to_update.append(row)

# Remove any rows that became empty
data['vocabulary'] = [row for row in rows_to_update if len(row['words']) > 0]

# Renumber rows
for idx, row in enumerate(data['vocabulary'], 1):
    row['row'] = idx

# Save the updated JSON file
with open('data/tingxie/tingxie_vocabulary.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"\nDuplicates removed successfully!")
print(f"Total rows after cleanup: {len(data['vocabulary'])}")

# Count total words
total_words = sum(len(row['words']) for row in data['vocabulary'])
print(f"Total unique words: {total_words}")
