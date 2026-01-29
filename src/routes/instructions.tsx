import { createFileRoute } from '@tanstack/react-router'
import { useState, useCallback, useMemo, useEffect } from 'react'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/instructions')({
  component: InstructionsPage,
})

// Instruction terms data
interface InstructionTerm {
  category: string
  chinese: string
  pinyin: string
  english: string
  explanation: string
}

const instructionTerms: InstructionTerm[] = [
  // Vocabulary Section
  {
    category: 'vocabulary',
    chinese: '字词学习',
    pinyin: 'zì cí xué xí',
    english: 'Vocabulary Learning',
    explanation: 'The section for learning new words and phrases',
  },
  {
    category: 'vocabulary',
    chinese: '序号',
    pinyin: 'xù hào',
    english: 'Serial Number',
    explanation: 'The number or order of items in a list',
  },
  {
    category: 'vocabulary',
    chinese: '识写字词',
    pinyin: 'shí xiě zì cí',
    english: 'Words to Read and Write',
    explanation: 'Words that students must learn to both recognize and write',
  },
  {
    category: 'vocabulary',
    chinese: '识读字词',
    pinyin: 'shí dú zì cí',
    english: 'Words to Read',
    explanation: 'Words that students only need to recognize and read, not write',
  },
  {
    category: 'vocabulary',
    chinese: '解释',
    pinyin: 'jiě shì',
    english: 'Definition / Explanation',
    explanation: 'The meaning or definition of a word',
  },
  {
    category: 'vocabulary',
    chinese: '构词',
    pinyin: 'gòu cí',
    english: 'Word Formation',
    explanation: 'How words are formed or combined with other characters',
  },
  {
    category: 'vocabulary',
    chinese: '搭配',
    pinyin: 'dā pèi',
    english: 'Word Combinations',
    explanation: 'Words that commonly go together',
  },
  {
    category: 'vocabulary',
    chinese: '例句',
    pinyin: 'lì jù',
    english: 'Example Sentence',
    explanation: 'A sentence showing how to use the word',
  },
  {
    category: 'vocabulary',
    chinese: '读一读',
    pinyin: 'dú yī dú',
    english: 'Read It',
    explanation: 'Instruction to read the following content aloud',
  },
  {
    category: 'vocabulary',
    chinese: '词语搭配',
    pinyin: 'cí yǔ dā pèi',
    english: 'Word Collocations',
    explanation: 'Common word pairings and phrases',
  },
  {
    category: 'vocabulary',
    chinese: '听写词语',
    pinyin: 'tīng xiě cí yǔ',
    english: 'Dictation Words',
    explanation: 'Words for spelling practice - listen and write',
  },

  // Exercises Section
  {
    category: 'exercises',
    chinese: '语文应用',
    pinyin: 'yǔ wén yìng yòng',
    english: 'Chinese Application',
    explanation: 'Exercises to apply Chinese language skills',
  },
  {
    category: 'exercises',
    chinese: '从所提供的选项中选出正确的答案',
    pinyin: 'cóng suǒ tí gōng de xuǎn xiàng zhōng xuǎn chū zhèng què de dá àn',
    english: 'Choose the correct answer from the options provided',
    explanation: 'Multiple choice question instruction',
  },
  {
    category: 'exercises',
    chinese: '本页得分',
    pinyin: 'běn yè dé fēn',
    english: 'Score for this page',
    explanation: 'The marks earned on this page',
  },
  {
    category: 'exercises',
    chinese: '选出适当的词语',
    pinyin: 'xuǎn chū shì dàng de cí yǔ',
    english: 'Select the appropriate word',
    explanation: 'Choose the right word to fill in the blank',
  },
  {
    category: 'exercises',
    chinese: '把代表它的数字填写在括号里',
    pinyin: 'bǎ dài biǎo tā de shù zì tián xiě zài kuò hào lǐ',
    english: 'Write the number representing it in the brackets',
    explanation: 'Write your answer number inside the parentheses',
  },
  {
    category: 'exercises',
    chinese: '改写句子',
    pinyin: 'gǎi xiě jù zi',
    english: 'Rewrite Sentences',
    explanation: 'Change or rewrite the sentence in a different way',
  },
  {
    category: 'exercises',
    chinese: '把两个句子合并成一个完整的句子',
    pinyin: 'bǎ liǎng gè jù zi hé bìng chéng yī gè wán zhěng de jù zi',
    english: 'Combine two sentences into one complete sentence',
    explanation: 'Join two sentences together into one',
  },
  {
    category: 'exercises',
    chinese: '加上适当的标点符号',
    pinyin: 'jiā shàng shì dàng de biāo diǎn fú hào',
    english: 'Add appropriate punctuation',
    explanation: 'Put in the correct punctuation marks',
  },
  {
    category: 'exercises',
    chinese: '组句成段',
    pinyin: 'zǔ jù chéng duàn',
    english: 'Arrange sentences into paragraph',
    explanation: 'Put sentences in order to form a paragraph',
  },
  {
    category: 'exercises',
    chinese: '按正确的顺序将句子排列出来',
    pinyin: 'àn zhèng què de shùn xù jiāng jù zi pái liè chū lái',
    english: 'Arrange sentences in the correct order',
    explanation: 'Put the sentences in the right sequence',
  },
  {
    category: 'exercises',
    chinese: '在括号里写上序号',
    pinyin: 'zài kuò hào lǐ xiě shàng xù hào',
    english: 'Write the serial number in the brackets',
    explanation: 'Number the items in order in the parentheses',
  },

  // Reading Section
  {
    category: 'reading',
    chinese: '阅读计划',
    pinyin: 'yuè dú jì huà',
    english: 'Reading Plan',
    explanation: 'A schedule or plan for reading activities',
  },
  {
    category: 'reading',
    chinese: '阅读作品',
    pinyin: 'yuè dú zuò pǐn',
    english: 'Reading Material',
    explanation: 'The book or text being read',
  },
  {
    category: 'reading',
    chinese: '阅读时间',
    pinyin: 'yuè dú shí jiān',
    english: 'Reading Time',
    explanation: 'How long spent reading',
  },
  {
    category: 'reading',
    chinese: '分钟',
    pinyin: 'fēn zhōng',
    english: 'Minutes',
    explanation: 'Unit of time measurement',
  },
  {
    category: 'reading',
    chinese: '考查情况',
    pinyin: 'kǎo chá qíng kuàng',
    english: 'Assessment Status',
    explanation: 'How well the student performed',
  },
  {
    category: 'reading',
    chinese: '考查标准',
    pinyin: 'kǎo chá biāo zhǔn',
    english: 'Assessment Criteria',
    explanation: 'The standards used to evaluate performance',
  },
  {
    category: 'reading',
    chinese: '请家长在以上的时间栏里签名',
    pinyin: 'qǐng jiā zhǎng zài yǐ shàng de shí jiān lán lǐ qiān míng',
    english: 'Please have parents sign in the time column above',
    explanation: 'Parent signature required for verification',
  },
  {
    category: 'reading',
    chinese: '阅读，是生命的源泉',
    pinyin: 'yuè dú, shì shēng mìng de yuán quán',
    english: 'Reading is the source of life',
    explanation: 'A motivational phrase about the importance of reading',
  },

  // Oral Practice Section
  {
    category: 'oral',
    chinese: '看图说话',
    pinyin: 'kàn tú shuō huà',
    english: 'Picture Description',
    explanation: 'Describe what you see in a picture - oral practice',
  },
  {
    category: 'oral',
    chinese: '描述图片',
    pinyin: 'miáo shù tú piàn',
    english: 'Describe the Picture',
    explanation: 'Tell what is happening in the picture',
  },
  {
    category: 'oral',
    chinese: '感受',
    pinyin: 'gǎn shòu',
    english: 'Feeling (F)',
    explanation: 'FORIF: Express how you feel about what you see',
  },
  {
    category: 'oral',
    chinese: '看法',
    pinyin: 'kàn fǎ',
    english: 'Opinion (O)',
    explanation: 'FORIF: Share your thoughts or opinion',
  },
  {
    category: 'oral',
    chinese: '原因',
    pinyin: 'yuán yīn',
    english: 'Reason (R)',
    explanation: 'FORIF: Give reasons to support your opinion',
  },
  {
    category: 'oral',
    chinese: '如果',
    pinyin: 'rú guǒ',
    english: 'If (IF)',
    explanation: 'FORIF: Suggest what you would do if you were in the situation',
  },
]

