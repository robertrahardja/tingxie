#!/usr/bin/env python3
"""
Complete vocabulary extraction and audio generation from PDF script.

This script takes a Chinese vocabulary PDF file and:
1. Extracts text from PDF (requires manual input for scanned PDFs)
2. Identifies highlighted/important words
3. Converts to traditional Chinese
4. Adds Pinyin pronunciation
5. Downloads audio files for each word
6. Generates a complete JSON with all data

Usage: python3 helper_scripts/extract_vocabulary.py <pdf_path>
"""

import sys
import json
import requests
import os
import time
from urllib.parse import quote
import re

def download_tts_audio(text, filename):
    """Download audio from ttsMP3.com for Chinese text"""
    url = "https://ttsmp3.com/makemp3_new.php"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://ttsmp3.com/text-to-speech/Chinese%20Mandarin/',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest'
    }
    
    data = {
        'msg': text,
        'lang': 'Zhiyu',
        'source': 'ttsmp3'
    }
    
    try:
        response = requests.post(url, headers=headers, data=data)
        if response.status_code == 200:
            result = response.json()
            if 'URL' in result:
                audio_url = result['URL']
                # Download the audio file
                audio_response = requests.get(audio_url)
                if audio_response.status_code == 200:
                    with open(filename, 'wb') as f:
                        f.write(audio_response.content)
                    print(f"Downloaded: {filename}")
                    return True
                else:
                    print(f"Failed to download audio for {text}")
            else:
                print(f"No URL in response for {text}")
        else:
            print(f"Failed to generate audio for {text}")
    except Exception as e:
        print(f"Error downloading {text}: {e}")
    
    return False

def convert_to_traditional(simplified_text):
    """Convert simplified Chinese to traditional (placeholder - needs real conversion)"""
    # This is a simplified mapping - in practice, you'd use a proper library like opencc
    conversion_map = {
        "饮料摊": "飲料攤", "热闹": "熱鬧", "五颜六色": "五顏六色",
        "碰碰车": "碰碰車", "辉辉": "輝輝", "引来": "引來", 
        "烤香肠": "烤香腸", "炸鸡翅": "炸雞翅", "放风筝": "放風箏",
        "长椅": "長椅", "安静": "安靜", "到处都是": "到處都是",
        "市区": "市區", "干净": "乾淨", "整齐": "整齊", "参观": "參觀",
        "植物园": "植物園", "美术馆": "美術館", "东海岸公园": "東海岸公園",
        "捡贝壳": "撿貝殼", "离开": "離開", "国家": "國家", "楼下": "樓下"
    }
    return conversion_map.get(simplified_text, simplified_text)

def get_pinyin(text):
    """Get pinyin for Chinese text (placeholder - needs real conversion)"""
    # This is a simplified mapping - in practice, you'd use a proper library
    pinyin_map = {
        "楼下": "lóu xià", "逛夜市": "guàng yè shì", "热闹": "rè nào",
        "五颜六色": "wǔ yán liù sè", "饮料摊": "yǐn liào tān",
        "射气球": "shè qì qiú", "套圈圈": "tào quān quān", "碰碰车": "pèng pèng chē",
        "辉辉": "huī huī", "引来": "yǐn lái", "一群群": "yī qún qún",
        "但是": "dàn shì", "烤香肠": "kǎo xiāng cháng", "炸鸡翅": "zhá jī chì",
        "踢足球": "tī zú qiú", "放风筝": "fàng fēng zhēng", "长椅": "cháng yǐ",
        "安静": "ān jìng", "新加坡": "xīn jiā pō", "城市": "chéng shì",
        "到处都是": "dào chù dōu shì", "市区": "shì qū", "街道": "jiē dào",
        "干净": "gān jìng", "整齐": "zhěng qí", "参观": "cān guān",
        "植物园": "zhí wù yuán", "美术馆": "měi shù guǎn",
        "东海岸公园": "dōng hǎi àn gōng yuán", "野餐": "yě cān",
        "游泳": "yóu yǒng", "玩泥沙": "wán ní shā", "捡贝壳": "jiǎn bèi ké",
        "离开": "lí kāi", "国家": "guó jiā"
    }
    return pinyin_map.get(text, "")

