import { useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { vocabularyQueryOptions, getAllWords } from '@/queries/vocabularyQueries'
import { useProgressQuery } from '@/queries/progressQueries'
import { ERRORS } from '@/lib/constants'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const queryClient = useQueryClient()

  // Fetch vocabulary data
  const { data: vocabularyData, isLoading: vocabLoading } = useQuery(vocabularyQueryOptions)

  // Fetch progress from cloud
  const {
    data: progressData,
    isLoading: progressLoading,
    error: progressError,
    refetch,
  } = useProgressQuery()

  // Calculate statistics
  const stats = useMemo(() => {
    const knownCount = progressData?.knownWords?.length || 0
    const unknownCount = progressData?.unknownWords?.length || 0
    const practicedCount = knownCount + unknownCount
    const totalWords = vocabularyData ? getAllWords(vocabularyData).length : 0
    const progressPercentage = totalWords > 0 ? Math.round((knownCount / totalWords) * 100) : 0

    return {
      knownCount,
      unknownCount,
      practicedCount,
      totalWords,
      progressPercentage,
    }
  }, [progressData, vocabularyData])

  // Format last updated timestamp
  const lastUpdatedText = useMemo(() => {
    if (!progressData?.lastUpdated) return null

    const date = new Date(progressData.lastUpdated)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return '刚刚更新'
    if (diffMins < 60) return `${diffMins} 分钟前更新`
    if (diffHours < 24) return `${diffHours} 小时前更新`
    if (diffDays < 7) return `${diffDays} 天前更新`

    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }, [progressData?.lastUpdated])

  const handleRefresh = () => {
    refetch()
    queryClient.invalidateQueries({ queryKey: ['vocabulary'] })
  }

  // Loading state
  if (vocabLoading || progressLoading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">家长看板</h1>
          <p className="dashboard-subtitle">实时查看孩子的学习进度</p>
        </div>
        <div className="loading-spinner">正在加载数据...</div>
      </div>
    )
  }

  // Error state
  if (progressError) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">家长看板</h1>
          <p className="dashboard-subtitle">实时查看孩子的学习进度</p>
        </div>
        <div className="error-message">{ERRORS.DATA_LOAD}</div>
        <button className="refresh-btn" onClick={handleRefresh}>
          刷新数据
        </button>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">家长看板</h1>
        <p className="dashboard-subtitle">实时查看孩子的学习进度</p>
      </div>

      {/* Stats grid */}
      <div className="stats-grid">
        {/* Known words card */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon">✅</div>
            <div className="stat-label">已掌握词语</div>
          </div>
          <div className="stat-value">{stats.knownCount}</div>
          <div className="stat-subtitle">孩子已经会的词语</div>
        </div>

        {/* Unknown words card */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon">📝</div>
            <div className="stat-label">需要复习</div>
          </div>
          <div className="stat-value">{stats.unknownCount}</div>
          <div className="stat-subtitle">孩子还不会的词语</div>
        </div>

        {/* Progress card */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon">📊</div>
            <div className="stat-label">总体进度</div>
          </div>
          <div className="stat-value">{stats.progressPercentage}%</div>
          <div className="stat-subtitle">
            {stats.practicedCount} / {stats.totalWords} 词语
          </div>
          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{ width: `${stats.progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Refresh button */}
      <button className="refresh-btn" onClick={handleRefresh}>
        刷新数据
      </button>

      {/* Word lists */}
      <div className="word-lists">
        {/* Known words section */}
        <div className="word-list-section">
          <div className="word-list-header">
            <span className="icon">✅</span>
            已掌握的词语
          </div>
          <div className="word-grid">
            {progressData?.knownWords && progressData.knownWords.length > 0 ? (
              progressData.knownWords.map((word, index) => (
                <div key={`known-${word}-${index}`} className="word-chip known">
                  {word}
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📚</div>
                <p>还没有掌握的词语</p>
              </div>
            )}
          </div>
        </div>

        {/* Unknown words section */}
        <div className="word-list-section">
          <div className="word-list-header">
            <span className="icon">📝</span>
            需要复习的词语
          </div>
          <div className="word-grid">
            {progressData?.unknownWords && progressData.unknownWords.length > 0 ? (
              progressData.unknownWords.map((word, index) => (
                <div key={`unknown-${word}-${index}`} className="word-chip unknown">
                  {word}
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">🎉</div>
                <p>太棒了！没有需要复习的词语</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Last updated */}
      {lastUpdatedText && (
        <div className="last-updated">{lastUpdatedText}</div>
      )}
    </div>
  )
}
