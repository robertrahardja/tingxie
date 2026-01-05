#!/bin/bash

# Upload all audio files to R2
cd audio
total=$(ls -1 *.mp3 | wc -l)
count=0

for file in *.mp3; do
    count=$((count + 1))
    echo -ne "[\033[0;32m$count/$total\033[0m] Uploading: $file\r"
    npx wrangler r2 object put "tingxie-assets/audio/$file" --file "$file" --remote --content-type "audio/wav" > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo "Error uploading $file"
    fi
done

echo ""
echo "Upload complete! Uploaded $count/$total files"
