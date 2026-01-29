import { UI_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface SelfAssessButtonsProps {
  onKnow: () => void
  onDontKnow: () => void
  className?: string
}

export function SelfAssessButtons({ onKnow, onDontKnow, className }: SelfAssessButtonsProps) {
  return (
    <div className={cn('assess-buttons', className)}>
      <button className="assess-btn know" onClick={onKnow}>
        {UI_LABELS.KNOW_BTN}
      </button>
      <button className="assess-btn dont-know" onClick={onDontKnow}>
        {UI_LABELS.DONT_KNOW_BTN}
      </button>
    </div>
  )
}
