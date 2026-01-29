/// <reference types="vite/client" />

declare module '*.css' {
  const content: string
  export default content
}

// HanziWriter CDN module declaration
declare module 'https://cdn.jsdelivr.net/npm/hanzi-writer@3.7.3/+esm' {
  interface HanziWriter {
    quiz: (options: {
      onMistake?: (strokeData: { strokeNum: number }) => void
      onCorrectStroke?: (strokeData: { strokeNum: number }) => void
      onComplete?: (summaryData: { totalMistakes: number }) => void
    }) => void
    highlightStroke: (strokeNum: number) => void
    cancelQuiz: () => void
  }

  interface HanziWriterOptions {
    width: number
    height: number
    padding: number
    showOutline: boolean
    showCharacter: boolean
    strokeAnimationSpeed: number
    delayBetweenStrokes: number
    strokeColor: string
    outlineColor: string
    drawingColor: string
    drawingWidth: number
    showHintAfterMisses: number
    highlightOnComplete: boolean
    highlightColor: string
    charDataLoader: (char: string) => Promise<unknown>
  }

  interface HanziWriterStatic {
    create: (
      element: HTMLElement,
      character: string,
      options: Partial<HanziWriterOptions>
    ) => HanziWriter
  }

  const HanziWriter: HanziWriterStatic
  export default HanziWriter
}
