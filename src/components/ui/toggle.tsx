import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const toggleVariants = cva(
  'inline-flex items-center justify-center rounded-full text-sm font-medium transition-all duration-300 cursor-pointer disabled:pointer-events-none disabled:opacity-50 touch-feedback',
  {
    variants: {
      variant: {
        default: 'bg-transparent hover:bg-white/10',
        outline: 'border border-white/30 bg-transparent hover:bg-white/10',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-8 px-3',
        lg: 'h-12 px-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ToggleProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof toggleVariants> {
  pressed?: boolean
  onPressedChange?: (pressed: boolean) => void
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, variant, size, pressed = false, onPressedChange, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={pressed}
        data-state={pressed ? 'on' : 'off'}
        className={cn(
          toggleVariants({ variant, size, className }),
          pressed && 'bg-white/20'
        )}
        onClick={() => onPressedChange?.(!pressed)}
        {...props}
      />
    )
  }
)
Toggle.displayName = 'Toggle'

export { Toggle, toggleVariants }
