
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/p3hcl-wupin-interactive')({
  component: P3HCLWupinInteractivePage,
})

function P3HCLWupinInteractivePage() {
  return (
    <div>
      <header className="mb-5">
        <h1 className="text-3xl font-bold text-white drop-shadow-md">互动阅读</h1>
      </header>
      <main className="text-white">
        <p>Interactive reading - Coming soon</p>
      </main>
    </div>
  )
}
