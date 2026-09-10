// /zonghe/<week>: the weekly 综合练习 study page (src/components/zonghe/).
import { createFileRoute } from '@tanstack/react-router'
import { ZonghePage } from '@/components/zonghe/ZonghePage'

export const Route = createFileRoute('/zonghe/$week')({
  component: ZongheRoute,
})

function ZongheRoute() {
  const { week } = Route.useParams()
  return <ZonghePage week={week} />
}
