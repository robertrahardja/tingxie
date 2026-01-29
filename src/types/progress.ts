export interface StudentProgress {
  knownWords: string[]
  unknownWords: string[]
  lastUpdated: number | null
}

export interface ProgressState {
  knownWords: Set<string>
  unknownWords: Set<string>
  lastUpdated: number | null
}

export const DEFAULT_PROGRESS_STATE: ProgressState = {
  knownWords: new Set(),
  unknownWords: new Set(),
  lastUpdated: null,
}

export interface SaveProgressPayload {
  studentId: string
  knownWords: string[]
  unknownWords: string[]
}

export interface SaveProgressResponse {
  success: boolean
  progress?: StudentProgress
  error?: string
}
