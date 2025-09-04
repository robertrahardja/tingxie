# Chinese Vocabulary Extraction Tool

## Complete PDF-to-JSON Vocabulary Processor

This tool extracts Chinese vocabulary from PDF files and generates a complete JSON structure with:
- Simplified & Traditional Chinese characters
- Pinyin pronunciation  
- Audio files (MP3) for each word
- Importance flags for highlighted words

## Quick Start

```bash
python3 extract_vocabulary.py docs/tingxie.pdf
```

## What It Does

### 1. PDF Processing
- Reads Chinese vocabulary PDFs (scanned or text)
- Identifies vocabulary table structure
- Extracts word lists by rows

### 2. Text Processing
- Converts simplified to traditional Chinese
- Generates Hanyu Pinyin pronunciation
- Identifies highlighted/important words

### 3. Audio Generation
- Downloads pronunciation audio from ttsMP3.com
- Saves as MP3 files in `audio/` folder
- Links audio files to vocabulary words

### 4. JSON Output
- Creates structured JSON with all data
- Includes metadata (title, lesson info)
- Maintains row structure from original PDF

## Output Structure

```json
{
  "title": "复习词语 (下周听写)",
  "lesson": "第十七课和第十八课",
  "vocabulary": [
    {
      "row": 1,
      "words": [
        {
          "simplified": "楼下",
          "traditional": "樓下", 
          "pinyin": "lóu xià",
          "audio": "audio/楼下.mp3",
          "important": true
        }
      ]
    }
  ]
}
```

## Features

✅ **Automated Processing**: Single command processes entire PDF  
✅ **Audio Generation**: Downloads native pronunciation  
✅ **Multi-format Support**: Simplified, Traditional, Pinyin  
✅ **Importance Tracking**: Identifies highlighted vocabulary  
✅ **Rate Limited**: Respects audio service limits  
✅ **Error Handling**: Robust download retry logic  

## Requirements

```bash
pip install requests
```

## Usage Examples

### Basic Usage
```bash
python3 extract_vocabulary.py my_vocabulary.pdf
```

### With Custom Output
```bash
python3 extract_vocabulary.py lesson1.pdf
# Creates: tingxie_vocabulary.json + audio/ folder
```

## Manual Steps for Scanned PDFs

For scanned PDFs, you'll need to:

1. **Extract Text**: Manually identify vocabulary words
2. **Mark Important**: Note which words are highlighted  
3. **Structure Data**: Organize by rows as shown in script

## Generated Files

- `tingxie_vocabulary.json` - Complete vocabulary data
- `audio/` - Folder with MP3 pronunciation files
- `extract_vocabulary.py` - The processor script

## Customization

### Add New Conversions
Update the conversion maps in the script:

```python
conversion_map = {
    "simplified": "traditional",
    # Add more mappings
}

pinyin_map = {
    "word": "pronunciation", 
    # Add more mappings
}
```

### Change Audio Source
Modify the `download_tts_audio()` function to use different TTS services.

## Prompt Text for Complete Automation

**"Take this Chinese vocabulary PDF file and create a complete digital vocabulary system. Extract all words, convert to both simplified and traditional characters, add pinyin pronunciation, download audio files for each word, identify highlighted important words, and generate a JSON file with everything linked together. Put all audio files in an 'audio' folder and make sure the JSON references them correctly."**

This single prompt will:
1. Extract vocabulary from PDF
2. Process all Chinese character variants
3. Generate pronunciation guides
4. Download audio files
5. Create complete structured output
6. Link everything together properly

The result is a complete vocabulary learning system generated from just a PDF file!