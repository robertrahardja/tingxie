# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Tingxie** is a mobile-first Chinese vocabulary learning application for Primary 2 Higher Chinese Level (P2HCL) students in Singapore. The application consists of two main learning modes:

1. **听写练习 (Tingxie)** - Spelling practice with audio-based word revelation
2. **口试 (Koushi)** - Oral exam preparation with scenario-based vocabulary and story text practice

The app is built as a static website using vanilla JavaScript with ES6 modules, designed for offline use and mobile deployment.

## Development Commands

### Running Locally
```bash
npm run dev          # Start dev server on port 3001 and open browser
npm start            # Start server without opening browser
```

### Audio Generation
```bash
python3 generate_audio.py           # Download MP3 files for vocabulary words
python3 generate_audio_alt.py       # Alternative audio generation method
```

### Creating Lesson Files
```bash
./create_lessons.sh                 # Create lesson HTML files (koushi25-lesson{3-10}.html)
python3 update_lessons.py           # Update all lesson files with new content
```

## Architecture

### Core Application Structure

The codebase uses **class-based inheritance** with a shared base class:

- **BaseApp.js** - Shared functionality for all apps
  - Data loading from JSON
  - Menu navigation (hamburger menu)
  - Filter toggle (all words vs important words)
  - Scroll management for mobile
  - Mobile-optimized touch interactions

- **TingxieApp** (script.js) - Extends BaseApp for spelling practice
  - Word-by-word reveal system with covered/uncovered states
  - Audio playback with preloading
  - Progress tracking across word sets
  - Self-assessment system (会/不会 buttons) for tracking known/unknown words
  - Review mode for practicing unknown words
  - Cloud synchronization via Cloudflare KV for cross-device progress

- **VocabularyApp** (vocabulary.js) - Extends BaseApp for vocabulary browsing
  - Grid display of all vocabulary
  - Intersection Observer for lazy audio preloading
  - Filter by importance

### Audio System

**AudioPlayer.js** implements a singleton pattern:
- Single audio element reused for all playback
- Intelligent preloading queue (preloads next 5 words)
- Error handling with fallback paths
- Prevents multiple simultaneous audio instances

### Constants Management

**constants.js** centralizes all configuration:
- Element IDs (prevents typos)
- CSS class names
- UI labels (Chinese text)
- Paths and configuration values
- Error messages

### Cloud Sync System

**CloudSync.js** handles cross-device progress synchronization:
- Generates unique student IDs (timestamp + random string)
- Student ID stored in localStorage for device persistence
- **Saves ONLY to Cloudflare KV** - No localStorage for progress
- Automatic deduplication - Sets prevent duplicate word entries
- Retry logic: 3 attempts with exponential backoff (1s, 2s, 3s)
- Loads progress from cloud on app startup
- Saves progress after each assessment (会/不会)
- API endpoint: `/api/progress` (Cloudflare Pages Function)
- Visual error notification if save fails

### Data Format

Vocabulary data is stored in JSON format at `data/tingxie/tingxie_vocabulary.json`:

```json
{
  "vocabulary": [
    {
      "row": 1,
      "words": [
        {
          "simplified": "美丽",
          "traditional": "美麗",
          "pinyin": "měi lì",
          "english": "beautiful",
          "audio": "audio/美丽.mp3",
          "important": true
        }
      ]
    }
  ]
}
```

**Key fields:**
- `simplified` - Simplified Chinese characters
- `traditional` - Traditional Chinese characters (used in Singapore)
- `pinyin` - Romanized pronunciation
- `audio` - Path to MP3 file
- `important` - Boolean flag for filtering

### Koushi (Oral Exam) System

The Koushi section includes:
- **koushi25.html** - Main index page showing all 10 lessons with progress tracking
- **koushi25-lesson{1-10}.html** - Individual lesson pages with:
  - Story text for oral practice
  - Scenario-based vocabulary with images
  - Learned word tracking via localStorage
  - Progress persistence

Each lesson page stores state in localStorage:
- `koushi25_lesson{N}_learned` - Array of learned word indices
- `koushi25_lesson{N}_progress` - Percentage completion

## Mobile-First Design

### Touch Optimization
- Touch feedback on all interactive elements (opacity change)
- Passive event listeners for scroll performance
- Viewport height fix for mobile browsers (CSS custom property `--vh`)

### Navigation Behavior
- Hamburger menu auto-closes on navigation or outside click
- Navbar hides on scroll down (mobile only, threshold: 60px)
- Navbar always visible on desktop (≥768px)

### Performance
- Audio preloading limited to next 5 words to minimize memory
- Intersection Observer for lazy loading in vocabulary grid
- Document fragments for efficient DOM manipulation

## Key Patterns

### Module Exports
All JavaScript uses ES6 modules:
```javascript
export class BaseApp { }        // Named export
export { getAudioPlayer }       // Singleton function
```

### Event Listeners
Always check element existence before adding listeners:
```javascript
if (element) {
  element.addEventListener('click', () => this.method());
}
```

