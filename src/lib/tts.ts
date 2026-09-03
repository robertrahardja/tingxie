/**
 * Pre-generated TTS clips live in /audio/tts/<sha256(text)[:16]>.mp3
 * (see scripts/generate_tts.py). This computes the same key in the browser.
 */
const cache = new Map<string, Promise<string>>()

export function ttsPath(text: string): Promise<string> {
  const t = text.trim()
  let p = cache.get(t)
  if (!p) {
    p = crypto.subtle
      .digest('SHA-256', new TextEncoder().encode(t))
      .then((buf) =>
        Array.from(new Uint8Array(buf))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('')
          .slice(0, 16)
      )
      .then((key) => `/audio/tts/${key}.mp3`)
    cache.set(t, p)
  }
  return p
}
