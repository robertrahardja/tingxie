import { useState, useCallback, useRef } from 'react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/shuihu-writing')({
  component: ShuihuWritingPage,
})

interface WordDefinition {
  pinyin: string
  english: string
  explanation: string
}

const wordDefs: Record<string, WordDefinition> = {
  '参考': { pinyin: 'cān kǎo', english: 'to refer to; reference', explanation: '查看别的东西来帮助自己' },
  '课本': { pinyin: 'kè běn', english: 'textbook', explanation: '上课用的书' },
  '阅读': { pinyin: 'yuè dú', english: 'to read', explanation: '看书或文章' },
  '放大镜': { pinyin: 'fàng dà jìng', english: 'magnifying glass', explanation: '让东西看起来更大的工具' },
  '根据': { pinyin: 'gēn jù', english: 'according to; based on', explanation: '按照某个东西来做' },
  '提示': { pinyin: 'tí shì', english: 'hint; prompt', explanation: '给你一些帮助的信息' },
  '水壶': { pinyin: 'shuǐ hú', english: 'water bottle', explanation: '用来装水喝水的容器' },
  '图案': { pinyin: 'tú àn', english: 'pattern; design', explanation: '画在东西上面的图画' },
  '形状': { pinyin: 'xíng zhuàng', english: 'shape', explanation: '东西的样子，比如圆的、方的' },
  '颜色': { pinyin: 'yán sè', english: 'color', explanation: '红色、蓝色等不同的色彩' },
  '怎么': { pinyin: 'zěn me', english: 'how; why', explanation: '用来问方法的词' },
  '使用': { pinyin: 'shǐ yòng', english: 'to use', explanation: '拿来用' },
  '东西': { pinyin: 'dōng xi', english: 'thing; stuff', explanation: '物品，任何事物' },
  '蓝色': { pinyin: 'lán sè', english: 'blue', explanation: '天空和大海的颜色' },
  '红色': { pinyin: 'hóng sè', english: 'red', explanation: '像火和血一样的颜色' },
  '白色': { pinyin: 'bái sè', english: 'white', explanation: '像雪和牛奶一样的颜色' },
  '圆柱形': { pinyin: 'yuán zhù xíng', english: 'cylindrical shape', explanation: '像柱子一样圆圆长长的形状' },
  '正方形': { pinyin: 'zhèng fāng xíng', english: 'square shape', explanation: '四条边一样长的形状' },
  '卡通': { pinyin: 'kǎ tōng', english: 'cartoon', explanation: '动画片里面的人物和画' },
  '人物': { pinyin: 'rén wù', english: 'character; figure', explanation: '故事或画里面的人' },
  '动物': { pinyin: 'dòng wù', english: 'animal', explanation: '猫、狗、鸟等有生命的东西' },
  '花朵': { pinyin: 'huā duǒ', english: 'flower', explanation: '植物上面漂亮的部分' },
  '吸管': { pinyin: 'xī guǎn', english: 'straw (drinking)', explanation: '用来吸水喝的管子' },
  '带子': { pinyin: 'dài zi', english: 'strap; band', explanation: '细长的条，可以挂东西' },
  '其他': { pinyin: 'qí tā', english: 'other; else', explanation: '除了已经说的以外的' },
  '按按钮': { pinyin: 'àn àn niǔ', english: 'press a button', explanation: '用手指按下按钮' },
  '打开': { pinyin: 'dǎ kāi', english: 'to open', explanation: '把关着的东西弄开' },
  '盖子': { pinyin: 'gài zi', english: 'lid; cap', explanation: '盖在上面的东西' },
  '内容': { pinyin: 'nèi róng', english: 'content', explanation: '里面包含的东西' },
  '符合': { pinyin: 'fú hé', english: 'to match; conform to', explanation: '和要求一样' },
  '题目': { pinyin: 'tí mù', english: 'topic; title', explanation: '作文或练习的主题' },
  '要求': { pinyin: 'yāo qiú', english: 'requirement', explanation: '需要做到的事情' },
  '完整': { pinyin: 'wán zhěng', english: 'complete; whole', explanation: '全部都有，没有缺少' },
  '条理': { pinyin: 'tiáo lǐ', english: 'orderly; logical', explanation: '写得有顺序，很清楚' },
  '清楚': { pinyin: 'qīng chǔ', english: 'clear', explanation: '容易明白，不模糊' },
  '语文': { pinyin: 'yǔ wén', english: 'language (subject)', explanation: '学习语言和文字的科目' },
  '表达': { pinyin: 'biǎo dá', english: 'to express', explanation: '把想法说出来或写出来' },
  '连贯': { pinyin: 'lián guàn', english: 'coherent; flowing', explanation: '前后连接得很好' },
  '句子': { pinyin: 'jù zi', english: 'sentence', explanation: '一句完整的话' },
  '通顺': { pinyin: 'tōng shùn', english: 'smooth; fluent', explanation: '读起来很顺，不别扭' },
  '词语': { pinyin: 'cí yǔ', english: 'words; vocabulary', explanation: '由字组成的词' },
  '正确': { pinyin: 'zhèng què', english: 'correct; right', explanation: '没有错误的' },
  '汉字': { pinyin: 'hàn zì', english: 'Chinese character', explanation: '中文的字' },
  '拼音': { pinyin: 'pīn yīn', english: 'pinyin', explanation: '用字母表示汉字读音的方法' },
  '段落': { pinyin: 'duàn luò', english: 'paragraph', explanation: '文章的一段' },
  '格式': { pinyin: 'gé shì', english: 'format', explanation: '写文章的排列方式' },
  '标点': { pinyin: 'biāo diǎn', english: 'punctuation', explanation: '句号、逗号等符号' },
  '缺漏': { pinyin: 'quē lòu', english: 'gaps; omissions', explanation: '少了一些东西' },
  '错误': { pinyin: 'cuò wù', english: 'error; mistake', explanation: '做错了的地方' },
  '配件': { pinyin: 'pèi jiàn', english: 'accessory; part', explanation: '和主要东西一起用的小东西' },
  '按钮': { pinyin: 'àn niǔ', english: 'button', explanation: '可以按下去的东西' },
  '提环': { pinyin: 'tí huán', english: 'carrying ring/handle', explanation: '用来提东西的环形把手' },
  '检查': { pinyin: 'jiǎn chá', english: 'to check; inspect', explanation: '仔细看有没有问题' },
  '错别字': { pinyin: 'cuò bié zì', english: 'wrongly written character', explanation: '写错了的字' },
  '方面': { pinyin: 'fāng miàn', english: 'aspect; side', explanation: '事情的某一部分' },
  '做到': { pinyin: 'zuò dào', english: 'to accomplish', explanation: '完成了某件事' },
  '上面': { pinyin: 'shàng miàn', english: 'on top; above', explanation: '在东西的上边' },
  '什么': { pinyin: 'shén me', english: 'what', explanation: '用来问东西的词' },
  '能': { pinyin: 'néng', english: 'can; able to', explanation: '有能力做某事' },
  '喝到': { pinyin: 'hē dào', english: 'to drink; to get a drink', explanation: '把水喝进嘴里' },
  '水': { pinyin: 'shuǐ', english: 'water', explanation: '我们每天要喝的液体' },
  '写': { pinyin: 'xiě', english: 'to write', explanation: '用笔把字写出来' },
  '自己': { pinyin: 'zì jǐ', english: 'oneself', explanation: '指你自己' },
  '的': { pinyin: 'de', english: '(possessive particle)', explanation: '表示所属关系的词' },
  '是': { pinyin: 'shì', english: 'is; am; are', explanation: '表示某样东西是什么' },
  '有': { pinyin: 'yǒu', english: 'have; there is', explanation: '表示存在或拥有' },
  '它': { pinyin: 'tā', english: 'it', explanation: '指代物品' },
  '或': { pinyin: 'huò', english: 'or', explanation: '表示选择' },
  '我': { pinyin: 'wǒ', english: 'I; me', explanation: '指自己' },
  '了': { pinyin: 'le', english: '(completed action)', explanation: '表示动作完成了' },
  '不': { pinyin: 'bù', english: 'not; no', explanation: '表示否定' },
  '多数': { pinyin: 'duō shù', english: 'majority; most', explanation: '大部分的' },
  '非常': { pinyin: 'fēi cháng', english: 'very; extremely', explanation: '程度很高' },
  '比较': { pinyin: 'bǐ jiào', english: 'comparatively; rather', explanation: '和别的比一比' },
  '不够': { pinyin: 'bú gòu', english: 'not enough', explanation: '没有达到需要的程度' },
  '不多': { pinyin: 'bù duō', english: 'not many', explanation: '数量很少' },
  '较多': { pinyin: 'jiào duō', english: 'relatively many', explanation: '比较多' },
  '严重': { pinyin: 'yán zhòng', english: 'serious; severe', explanation: '问题很大' },
  '完全': { pinyin: 'wán quán', english: 'completely', explanation: '全部都是' },
  '下面': { pinyin: 'xià miàn', english: 'below; following', explanation: '在后面的部分' },
}

