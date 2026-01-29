
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { MainNav } from '@/components/layout/MainNav'
import { PageContainer } from '@/components/layout/PageContainer'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <div className="min-h-screen bg-gradient-primary">
      <MainNav />
      <PageContainer>
        <Outlet />
      </PageContainer>
    </div>
  )
}
