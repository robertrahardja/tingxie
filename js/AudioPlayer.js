import { CONSTANTS } from './constants.js';

// Audio Player module for handling all audio functionality
export class AudioPlayer {
    constructor() {
        this.currentAudio = null;
        this.audioCache = new Map();
    }

    async play(audioPath) {
        if (!audioPath) {
            console.warn('No audio path provided');
            return false;
        }

        try {
            // Stop any currently playing audio
            this.stop();

            // Convert relative path to absolute if needed
            const absolutePath = audioPath.startsWith('http') ? audioPath : (audioPath.startsWith('/') ? audioPath : '/' + audioPath);

            console.log('Attempting to play audio:', absolutePath);

            // Check cache first
            let audio = this.audioCache.get(audioPath);

            if (!audio) {
                // Fetch audio first to verify it loads
                const response = await fetch(absolutePath);
                if (!response.ok) {
                    throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
                }

                // Create audio blob from response
                // Handle both WAV and MP3 formats
                const blob = await response.blob();

                // Determine the correct MIME type by inspecting file bytes
                let mimeType = 'audio/mpeg'; // default to MP3
                const arrayBuffer = await blob.slice(0, 12).arrayBuffer();
                const view = new Uint8Array(arrayBuffer);

                // Log the first few bytes for debugging
                const hexBytes = Array.from(view.slice(0, 4)).map(b => '0x' + b.toString(16).toUpperCase()).join(' ');
                console.log('First 4 bytes:', hexBytes);

                // Check for RIFF header (WAV files start with 0x52, 0x49, 0x46, 0x46 = "RIFF")
                if (view[0] === 0x52 && view[1] === 0x49 && view[2] === 0x46 && view[3] === 0x46) {
                    mimeType = 'audio/wav';
                    console.log('Detected WAV format');
                }
                // Check for FORM header (AIFF files start with 0x46, 0x4F, 0x52, 0x4D = "FORM")
                else if (view[0] === 0x46 && view[1] === 0x4F && view[2] === 0x52 && view[3] === 0x4D) {
                    // Try audio/aiff first, then audio/x-aiff as fallback
                    // Most browsers don't support AIFF - we may need to convert these files
                    mimeType = 'audio/x-aiff';
                    console.log('Detected AIFF format - note: browsers may not support AIFF natively');
                } else {
                    console.log('Not WAV/AIFF, using audio/mpeg');
                }

                // Create audio element with proper MIME type
                audio = new Audio();
                audio.crossOrigin = 'anonymous';
                const blobUrl = URL.createObjectURL(blob);

                // Use source element with proper MIME type
                const source = document.createElement('source');
                source.src = blobUrl;
                source.type = mimeType;
                audio.appendChild(source);

                // Add error handler to audio element
                audio.addEventListener('error', (e) => {
                    console.error('Audio element error:', e.target.error?.code, 'Type:', mimeType);
                });

                // Cache the audio object for better performance
                this.audioCache.set(audioPath, audio);

                console.log('Audio loaded successfully:', absolutePath, 'Format:', mimeType);
            }

            this.currentAudio = audio;
            await audio.play();
            return true;
        } catch (error) {
            console.warn(CONSTANTS.ERRORS.AUDIO_PLAYBACK, error);
            console.log('Failed audio path was:', audioPath);
            return false;
        }
    }

    stop() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio = null;
        }
    }

    preload(audioPaths) {
        if (!Array.isArray(audioPaths)) {
            audioPaths = [audioPaths];
        }

        audioPaths.forEach(path => {
            if (path && !this.audioCache.has(path)) {
                const audio = new Audio();
                // Convert relative path to absolute if needed
                const absolutePath = path.startsWith('http') ? path : (path.startsWith('/') ? path : '/' + path);
                audio.src = absolutePath;
                audio.crossOrigin = 'anonymous';
                audio.preload = 'auto';
                this.audioCache.set(path, audio);
            }
        });
    }

    clearCache() {
        this.stop();
        this.audioCache.clear();
    }

    destroy() {
        this.clearCache();
    }
}

// Singleton instance for shared audio player
let sharedAudioPlayer = null;

export function getAudioPlayer() {
    if (!sharedAudioPlayer) {
        sharedAudioPlayer = new AudioPlayer();
    }
    return sharedAudioPlayer;
}