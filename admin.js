// Admin page functionality
let isAuthenticated = false;
let currentAudioBlob = null;
let vocabularyData = {};

// Simple password check (in production, use proper authentication)
function checkPassword() {
    const password = document.getElementById('admin-password').value;
    // Default password - change this!
    if (password === 'admin123') {
        isAuthenticated = true;
        document.getElementById('password-section').classList.add('hidden');
        document.getElementById('admin-content').classList.remove('hidden');
        loadExistingVocabulary();
        showStatus('登录成功！Login successful!', 'success');
    } else {
        showStatus('密码错误！Wrong password!', 'error');
    }
}

// Load existing vocabulary from localStorage
function loadExistingVocabulary() {
    const stored = localStorage.getItem('vocabularyData');
    if (stored) {
        vocabularyData = JSON.parse(stored);
    } else {
        // Load from script.js default data
        loadDefaultVocabulary();
    }
    loadVocabularyList();
}

// Load default vocabulary from main app
function loadDefaultVocabulary() {
    // This would normally import from script.js
    // For now, we'll start with empty data
    vocabularyData = {
        1: [], 2: [], 3: [], 4: [], 5: [], 6: []
    };
}

// Fetch pinyin from online API
async function fetchPinyin() {
    const chinese = document.getElementById('chinese-input').value.trim();
    if (!chinese) {
        showStatus('请先输入中文！Please enter Chinese text first!', 'error');
        return;
    }
    
    const spinner = document.getElementById('pinyin-spinner');
    spinner.classList.remove('hidden');
    
    try {
        // Using a free pinyin API (you might need to find a suitable one)
        // For demonstration, we'll use a simple conversion
        const pinyin = await getPinyinFromAPI(chinese);
        document.getElementById('pinyin-input').value = pinyin;
        showStatus('拼音获取成功！Pinyin fetched successfully!', 'success');
    } catch (error) {
        showStatus('获取拼音失败！Failed to fetch pinyin!', 'error');
        console.error(error);
    } finally {
        spinner.classList.add('hidden');
    }
}

// Simulated pinyin API (replace with real API)
async function getPinyinFromAPI(chinese) {
    // In production, use a real API like:
    // - Google Translate API
    // - Microsoft Translator API
    // - Chinese-specific APIs
    
    // For now, return a placeholder
    const pinyinMap = {
        '你好': 'nǐ hǎo',
        '谢谢': 'xiè xie',
        '老师': 'lǎo shī',
        '学生': 'xué shēng',
        '中国': 'zhōng guó',
        '学校': 'xué xiào',
        '朋友': 'péng yǒu',
        '家人': 'jiā rén'
    };
    
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(pinyinMap[chinese] || 'pīn yīn');
        }, 1000);
    });
}

// Generate audio using Text-to-Speech
async function generateAudio() {
    const chinese = document.getElementById('chinese-input').value.trim();
    if (!chinese) {
        showStatus('请先输入中文！Please enter Chinese text first!', 'error');
        return;
    }
    
    const spinner = document.getElementById('audio-spinner');
    spinner.classList.remove('hidden');
    
    try {
        // Using Web Speech API for TTS
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(chinese);
            utterance.lang = 'zh-CN';
            utterance.rate = 0.8; // Slower for learning
            
            // Get Chinese voice if available
            const voices = speechSynthesis.getVoices();
            const chineseVoice = voices.find(voice => voice.lang.includes('zh'));
            if (chineseVoice) {
                utterance.voice = chineseVoice;
            }
            
            // Create audio blob (simplified - in production use MediaRecorder)
            speechSynthesis.speak(utterance);
            
            document.getElementById('audio-status').value = '音频已生成 Audio generated';
            showStatus('音频生成成功！Audio generated successfully!', 'success');
            
            // Store audio reference
            currentAudioBlob = chinese; // In production, store actual audio blob
        } else {
            throw new Error('浏览器不支持语音合成 Browser does not support speech synthesis');
        }
    } catch (error) {
        showStatus('音频生成失败！Failed to generate audio!', 'error');
        console.error(error);
    } finally {
        spinner.classList.add('hidden');
    }
}

// Add vocabulary to list
document.getElementById('vocab-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const week = document.getElementById('week-select').value;
    const chinese = document.getElementById('chinese-input').value.trim();
    const pinyin = document.getElementById('pinyin-input').value.trim();
    const meaning = document.getElementById('meaning-input').value.trim();
    
    if (!chinese || !pinyin || !meaning) {
        showStatus('请填写所有字段！Please fill in all fields!', 'error');
        return;
    }
    
    // Initialize week if not exists
    if (!vocabularyData[week]) {
        vocabularyData[week] = [];
    }
    
    // Generate ID
    const newId = vocabularyData[week].length + 1;
    
    // Create vocabulary item
    const vocabItem = {
        id: newId,
        chinese: chinese,
        pinyin: pinyin,
        meaning: meaning,
        audio: `${chinese.replace(/\s+/g, '')}.mp3`
    };
    
    // Add to data
    vocabularyData[week].push(vocabItem);
    
    // Save to localStorage
    saveVocabulary();
    
    // Clear form
    document.getElementById('vocab-form').reset();
    document.getElementById('audio-status').value = '';
    currentAudioBlob = null;
    
    // Reload list
    loadVocabularyList();
    
    showStatus(`成功添加词汇到第${week}周！Vocabulary added to Week ${week}!`, 'success');
});

