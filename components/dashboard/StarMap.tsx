'use client'

import React, { useEffect, useState } from 'react'
import { StarAchievement } from '@/types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

interface StarMapProps {
  achievements: StarAchievement[]
  width?: number
  height?: number
  onAchievementClick?: (achievement: StarAchievement) => void
}

export function StarMap({ achievements, width = 600, height = 400, onAchievementClick }: StarMapProps) {
  const [hoveredStar, setHoveredStar] = useState<string | null>(null)
  const [animatedStars, setAnimatedStars] = useState<Set<string>>(new Set())

  useEffect(() => {
    // 逐个显示星星的动画
    achievements.forEach((achievement, index) => {
      setTimeout(() => {
        setAnimatedStars(prev => new Set([...Array.from(prev), achievement.id]))
      }, index * 200)
    })
  }, [achievements])

  // 生成背景星星（装饰性）
  const backgroundStars = Array.from({ length: 50 }, (_, i) => ({
    id: `bg-${i}`,
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 2 + 1,
    opacity: Math.random() * 0.5 + 0.2,
    delay: Math.random() * 3
  }))

  const hoveredAchievement = achievements.find(a => a.id === hoveredStar)

  return (
    <Card variant="cosmos" className="relative">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>成长星图</span>
          <span className="text-sm font-normal text-cosmos-300">
            {achievements.length} 颗星辰
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative bg-gradient-to-b from-cosmos-900 to-cosmos-800 rounded-lg overflow-hidden">
          <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto"
          >
            {/* 背景装饰星星 */}
            {backgroundStars.map(star => (
              <circle
                key={star.id}
                cx={star.x}
                cy={star.y}
                r={star.size}
                fill="white"
                opacity={star.opacity}
                className="animate-star-twinkle"
                style={{ animationDelay: `${star.delay}s` }}
              />
            ))}

            {/* 成就星星连线 */}
            {achievements.length > 1 && achievements.map((achievement, index) => {
              if (index === 0) return null
              const prev = achievements[index - 1]
              return (
                <line
                  key={`line-${achievement.id}`}
                  x1={prev.starPosition.x}
                  y1={prev.starPosition.y}
                  x2={achievement.starPosition.x}
                  y2={achievement.starPosition.y}
                  stroke="rgba(250, 204, 21, 0.3)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  className={animatedStars.has(achievement.id) ? 'opacity-100' : 'opacity-0'}
                  style={{ transition: 'opacity 0.5s ease-in' }}
                />
              )
            })}

            {/* 成就星星 */}
            {achievements.map(achievement => {
              const isAnimated = animatedStars.has(achievement.id)
              const isHovered = hoveredStar === achievement.id

              return (
                <g
                  key={achievement.id}
                  onMouseEnter={() => setHoveredStar(achievement.id)}
                  onMouseLeave={() => setHoveredStar(null)}
                  onClick={() => onAchievementClick?.(achievement)}
                  className="cursor-pointer"
                  style={{
                    transform: isAnimated ? 'scale(1)' : 'scale(0)',
                    transformOrigin: `${achievement.starPosition.x}px ${achievement.starPosition.y}px`,
                    transition: 'transform 0.5s ease-out'
                  }}
                >
                  {/* 星星光晕 */}
                  {isHovered && (
                    <circle
                      cx={achievement.starPosition.x}
                      cy={achievement.starPosition.y}
                      r="20"
                      fill="rgba(250, 204, 21, 0.2)"
                      className="animate-pulse"
                    />
                  )}

                  {/* 星星主体 */}
                  <Star
                    x={achievement.starPosition.x}
                    y={achievement.starPosition.y}
                    size={isHovered ? 16 : 12}
                    color="#facc15"
                  />
                </g>
              )
            })}
          </svg>

          {/* 悬停提示 */}
          {hoveredAchievement && (
            <div className="absolute bottom-4 left-4 right-4 bg-cosmos-700/90 backdrop-blur-sm rounded-lg p-4 border border-star-400/30">
              <div className="text-star-400 font-semibold mb-1">
                {hoveredAchievement.title}
              </div>
              <div className="text-sm text-cosmos-200">
                {hoveredAchievement.description}
              </div>
              <div className="text-xs text-cosmos-400 mt-2">
                获得于 {new Date(hoveredAchievement.earnedAt).toLocaleDateString('zh-CN')}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// 星星形状组件
function Star({ x, y, size, color }: { x: number; y: number; size: number; color: string }) {
  const points = []
  const outerRadius = size
  const innerRadius = size * 0.4

  for (let i = 0; i < 5; i++) {
    // 外点
    const outerAngle = (Math.PI * 2 * i) / 5 - Math.PI / 2
    points.push(`${x + Math.cos(outerAngle) * outerRadius},${y + Math.sin(outerAngle) * outerRadius}`)

    // 内点
    const innerAngle = (Math.PI * 2 * i) / 5 - Math.PI / 2 + Math.PI / 5
    points.push(`${x + Math.cos(innerAngle) * innerRadius},${y + Math.sin(innerAngle) * innerRadius}`)
  }

  return (
    <polygon
      points={points.join(' ')}
      fill={color}
      className="transition-all duration-300"
      style={{ filter: 'drop-shadow(0 0 4px rgba(250, 204, 21, 0.6))' }}
    />
  )
}
