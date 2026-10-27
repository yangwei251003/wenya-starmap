import { useEffect, useState } from 'react'

// 动画控制Hook
export function useAnimation(trigger: boolean, delay: number = 0) {
  const [shouldAnimate, setShouldAnimate] = useState(false)

  useEffect(() => {
    if (trigger) {
      const timer = setTimeout(() => {
        setShouldAnimate(true)
      }, delay)

      return () => clearTimeout(timer)
    } else {
      setShouldAnimate(false)
    }
  }, [trigger, delay])

  return shouldAnimate
}

// 成长动画Hook
export function useGrowthAnimation(isVisible: boolean, delay: number = 0) {
  const [animationClass, setAnimationClass] = useState('')

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setAnimationClass('animate-sprout-grow')
      }, delay)

      return () => clearTimeout(timer)
    } else {
      setAnimationClass('')
    }
  }, [isVisible, delay])

  return animationClass
}

// 星辰闪烁动画Hook
export function useStarTwinkle(isActive: boolean) {
  const [twinkleClass, setTwinkleClass] = useState('')

  useEffect(() => {
    if (isActive) {
      setTwinkleClass('animate-star-twinkle')
    } else {
      setTwinkleClass('')
    }
  }, [isActive])

  return twinkleClass
}

// 浮动动画Hook
export function useFloatAnimation(isEnabled: boolean = true) {
  return isEnabled ? 'animate-float' : ''
}