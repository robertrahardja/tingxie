import { useCallback } from 'react'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { cn } from '@/lib/utils'

interface AudioButtonProps {
  audioPath: string
  revealed: boolean
  onReveal: () => void
  className?: string
}

export function AudioButton({ audioPath, revealed, onReveal, className }: AudioButtonProps) {
  const { play } = useAudioPlayer()

  const handleClick = useCallback(async () => {
    await play(audioPath)
    onReveal()
  }, [audioPath, play, onReveal])

  return (
    <button
      className={cn('audio-btn', revealed ? 'revealed' : 'covered', className)}
      onClick={handleClick}
      aria-label="Play audio"
    >
      🔊
    </button>
  )
}