function segmentText(text: string): Array<{ text: string; isWord: boolean; def?: WordDefinition }> {
  const segments: Array<{ text: string; isWord: boolean; def?: WordDefinition }> = []
  let i = 0

  while (i < text.length) {
    let matched = false

    for (let len = Math.min(7, text.length - i); len > 0; len--) {
      const substr = text.substr(i, len)
      if (wordDefs[substr]) {
        segments.push({ text: substr, isWord: true, def: wordDefs[substr] })
        i += len
        matched = true
        break
      }
    }

    if (!matched) {
      segments.push({ text: text[i], isWord: false })
      i++
    }
  }

  return segments
}

// Renders text with clickable word segments
function ClickableText({
  text,
  onWordClick,
  style,
}: {
  text: string
  onWordClick: (word: string, def: WordDefinition) => void
  style?: React.CSSProperties
}) {
  const segments = segmentText(text)
  return (
    <span style={style}>
      {segments.map((seg, idx) =>
        seg.isWord && seg.def ? (
          <span
            key={idx}
            onClick={(e) => {
              e.stopPropagation()
              onWordClick(seg.text, seg.def!)
            }}
            style={{
              cursor: 'pointer',
              borderBottom: '2px dotted #667eea',
              color: '#667eea',
            }}
          >
            {seg.text}
          </span>
        ) : (
          <span key={idx}>{seg.text}</span>
        ),
      )}
    </span>
  )
}

