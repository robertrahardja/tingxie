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

            // Check cache first
            let audio = this.audioCache.get(audioPath);

            if (!audio) {
                audio = new Audio();
                audio.src = audioPath;
                audio.crossOrigin = 'anonymous';
                audio.type = 'audio/mpeg';
                // Cache the audio object for better performance
                this.audioCache.set(audioPath, audio);
            }

            this.currentAudio = audio;
            await audio.play();
            return true;
        } catch (error) {
            console.warn(CONSTANTS.ERRORS.AUDIO_PLAYBACK, error);
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
                audio.src = path;
                audio.crossOrigin = 'anonymous';
                audio.type = 'audio/mpeg';
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