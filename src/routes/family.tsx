import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/family')({
  component: FamilyPage,
})

// Family data organized by category
const familyData = {
  'immediate-family': [
    { english: 'Your Mom', chinese: '妈妈', pinyin: 'māma' },
    { english: 'Your Dad', chinese: '爸爸', pinyin: 'bàba' },
    { english: 'Your Wife', chinese: '妻子 / 老婆', pinyin: 'qīzi / lǎopó' },
    { english: 'Your Husband', chinese: '丈夫 / 老公', pinyin: 'zhàngfū / lǎogōng' },
    { english: 'Your older brother', chinese: '哥哥', pinyin: 'gēgē' },
    { english: 'Your older sister', chinese: '姐姐', pinyin: 'jiějiě' },
    { english: 'Your younger brother', chinese: '弟弟', pinyin: 'dìdì' },
    { english: 'Your younger sister', chinese: '妹妹', pinyin: 'mèimei' },
    { english: 'Your son', chinese: '儿子', pinyin: 'érzi' },
    { english: 'Your daughter', chinese: '女儿', pinyin: "nǚ'ér" },
  ],
  grandparents: [
    { english: "Grandmother (Dad's side)", chinese: '奶奶', pinyin: 'nǎinai' },
    { english: "Grandmother (Mom's side)", chinese: '外婆', pinyin: 'wàipó' },
    { english: "Grandfather (Dad's side)", chinese: '爷爷', pinyin: 'yéyé' },
    { english: "Grandfather (Mom's side)", chinese: '外公', pinyin: 'wàigōng' },
  ],
  uncles: [
    { english: "Dad's older brother", chinese: '伯伯', pinyin: 'bóbo' },
    { english: "Dad's younger brother", chinese: '叔叔', pinyin: 'shūshu' },
    { english: "Dad's sister's husband", chinese: '姑夫', pinyin: 'gūfū' },
    { english: "Mom's brother", chinese: '舅舅', pinyin: 'jiùjiu' },
  ],
  aunts: [
    { english: "Dad's older sister", chinese: '姑妈', pinyin: 'gūmā' },
    { english: "Dad's younger sister", chinese: '姑姑', pinyin: 'gūgū' },
    { english: "Dad's older brother's wife", chinese: '伯母', pinyin: 'bómǔ' },
    { english: "Dad's younger brother's wife", chinese: '婶婶', pinyin: 'shěnshěn' },
    { english: "Mom's older sister", chinese: '姨妈', pinyin: 'yímā' },
    { english: "Mom's younger sister", chinese: '阿姨', pinyin: 'āyí' },
    { english: "Mom's brother's wife", chinese: '舅母', pinyin: 'jiùmǔ' },
  ],
  cousins: [
    { english: "Dad's sibling's son (older)", chinese: '堂兄', pinyin: 'táng xiōng' },
    { english: "Dad's sibling's son (younger)", chinese: '堂弟', pinyin: 'táng dì' },
    { english: "Dad's sibling's daughter (older)", chinese: '堂姐', pinyin: 'táng jiě' },
    { english: "Dad's sibling's daughter (younger)", chinese: '堂妹', pinyin: 'táng mèi' },
    { english: "Mom's sibling's son (older)", chinese: '表哥', pinyin: 'biǎo gē' },
    { english: "Mom's sibling's son (younger)", chinese: '表弟', pinyin: 'biǎo dì' },
    { english: "Mom's sibling's daughter (older)", chinese: '表姐', pinyin: 'biǎo jiě' },
    { english: "Mom's sibling's daughter (younger)", chinese: '表妹', pinyin: 'biǎo mèi' },
  ],
  'nephews-nieces': [
    { english: "Brother's son", chinese: '侄子', pinyin: 'zhízi' },
    { english: "Sister's son", chinese: '外甥', pinyin: 'wàishēng' },
    { english: "Brother's daughter", chinese: '侄女', pinyin: 'zhínǚ' },
    { english: "Sister's daughter", chinese: '外甥女', pinyin: 'wàishengnǚ' },
  ],
  'in-laws': [
    { english: "Husband's father", chinese: '公公', pinyin: 'gōnggong' },
    { english: "Wife's father", chinese: '岳父', pinyin: 'yuèfù' },
    { english: "Husband's mother", chinese: '婆婆', pinyin: 'pópo' },
    { english: "Wife's mother", chinese: '岳母', pinyin: 'yuèmǔ' },
    { english: "Older sister's husband", chinese: '姐夫', pinyin: 'jiěfū' },
    { english: "Younger sister's husband", chinese: '妹夫', pinyin: 'mèifū' },
    { english: "Older brother's wife", chinese: '嫂子', pinyin: 'sǎozi' },
    { english: "Younger brother's wife", chinese: '弟妇', pinyin: 'dìfù' },
  ],
}

