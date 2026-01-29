import { useState, useEffect, useCallback, useRef } from 'react'
import { CONSTANTS } from '@/lib/constants'

interface UseScrollHideOptions {
  mobileBreakpoint?: number
  scrollThreshold?: number
}

export function useScrollHide(options: UseScrollHideOptions = {}) {
  const {
    mobileBreakpoint = CONSTANTS.MOBILE_BREAKPOINT,
    scrollThreshold = CONSTANTS.SCROLL_HIDE_THRESHOLD,
  } = options

  const [isHidden, setIsHidden] = useState(false)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  const updateNavbar = useCallback(() => {
    const currentScrollY = window.scrollY

    // Only hide on mobile devices
    if (window.innerWidth < mobileBreakpoint) {
      if (currentScrollY > lastScrollY.current && currentScrollY > scrollThreshold) {
        setIsHidden(true)
      } else {
        setIsHidden(false)
      }
    } else {
      setIsHidden(false)
    }

    lastScrollY.current = currentScrollY
    ticking.current = false
  }, [mobileBreakpoint, scrollThreshold])

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(updateNavbar)
      ticking.current = true
    }
  }, [updateNavbar])

  const handleResize = useCallback(() => {
    if (window.innerWidth >= mobileBreakpoint) {
      setIsHidden(false)
    }
  }, [mobileBreakpoint])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [handleScroll, handleResize])

  return isHidden
}
