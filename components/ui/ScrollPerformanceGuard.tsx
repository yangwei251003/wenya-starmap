'use client'

import { useEffect } from 'react'

export function ScrollPerformanceGuard() {
  useEffect(() => {
    const root = document.documentElement
    let idleTimer: number | undefined
    let scrolling = false

    const setScrolling = (value: boolean) => {
      scrolling = value
      root.classList.toggle('is-scrolling', value)
    }

    const onUserScrollIntent = () => {
      if (!scrolling) {
        setScrolling(true)
      }

      if (idleTimer) {
        window.clearTimeout(idleTimer)
      }

      idleTimer = window.setTimeout(() => {
        setScrolling(false)
      }, 120)
    }

    const onVisibilityChange = () => {
      if (document.hidden) {
        if (idleTimer) {
          window.clearTimeout(idleTimer)
        }
        setScrolling(false)
      }
    }

    root.classList.remove('is-scrolling')
    window.addEventListener('wheel', onUserScrollIntent, { passive: true })
    window.addEventListener('touchmove', onUserScrollIntent, { passive: true })
    window.addEventListener('scroll', onUserScrollIntent, { passive: true })
    window.addEventListener('keydown', onUserScrollIntent)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      if (idleTimer) {
        window.clearTimeout(idleTimer)
      }
      root.classList.remove('is-scrolling')
      window.removeEventListener('wheel', onUserScrollIntent)
      window.removeEventListener('touchmove', onUserScrollIntent)
      window.removeEventListener('scroll', onUserScrollIntent)
      window.removeEventListener('keydown', onUserScrollIntent)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  return null
}
