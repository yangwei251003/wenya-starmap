'use client'

import React, { useEffect, useState } from 'react'

interface GrowthAnimationProps {
  isVisible: boolean
  onComplete?: () => void
  achievementTitle?: string
}

export function GrowthAnimation({ 
  isVisible, 
  onComplete,
  achievementTitle = '新成就解锁！'
}: GrowthAnimationProps) {
  const [stage, setStage] = useState<'seed' | 'sprout' | 'bloom' | 'complete'>('seed')

  useEffect(() => {
    if (!isVisible) {
      setStage('seed')
      return
    }

    const timers = [
      setTimeout(() => setStage('sprout'), 500),
      setTimeout(() => setStage('bloom'), 1500),
      setTimeout(() => setStage('complete'), 2500),
      setTimeout(() => {
        onComplete?.()
      }, 3500)
    ]

    return () => timers.forEach(timer => clearTimeout(timer))
  }, [isVisible, onComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-cosmos-900/80 backdrop-blur-sm">
      <div className="relative">
        {/* 成长动画容器 */}
        <div className="relative w-64 h-64 flex items-end justify-center">
          {/* 种子阶段 */}
          {stage === 'seed' && (
            <div className="absolute bottom-0 animate-sprout-grow">
              <div className="w-8 h-8 bg-gradient-to-br from-sprout-600 to-sprout-700 rounded-full" />
            </div>
          )}

          {/* 发芽阶段 */}
          {(stage === 'sprout' || stage === 'bloom' || stage === 'complete') && (
            <div className="absolute bottom-0 animate-sprout-grow">
              {/* 茎 */}
              <div className="w-2 h-32 bg-gradient-to-t from-sprout-600 to-sprout-500 mx-auto rounded-t-full" />
              
              {/* 叶子 */}
              <div className="absolute top-16 -left-8 w-16 h-8 bg-gradient-to-br from-sprout-400 to-sprout-500 rounded-full transform -rotate-45 origin-right" />
              <div className="absolute top-20 -right-8 w-16 h-8 bg-gradient-to-bl from-sprout-400 to-sprout-500 rounded-full transform rotate-45 origin-left" />
            </div>
          )}

          {/* 开花阶段 */}
          {(stage === 'bloom' || stage === 'complete') && (
            <div className="absolute top-0 animate-sprout-grow">
              {/* 花瓣 */}
              {[0, 1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="absolute w-12 h-12 bg-gradient-to-br from-star-400 to-star-500 rounded-full"
                  style={{
                    transform: `rotate(${i * 72}deg) translateY(-20px)`,
                    transformOrigin: 'center 20px'
                  }}
                />
              ))}
              
              {/* 花心 */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-star-300 to-star-400 rounded-full animate-star-twinkle" />
            </div>
          )}

          {/* 星星粒子效果 */}
          {stage === 'complete' && (
            <>
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-2 h-2 bg-star-400 rounded-full animate-star-twinkle"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-80px)`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </>
          )}
        </div>

        {/* 成就文字 */}
        {(stage === 'bloom' || stage === 'complete') && (
          <div className="mt-8 text-center animate-sprout-grow">
            <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sprout-400 to-star-400 mb-2">
              {achievementTitle}
            </div>
            <div className="text-cosmos-300">
              继续加油，你做得很棒！
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface SproutIconProps {
  className?: string
  size?: number
}

export function SproutIcon({ className = '', size = 24 }: SproutIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M12 22V12M12 12C12 8 14 6 16 4C14 6 14 8 14 10C14 11 14.5 12 16 12M12 12C12 8 10 6 8 4C10 6 10 8 10 10C10 11 9.5 12 8 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  )
}
