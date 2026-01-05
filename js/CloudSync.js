/**
 * CloudSync.js
 * Handles syncing student progress with Cloudflare KV
 */

export class CloudSync {
    constructor(apiBaseUrl = '') {
        this.apiBaseUrl = apiBaseUrl;
        this.studentId = this.getOrCreateStudentId();
    }

    /**
     * Get or create a unique student ID
     * Stored in localStorage for device persistence
     */
    getOrCreateStudentId() {
        let studentId = localStorage.getItem('tingxie_student_id');

        if (!studentId) {
            // Generate a unique ID: timestamp + random string
            studentId = `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('tingxie_student_id', studentId);
        }

        return studentId;
    }

    /**
     * Fetch student progress from Cloudflare KV
     */
    async fetchProgress() {
        try {
            const response = await fetch(
                `${this.apiBaseUrl}/api/progress?studentId=${encodeURIComponent(this.studentId)}`
            );

            if (!response.ok) {
                // For local development without API endpoints, return empty progress
                if (response.status === 404) {
                    console.log('Cloud API not available (local development mode)');
                    return {
                        knownWords: new Set(),
                        unknownWords: new Set(),
                        lastUpdated: null
                    };
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                knownWords: new Set(data.knownWords || []),
                unknownWords: new Set(data.unknownWords || []),
                lastUpdated: data.lastUpdated
            };
        } catch (error) {
            console.log('Cloud sync not available - using local mode only');
            // Return empty progress to allow local-only operation
            return {
                knownWords: new Set(),
                unknownWords: new Set(),
                lastUpdated: null
            };
        }
    }

    /**
     * Save student progress to Cloudflare KV with retry logic
     */
    async saveProgress(knownWords, unknownWords, retries = 3) {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const response = await fetch(`${this.apiBaseUrl}/api/progress`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        studentId: this.studentId,
                        // Convert Sets to Arrays and remove duplicates
                        knownWords: Array.from(new Set(knownWords)),
                        unknownWords: Array.from(new Set(unknownWords))
                    })
                });

                // For local development without API endpoints, silently succeed
                if (response.status === 404) {
                    console.log('Cloud API not available (local development mode) - progress not saved to cloud');
                    return true; // Return true to not show error to user
                }

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (data.success) {
                    console.log(`✓ Progress saved to cloud (attempt ${attempt}/${retries})`);
                    return true;
                }

                throw new Error('Save returned success: false');
            } catch (error) {
                console.error(`Failed to save progress (attempt ${attempt}/${retries}):`, error);

                // If this was the last attempt, return false
                if (attempt === retries) {
                    return false;
                }

                // Wait before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, attempt * 1000));
            }
        }

        return false;
    }

    /**
     * Merge local and cloud progress
     * Strategy: Union of sets (student knows word if marked on any device)
     */
    mergeProgress(local, cloud) {
        const merged = {
            knownWords: new Set([...local.knownWords]),
            unknownWords: new Set([...local.unknownWords])
        };

        // Add cloud known words to merged
        cloud.knownWords.forEach(word => {
            merged.knownWords.add(word);
            // Remove from unknown if it's in known
            merged.unknownWords.delete(word);
        });

        // Add cloud unknown words (but only if not already known)
        cloud.unknownWords.forEach(word => {
            if (!merged.knownWords.has(word)) {
                merged.unknownWords.add(word);
            }
        });

        return merged;
    }
}
