// /p3-final: P3 HCL year-end revision page (src/components/final/).
import { createFileRoute } from '@tanstack/react-router'
import { FinalPage } from '@/components/final/FinalPage'

export const Route = createFileRoute('/p3-final')({
  component: FinalPage,
})
