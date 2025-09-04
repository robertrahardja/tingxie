#!/usr/bin/env python3
import json
import requests
import os
import time
from urllib.parse import quote

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

def main():
    # Load vocabulary JSON
    with open('tingxie_vocabulary.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Create audio directory if it doesn't exist
    os.makedirs('audio', exist_ok=True)
    
    # Download audio for each word
    for row in data['vocabulary']:
        for word in row['words']:
            simplified = word['simplified']
            # Create filename from simplified Chinese
            filename = f"audio/{simplified}.mp3"
            
            if not os.path.exists(filename):
                print(f"Downloading audio for: {simplified}")
                success = download_tts_audio(simplified, filename)
                if success:
                    # Add delay to avoid overwhelming the server
                    time.sleep(2)
                else:
                    print(f"Failed to download {simplified}")
            else:
                print(f"Audio already exists for: {simplified}")
    
    print("Audio download complete!")

if __name__ == "__main__":
    main()