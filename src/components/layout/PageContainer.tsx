import { ReactNode } from 'react'
import { useMobileViewport } from '@/hooks/useMobileViewport'
import { cn } from '@/lib/utils'

interface PageContainerProps {
  children: ReactNode
  className?: string
}

export function PageContainer({ children, className }: PageContainerProps) {
  // Set up mobile viewport height fix
  useMobileViewport()

  return (
    <div className={cn('page-container', className)}>
      {children}
    </div>
  )
}
