
import { createFileRoute } from '@tanstack/react-router'
import { LatestWordsPage } from '@/components/pages/LatestWordsPage'

export const Route = createFileRoute('/')({
  component: LatestWordsPage,
})
