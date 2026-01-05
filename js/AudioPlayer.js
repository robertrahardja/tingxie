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
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);

                audio = new Audio();
                audio.src = blobUrl;
                audio.crossOrigin = 'anonymous';

                // Cache the audio object for better performance
                this.audioCache.set(audioPath, audio);

                console.log('Audio loaded successfully:', absolutePath);
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