const categoryNames: Record<string, string> = {
  vocabulary: 'Vocabulary Terms',
  exercises: 'Exercise Instructions',
  reading: 'Reading Terms',
  oral: 'Oral Practice Terms',
}

const categoryFilters = [
  { id: 'all', label: 'All' },
  { id: 'vocabulary', label: 'Vocabulary' },
  { id: 'exercises', label: 'Exercises' },
  { id: 'reading', label: 'Reading' },
  { id: 'oral', label: 'Oral' },
]

interface TermCardProps {
  term: InstructionTerm
}

function TermCard({ term }: TermCardProps) {
  const { play } = useAudioPlayer()
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlayAudio = useCallback(async () => {
    setIsPlaying(true)
    const audioPath = `audio/${term.chinese}.mp3`
    await play(audioPath)
    setTimeout(() => setIsPlaying(false), 500)
  }, [term.chinese, play])

  return (
    <div className="term-card">
      <div className="term-header">
        <button
          className={cn('instructions-audio-btn', isPlaying && 'playing')}
          onClick={handlePlayAudio}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>
        </button>
        <div className="term-chinese">{term.chinese}</div>
      </div>
      <div className="term-pinyin">{term.pinyin}</div>
      <div className="term-english">{term.english}</div>
      <div className="term-explanation">{term.explanation}</div>
    </div>
  )
}