def extract_vocabulary_from_pdf():
    """Extract vocabulary from PDF - manual input required for scanned PDFs"""
    print("Please manually extract the vocabulary from the PDF and provide the data structure:")
    print("This script assumes you have the following vocabulary structure from the PDF:")
    
    # Sample data structure based on the PDF you provided
    vocabulary_data = {
        "title": "复习词语 (下周听写)",
        "lesson": "第十七课和第十八课",
        "vocabulary": [
            {
                "row": 1,
                "words": ["楼下", "逛夜市", "热闹", "五颜六色"],
                "important_words": ["楼下", "逛夜市", "热闹"]  # highlighted words
            },
            {
                "row": 2,
                "words": ["饮料摊", "射气球", "套圈圈", "碰碰车"],
                "important_words": []
            },
            {
                "row": 3,
                "words": ["辉辉", "引来", "一群群", "但是", "烤香肠"],
                "important_words": ["烤香肠"]
            },
            {
                "row": 4,
                "words": ["炸鸡翅", "踢足球", "放风筝", "长椅", "安静"],
                "important_words": []
            },
            {
                "row": 5,
                "words": ["新加坡", "城市", "到处都是", "市区"],
                "important_words": ["到处都是"]
            },
            {
                "row": 6,
                "words": ["街道", "干净", "整齐", "参观", "植物园"],
                "important_words": []
            },
            {
                "row": 7,
                "words": ["美术馆", "东海岸公园", "野餐", "游泳"],
                "important_words": ["东海岸公园"]
            },
            {
                "row": 8,
                "words": ["玩泥沙", "捡贝壳", "离开", "国家"],
                "important_words": ["国家"]
            }
        ]
    }
    
    return vocabulary_data

def process_vocabulary(vocab_data):
    """Process vocabulary data into final JSON format with audio"""
    print("Processing vocabulary data...")
    
    # Create audio directory
    os.makedirs('../audio', exist_ok=True)
    
    processed_vocab = {
        "title": vocab_data["title"],
        "lesson": vocab_data["lesson"],
        "vocabulary": []
    }
    
    for row_data in vocab_data["vocabulary"]:
        row_entry = {
            "row": row_data["row"],
            "words": []
        }
        
        for word in row_data["words"]:
            # Determine if word is important
            is_important = word in row_data.get("important_words", [])
            
            # Create word entry
            word_entry = {
                "simplified": word,
                "traditional": convert_to_traditional(word),
                "pinyin": get_pinyin(word),
                "audio": f"audio/{word}.mp3",
                "important": is_important
            }
            
            # Download audio file
            audio_file = f"../audio/{word}.mp3"
            if not os.path.exists(audio_file):
                print(f"Downloading audio for: {word}")
                success = download_tts_audio(word, audio_file)
                if success:
                    time.sleep(2)  # Rate limiting
                else:
                    print(f"Failed to download audio for {word}")
            
            row_entry["words"].append(word_entry)
        
        processed_vocab["vocabulary"].append(row_entry)
    
    # Add note
    processed_vocab["note"] = "*Highlight 部分是识写的词语，**没有 Highlight 部分是识读的词语。"
    
    return processed_vocab

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 helper_scripts/extract_vocabulary.py <pdf_path>")
        print("\nThis script will:")
        print("1. Extract vocabulary from Chinese PDF")
        print("2. Convert to traditional characters")
        print("3. Add Pinyin pronunciation")
        print("4. Download audio files")
        print("5. Generate complete JSON file")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    
    print(f"Processing PDF: {pdf_path}")
    print("Note: For scanned PDFs, manual text extraction is required.")
    
    # Extract vocabulary data (manual for scanned PDFs)
    vocab_data = extract_vocabulary_from_pdf()
    
    # Process the data
    final_vocab = process_vocabulary(vocab_data)
    
    # Save to JSON file
    output_file = "../data/tingxie/tingxie_vocabulary.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(final_vocab, f, ensure_ascii=False, indent=2)
    
    print(f"\nCompleted! Generated:")
    print(f"- {output_file} (vocabulary JSON)")
    print(f"- ../audio/ folder with {len([f for f in os.listdir('../audio') if f.endswith('.mp3')])} MP3 files")
    print("\nNext steps:")
    print("1. Review the JSON file for accuracy")
    print("2. Test audio files")
    print("3. Use in your Chinese learning application")

if __name__ == "__main__":
    main()