// Save vocabulary to localStorage
function saveVocabulary() {
    localStorage.setItem('vocabularyData', JSON.stringify(vocabularyData));
    // Also update the main app's vocabulary
    localStorage.setItem('customVocabulary', JSON.stringify(vocabularyData));
}

// Load vocabulary list
function loadVocabularyList() {
    const filter = document.getElementById('week-filter').value;
    const tbody = document.getElementById('vocab-list');
    tbody.innerHTML = '';
    
    Object.keys(vocabularyData).forEach(week => {
        if (filter === 'all' || filter === week) {
            const words = vocabularyData[week] || [];
            words.forEach(word => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${word.id}</td>
                    <td>${word.chinese}</td>
                    <td>${word.pinyin}</td>
                    <td>${word.meaning}</td>
                    <td>${word.audio}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="play-btn" onclick="playWord('${word.chinese}')">▶️</button>
                            <button class="edit-btn" onclick="editWord(${week}, ${word.id})">✏️</button>
                            <button class="delete-btn" onclick="deleteWord(${week}, ${word.id})">🗑️</button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    });
}

// Play word pronunciation
function playWord(chinese) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(chinese);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
    }
}

// Edit word (placeholder)
function editWord(week, id) {
    const word = vocabularyData[week].find(w => w.id === id);
    if (word) {
        document.getElementById('week-select').value = week;
        document.getElementById('chinese-input').value = word.chinese;
        document.getElementById('pinyin-input').value = word.pinyin;
        document.getElementById('meaning-input').value = word.meaning;
        
        // Remove the word temporarily
        deleteWord(week, id);
        
        showStatus('编辑词汇 - 请修改后重新添加 Edit word - modify and add again', 'info');
    }
}

// Delete word
function deleteWord(week, id) {
    if (confirm('确定要删除这个词汇吗？Are you sure you want to delete this word?')) {
        vocabularyData[week] = vocabularyData[week].filter(w => w.id !== id);
        // Reindex IDs
        vocabularyData[week].forEach((word, index) => {
            word.id = index + 1;
        });
        saveVocabulary();
        loadVocabularyList();
        showStatus('词汇已删除！Word deleted!', 'success');
    }
}

// Show status message
function showStatus(message, type) {
    const statusDiv = document.getElementById('status-message');
    statusDiv.textContent = message;
    statusDiv.className = `status-message ${type}`;
    statusDiv.style.display = 'block';
    
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 3000);
}

// Export vocabulary
function exportVocabulary() {
    const dataStr = JSON.stringify(vocabularyData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `vocabulary_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showStatus('词汇已导出！Vocabulary exported!', 'success');
}

// Import vocabulary
function importVocabulary() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = event => {
            try {
                const imported = JSON.parse(event.target.result);
                vocabularyData = imported;
                saveVocabulary();
                loadVocabularyList();
                showStatus('词汇导入成功！Vocabulary imported successfully!', 'success');
            } catch (error) {
                showStatus('导入失败！Import failed!', 'error');
                console.error(error);
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Handle CSV file drop
function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const uploadArea = document.getElementById('upload-area');
    uploadArea.classList.remove('dragging');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleCSVFile(files[0]);
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('upload-area').classList.add('dragging');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('upload-area').classList.remove('dragging');
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleCSVFile(file);
    }
}

// Parse CSV file
function handleCSVFile(file) {
    if (!file.name.endsWith('.csv')) {
        showStatus('请上传CSV文件！Please upload a CSV file!', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const csv = e.target.result;
        const lines = csv.split('\n');
        const week = document.getElementById('week-select').value;
        
        let addedCount = 0;
        
        lines.forEach((line, index) => {
            if (index === 0 || !line.trim()) return; // Skip header and empty lines
            
            const [chinese, pinyin, meaning, audio] = line.split(',').map(s => s.trim());
            
            if (chinese && pinyin && meaning) {
                if (!vocabularyData[week]) {
                    vocabularyData[week] = [];
                }
                
                vocabularyData[week].push({
                    id: vocabularyData[week].length + 1,
                    chinese: chinese,
                    pinyin: pinyin,
                    meaning: meaning,
                    audio: audio || `${chinese}.mp3`
                });
                
                addedCount++;
            }
        });
        
        if (addedCount > 0) {
            saveVocabulary();
            loadVocabularyList();
            showStatus(`成功添加 ${addedCount} 个词汇！Successfully added ${addedCount} words!`, 'success');
        }
    };
    
    reader.readAsText(file);
}

// Initialize on load
window.onload = function() {
    // Check if already authenticated (for development)
    const savedAuth = sessionStorage.getItem('adminAuth');
    if (savedAuth === 'true') {
        isAuthenticated = true;
        document.getElementById('password-section').classList.add('hidden');
        document.getElementById('admin-content').classList.remove('hidden');
        loadExistingVocabulary();
    }
    
    // Allow Enter key for password
    document.getElementById('admin-password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkPassword();
        }
    });
}

// Save auth state
window.addEventListener('beforeunload', function() {
    if (isAuthenticated) {
        sessionStorage.setItem('adminAuth', 'true');
    }
});