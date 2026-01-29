import { useRef, useCallback } from 'react'
import { ERRORS } from '@/lib/constants'

interface AudioCache {
  [key: string]: HTMLAudioElement
}

export function useAudioPlayer() {
  const audioCache = useRef<AudioCache>({})
  const currentAudio = useRef<HTMLAudioElement | null>(null)

  const stop = useCallback(() => {
    if (currentAudio.current) {
      currentAudio.current.pause()
      currentAudio.current.currentTime = 0
      currentAudio.current = null
    }
  }, [])

  const play = useCallback(async (audioPath: string): Promise<boolean> => {
    if (!audioPath) {
      console.warn('No audio path provided')
      return false
    }

    try {
      // Stop any currently playing audio
      stop()

      // Convert relative path to absolute if needed
      const absolutePath = audioPath.startsWith('http')
        ? audioPath
        : audioPath.startsWith('/')
          ? audioPath
          : '/' + audioPath

      console.log('Attempting to play audio:', absolutePath)

      // Check cache first
      let audio = audioCache.current[audioPath]

      if (!audio) {
        // Fetch audio first to verify it loads
        const response = await fetch(absolutePath)
        if (!response.ok) {
          throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`)
        }

        // Create audio blob from response
        const blob = await response.blob()

        // Determine the correct MIME type by inspecting file bytes
        let mimeType = 'audio/mpeg' // default to MP3
        const arrayBuffer = await blob.slice(0, 12).arrayBuffer()
        const view = new Uint8Array(arrayBuffer)

        // Check for RIFF header (WAV files start with 0x52, 0x49, 0x46, 0x46 = "RIFF")
        if (view[0] === 0x52 && view[1] === 0x49 && view[2] === 0x46 && view[3] === 0x46) {
          mimeType = 'audio/wav'
        }
        // Check for FORM header (AIFF files)
        else if (view[0] === 0x46 && view[1] === 0x4f && view[2] === 0x52 && view[3] === 0x4d) {
          mimeType = 'audio/x-aiff'
        }

        // Create audio element with proper MIME type
        audio = new Audio()
        audio.crossOrigin = 'anonymous'
        const blobUrl = URL.createObjectURL(blob)

        // Use source element with proper MIME type
        const source = document.createElement('source')
        source.src = blobUrl
        source.type = mimeType
        audio.appendChild(source)

        // Cache the audio object
        audioCache.current[audioPath] = audio

        console.log('Audio loaded successfully:', absolutePath, 'Format:', mimeType)
      }

      currentAudio.current = audio
      await audio.play()
      return true
    } catch (error) {
      console.warn(ERRORS.AUDIO_PLAYBACK, error)
      console.log('Failed audio path was:', audioPath)
      return false
    }
  }, [stop])

  const preload = useCallback((audioPaths: string | string[]) => {
    const paths = Array.isArray(audioPaths) ? audioPaths : [audioPaths]

    paths.forEach((path) => {
      if (path && !audioCache.current[path]) {
        const audio = new Audio()
        // Convert relative path to absolute if needed
        const absolutePath = path.startsWith('http')
          ? path
          : path.startsWith('/')
            ? path
            : '/' + path
        audio.src = absolutePath
        audio.crossOrigin = 'anonymous'
        audio.preload = 'auto'
        audioCache.current[path] = audio
      }
    })
  }, [])

  const clearCache = useCallback(() => {
    stop()
    audioCache.current = {}
  }, [stop])

  return {
    play,
    stop,
    preload,
    clearCache,
  }
}
