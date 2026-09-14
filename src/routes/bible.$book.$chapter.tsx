// /bible/<book>/<chapter>: read a Bible chapter word by word (src/components/bible/).
import { createFileRoute } from '@tanstack/react-router'
import { BiblePage } from '@/components/bible/BiblePage'

export const Route = createFileRoute('/bible/$book/$chapter')({
  component: BibleRoute,
})

function BibleRoute() {
  const { book, chapter } = Route.useParams()
  return <BiblePage book={book} chapter={chapter} />
}
