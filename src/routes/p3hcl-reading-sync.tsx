import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/p3hcl-reading-sync')({
  component: P3HCLReadingSyncPage,
})

function P3HCLReadingSyncPage() {
  return (
    <div className="reading-sync-page">
      <div className="lesson-header lesson-header-blue">
        <h1>阅读练习</h1>
        <div className="lesson-subtitle">Reading Practice with Audio Sync</div>
      </div>

      <div className="content-container">
        <div className="coming-soon-box">
          <div className="coming-soon-icon">🔜</div>
          <h2 className="coming-soon-title">即将推出</h2>
          <p className="coming-soon-text">Coming Soon</p>
          <p className="coming-soon-description">
            阅读练习功能正在开发中，敬请期待！
          </p>
        </div>
      </div>
    </div>
  )
}