const categoryTitles: Record<string, { icon: string; title: string }> = {
  'immediate-family': { icon: '👨‍👩‍👧‍👦', title: 'Your Immediate Family 直系亲属' },
  grandparents: { icon: '👴👵', title: 'Grandparents 祖父母/外祖父母' },
  uncles: { icon: '👨', title: 'Uncles 伯伯/叔叔/舅舅' },
  aunts: { icon: '👩', title: 'Aunts 姑妈/姨妈/伯母/婶婶' },
  cousins: { icon: '👫', title: 'Cousins 堂兄弟姐妹/表兄弟姐妹' },
  'nephews-nieces': { icon: '👶', title: 'Nephews & Nieces 侄子/侄女/外甥' },
  'in-laws': { icon: '💑', title: 'In-Laws 姻亲' },
}

// Mermaid flowchart definition
const mermaidDefinition = `flowchart TB
    subgraph FATHER_SIDE["Father's Side"]
        direction TB
        subgraph F_GP["Grandparents"]
            yeye["👴 爷爷<br/>Grandfather"]:::male
            nainai["👵 奶奶<br/>Grandmother"]:::female
        end

        subgraph F_PARENTS["Parents Generation"]
            bobo["👨 伯伯<br/>Uncle (older)"]:::male
            baba["👨 爸爸<br/>Father"]:::male
            shushu["👨 叔叔<br/>Uncle (younger)"]:::male
            guma["👩 姑妈<br/>Aunt"]:::female
        end

        yeye --> bobo
        nainai --> bobo
        yeye --> baba
        nainai --> baba
        yeye --> shushu
        nainai --> shushu
        yeye --> guma
        nainai --> guma
    end

    subgraph MOTHER_SIDE["Mother's Side"]
        direction TB
        subgraph M_GP["Grandparents"]
            waigong["👴 外公<br/>Grandfather"]:::male
            waipo["👵 外婆<br/>Grandmother"]:::female
        end

        subgraph M_PARENTS["Parents Generation"]
            mama["👩 妈妈<br/>Mother"]:::female
            jiujiu["👨 舅舅<br/>Uncle"]:::male
            yima["👩 姨妈<br/>Aunt (older)"]:::female
            ayi["👩 阿姨<br/>Aunt (younger)"]:::female
        end

        waigong --> mama
        waipo --> mama
        waigong --> jiujiu
        waipo --> jiujiu
        waigong --> yima
        waipo --> yima
        waigong --> ayi
        waipo --> ayi
    end

    FATHER_SIDE ~~~ MOTHER_SIDE

    subgraph YOUR_GEN["Your Generation"]
        direction LR
        gege["👦 哥哥<br/>Older Brother"]:::male
        jiejie["👧 姐姐<br/>Older Sister"]:::female
        you["🟡 你/我<br/>YOU"]:::highlight
        qizi["💑 妻子<br/>Wife"]:::female
        didi["👦 弟弟<br/>Younger Brother"]:::male
        meimei["👧 妹妹<br/>Younger Sister"]:::female
    end

    subgraph CHILDREN["Children Generation"]
        direction LR
        erzi["👦 儿子<br/>Son"]:::male
        nuer["👧 女儿<br/>Daughter"]:::female
    end

    baba -.marriage.- mama

    baba --> you
    mama --> you
    baba --> gege
    mama --> gege
    baba --> jiejie
    mama --> jiejie
    baba --> didi
    mama --> didi
    baba --> meimei
    mama --> meimei

    you -.marriage.- qizi

    you --> erzi
    qizi --> erzi
    you --> nuer
    qizi --> nuer

    classDef male fill:#80ccff,stroke:#333,stroke-width:2px,color:#000
    classDef female fill:#ffb3d9,stroke:#333,stroke-width:2px,color:#000
    classDef highlight fill:#ffd700,stroke:#333,stroke-width:3px,color:#000`

