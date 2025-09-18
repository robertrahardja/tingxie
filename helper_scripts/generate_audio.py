#!/usr/bin/env python3
"""
Generate MP3 audio files for Chinese vocabulary using gTTS
"""

import json
import os
from gtts import gTTS
import time

def generate_audio_file(text, output_path):
    """Generate an MP3 file for the given Chinese text"""
    try:
        # Create gTTS object with Chinese language
        tts = gTTS(text=text, lang='zh-CN', slow=False)
        
        # Save the audio file
        tts.save(output_path)
        print(f"✓ Generated: {output_path}")
        return True
    except Exception as e:
        print(f"✗ Failed to generate {output_path}: {str(e)}")
        return False

def main():
    # Load vocabulary data
    with open('../data/tingxie/tingxie_vocabulary.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Create audio directory if it doesn't exist
    os.makedirs('../audio', exist_ok=True)
    
    # Track statistics
    total = 0
    generated = 0
    skipped = 0
    failed = 0
    
    # Process each word in the vocabulary
    for row in data['vocabulary']:
        for word in row['words']:
            total += 1
            simplified = word['simplified']
            audio_path = f"../{word['audio']}"

            # Check if file already exists
            if os.path.exists(audio_path):
                print(f"⊙ Skipping (exists): {audio_path}")
                skipped += 1
                continue

            # Generate the audio file
            if generate_audio_file(simplified, audio_path):
                generated += 1
                # Small delay to avoid rate limiting
                time.sleep(0.5)
            else:
                failed += 1
    
    # Print summary
    print("\n" + "="*50)
    print("Audio Generation Complete!")
    print(f"Total words: {total}")
    print(f"Generated: {generated}")
    print(f"Skipped (already exist): {skipped}")
    print(f"Failed: {failed}")
    print("="*50)

if __name__ == "__main__":
    main()