import { useEffect } from 'react'

/**
 * Hook to fix mobile viewport height issues
 * Sets --vh CSS custom property to actual viewport height
 */
export function useMobileViewport() {
  useEffect(() => {
    const setViewportHeight = () => {
      // First we get the viewport height and we multiply it by 1% to get a value for a vh unit
      const vh = window.innerHeight * 0.01
      // Then we set the value in the --vh custom property to the root of the document
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }

    // Set on initial load
    setViewportHeight()

    // Update on resize and orientation change
    window.addEventListener('resize', setViewportHeight)
    window.addEventListener('orientationchange', setViewportHeight)

    return () => {
      window.removeEventListener('resize', setViewportHeight)
      window.removeEventListener('orientationchange', setViewportHeight)
    }
  }, [])
}
