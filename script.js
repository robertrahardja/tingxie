// Enhanced vocabulary data structure
let vocabularyData = {
    1: [
        { id: 1, chinese: '你好', pinyin: 'nǐ hǎo', meaning: 'Hello', audio: 'nihao.mp3' },
        { id: 2, chinese: '谢谢', pinyin: 'xiè xie', meaning: 'Thank you', audio: 'xiexie.mp3' },
        { id: 3, chinese: '再见', pinyin: 'zài jiàn', meaning: 'Goodbye', audio: 'zaijian.mp3' },
        { id: 4, chinese: '老师', pinyin: 'lǎo shī', meaning: 'Teacher', audio: 'laoshi.mp3' },
        { id: 5, chinese: '学生', pinyin: 'xué shēng', meaning: 'Student', audio: 'xuesheng.mp3' },
        { id: 6, chinese: '朋友', pinyin: 'péng yǒu', meaning: 'Friend', audio: 'pengyou.mp3' },
        { id: 7, chinese: '家人', pinyin: 'jiā rén', meaning: 'Family', audio: 'jiaren.mp3' },
        { id: 8, chinese: '中国', pinyin: 'zhōng guó', meaning: 'China', audio: 'zhongguo.mp3' },
        { id: 9, chinese: '早上好', pinyin: 'zǎo shang hǎo', meaning: 'Good morning', audio: 'zaoshanghao.mp3' },
        { id: 10, chinese: '晚安', pinyin: 'wǎn ān', meaning: 'Good night', audio: 'wanan.mp3' }
    ],
    2: [
        { id: 1, chinese: '学校', pinyin: 'xué xiào', meaning: 'School', audio: 'xuexiao.mp3' },
        { id: 2, chinese: '教室', pinyin: 'jiào shì', meaning: 'Classroom', audio: 'jiaoshi.mp3' },
        { id: 3, chinese: '书包', pinyin: 'shū bāo', meaning: 'Backpack', audio: 'shubao.mp3' },
        { id: 4, chinese: '铅笔', pinyin: 'qiān bǐ', meaning: 'Pencil', audio: 'qianbi.mp3' },
        { id: 5, chinese: '作业', pinyin: 'zuò yè', meaning: 'Homework', audio: 'zuoye.mp3' },
        { id: 6, chinese: '考试', pinyin: 'kǎo shì', meaning: 'Exam', audio: 'kaoshi.mp3' },
        { id: 7, chinese: '成绩', pinyin: 'chéng jì', meaning: 'Grades', audio: 'chengji.mp3' },
        { id: 8, chinese: '课本', pinyin: 'kè běn', meaning: 'Textbook', audio: 'keben.mp3' },
        { id: 9, chinese: '黑板', pinyin: 'hēi bǎn', meaning: 'Blackboard', audio: 'heiban.mp3' },
        { id: 10, chinese: '同学', pinyin: 'tóng xué', meaning: 'Classmate', audio: 'tongxue.mp3' }
    ],
    3: [
        { id: 1, chinese: '早上', pinyin: 'zǎo shang', meaning: 'Morning', audio: 'zaoshang.mp3' },
        { id: 2, chinese: '中午', pinyin: 'zhōng wǔ', meaning: 'Noon', audio: 'zhongwu.mp3' },
        { id: 3, chinese: '晚上', pinyin: 'wǎn shang', meaning: 'Evening', audio: 'wanshang.mp3' },
        { id: 4, chinese: '今天', pinyin: 'jīn tiān', meaning: 'Today', audio: 'jintian.mp3' },
        { id: 5, chinese: '明天', pinyin: 'míng tiān', meaning: 'Tomorrow', audio: 'mingtian.mp3' },
        { id: 6, chinese: '昨天', pinyin: 'zuó tiān', meaning: 'Yesterday', audio: 'zuotian.mp3' },
        { id: 7, chinese: '星期', pinyin: 'xīng qī', meaning: 'Week', audio: 'xingqi.mp3' },
        { id: 8, chinese: '周末', pinyin: 'zhōu mò', meaning: 'Weekend', audio: 'zhoumo.mp3' },
        { id: 9, chinese: '小时', pinyin: 'xiǎo shí', meaning: 'Hour', audio: 'xiaoshi.mp3' },
        { id: 10, chinese: '分钟', pinyin: 'fēn zhōng', meaning: 'Minute', audio: 'fenzhong.mp3' }
    ],
    4: [
        { id: 1, chinese: '爸爸', pinyin: 'bà ba', meaning: 'Father', audio: 'baba.mp3' },
        { id: 2, chinese: '妈妈', pinyin: 'mā ma', meaning: 'Mother', audio: 'mama.mp3' },
        { id: 3, chinese: '哥哥', pinyin: 'gē ge', meaning: 'Older brother', audio: 'gege.mp3' },
        { id: 4, chinese: '姐姐', pinyin: 'jiě jie', meaning: 'Older sister', audio: 'jiejie.mp3' },
        { id: 5, chinese: '弟弟', pinyin: 'dì di', meaning: 'Younger brother', audio: 'didi.mp3' },
        { id: 6, chinese: '妹妹', pinyin: 'mèi mei', meaning: 'Younger sister', audio: 'meimei.mp3' },
        { id: 7, chinese: '爷爷', pinyin: 'yé ye', meaning: 'Grandfather', audio: 'yeye.mp3' },
        { id: 8, chinese: '奶奶', pinyin: 'nǎi nai', meaning: 'Grandmother', audio: 'nainai.mp3' },
        { id: 9, chinese: '叔叔', pinyin: 'shū shu', meaning: 'Uncle', audio: 'shushu.mp3' },
        { id: 10, chinese: '阿姨', pinyin: 'ā yí', meaning: 'Aunt', audio: 'ayi.mp3' }
    ]
};

