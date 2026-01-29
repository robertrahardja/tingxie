import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { StudentProgress, SaveProgressPayload, SaveProgressResponse } from '@/types/progress'
import { CONSTANTS, STORAGE_KEYS } from '@/lib/constants'

// Get or create student ID
function getOrCreateStudentId(): string {
  let studentId = localStorage.getItem(STORAGE_KEYS.STUDENT_ID)

  if (!studentId) {
    // Generate a unique ID: timestamp + random string
    studentId = `student_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    localStorage.setItem(STORAGE_KEYS.STUDENT_ID, studentId)
  }

  return studentId
}

// Fetch progress from cloud
async function fetchProgress(studentId: string): Promise<StudentProgress> {
  try {
    const response = await fetch(
      `${CONSTANTS.API_PROGRESS_PATH}?studentId=${encodeURIComponent(studentId)}`
    )

    // Check content type to detect SPA fallback (HTML instead of JSON)
    const contentType = response.headers.get('content-type')
    const isJson = contentType !== null && contentType.includes('application/json')

    if (!response.ok || !isJson) {
      // For local development without API endpoints, return empty progress
      console.log('Cloud API not available (local development mode)')
      return {
        knownWords: [],
        unknownWords: [],
        lastUpdated: null,
      }
    }

    return await response.json()
  } catch (error) {
    console.log('Cloud sync not available - using local mode only')
    return {
      knownWords: [],
      unknownWords: [],
      lastUpdated: null,
    }
  }
}

// Save progress to cloud with retry logic
async function saveProgress(payload: SaveProgressPayload): Promise<SaveProgressResponse> {
  const { MAX_ATTEMPTS, INITIAL_DELAY } = CONSTANTS.RETRY

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(CONSTANTS.API_PROGRESS_PATH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      // Check content type to detect SPA fallback (HTML instead of JSON)
      const contentType = response.headers.get('content-type')
      const isJson = contentType !== null && contentType.includes('application/json')

      // For local development without API endpoints, silently succeed
      if (!isJson || response.status === 404) {
        console.log('Cloud API not available (local development mode) - progress not saved to cloud')
        return { success: true }
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        console.log(`Progress saved to cloud (attempt ${attempt}/${MAX_ATTEMPTS})`)
        return data
      }

      throw new Error('Save returned success: false')
    } catch (error) {
      console.error(`Failed to save progress (attempt ${attempt}/${MAX_ATTEMPTS}):`, error)

      // If this was the last attempt, throw
      if (attempt === MAX_ATTEMPTS) {
        throw error
      }

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, attempt * INITIAL_DELAY))
    }
  }

  throw new Error('Failed to save progress after all retries')
}

// Query hook for fetching progress
export function useProgressQuery() {
  const studentId = getOrCreateStudentId()

  return useQuery({
    queryKey: ['progress', studentId],
    queryFn: () => fetchProgress(studentId),
    staleTime: 0, // Always fetch fresh data on mount
  })
}

// Mutation hook for saving progress
export function useSaveProgressMutation() {
  const queryClient = useQueryClient()
  const studentId = getOrCreateStudentId()

  return useMutation({
    mutationFn: (data: { knownWords: string[]; unknownWords: string[] }) =>
      saveProgress({
        studentId,
        knownWords: [...new Set(data.knownWords)], // Remove duplicates
        unknownWords: [...new Set(data.unknownWords)],
      }),
    onSuccess: (data) => {
      // Update cache with new progress
      if (data.progress) {
        queryClient.setQueryData(['progress', studentId], data.progress)
      }
    },
    onError: (error) => {
      console.error('Failed to save progress:', error)
    },
  })
}

// Export student ID helper
export { getOrCreateStudentId }
