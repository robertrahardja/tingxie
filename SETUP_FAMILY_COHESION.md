# Setup Instructions for Family Cohesion Lesson

## Overview
A new Koushi lesson page has been created at `koushi-family-cohesion.html` for the P3HCL "家庭凝聚力" (Family Cohesion) oral exam practice.

## What's Already Set Up ✅
- ✅ HTML lesson page created
- ✅ Audio file copied to `audio/family-cohesion/story.mp4`
- ✅ Placeholder images created (can be replaced with actual pictures)
- ✅ Vocabulary (18 words) extracted and added
- ✅ Story text and reflection questions added
- ✅ Progress tracking functionality
- ✅ Mobile-responsive design
- ✅ All tests passing (no console errors)

## What You Can Optionally Do 📋

### 1. Replace Placeholder Images (Optional)
If you want to use the actual pictures instead of placeholders:
```
images/family-cohesion/picture1.png  (一家人在车里)
images/family-cohesion/picture2.png  (海边野餐)
images/family-cohesion/picture3.png  (回家的车)
```

Just replace the existing PNG files with your actual pictures. The page works perfectly with the current placeholders.

### 2. Test the Page
```bash
npm run dev
# Then open: http://localhost:3001/koushi-family-cohesion.html
```

## Features 🎯

### For Students
1. **Audio Playback** - Listen to the full story narration
2. **Interactive Vocabulary** - Click any word to practice
   - View pinyin pronunciation
   - Hear TTS pronunciation
   - Mark as learned/not learned
3. **Progress Tracking** - Automatically saves which words have been learned
4. **Mobile-First Design** - Optimized for phone/tablet use

### Structure
- **Pictures Section** - Three story pictures
- **Question 1** - Story content with reflection (F.O.R.IF structure)
- **Question 2** - Personal experience example
- **Vocabulary Grid** - 18 key vocabulary words with pinyin

## Vocabulary Included (18 words)
记得, 地点, 海边, 起因, 度假, 人物, 立刻, 拍手, 欢呼, 准备, 就绪, 兴致勃勃, 经过, 赶紧, 换上, 呼着, 欢快, 歌儿

## File Locations
```
koushi-family-cohesion.html          (main page)
audio/family-cohesion/story.mp4      (audio file)
images/family-cohesion/picture*.png  (to be added)
```

## Next Steps
1. Save the three pictures to the images directory
2. Test the page on mobile and desktop
3. Optionally add to navigation menu in index.html
