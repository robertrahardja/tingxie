// /p3-weak: the words Hannah marked 不会 on /p3-final, as a fixed review list.
import { createFileRoute } from '@tanstack/react-router'
import { WeakPage } from '@/components/final/WeakPage'

export const Route = createFileRoute('/p3-weak')({
  component: WeakPage,
})