interface MindMapBranch {
  label: string
  emoji: string
  color: string
  sectionId: string
}

const mindMapBranches: MindMapBranch[] = [
  { label: '颜色', emoji: '🎨', color: '#ef4444', sectionId: 'q-color' },
  { label: '形状', emoji: '🔷', color: '#3b82f6', sectionId: 'q-shape' },
  { label: '图案', emoji: '🖼', color: '#8b5cf6', sectionId: 'q-pattern' },
  { label: '上面有什么东西', emoji: '🔍', color: '#f59e0b', sectionId: 'q-accessories' },
  { label: '怎么使用', emoji: '💧', color: '#10b981', sectionId: 'q-usage' },
]

interface GuidingQuestion {
  id: string
  question: string
  examples: string[]
}

const guidingQuestions: GuidingQuestion[] = [
  { id: 'q-color', question: '它是什么颜色的？', examples: ['蓝色', '红色', '白色'] },
  { id: 'q-shape', question: '是什么形状的？', examples: ['圆柱形', '正方形'] },
  { id: 'q-pattern', question: '上面有什么图案？', examples: ['卡通人物', '动物', '花朵'] },
  {
    id: 'q-accessories',
    question: '有吸管、带子或其他的东西吗？',
    examples: ['吸管', '带子', '盖子', '按钮', '提环'],
  },
  { id: 'q-usage', question: '怎么能喝到水？', examples: ['按按钮', '打开盖子'] },
]

