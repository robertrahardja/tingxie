import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/phrase-matching')({
  component: PhraseMatchingPage,
})

function PhraseMatchingPage() {
  return (
    <div className="phrase-matching-page">
      <div className="lesson-header lesson-header-purple">
        <h1>词语搭配</h1>
        <div className="lesson-subtitle">Word-Phrase Matching Practice</div>
      </div>

      <div className="content-container">
        <div className="coming-soon-box">
          <div className="coming-soon-icon">🔜</div>
          <h2 className="coming-soon-title">即将推出</h2>
          <p className="coming-soon-text">Coming Soon</p>
          <p className="coming-soon-description">
            词语搭配练习功能正在开发中，敬请期待！
          </p>
        </div>
      </div>
    </div>
  )
}
