import { Store } from '@tanstack/store'
import { STORAGE_KEYS } from '@/lib/constants'

export interface SettingsState {
  // Learning settings
  autoplay: boolean
  traditional: boolean
  pinyin: boolean
  vibration: boolean

  // Display settings
  darkmode: boolean
  largefont: boolean
  simplified: boolean

  // Other settings
  reminders: boolean
  analytics: boolean

  // Legacy settings (kept for backward compatibility)
  autoPlayAudio: boolean
  audioSpeed: number
  showPinyin: boolean
  showEnglish: boolean
  autoAdvance: boolean
}

const DEFAULT_SETTINGS: SettingsState = {
  // Learning settings
  autoplay: true,
  traditional: true,
  pinyin: true,
  vibration: false,

  // Display settings
  darkmode: false,
  largefont: false,
  simplified: false,

  // Other settings
  reminders: true,
  analytics: true,

  // Legacy
  autoPlayAudio: false,
  audioSpeed: 1.0,
  showPinyin: true,
  showEnglish: true,
  autoAdvance: false,
}

// Load settings from localStorage
function loadSettings(): SettingsState {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS)
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
    }
  } catch (error) {
    console.error('Failed to load settings:', error)
  }
  return DEFAULT_SETTINGS
}

// Save settings to localStorage
function saveSettings(settings: SettingsState) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
  } catch (error) {
    console.error('Failed to save settings:', error)
  }
}

export const settingsStore = new Store<SettingsState>(loadSettings())

// Subscribe to changes and persist
settingsStore.subscribe(() => {
  saveSettings(settingsStore.state)
})

// Generic setter for any setting
export function setSetting<K extends keyof SettingsState>(key: K, value: SettingsState[K]) {
  settingsStore.setState((state) => ({
    ...state,
    [key]: value,
  }))
}

// Toggle a boolean setting
export function toggleSetting(key: keyof SettingsState) {
  const currentValue = settingsStore.state[key]
  if (typeof currentValue === 'boolean') {
    setSetting(key, !currentValue as SettingsState[typeof key])
  }
}

// Actions for legacy settings
export function setAutoPlayAudio(value: boolean) {
  settingsStore.setState((state) => ({
    ...state,
    autoPlayAudio: value,
  }))
}

export function setAudioSpeed(value: number) {
  settingsStore.setState((state) => ({
    ...state,
    audioSpeed: value,
  }))
}

export function setShowPinyin(value: boolean) {
  settingsStore.setState((state) => ({
    ...state,
    showPinyin: value,
  }))
}

export function setShowEnglish(value: boolean) {
  settingsStore.setState((state) => ({
    ...state,
    showEnglish: value,
  }))
}

export function setAutoAdvance(value: boolean) {
  settingsStore.setState((state) => ({
    ...state,
    autoAdvance: value,
  }))
}

export function resetSettings() {
  settingsStore.setState(() => DEFAULT_SETTINGS)
}

// Export progress data
export function exportProgressData(): string {
  try {
    const data = {
      settings: settingsStore.state,
      exportDate: new Date().toISOString(),
      version: '1.0.0',
    }
    return JSON.stringify(data, null, 2)
  } catch (error) {
    console.error('Failed to export data:', error)
    return ''
  }
}

// Clear all data
export function clearAllData() {
  try {
    // Clear settings
    localStorage.removeItem(STORAGE_KEYS.SETTINGS)
    // Reset to defaults
    settingsStore.setState(() => DEFAULT_SETTINGS)
    return true
  } catch (error) {
    console.error('Failed to clear data:', error)
    return false
  }
}
