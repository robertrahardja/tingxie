# Phrase Matching Practice (词语搭配)

## Overview

The Phrase Matching page (`phrase-matching.html`) is a reading practice tool designed for P2 Higher Chinese Level students. It presents 25 common Chinese phrase combinations with their pinyin pronunciation, allowing students to:

1. **Read** each phrase (traditional Chinese characters with pinyin)
2. **Listen** to correct pronunciation via text-to-speech
3. **Record** their own voice reading the phrase
4. **Playback** their recording to compare with the model pronunciation

## Features

### Audio Playback
- Click the **🔊 播放** button on any phrase card to hear it pronounced
- Click **🔊 播放全部** to hear all 25 phrases read sequentially
- Uses Web Speech API with Chinese (zh-CN) locale
- Slowed rate (0.75x) for easier learning

### Voice Recording
- Click **🎤 录音** to start recording your pronunciation
- Click **⏹️ 停止** to stop recording
- Button changes to **🎤 重新录音** after recording
- Recording indicator appears in top-right corner during recording

### Playback
- After recording, **▶️ 听录音** button becomes available
- Click to hear your own pronunciation
- Compare with the model pronunciation to self-assess

### Management
- **🗑️ 清除所有录音** - Clear all recordings to start fresh
- Recordings are stored in browser memory (not persisted)

## Phrase Content

The page includes 25 phrase pairs from the P2 HCL curriculum, covering topics like:
- Colors (颜色)
- Partners/companions (伙伴)
- Buttons (按钮)
- Habits (习惯)
- Punctuality (迟到/准时)
- Shapes (形状)
- And more...

Each phrase shows:
- Traditional Chinese characters (large, bold)
- Pinyin romanization (smaller, gray text)
- Numbered card (1-25)

## Mobile Optimization

- Fully responsive design
- Touch-optimized buttons (44x44px minimum)
- Grid layout adapts to screen size
- Accessible via hamburger menu navigation
- Card-based UI with visual feedback (hover/active states)

## Technical Implementation

### Browser APIs Used
- **Web Speech API** - Text-to-speech for phrase pronunciation
- **MediaRecorder API** - Voice recording functionality
- **getUserMedia API** - Microphone access

### Browser Compatibility
- Modern browsers (Chrome, Safari, Edge)
- Requires microphone permission for recording
- Works on iOS Safari and Android Chrome

### Integration
- Accessible from main navigation menu as "词语搭配"
- Standalone page with independent state management
- No backend required - all processing in browser

## Usage Tips

1. **Listen first** - Click 🔊 to hear correct pronunciation
2. **Record yourself** - Click 🎤 and read the phrase aloud
3. **Compare** - Listen to both the model and your recording
4. **Repeat** - Re-record until you're satisfied
5. **Practice all** - Use "播放全部" to review all phrases

## File Location

```
tingxie/
├── phrase-matching.html    # Main page file
└── styles.css             # Shared styles
```

## Adding to Navigation

The page is linked in the main navigation menu of all primary pages:
- index.html (最新词语)
- review.html (复习词语)
- vocabulary.html (词汇表)
- etc.

## Future Enhancements

Potential improvements:
- Persist recordings to localStorage
- Add audio file support (pre-recorded native speaker audio)
- Progress tracking (which phrases practiced)
- Speech recognition for automatic pronunciation scoring
- Export recordings for teacher review
