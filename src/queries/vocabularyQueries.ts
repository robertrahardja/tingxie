import { queryOptions } from '@tanstack/react-query'
import type { VocabularyData, Word } from '@/types/vocabulary'
import { CONSTANTS, STORAGE_KEYS } from '@/lib/constants'
import { queryClient } from '@/lib/queryClient'

async function fetchVocabulary(): Promise<VocabularyData> {
  // Try to load from localStorage cache first
  const cachedData = localStorage.getItem(STORAGE_KEYS.VOCABULARY_CACHE)
  const cacheTimestamp = localStorage.getItem(STORAGE_KEYS.VOCABULARY_CACHE_TIMESTAMP)

  // Use cache if it's fresh
  if (cachedData && cacheTimestamp) {
    const age = Date.now() - parseInt(cacheTimestamp)
    if (age < CONSTANTS.CACHE_DURATION) {
      console.log('Using cached vocabulary data')
      // Fetch new data in background to update cache
      refreshCacheInBackground()
      return JSON.parse(cachedData)
    }
  }

  // Helper to check if response is JSON
  const isJsonResponse = (response: Response): boolean => {
    const contentType = response.headers.get('content-type')
    return contentType !== null && contentType.includes('application/json')
  }

  // Try fetching from API first
  let response = await fetch(CONSTANTS.API_VOCABULARY_PATH)

  // Check if response is actually JSON (not HTML from SPA fallback)
  if (!response.ok || !isJsonResponse(response)) {
    // Fall back to direct file load for local development
    response = await fetch(CONSTANTS.DATA_PATH)
  }

  if (!response.ok) {
    // If both fail and we have cache, use it
    if (cachedData) {
      console.log('All sources failed, using stale cache')
      return JSON.parse(cachedData)
    }
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()

  // Update cache
  localStorage.setItem(STORAGE_KEYS.VOCABULARY_CACHE, JSON.stringify(data))
  localStorage.setItem(STORAGE_KEYS.VOCABULARY_CACHE_TIMESTAMP, Date.now().toString())

  return data
}

async function refreshCacheInBackground(): Promise<void> {
  try {
    // Helper to check if response is JSON
    const isJsonResponse = (response: Response): boolean => {
      const contentType = response.headers.get('content-type')
      return contentType !== null && contentType.includes('application/json')
    }

    let response = await fetch(CONSTANTS.API_VOCABULARY_PATH)

    // Check if response is actually JSON (not HTML from SPA fallback)
    if (!response.ok || !isJsonResponse(response)) {
      response = await fetch(CONSTANTS.DATA_PATH)
    }

    if (response.ok && isJsonResponse(response)) {
      const newData = await response.json()
      localStorage.setItem(STORAGE_KEYS.VOCABULARY_CACHE, JSON.stringify(newData))
      localStorage.setItem(STORAGE_KEYS.VOCABULARY_CACHE_TIMESTAMP, Date.now().toString())
      console.log('Cache refreshed in background')
      // Invalidate TanStack Query so components re-render with new data
      queryClient.setQueryData(['vocabulary'], newData)
    }
  } catch {
    // Silent fail - we're already using cache
    console.log('Background cache refresh failed')
  }
}

export const vocabularyQueryOptions = queryOptions({
  queryKey: ['vocabulary'],
  queryFn: fetchVocabulary,
  staleTime: 1000 * 60 * 5, // 5 minutes
  gcTime: 1000 * 60 * 60 * 24, // 24 hours
})

// Helper function to extract latest words
export function getLatestWords(data: VocabularyData): Word[] {
  const latestRow = data.vocabulary.find(
    (row) => row.row === CONSTANTS.VOCABULARY.LATEST_ROW_NUMBER
  )
  return latestRow?.words ?? []
}

// Helper function to get all words
export function getAllWords(data: VocabularyData): Word[] {
  return data.vocabulary.flatMap((row) => row.words)
}

// Helper function to filter important words
export function filterImportantWords(words: Word[]): Word[] {
  return words.filter((word) => word.important)
}
