'use client'

import { useEffect, useState } from 'react'

interface Star {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  animationDuration: number
  animationDelay: number
}

interface Meteor {
  id: number
  x: number
  y: number
  angle: number
  speed: number
  length: number
}

export function StarryBackground() {
  const [stars, setStars] = useState<Star[]>([])
  const [meteors, setMeteors] = useState<Meteor[]>([])

  useEffect(() => {
    // 生成星星
    const generatedStars: Star[] = []
    for (let i = 0; i < 150; i++) {
      generatedStars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        animationDuration: Math.random() * 3 + 2,
        animationDelay: Math.random() * 5,
      })
    }
    setStars(generatedStars)

    // 定期生成流星
    const meteorInterval = setInterval(() => {
      const newMeteor: Meteor = {
        id: Date.now(),
        x: Math.random() * 100,
        y: Math.random() * 30,
        angle: Math.random() * 30 + 30,
        speed: Math.random() * 2 + 1,
        length: Math.random() * 100 + 50,
      }
      setMeteors(prev => [...prev.slice(-5), newMeteor])
    }, 3000)

    return () => clearInterval(meteorInterval)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>
      {/* 深空背景渐变 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#0f172a] to-[#1a1a2e]" />
      
      {/* 星云效果 */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-900/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-indigo-900/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }} />
      </div>

      {/* 星星 */}
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute rounded-full animate-twinkle"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: star.size > 2 ? '#fde047' : '#ffffff',
            opacity: star.opacity,
            animationDuration: `${star.animationDuration}s`,
            animationDelay: `${star.animationDelay}s`,
            boxShadow: star.size > 2 
              ? `0 0 ${star.size * 2}px ${star.size}px rgba(253, 224, 71, 0.3)` 
              : `0 0 ${star.size}px rgba(255, 255, 255, 0.5)`,
          }}
        />
      ))}

      {/* 流星 */}
      {meteors.map(meteor => (
        <div
          key={meteor.id}
          className="absolute animate-meteor"
          style={{
            left: `${meteor.x}%`,
            top: `${meteor.y}%`,
            transform: `rotate(${meteor.angle}deg)`,
            animationDuration: `${meteor.speed}s`,
          }}
        >
          <div 
            className="h-0.5 bg-gradient-to-r from-white via-yellow-200 to-transparent rounded-full"
            style={{ width: `${meteor.length}px` }}
          />
        </div>
      ))}

      {/* 大型装饰星星 */}
      <div className="absolute top-20 left-[15%] animate-float">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-star-400">
          <path d="M12 2L14.5 9H22L16 14L18.5 22L12 17L5.5 22L8 14L2 9H9.5L12 2Z" fill="currentColor" opacity="0.8"/>
        </svg>
      </div>
      <div className="absolute top-40 right-[20%] animate-float" style={{ animationDelay: '1s' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-star-300">
          <path d="M12 2L14.5 9H22L16 14L18.5 22L12 17L5.5 22L8 14L2 9H9.5L12 2Z" fill="currentColor" opacity="0.6"/>
        </svg>
      </div>
      <div className="absolute bottom-32 left-[25%] animate-float" style={{ animationDelay: '2s' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-sprout-400">
          <path d="M12 2L14.5 9H22L16 14L18.5 22L12 17L5.5 22L8 14L2 9H9.5L12 2Z" fill="currentColor" opacity="0.7"/>
        </svg>
      </div>
    </div>
  )
}

export function MeteorShower() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-meteor-fall"
          style={{
            left: `${10 + i * 15}%`,
            top: '-5%',
            animationDelay: `${i * 2}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
          }}
        >
          <div className="w-32 h-0.5 bg-gradient-to-r from-white via-yellow-200 to-transparent rounded-full transform rotate-45" />
        </div>
      ))}
    </div>
  )
}

export function FloatingParticles() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; duration: number }>>([])

  useEffect(() => {
    const generated = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 10 + 10,
    }))
    setParticles(generated)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-sprout-400/30 animate-float-particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  )
}
