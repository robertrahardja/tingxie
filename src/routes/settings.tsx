import { createFileRoute } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { useCallback, useState } from 'react'
import {
  settingsStore,
  toggleSetting,
  resetSettings,
  exportProgressData,
  clearAllData,
  type SettingsState,
} from '@/stores/settingsStore'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

// Setting toggle component
interface SettingToggleProps {
  settingKey: keyof SettingsState
  label: string
}

function SettingToggle({ settingKey, label }: SettingToggleProps) {
  const value = useStore(settingsStore, (state) => state[settingKey])
  const isActive = typeof value === 'boolean' ? value : false

  return (
    <div className="setting-item">
      <div className="setting-label">{label}</div>
      <div
        className={`setting-toggle ${isActive ? 'active' : ''}`}
        onClick={() => toggleSetting(settingKey)}
        role="switch"
        aria-checked={isActive}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            toggleSetting(settingKey)
          }
        }}
      />
    </div>
  )
}

function SettingsPage() {
  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  const handleExport = useCallback(() => {
    const data = exportProgressData()
    if (data) {
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tingxie-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }, [])

  const handleReset = useCallback(() => {
    if (confirmReset) {
      resetSettings()
      setConfirmReset(false)
    } else {
      setConfirmReset(true)
      // Auto-reset after 3 seconds
      setTimeout(() => setConfirmReset(false), 3000)
    }
  }, [confirmReset])

  const handleClear = useCallback(() => {
    if (confirmClear) {
      clearAllData()
      setConfirmClear(false)
    } else {
      setConfirmClear(true)
      // Auto-reset after 3 seconds
      setTimeout(() => setConfirmClear(false), 3000)
    }
  }, [confirmClear])

  return (
    <div>
      <header className="header-row">
        <h1 className="page-title">设置</h1>
      </header>

      <main className="settings-main">
        {/* Learning Settings */}
        <div className="settings-section">
          <div className="settings-title">学习设置</div>
          <SettingToggle settingKey="autoplay" label="自动播放音频" />
          <SettingToggle settingKey="traditional" label="显示繁体字" />
          <SettingToggle settingKey="pinyin" label="显示拼音" />
          <SettingToggle settingKey="vibration" label="振动反馈" />
        </div>

        {/* Display Settings */}
        <div className="settings-section">
          <div className="settings-title">显示设置</div>
          <SettingToggle settingKey="darkmode" label="深色模式" />
          <SettingToggle settingKey="largefont" label="大字体模式" />
          <SettingToggle settingKey="simplified" label="简化界面" />
        </div>

        {/* Other Settings */}
        <div className="settings-section">
          <div className="settings-title">其他设置</div>
          <SettingToggle settingKey="reminders" label="学习提醒" />
          <SettingToggle settingKey="analytics" label="数据统计" />
        </div>

        {/* Data Management */}
        <div className="settings-section">
          <div className="settings-title">数据管理</div>
          <div className="setting-item">
            <button className="setting-btn" onClick={handleExport}>
              导出学习数据
            </button>
          </div>
          <div className="setting-item">
            <button
              className={`setting-btn ${confirmReset ? 'danger' : ''}`}
              onClick={handleReset}
            >
              {confirmReset ? '确认重置？' : '重置学习进度'}
            </button>
          </div>
          <div className="setting-item">
            <button
              className={`setting-btn danger`}
              onClick={handleClear}
            >
              {confirmClear ? '确认清除？' : '清除所有数据'}
            </button>
          </div>
        </div>

        {/* About */}
        <div className="settings-section">
          <div className="settings-title">关于</div>
          <div className="about-info">
            <p><strong>听写练习</strong> v2.0.0</p>
            <p>帮助孩子练习中文听写的移动应用</p>
            <p>适用于iPad和iPhone设备</p>
          </div>
        </div>
      </main>
    </div>
  )
}