### State Management
- App state stored in class properties
- No external state management library
- **Tingxie Progress Storage**:
  - **ONLY Cloudflare KV** - Single source of truth
  - No localStorage for progress data
  - Key format: `student:{studentId}:tingxie:progress`
  - Contains unique knownWords, unknownWords arrays (duplicates removed), and lastUpdated timestamp
  - Student ID stored in localStorage: `tingxie_student_id` (device-specific identifier)
  - Automatic retry logic (3 attempts with exponential backoff)
  - Visual error notification if save fails
- **Koushi lesson progress**: localStorage only (not synced)

### CSS Classes
Use constants instead of hardcoding:
```javascript
element.classList.add(CSS_CLASSES.COVERED);  // Good
element.classList.add('covered');            // Avoid
```

## Common Tasks

### Adding New Vocabulary Words
1. Edit `data/tingxie/tingxie_vocabulary.json`
2. Add simplified, traditional, pinyin, English, audio path
3. Set `important: true` for key words
4. Run `python3 generate_audio.py` to download MP3 files

### Self-Assessment System
Students can mark words as known (会 ✓) or unknown (不会 ✗):
- **Known words**: Marked when student is confident
- **Unknown words**: Automatically available in review mode
- **Progress saved ONLY to Cloudflare KV** - No localStorage
- Automatic deduplication - same word marked multiple times won't create duplicates
- Progress syncs across devices via Cloudflare KV (single source of truth)
- Retry logic: 3 attempts with exponential backoff (1s, 2s, 3s delays)
- Visual error notification appears if save fails after all retries
- Review mode button appears when there are unknown words
- Filter button (重要词语) is hidden in review mode

### Creating New Lesson Pages
1. Use `update_lessons.py` as reference for lesson data structure
2. Each lesson needs: title, subtitle, emoji, text, vocab array
3. Vocabulary items need: chinese, pinyin, english, example, image URL
4. Update koushi25.html to add lesson card to grid

### Modifying UI Labels
All Chinese text labels are in `js/constants.js` under `UI_LABELS`:
```javascript
CONSTANTS.UI_LABELS.SIMPLIFIED  // "简单"
```

### Changing Audio Behavior
Modify AudioPlayer.js:
- `preload()` - Controls preloading logic
- `play()` - Handles playback
- Adjust `CONSTANTS.AUDIO_PRELOAD_COUNT` for preload quantity

## File Organization

```
tingxie/
├── index.html              # Main tingxie practice page
├── koushi.html             # Koushi mode selector (not implemented)
├── koushi25.html           # Week 37 lesson index
├── koushi25-lesson{1-10}.html  # Individual lesson pages
├── vocabulary.html         # Vocabulary browser
├── script.js               # TingxieApp implementation
├── vocabulary.js           # VocabularyApp implementation
├── styles.css              # Global styles
├── js/
│   ├── BaseApp.js          # Base class
│   ├── AudioPlayer.js      # Audio singleton
│   ├── CloudSync.js        # Cloud sync functionality
│   └── constants.js        # Configuration
├── functions/
│   └── api/
│       └── progress.js     # Cloudflare Pages Function for KV operations
├── data/
│   ├── tingxie/
│   │   └── tingxie_vocabulary.json
│   └── koushi/
│       ├── Koushi25.pdf
│       └── vocabulary_table.json
├── audio/                  # MP3 pronunciation files
├── wrangler.toml           # Cloudflare configuration
├── .dev.vars               # Local environment variables (gitignored)
├── generate_audio.py       # Audio downloader (ttsMP3.com)
├── generate_audio_alt.py   # Alternative audio source
└── update_lessons.py       # Lesson updater script
```

## Important Notes

- All audio files must exist in `audio/` directory with exact filename match to JSON
- Traditional Chinese is the primary display (Singapore education standard)
- Filter system affects both display and navigation (word count changes)
- Self-assessment buttons (会/不会) are always visible and not tied to item revelation
- **Tingxie progress**: Cloudflare KV ONLY (single source of truth, no localStorage)
- **Koushi lesson progress**: localStorage only (per-device, not synced)
- Student ID persists in localStorage to identify the student across sessions
- Automatic deduplication ensures same word marked multiple times = no duplicates
- Retry logic (3 attempts) with visual error feedback if save fails
- Progress counter displayed prominently inside word card for easy tracking
- Review mode filters to show only unknown words and hides the importance filter button
- Dashboard loads progress from cloud only (no localStorage fallback)

## Deployment

The app is deployed on **Cloudflare Pages** with Git integration:
- **Account**: robertrahardja@gmail.com
- **Account ID**: 8bd804c6c83f8c21095206344daf4a16
- **KV Namespace**: STUDENT_PROGRESS (ID: 7b92b749c283431582ccc77724f1cbdb)
- **Deployment**: Automatic on git push to main branch
- **API Endpoint**: `/api/progress` via Pages Functions

### Environment Variables
- `.dev.vars` (local only, gitignored): Contains CLOUDFLARE_API_TOKEN
- Cloudflare Pages binding: `STUDENT_PROGRESS` KV namespace bound in Pages settings
