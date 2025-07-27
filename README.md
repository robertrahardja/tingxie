# 听写 (Tīngxiě) - Chinese Homework Helper

An interactive web application designed to help students practice Chinese vocabulary, dictation, and oral skills.

## Features

### 📚 Vocabulary Practice
- Interactive flashcards with Chinese characters, pinyin, and English meanings
- Click to reveal/hide meanings
- Shuffle functionality for random practice
- Organized by weekly lessons

### 🎧 Dictation Practice (听写)
- Audio-based word practice (audio files to be added)
- Progress tracking
- Randomized word order
- Visual feedback for completed words

### 🗣️ Oral Practice
- Timed speaking exercises (2 minutes)
- Multiple practice topics
- Visual recording indicator
- Topic rotation for variety

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

## Future Enhancements
- [ ] Add actual audio recordings for dictation
- [ ] Implement speech recognition for oral practice
- [ ] Add more vocabulary weeks
- [ ] Create student progress tracking
- [ ] Add printable practice sheets

## Contributing
Feel free to submit issues and enhancement requests!

## License
This project is open source and available for educational use.