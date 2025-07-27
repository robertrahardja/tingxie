# 听写 (Tīngxiě) - Chinese Homework Helper

An interactive web application designed to help students practice Chinese vocabulary, dictation, and oral skills.

## Features

### 📚 Vocabulary Practice
- Interactive flip cards with numbers on front, Chinese characters on back
- Audio playback for each word with automatic card flipping
- Displays pinyin and English meanings
- Shuffle functionality for random practice
- Organized by weekly lessons with themed vocabulary

### 🎧 Dictation Practice (听写)
- Audio-based word practice (audio files to be added)
- Progress tracking with visual progress bar
- Randomized word order for better learning
- Shows Chinese characters after each word
- Automatic progression through vocabulary list

### 🎤 Oral Practice
- Scenario-based speaking exercises with reveal buttons
- Highlighted sentences for memorization practice
- Built-in audio recording with visual indicators
- 2-minute timer for practice sessions
- Save and playback recordings

### 📝 Comprehensive Exercises
- Checkbox tracking for homework completion
- Progress saved to browser's localStorage
- Generate learning reports
- Track completion across multiple weeks

## Getting Started

### Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/robertrahardja/tingxie.git
   cd tingxie
   ```

2. Open `index.html` in your web browser

3. To add audio files:
   - Create MP3 files for each vocabulary word
   - Name them as: `[chinese_character].mp3`
   - Place them in the `audio/week[number]/` directory

### GitHub Pages Deployment
The site is automatically deployed to: https://robertrahardja.github.io/tingxie/

## Vocabulary Structure

The application includes 4 weeks of vocabulary:

- **Week 1**: Basic greetings and people (你好, 谢谢, 老师, etc.)
- **Week 2**: School-related terms (学校, 教室, 作业, etc.)
- **Week 3**: Time expressions (早上, 今天, 周末, etc.)
- **Week 4**: Family members (爸爸, 妈妈, 哥哥, etc.)

## Adding New Content

### To add new vocabulary:
1. Edit the `vocabularyData` object in `index.html`
2. Follow the existing format:
   ```javascript
   {
     chinese: '中文',
     pinyin: 'zhōng wén',
     meaning: 'Chinese language'
   }
   ```

### To add new oral topics:
1. Edit the `oralTopics` array in `index.html`
2. Include both Chinese and English versions

## Browser Compatibility
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Audio File Structure

Place audio files in the following structure:
```
audio/
├── week1/
│   ├── nihao.mp3
│   ├── xiexie.mp3
│   └── ...
├── week2/
│   ├── xuexiao.mp3
│   ├── jiaoshi.mp3
│   └── ...
├── week3/
│   └── ...
└── week4/
    └── ...
```

## Key Improvements from P2HCL Template

- **Flip Card Design**: Cards now show numbers on front with audio buttons, Chinese characters on back
- **Instructions Section**: Clear usage instructions at the top of the page
- **Enhanced UI**: Better color scheme with gradients and improved typography
- **Progress Tracking**: All progress is saved to localStorage
- **Recording Features**: Built-in audio recording for oral practice
- **Exercise Tracking**: Checkbox system for tracking homework completion

## Future Enhancements
- [ ] Add actual audio recordings for dictation
- [ ] Implement speech recognition for oral practice
- [ ] Add more vocabulary weeks
- [ ] Create student progress tracking dashboard
- [ ] Add printable practice sheets
- [ ] Export progress reports as PDF
- [ ] Add parent/teacher portal

## Contributing
Feel free to submit issues and enhancement requests!

## License
This project is open source and available for educational use.