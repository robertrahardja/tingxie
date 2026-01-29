import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-base font-bold transition-all duration-300 cursor-pointer disabled:pointer-events-none disabled:opacity-50 touch-feedback',
  {
    variants: {
      variant: {
        default: 'bg-white text-[var(--color-primary)] shadow-md hover:shadow-lg',
        primary: 'bg-gradient-button text-white shadow-md',
        audio: 'bg-gradient-audio text-white shadow-md',
        know: 'bg-gradient-know text-white shadow-md',
        dontKnow: 'bg-gradient-dont-know text-white shadow-md',
        handwriting: 'bg-gradient-handwriting text-white shadow-md',
        filter: 'bg-white/20 text-white border-2 border-white',
        filterActive: 'bg-white text-[var(--color-primary)]',
        ghost: 'hover:bg-white/10 text-white',
        link: 'text-[var(--color-primary)] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-12 px-6 py-3 min-h-[48px]',
        sm: 'h-10 px-4 py-2',
        lg: 'h-14 px-8 py-4 min-h-[56px] text-lg',
        icon: 'h-12 w-12 min-w-[48px] min-h-[48px]',
        iconLg: 'h-16 w-16 min-w-[64px] min-h-[64px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
