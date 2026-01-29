import * as React from 'react'
import { cn } from '@/lib/utils'

interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked = false, onCheckedChange, ...props }, ref) => {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        ref={ref}
        className={cn(
          'relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-300',
          checked ? 'bg-[var(--color-primary)]' : 'bg-gray-300',
          className
        )}
        onClick={() => onCheckedChange?.(!checked)}
        {...props}
      >
        <span
          className={cn(
            'pointer-events-none block h-6 w-6 rounded-full bg-white shadow-lg transition-transform duration-300',
            'absolute top-0.5',
            checked ? 'translate-x-5' : 'translate-x-0.5'
          )}
        />
      </button>
    )
  }
)
Switch.displayName = 'Switch'

export { Switch }
