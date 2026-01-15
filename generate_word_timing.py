#!/usr/bin/env python3
"""
Generate word-level timestamps for P3HCL_3.mp4 using OpenAI Whisper API
Requires: OPENAI_API_KEY environment variable
"""

import os
import json
from openai import OpenAI

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Path to audio file (actually M4A format)
audio_file_path = "audio/koushi/P3HCL_3.mp4"

print(f"Processing audio file: {audio_file_path}")

# Transcribe with word-level timestamps
# Note: Opening as M4A format which is supported
with open(audio_file_path, "rb") as audio_file:
    # Create a tuple with filename to hint at format
    audio_file_tuple = (os.path.basename(audio_file_path).replace('.mp4', '.m4a'), audio_file)
    transcript = client.audio.transcriptions.create(
        model="whisper-1",
        file=audio_file_tuple,
        response_format="verbose_json",
        timestamp_granularities=["word"]
    )

# Save the full response
output_file = "audio/koushi/P3HCL_3_timing.json"
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(transcript.model_dump(), f, ensure_ascii=False, indent=2)

print(f"\n✅ Timing data saved to: {output_file}")
print(f"\nTranscription: {transcript.text}")

# Print word-level timing info
if hasattr(transcript, 'words') and transcript.words:
    print(f"\n📊 Found {len(transcript.words)} words with timestamps:")
    for i, word in enumerate(transcript.words[:10]):  # Show first 10 words
        print(f"  {word.word} ({word.start:.2f}s - {word.end:.2f}s)")
    if len(transcript.words) > 10:
        print(f"  ... and {len(transcript.words) - 10} more words")
