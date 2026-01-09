# Adding New Tingxie Words

This guide explains how to add new vocabulary words to the tingxie application.

## Quick Steps

1. **Add new row to vocabulary JSON** - `data/tingxie/tingxie_vocabulary.json`
2. **Generate audio files** - Use Google Translate TTS script
3. **Update the configuration** - Update `LATEST_ROW_NUMBER` in `js/constants.js`
4. **Deploy** - Run `npx wrangler deploy`

## Detailed Process

### Step 1: Add Words to Vocabulary JSON

Edit `data/tingxie/tingxie_vocabulary.json` and add a new row with the next available row number.

**Example:**
```json
{
  "row": 77,
  "words": [
    {
      "simplified": "新单词",
      "traditional": "新單詞",
      "pinyin": "xīn dān cí",
      "english": "new word",
      "audio": "audio/新单词.mp3",
      "important": true
    }
  ]
}
```

### Step 2: Generate Audio Files

Download audio pronunciation files for each word using the Google Translate TTS script:

```bash
python3 download_google_audio.py
```

This creates MP3 files in the `audio/` directory.

### Step 3: Update Configuration

Update the row number in `js/constants.js`:

```javascript
VOCABULARY: {
    LATEST_ROW_NUMBER: 77,  // Change from 76 to your new row number
    REVIEW_MODE_NAME: 'UNKNOWN_WORDS'
}
```

### Step 4: Deploy

Commit your changes and deploy to Cloudflare:

```bash
git add data/tingxie/tingxie_vocabulary.json audio/*.mp3 js/constants.js
git commit -m "Feature: Add new tingxie words - row 77"
git push
npx wrangler deploy
```

## How the "Latest Words" System Works

### The Problem (Before Refactor)

The old code used `this.data.vocabulary[this.data.vocabulary.length - 1]` which meant:
- It always loaded the **last row** in the array
- When adding new words to row 3, they didn't appear because row 75 was still last
- Unclear where to make changes for future developers

### The Solution (After Refactor)

- Configuration is explicit: `VOCABULARY.LATEST_ROW_NUMBER` in `js/constants.js`
- Clear documentation: Comments explain the process
- Error messages: If row not found, tells you exactly what went wrong
- Single source of truth: All three apps (latest, review, vocabulary) reference same config

### Which Apps Use This Setting?

- **latest.js** - Uses `LATEST_ROW_NUMBER` to show latest words
- Other apps have their own logic (vocabulary.js, review.js)

## Troubleshooting

### Words don't appear after deployment

1. Check that `LATEST_ROW_NUMBER` in `js/constants.js` is updated to your new row
2. Verify audio files are in `audio/` directory and referenced correctly in JSON
3. Check browser console for error messages (Ctrl+Shift+J or Cmd+Option+J)
4. Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)

### Audio files missing

Run the audio download script again:
```bash
python3 download_google_audio.py
```

If specific words fail, they'll be listed. Retry those individually.

## File Locations Reference

- **Vocabulary data**: `data/tingxie/tingxie_vocabulary.json`
- **Row configuration**: `js/constants.js` - `CONSTANTS.VOCABULARY.LATEST_ROW_NUMBER`
- **Audio files**: `audio/*.mp3`
- **Latest app code**: `latest.js`
- **Audio download script**: `download_google_audio.py`

## Example: Adding Row 77 (15 words)

**1. Edit tingxie_vocabulary.json** - Add row 77 with 15 words

**2. Run audio script**
```bash
python3 download_google_audio.py  # Downloads all 15 new MP3s
```

**3. Update constants.js**
```javascript
LATEST_ROW_NUMBER: 77,
```

**4. Deploy**
```bash
git add .
git commit -m "Feature: Add row 77 vocabulary (15 new words)"
git push && npx wrangler deploy
```

Done! Students will now see row 77 words when they open latest.html.
