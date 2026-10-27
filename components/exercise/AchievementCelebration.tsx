'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StarAchievement } from '@/types'

interface AchievementCelebrationProps {
  achievements: StarAchievement[]
  onClose: () => void
}

export function AchievementCelebration({
  achievements,
  onClose
}: AchievementCelebrationProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (achievements.length === 0) {
      onClose()
      return
    }

    // 每个成就显示3秒
    const timer = setTimeout(() => {
      if (currentIndex < achievements.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        setIsVisible(false)
        setTimeout(onClose, 500)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [currentIndex, achievements.length, onClose])

  if (achievements.length === 0) return null

  const currentAchievement = achievements[currentIndex]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => {
            setIsVisible(false)
            setTimeout(onClose, 500)
          }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 星星闪烁效果 */}
            <div className="absolute inset-0 -z-10">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: Math.random() * 400 - 200,
                    y: Math.random() * 400 - 200
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                  className="absolute top-1/2 left-1/2 w-2 h-2 bg-star-400 rounded-full"
                />
              ))}
            </div>

            {/* 成就卡片 */}
            <div className="bg-gradient-to-br from-cosmos-800 to-cosmos-900 p-8 rounded-2xl border-4 border-star-400 shadow-2xl max-w-md">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                {/* 图标 */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                  className="text-8xl mb-4"
                >
                  {currentAchievement.metadata?.icon || '⭐'}
                </motion.div>

                {/* 标题 */}
                <h2 className="text-3xl font-bold text-star-400 mb-2">
                  🎉 新成就解锁！
                </h2>

                {/* 成就名称 */}
                <h3 className="text-2xl font-semibold text-cosmos-100 mb-3">
                  {currentAchievement.title}
                </h3>

                {/* 成就描述 */}
                <p className="text-cosmos-300 mb-6">
                  {currentAchievement.description}
                </p>

                {/* 进度指示器 */}
                {achievements.length > 1 && (
                  <div className="flex justify-center gap-2">
                    {achievements.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentIndex
                            ? 'bg-star-400 w-6'
                            : 'bg-cosmos-600'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* 提示文字 */}
                <p className="text-sm text-cosmos-500 mt-4">
                  点击任意处继续
                </p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