interface FamilyMember {
  english: string
  chinese: string
  pinyin: string
}

interface FamilyCardProps {
  data: FamilyMember
}

function FamilyCard({ data }: FamilyCardProps) {
  const { play } = useAudioPlayer()
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlayAudio = useCallback(
    async (e?: React.MouseEvent) => {
      e?.stopPropagation()
      setIsPlaying(true)
      const firstWord = data.chinese.split('/')[0].trim()
      const audioPath = `audio/${firstWord}.mp3`
      await play(audioPath)
      setTimeout(() => setIsPlaying(false), 500)
    },
    [data.chinese, play]
  )

  return (
    <div className="family-card" onClick={() => handlePlayAudio()}>
      <div className="family-card-english">{data.english}</div>
      <div className="family-card-chinese">{data.chinese}</div>
      <div className="family-card-pinyin">{data.pinyin}</div>
      <button
        className={cn('family-card-audio-btn', isPlaying && 'playing')}
        onClick={handlePlayAudio}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
        </svg>
        <span>Play Audio</span>
      </button>
    </div>
  )
}

interface CategorySectionProps {
  categoryId: string
  members: FamilyMember[]
}

function CategorySection({ categoryId, members }: CategorySectionProps) {
  const { icon, title } = categoryTitles[categoryId]

  return (
    <div className="category-section">
      <div className="category-header">
        {icon} {title}
      </div>
      <div className="family-grid">
        {members.map((member, index) => (
          <FamilyCard key={index} data={member} />
        ))}
      </div>
    </div>
  )
}

function FamilyTree() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mermaidRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const panStart = useRef({ x: 0, y: 0 })

  useEffect(() => {
    // Load and initialize Mermaid
    const loadMermaid = async () => {
      try {
        // @ts-expect-error - CDN import has no types
        const mermaid = await import('https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs')
        mermaid.default.initialize({
          startOnLoad: false,
          theme: 'default',
          flowchart: {
            useMaxWidth: false,
            htmlLabels: true,
            curve: 'basis',
            nodeSpacing: 120,
            rankSpacing: 120,
            padding: 30,
          },
          themeVariables: {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
          },
        })

        if (mermaidRef.current) {
          const { svg } = await mermaid.default.render('family-tree-svg', mermaidDefinition)
          mermaidRef.current.innerHTML = svg
        }
      } catch (error) {
        console.error('Failed to load Mermaid:', error)
      }
    }

    loadMermaid()
  }, [])

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.2, 3))
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.5))
  const handleResetZoom = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY }
    panStart.current = { x: pan.x, y: pan.y }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    setPan({ x: panStart.current.x + dx, y: panStart.current.y + dy })
  }

  const handleMouseUp = () => setIsDragging(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true)
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      panStart.current = { x: pan.x, y: pan.y }
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return
    e.preventDefault()
    const dx = e.touches[0].clientX - dragStart.current.x
    const dy = e.touches[0].clientY - dragStart.current.y
    setPan({ x: panStart.current.x + dx, y: panStart.current.y + dy })
  }

  const handleTouchEnd = () => setIsDragging(false)

  return (
    <div className="tree-section">
      <h2>Family Tree</h2>
      <div className="tree-controls">
        <button className="tree-btn" onClick={handleZoomIn}>
          + Zoom In
        </button>
        <button className="tree-btn" onClick={handleZoomOut}>
          - Zoom Out
        </button>
        <button className="tree-btn" onClick={handleResetZoom}>
          Reset
        </button>
      </div>
      <div
        ref={containerRef}
        className="tree-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={mermaidRef}
          className="mermaid"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
        />
      </div>
      <div className="scroll-hint">
        Click/Touch and drag to move | Zoom to enlarge
        <br />
        Blue=Male | Pink=Female | Gold=You
      </div>
    </div>
  )
}

function FamilyPage() {
  return (
    <div className="family-container">
      <header className="family-header">
        <h1>Family Relationships</h1>
        <p>Tap cards to hear pronunciation</p>
      </header>

      <div className="note">
        <strong>Tip:</strong> Chinese family terms are very specific about age order and which side
        of the family. Pay attention to these details!
      </div>

      <FamilyTree />

      {Object.entries(familyData).map(([categoryId, members]) => (
        <CategorySection key={categoryId} categoryId={categoryId} members={members} />
      ))}
    </div>
  )
}