interface ChecklistItem {
  text: string
  subItems?: string[]
}

const checklistItems: ChecklistItem[] = [
  { text: '我写了水壶的：', subItems: ['颜色', '图案'] },
  { text: '我写了水壶的配件：', subItems: ['盖子', '带子', '按钮', '吸管', '提环'] },
  { text: '我写了怎么喝到水。' },
  { text: '我检查了错别字。' },
  { text: '我写了水壶的其他方面。' },
]

function ShuihuWritingPage() {
  const [selectedWord, setSelectedWord] = useState<{ word: string; def: WordDefinition } | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})
  const [rubricOpen, setRubricOpen] = useState(false)
  const [generatedEssay, setGeneratedEssay] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const essayRef = useRef<HTMLDivElement | null>(null)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const handleWordClick = useCallback((word: string, def: WordDefinition) => {
    setSelectedWord({ word, def })
  }, [])

  const scrollToSection = (sectionId: string) => {
    const el = sectionRefs.current[sectionId]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const toggleCheck = (key: string) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div>
      {/* Header */}
      <header className="header-row">
        <h1 className="page-title">水壶写作</h1>
      </header>

      <main className="vocabulary-main">
        <div style={{ padding: '20px' }}>
          {/* Title Card */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '16px',
              padding: '24px 20px',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea', marginBottom: '12px' }}>
              <ClickableText text="写一写自己的水壶" onWordClick={handleWordClick} />
            </h2>
            <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.8' }}>
              <ClickableText
                text={'参考课本第35页\u201c阅读放大镜\u201d。根据下面的提示，写一写自己的水壶。'}
                onWordClick={handleWordClick}
              />
            </p>
          </div>

          {/* Mind Map */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '16px',
              padding: '24px 20px',
              marginBottom: '20px',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div
                style={{
                  display: 'inline-block',
                  padding: '14px 28px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '50px',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '20px',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                }}
              >
                <ClickableText
                  text="我的水壶"
                  onWordClick={handleWordClick}
                  style={{ color: 'white' }}
                />
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '10px',
              }}
            >
              {mindMapBranches.map((branch) => (
                <button
                  key={branch.sectionId}
                  onClick={() => scrollToSection(branch.sectionId)}
                  style={{
                    padding: '12px 18px',
                    backgroundColor: `${branch.color}15`,
                    border: `2px solid ${branch.color}40`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: branch.color,
                    minHeight: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onTouchStart={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.95)'
                  }}
                  onTouchEnd={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
                  }}
                >
                  <span>{branch.emoji}</span>
                  <span>{branch.label}</span>
                </button>
              ))}
            </div>

            <div
              style={{
                marginTop: '15px',
                padding: '10px',
                backgroundColor: '#f0f0f0',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#666',
                textAlign: 'center',
              }}
            >
              点击上方卡片跳转到对应问题 · 点击蓝色词语查看解释
            </div>
          </div>

          {/* Guiding Questions */}
          {guidingQuestions.map((q, qIdx) => (
            <div
              key={q.id}
              ref={(el) => {
                sectionRefs.current[q.id] = el
              }}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '16px',
                scrollMarginTop: '20px',
              }}
            >
              {/* Question number and text */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '15px',
                    flexShrink: 0,
                  }}
                >
                  {qIdx + 1}
                </div>
                <p style={{ fontSize: '18px', color: '#333', lineHeight: '1.8', fontWeight: '500' }}>
                  <ClickableText text={q.question} onWordClick={handleWordClick} />
                </p>
              </div>

              {/* Example answers as toggleable chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                {q.examples.map((ex) => {
                  const current = answers[q.id] || ''
                  const isSelected = current.includes(ex)
                  return (
                    <button
                      key={ex}
                      onClick={() => {
                        setAnswers((prev) => {
                          const val = prev[q.id] || ''
                          if (val.includes(ex)) {
                            // Remove it: strip the word and clean up separators
                            const cleaned = val
                              .replace(ex, '')
                              .replace(/、{2,}/g, '、')
                              .replace(/^、|、$/g, '')
                              .trim()
                            return { ...prev, [q.id]: cleaned }
                          } else {
                            // Append it
                            const appended = val ? val + '、' + ex : ex
                            return { ...prev, [q.id]: appended }
                          }
                        })
                      }}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: isSelected ? '#667eea' : '#667eea15',
                        border: isSelected ? '2px solid #667eea' : '1px solid #667eea40',
                        borderRadius: '20px',
                        fontSize: '16px',
                        color: isSelected ? 'white' : '#667eea',
                        fontWeight: isSelected ? '600' : '400',
                        cursor: 'pointer',
                        minHeight: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {ex}
                    </button>
                  )
                })}
              </div>

              {/* Text area for student answer */}
              <textarea
                value={answers[q.id] || ''}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                placeholder="在这里写你的答案..."
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '14px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '17px',
                  lineHeight: '1.8',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  color: '#333',
                  backgroundColor: '#fafafa',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#667eea'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb'
                }}
              />
            </div>
          ))}

          {/* Generate Essay Button & Output */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '16px',
            }}
          >
            <button
              disabled={isGenerating}
              onClick={async () => {
                const colorAnswer = (answers['q-color'] || '').trim()
                const shapeAnswer = (answers['q-shape'] || '').trim()
                const patternAnswer = (answers['q-pattern'] || '').trim()
                const accessoriesAnswer = (answers['q-accessories'] || '').trim()
                const usageAnswer = (answers['q-usage'] || '').trim()

                const hasAny = colorAnswer || shapeAnswer || patternAnswer || accessoriesAnswer || usageAnswer
                if (!hasAny) {
                  setGeneratedEssay(null)
                  alert('请先在上面的问题中写一些答案！')
                  return
                }

                setIsGenerating(true)
                setGeneratedEssay(null)

                try {
                  const res = await fetch('/api/generate-essay', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      color: colorAnswer,
                      shape: shapeAnswer,
                      pattern: patternAnswer,
                      accessories: accessoriesAnswer,
                      usage: usageAnswer,
                    }),
                  })

                  if (!res.ok) throw new Error('Failed to generate')

                  const data = await res.json()
                  setGeneratedEssay(data.essay)

                  setTimeout(() => {
                    essayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  }, 100)
                } catch {
                  alert('生成失败，请再试一次。')
                } finally {
                  setIsGenerating(false)
                }
              }}
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: isGenerating ? 'wait' : 'pointer',
                opacity: isGenerating ? 0.7 : 1,
                minHeight: '52px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onTouchStart={(e) => {
                if (!isGenerating) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)'
              }}
              onTouchEnd={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
              }}
            >
              {isGenerating ? '⏳ AI正在写作文...' : '✨ 生成作文'}
            </button>

            {generatedEssay && (
              <div
                ref={essayRef}
                style={{
                  marginTop: '20px',
                  padding: '20px',
                  backgroundColor: '#fefce8',
                  border: '2px solid #fbbf24',
                  borderRadius: '12px',
                }}
              >
                <h4 style={{ fontSize: '17px', fontWeight: 'bold', color: '#92400e', marginBottom: '12px' }}>
                  我的水壶 ✏️
                </h4>
                <p
                  style={{
                    fontSize: '18px',
                    lineHeight: '2.2',
                    color: '#333',
                    textIndent: '2em',
                  }}
                >
                  <ClickableText text={generatedEssay} onWordClick={handleWordClick} />
                </p>

                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <button
                    onClick={() => {
                      if (generatedEssay) {
                        navigator.clipboard.writeText(generatedEssay).then(() => {
                          alert('已复制到剪贴板！')
                        }).catch(() => {
                          // Fallback for older browsers
                          const ta = document.createElement('textarea')
                          ta.value = generatedEssay
                          document.body.appendChild(ta)
                          ta.select()
                          document.execCommand('copy')
                          document.body.removeChild(ta)
                          alert('已复制到剪贴板！')
                        })
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      minHeight: '44px',
                    }}
                  >
                    复制作文
                  </button>
                  <button
                    onClick={() => setGeneratedEssay(null)}
                    style={{
                      padding: '12px 20px',
                      backgroundColor: '#f5f5f5',
                      color: '#666',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '15px',
                      cursor: 'pointer',
                      minHeight: '44px',
                    }}
                  >
                    关闭
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Rubric Section - Collapsible */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '16px',
              marginBottom: '16px',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => setRubricOpen(!rubricOpen)}
              style={{
                width: '100%',
                padding: '18px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '17px',
                fontWeight: '600',
                color: '#333',
                minHeight: '48px',
              }}
            >
              <span>
                <ClickableText text="评分标准" onWordClick={handleWordClick} /> (Rubric)
              </span>
              <span
                style={{
                  transform: rubricOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease',
                  fontSize: '20px',
                }}
              >
                ▼
              </span>
            </button>

            {rubricOpen && (
              <div style={{ padding: '0 20px 20px 20px' }}>
                {/* Content rubric */}
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#667eea', marginBottom: '10px' }}>
                  <ClickableText text="内容" onWordClick={handleWordClick} /> (7 marks)
                </h4>
                <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '14px',
                      minWidth: '320px',
                    }}
                  >
                    <thead>
                      <tr>
                        {['上 (6-7)', '中 (3-5)', '下 (1-2)'].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding: '10px 8px',
                              backgroundColor: '#667eea',
                              color: 'white',
                              fontWeight: '600',
                              textAlign: 'center',
                              border: '1px solid #667eea',
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: '10px 8px', border: '1px solid #e5e7eb', verticalAlign: 'top', lineHeight: '1.7' }}>
                          <ClickableText text="符合题目要求" onWordClick={handleWordClick} />
                          <br />
                          <ClickableText text="内容完整" onWordClick={handleWordClick} />
                          <br />
                          <ClickableText text="条理清楚" onWordClick={handleWordClick} />
                        </td>
                        <td style={{ padding: '10px 8px', border: '1px solid #e5e7eb', verticalAlign: 'top', lineHeight: '1.7' }}>
                          <ClickableText text="不完全符合题目要求" onWordClick={handleWordClick} />
                          <br />
                          <ClickableText text="内容有些缺漏" onWordClick={handleWordClick} />
                          <br />
                          <ClickableText text="条理不够清楚" onWordClick={handleWordClick} />
                        </td>
                        <td style={{ padding: '10px 8px', border: '1px solid #e5e7eb', verticalAlign: 'top', lineHeight: '1.7' }}>
                          <ClickableText text="不符合题目要求" onWordClick={handleWordClick} />
                          <br />
                          <ClickableText text="内容严重缺漏" onWordClick={handleWordClick} />
                          <br />
                          <ClickableText text="条理不清楚" onWordClick={handleWordClick} />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Language rubric */}
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#667eea', marginBottom: '10px' }}>
                  <ClickableText text="语文" onWordClick={handleWordClick} /> (8 marks)
                </h4>
                <div style={{ overflowX: 'auto' }}>
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '14px',
                      minWidth: '320px',
                    }}
                  >
                    <thead>
                      <tr>
                        {['上 (6-8)', '中 (3-5)', '下 (1-2)'].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding: '10px 8px',
                              backgroundColor: '#764ba2',
                              color: 'white',
                              fontWeight: '600',
                              textAlign: 'center',
                              border: '1px solid #764ba2',
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: '10px 8px', border: '1px solid #e5e7eb', verticalAlign: 'top', lineHeight: '1.7' }}>
                          <ClickableText text="表达非常清楚、连贯" onWordClick={handleWordClick} />
                          <br />
                          <ClickableText text="句子通顺、词语正确" onWordClick={handleWordClick} />
                          <br />
                          <ClickableText text="汉字拼音正确" onWordClick={handleWordClick} />
                          <br />
                          <ClickableText text="段落格式正确、标点正确" onWordClick={handleWordClick} />
                        </td>
                        <td style={{ padding: '10px 8px', border: '1px solid #e5e7eb', verticalAlign: 'top', lineHeight: '1.7' }}>
                          <ClickableText text="表达比较清楚、连贯" onWordClick={handleWordClick} />
                          <br />
                          <ClickableText text="多数句子通顺、多数词语正确" onWordClick={handleWordClick} />
                          <br />
                          <ClickableText text="汉字拼音错误不多" onWordClick={handleWordClick} />
                          <br />
                          <ClickableText text="段落格式正确、标点错误不多" onWordClick={handleWordClick} />
                        </td>
                        <td style={{ padding: '10px 8px', border: '1px solid #e5e7eb', verticalAlign: 'top', lineHeight: '1.7' }}>
                          <ClickableText text="表达不清楚、不连贯" onWordClick={handleWordClick} />
                          <br />
                          <ClickableText text="多数句子不通顺、多数词语不正确" onWordClick={handleWordClick} />
                          <br />
                          <ClickableText text="汉字拼音错误较多" onWordClick={handleWordClick} />
                          <br />
                          <ClickableText text="段落格式不正确、标点错误较多" onWordClick={handleWordClick} />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Self-Check Checklist */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '20px',
            }}
          >
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#667eea', marginBottom: '16px' }}>
              我做得怎样？
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {checklistItems.map((item, itemIdx) => {
                if (item.subItems) {
                  return (
                    <div key={itemIdx}>
                      <p style={{ fontSize: '16px', color: '#333', marginBottom: '8px', lineHeight: '1.6' }}>
                        <ClickableText text={item.text} onWordClick={handleWordClick} />
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingLeft: '8px' }}>
                        {item.subItems.map((sub) => {
                          const key = `${itemIdx}-${sub}`
                          const checked = !!checkedItems[key]
                          return (
                            <button
                              key={key}
                              onClick={() => toggleCheck(key)}
                              style={{
                                padding: '10px 16px',
                                backgroundColor: checked ? '#667eea' : '#f5f5f5',
                                color: checked ? 'white' : '#333',
                                border: checked ? '2px solid #667eea' : '2px solid #e5e7eb',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: checked ? '600' : '400',
                                minHeight: '44px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s ease',
                              }}
                            >
                              <span style={{ fontSize: '18px' }}>{checked ? '✓' : '☐'}</span>
                              <ClickableText text={sub} onWordClick={handleWordClick} />
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                }

                const key = `${itemIdx}`
                const checked = !!checkedItems[key]
                return (
                  <button
                    key={itemIdx}
                    onClick={() => toggleCheck(key)}
                    style={{
                      padding: '14px 16px',
                      backgroundColor: checked ? '#667eea10' : '#f9fafb',
                      border: checked ? '2px solid #667eea' : '2px solid #e5e7eb',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      color: '#333',
                      minHeight: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      textAlign: 'left',
                      width: '100%',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '20px',
                        color: checked ? '#667eea' : '#ccc',
                        flexShrink: 0,
                      }}
                    >
                      {checked ? '✓' : '☐'}
                    </span>
                    <span style={{ lineHeight: '1.6' }}>
                      <ClickableText text={item.text} onWordClick={handleWordClick} />
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Word definition popup */}
      {selectedWord && (
        <div
          onClick={() => setSelectedWord(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '25px',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ marginBottom: '15px' }}>
              <h3 style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea', marginBottom: '5px' }}>
                {selectedWord.word}
              </h3>
              <p style={{ fontSize: '16px', color: '#999', marginBottom: '10px' }}>{selectedWord.def.pinyin}</p>
            </div>
            <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
              <p style={{ fontSize: '16px', color: '#333', marginBottom: '10px', fontWeight: '500' }}>
                {selectedWord.def.english}
              </p>
              <p style={{ fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
                {selectedWord.def.explanation}
              </p>
            </div>
            <button
              onClick={() => setSelectedWord(null)}
              style={{
                marginTop: '20px',
                width: '100%',
                padding: '12px',
                backgroundColor: '#f5f5f5',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#666',
                cursor: 'pointer',
                minHeight: '44px',
              }}
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
