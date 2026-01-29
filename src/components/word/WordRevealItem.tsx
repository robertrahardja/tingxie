import { cn } from '@/lib/utils'
import { UI_LABELS } from '@/lib/constants'
import type { WordField } from '@/types/vocabulary'

interface WordRevealItemProps {
  field: WordField
  value: string
  revealed: boolean
  onToggle: () => void
  className?: string
}

const FIELD_LABELS: Record<WordField, string> = {
  simplified: UI_LABELS.SIMPLIFIED,
  traditional: UI_LABELS.TRADITIONAL,
  pinyin: UI_LABELS.PINYIN,
  english: UI_LABELS.ENGLISH,
}

export function WordRevealItem({
  field,
  value,
  revealed,
  onToggle,
  className,
}: WordRevealItemProps) {
  const label = FIELD_LABELS[field]

  return (
    <div className={cn('word-item', className)}>
      <button
        className={cn('content-btn', revealed ? 'revealed' : 'covered')}
        onClick={onToggle}
        aria-label={revealed ? `Hide ${field}` : `Reveal ${field}`}
      >
        {revealed ? value : label}
      </button>
    </div>
  )
}