// Global variables
let currentWeek = 1;
let dictationWords = [];
let currentWordIndex = 0;
let isPlaying = false;
let oralTimer = null;
let oralTimeLeft = 120;
let recordings = {};
let mediaRecorder = null;
let audioChunks = [];

// Tab switching
function switchTab(tabName) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
    
    // Save current tab to localStorage
    localStorage.setItem('currentTab', tabName);
}

// Vocabulary functions
function loadVocabulary() {
    const week = document.getElementById('week-select-vocab').value;
    const vocabGrid = document.getElementById('vocab-grid');
    const words = vocabularyData[week] || [];
    
    currentWeek = week;
    updateWeekInfo(week);
    
    vocabGrid.innerHTML = '';
    
    words.forEach((word, index) => {
        const card = document.createElement('div');
        card.className = 'vocab-card';
        card.id = `vocab-card-${word.id}`;
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">
                    <div class="vocab-number">${word.id}</div>
                    <button class="audio-btn" onclick="playAudioAndFlip('vocab-card-${word.id}', '${word.audio}')">🔊</button>
                </div>
                <div class="card-back" onclick="flipBack('vocab-card-${word.id}')">
                    <div class="chinese-display">${word.chinese}</div>
                    <div class="pinyin-display">${word.pinyin}</div>
                    <div class="meaning-display">${word.meaning}</div>
                    <div class="stroke-hint">点击返回 Click to flip back</div>
                </div>
            </div>
        `;
        vocabGrid.appendChild(card);
    });
    
    // Save current week selection
    localStorage.setItem('currentWeek', week);
}

function playAudioAndFlip(cardId, audioFile) {
    const card = document.getElementById(cardId);
    const week = document.getElementById('week-select-vocab').value;
    
    // Play audio
    const audio = new Audio(`audio/week${week}/${audioFile}`);
    audio.play().catch(e => {
        console.log('Audio file not found: ' + audioFile);
        // Show visual feedback
        const audioBtn = card.querySelector('.audio-btn');
        audioBtn.textContent = '🔊✓';
        setTimeout(() => {
            audioBtn.textContent = '🔊';
        }, 1000);
    });
    
    // Flip card after a short delay
    setTimeout(() => {
        card.classList.add('flipped');
    }, 300);
}

function flipBack(cardId) {
    const card = document.getElementById(cardId);
    card.classList.remove('flipped');
}

function shuffleCards() {
    const vocabGrid = document.getElementById('vocab-grid');
    const cards = Array.from(vocabGrid.children);
    
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    
    vocabGrid.innerHTML = '';
    cards.forEach(card => vocabGrid.appendChild(card));
}

function flipAllCards() {
    document.querySelectorAll('.vocab-card').forEach(card => {
        card.classList.add('flipped');
    });
}

function resetAllCards() {
    document.querySelectorAll('.vocab-card').forEach(card => {
        card.classList.remove('flipped');
    });
}

// Dictation functions
function loadDictationWords() {
    const week = document.getElementById('week-select-dictation').value;
    dictationWords = vocabularyData[week] || [];
    
    const wordList = document.getElementById('word-list');
    wordList.innerHTML = '';
    
    dictationWords.forEach(word => {
        const li = document.createElement('li');
        li.textContent = `${word.chinese} (${word.pinyin}) - ${word.meaning}`;
        wordList.appendChild(li);
    });
    
    resetDictation();
}

function startDictation() {
    if (dictationWords.length === 0) {
        alert('请先选择一周的词汇！ Please select a week first!');
        return;
    }
    
    currentWordIndex = 0;
    isPlaying = true;
    
    document.getElementById('start-btn').disabled = true;
    document.getElementById('play-btn').disabled = false;
    document.getElementById('next-btn').disabled = false;
    
    dictationWords = dictationWords.sort(() => Math.random() - 0.5);
    
    showCurrentWord();
    playCurrentWord();
}

function showCurrentWord() {
    const word = dictationWords[currentWordIndex];
    document.getElementById('current-word').textContent = '?';
    document.getElementById('word-info').textContent = `第 ${currentWordIndex + 1} 个 / 共 ${dictationWords.length} 个`;
    
    updateProgress();
}

function playCurrentWord() {
    const word = dictationWords[currentWordIndex];
    const week = document.getElementById('week-select-dictation').value;
    
    const audio = new Audio(`audio/week${week}/${word.audio}`);
    audio.play().catch(e => {
        console.log('Audio file not found');
        alert(`播放词语: ${word.pinyin}`);
    });
}

function nextWord() {
    const word = dictationWords[currentWordIndex];
    document.getElementById('current-word').textContent = word.chinese;
    
    setTimeout(() => {
        currentWordIndex++;
        
        if (currentWordIndex >= dictationWords.length) {
            endDictation();
        } else {
            showCurrentWord();
            playCurrentWord();
        }
    }, 2000);
}

function updateProgress() {
    const progress = (currentWordIndex / dictationWords.length) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';
}

function endDictation() {
    isPlaying = false;
    document.getElementById('current-word').textContent = '练习完成！Well done!';
    document.getElementById('word-info').textContent = '';
    document.getElementById('score-display').textContent = `你完成了 ${dictationWords.length} 个词的听写练习！`;
    
    document.getElementById('start-btn').disabled = false;
    document.getElementById('play-btn').disabled = true;
    document.getElementById('next-btn').disabled = true;
    
    // Save completion to localStorage
    const completions = JSON.parse(localStorage.getItem('dictationCompletions') || '{}');
    const week = document.getElementById('week-select-dictation').value;
    completions[`week${week}`] = new Date().toISOString();
    localStorage.setItem('dictationCompletions', JSON.stringify(completions));
}

function resetDictation() {
    isPlaying = false;
    currentWordIndex = 0;
    document.getElementById('current-word').textContent = '准备开始 Ready to Start';
    document.getElementById('word-info').textContent = '';
    document.getElementById('score-display').textContent = '';
    document.getElementById('progress-fill').style.width = '0%';
    
    document.getElementById('start-btn').disabled = false;
    document.getElementById('play-btn').disabled = true;
    document.getElementById('next-btn').disabled = true;
}

// Oral Practice functions
function revealText(scenarioId) {
    const text = document.getElementById(scenarioId);
    const btn = text.parentElement.querySelector('.reveal-btn');
    
    text.classList.add('visible');
    btn.classList.add('hidden');
}

function toggleRecorder(recorderId) {
    const recorder = document.getElementById(recorderId);
    recorder.style.display = recorder.style.display === 'none' ? 'block' : 'none';
}

async function toggleRecording(btn, recordingId) {
    if (!btn.classList.contains('recording')) {
        // Start recording
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            
            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };
            
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);
                recordings[recordingId] = audioUrl;
            };
            
            mediaRecorder.start();
            btn.classList.add('recording');
            btn.textContent = '⏹️ 停止';
            
            // Show recording indicator
            document.getElementById('recording-indicator').style.display = 'inline-flex';
            
            // Start timer
            startOralTimer();
        } catch (err) {
            alert('请允许使用麦克风进行录音 Please allow microphone access');
        }
    } else {
        // Stop recording
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        btn.classList.remove('recording');
        btn.textContent = '🔴 录音';
        
        // Hide recording indicator
        document.getElementById('recording-indicator').style.display = 'none';
        
        // Stop timer
        stopOralTimer();
    }
}

function playRecording(recordingId) {
    const audioUrl = recordings[recordingId];
    if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play();
    } else {
        alert('还没有录音 No recording yet');
    }
}

function saveRecording(recordingId) {
    const audioUrl = recordings[recordingId];
    if (audioUrl) {
        // Save to localStorage
        const savedRecordings = JSON.parse(localStorage.getItem('oralRecordings') || '{}');
        savedRecordings[recordingId] = {
            date: new Date().toISOString(),
            week: currentWeek
        };
        localStorage.setItem('oralRecordings', JSON.stringify(savedRecordings));
        
        alert('录音已保存！Recording saved!');
    } else {
        alert('没有录音可保存 No recording to save');
    }
}

function startOralTimer() {
    const timerDiv = document.getElementById('timer');
    timerDiv.style.display = 'block';
    oralTimeLeft = 120;
    updateTimer();
    
    oralTimer = setInterval(() => {
        oralTimeLeft--;
        updateTimer();
        
        if (oralTimeLeft <= 0) {
            // Auto stop recording
            document.querySelectorAll('.record-btn.recording').forEach(btn => {
                btn.click();
            });
        }
    }, 1000);
}

function stopOralTimer() {
    clearInterval(oralTimer);
    document.getElementById('timer').style.display = 'none';
}

function updateTimer() {
    const minutes = Math.floor(oralTimeLeft / 60);
    const seconds = oralTimeLeft % 60;
    document.getElementById('timer').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Exercise functions
function markComplete(btn, exerciseId) {
    btn.style.background = '#48bb78';
    btn.textContent = '✓ 已完成';
    btn.disabled = true;
    
    const checkbox = btn.parentElement.parentElement.querySelector('input[type="checkbox"]');
    checkbox.checked = true;
    
    // Save progress
    const progress = JSON.parse(localStorage.getItem('exerciseProgress') || '{}');
    progress[exerciseId] = {
        completed: true,
        date: new Date().toISOString(),
        week: currentWeek
    };
    localStorage.setItem('exerciseProgress', JSON.stringify(progress));
    
    // Play completion sound
    playCompletionSound();
}

function playCompletionSound() {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE');
    audio.volume = 0.2;
    audio.play();
}

function generateReport() {
    const progress = JSON.parse(localStorage.getItem('exerciseProgress') || '{}');
    const dictationCompletions = JSON.parse(localStorage.getItem('dictationCompletions') || '{}');
    const oralRecordings = JSON.parse(localStorage.getItem('oralRecordings') || '{}');
    
    let report = '📊 学习报告 Learning Report\n\n';
    report += `当前周: 第${currentWeek}周\n\n`;
    
    // Exercise completion
    const exerciseCount = Object.keys(progress).filter(key => progress[key].completed).length;
    report += `✅ 综合练习完成: ${exerciseCount}/5\n`;
    
    // Dictation completion
    const dictationCount = Object.keys(dictationCompletions).length;
    report += `🎧 听写练习完成: ${dictationCount} 周\n`;
    
    // Oral recordings
    const oralCount = Object.keys(oralRecordings).length;
    report += `🎤 口语录音: ${oralCount} 个\n\n`;
    
    report += '继续加油！Keep up the good work! 💪';
    
    alert(report);
}

function saveProgress() {
    const progressData = {
        currentWeek: currentWeek,
        currentTab: document.querySelector('.tab.active').textContent,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('progressData', JSON.stringify(progressData));
    alert('进度已保存！Progress saved! ✅');
}

function updateWeekInfo(week) {
    const weekInfo = document.getElementById('week-info');
    const weekNames = {
        1: '第1周 Week 1 - 基础问候',
        2: '第2周 Week 2 - 学校生活',
        3: '第3周 Week 3 - 时间表达',
        4: '第4周 Week 4 - 家庭成员'
    };
    weekInfo.textContent = weekNames[week] || `第${week}周 Week ${week}`;
}

// Load saved progress on page load
function loadSavedProgress() {
    // Load exercise progress
    const progress = JSON.parse(localStorage.getItem('exerciseProgress') || '{}');
    Object.keys(progress).forEach(exerciseId => {
        if (progress[exerciseId].completed) {
            const checkbox = document.getElementById(exerciseId);
            if (checkbox) {
                checkbox.checked = true;
                const btn = checkbox.parentElement.parentElement.querySelector('.check-btn');
                if (btn) {
                    btn.style.background = '#48bb78';
                    btn.textContent = '✓ 已完成';
                    btn.disabled = true;
                }
            }
        }
    });
    
    // Load saved week
    const savedWeek = localStorage.getItem('currentWeek') || '1';
    document.getElementById('week-select-vocab').value = savedWeek;
    document.getElementById('week-select-dictation').value = savedWeek;
    
    // Load saved tab
    const savedTab = localStorage.getItem('currentTab');
    if (savedTab) {
        document.querySelector(`[onclick="switchTab('${savedTab}')"]`).click();
    }
}

// Load custom vocabulary if available
function loadCustomVocabulary() {
    const customVocab = localStorage.getItem('customVocabulary');
    if (customVocab) {
        try {
            const parsed = JSON.parse(customVocab);
            // Merge with default vocabulary
            Object.keys(parsed).forEach(week => {
                if (parsed[week] && parsed[week].length > 0) {
                    vocabularyData[week] = parsed[week];
                }
            });
            console.log('Loaded custom vocabulary');
        } catch (error) {
            console.error('Error loading custom vocabulary:', error);
        }
    }
}

// Initialize
window.onload = function() {
    loadCustomVocabulary();
    loadVocabulary();
    loadDictationWords();
    loadSavedProgress();
    
    console.log('中文作业助手已准备就绪！Chinese Homework Helper is ready!');
};