interface QuizQuestion {
  term: InstructionTerm
  options: string[]
}

function LearnView() {
  const [currentCategory, setCurrentCategory] = useState('all')

  const filteredTerms = useMemo(() => {
    return currentCategory === 'all'
      ? instructionTerms
      : instructionTerms.filter((t) => t.category === currentCategory)
  }, [currentCategory])

  const groupedTerms = useMemo(() => {
    const grouped: Record<string, InstructionTerm[]> = {}
    filteredTerms.forEach((term) => {
      if (!grouped[term.category]) {
        grouped[term.category] = []
      }
      grouped[term.category].push(term)
    })
    return grouped
  }, [filteredTerms])

  return (
    <div className="glossary-container active">
      <div className="category-filter">
        {categoryFilters.map((filter) => (
          <button
            key={filter.id}
            className={cn('category-btn', currentCategory === filter.id && 'active')}
            onClick={() => setCurrentCategory(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div id="glossary-content">
        {Object.entries(groupedTerms).map(([category, terms]) => (
          <div key={category} className="glossary-section">
            <h2 className="section-title">{categoryNames[category]}</h2>
            {terms.map((term, index) => (
              <TermCard key={index} term={term} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function QuizView() {
  const { play } = useAudioPlayer()
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const generateQuiz = useCallback(() => {
    // Shuffle and pick 10 questions
    const shuffled = [...instructionTerms].sort(() => Math.random() - 0.5)
    const selectedQuestions = shuffled.slice(0, 10)

    const questions: QuizQuestion[] = selectedQuestions.map((term) => {
      // Generate wrong options (3 random different answers)
      const wrongOptions = instructionTerms
        .filter((t) => t.chinese !== term.chinese)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((t) => t.english)

      // Combine and shuffle options
      const options = [term.english, ...wrongOptions].sort(() => Math.random() - 0.5)

      return { term, options }
    })

    setQuizQuestions(questions)
    setCurrentQuestionIndex(0)
    setScore(0)
    setSelectedAnswer(null)
    setShowFeedback(false)
  }, [])

  // Initialize quiz on mount
  useEffect(() => {
    generateQuiz()
  }, [generateQuiz])

  const currentQuestion = quizQuestions[currentQuestionIndex]

  const handlePlayAudio = useCallback(async () => {
    if (!currentQuestion) return
    setIsPlaying(true)
    const audioPath = `audio/${currentQuestion.term.chinese}.mp3`
    await play(audioPath)
    setTimeout(() => setIsPlaying(false), 500)
  }, [currentQuestion, play])

  const handleAnswer = useCallback(
    (answer: string) => {
      if (showFeedback || !currentQuestion) return

      setSelectedAnswer(answer)
      setShowFeedback(true)

      if (answer === currentQuestion.term.english) {
        setScore((s) => s + 1)
      }
    },
    [showFeedback, currentQuestion]
  )

  const handleNext = useCallback(() => {
    setCurrentQuestionIndex((i) => i + 1)
    setSelectedAnswer(null)
    setShowFeedback(false)
  }, [])

  // Show loading state while quiz is being generated
  if (quizQuestions.length === 0) {
    return (
      <div className="quiz-container active">
        <div className="quiz-card">
          <p>Loading quiz...</p>
        </div>
      </div>
    )
  }

  // Show results
  if (currentQuestionIndex >= quizQuestions.length) {
    const percentage = Math.round((score / quizQuestions.length) * 100)
    let message = ''
    if (percentage === 100) {
      message = 'Perfect! Excellent work!'
    } else if (percentage >= 80) {
      message = 'Great job! Keep it up!'
    } else if (percentage >= 60) {
      message = 'Good effort! Review and try again!'
    } else {
      message = 'Keep practicing! You can do it!'
    }

    return (
      <div className="quiz-container active">
        <div className="quiz-results">
          <div className="results-score">
            {score}/{quizQuestions.length}
          </div>
          <div className="results-message">{message}</div>
          <button className="restart-btn" onClick={generateQuiz}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const isCorrect = selectedAnswer === currentQuestion.term.english

  return (
    <div className="quiz-container active">
      <div className="quiz-progress">
        Question <span id="current-q">{currentQuestionIndex + 1}</span> of{' '}
        <span id="total-q">{quizQuestions.length}</span>
        <div className="quiz-score">
          Score: <span id="quiz-score">{score}</span>
        </div>
      </div>

      <div className="quiz-card">
        <div className="quiz-question-label">What does this mean?</div>
        <button className={cn('quiz-audio-btn', isPlaying && 'playing')} onClick={handlePlayAudio}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>
        </button>
        <div className="quiz-term">{currentQuestion.term.chinese}</div>
        <div className="quiz-pinyin">{currentQuestion.term.pinyin}</div>
        <div className="quiz-options">
          {currentQuestion.options.map((option, i) => (
            <button
              key={i}
              className={cn(
                'quiz-option',
                showFeedback && 'disabled',
                showFeedback && option === currentQuestion.term.english && 'correct',
                showFeedback && selectedAnswer === option && !isCorrect && 'incorrect'
              )}
              onClick={() => handleAnswer(option)}
              disabled={showFeedback}
            >
              {option}
            </button>
          ))}
        </div>
        {showFeedback && (
          <div className={cn('quiz-feedback', isCorrect ? 'correct' : 'incorrect')}>
            {isCorrect ? 'Correct!' : `Incorrect. The answer is: ${currentQuestion.term.english}`}
          </div>
        )}
        {showFeedback && (
          <button className="quiz-next-btn visible" onClick={handleNext}>
            Next Question
          </button>
        )}
      </div>
    </div>
  )
}

function InstructionsPage() {
  const [currentView, setCurrentView] = useState<'glossary' | 'quiz'>('glossary')

  return (
    <div className="instructions-page">
      <div className="instructions-header">
        <h1>Instructions Glossary</h1>
        <p>zhishi ciyu</p>
      </div>

      <div className="nav-tabs">
        <button
          className={cn('nav-tab', currentView === 'glossary' && 'active')}
          onClick={() => setCurrentView('glossary')}
        >
          Learn
        </button>
        <button
          className={cn('nav-tab', currentView === 'quiz' && 'active')}
          onClick={() => setCurrentView('quiz')}
        >
          Quiz
        </button>
      </div>

      <div className="instructions-content">
        {currentView === 'glossary' ? <LearnView /> : <QuizView />}
      </div>
    </div>
  )
}
