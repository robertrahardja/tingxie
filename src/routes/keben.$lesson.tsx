// /keben/<lesson>: one 活动本 lesson's answer key (src/components/keben/).
import { createFileRoute } from '@tanstack/react-router'
import { KebenPage } from '@/components/keben/KebenPage'

export const Route = createFileRoute('/keben/$lesson')({
  component: KebenRoute,
})

function KebenRoute() {
  const { lesson } = Route.useParams()
  return <KebenPage lesson={lesson} />
}
