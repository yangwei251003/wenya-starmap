'use client'

import { useEffect, useState } from 'react'

interface Star {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  color: string
  glow: string
  drift: number
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

interface Sparkle {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  animationDuration: number
  animationDelay: number
}

export function StarryBackground() {
  const [stars, setStars] = useState<Star[]>([])
  const [sparkles, setSparkles] = useState<Sparkle[]>([])
  const [meteors, setMeteors] = useState<Meteor[]>([])

  useEffect(() => {
    const createField = () => {
      const isSmallScreen = window.innerWidth < 768
      const starCount = isSmallScreen ? 88 : 168
      const sparkleCount = isSmallScreen ? 18 : 34
      const palette = [
        { color: '#ffffff', glow: 'rgba(255, 255, 255, 0.42)', weight: 0.64 },
        { color: '#00F5A0', glow: 'rgba(0, 245, 160, 0.46)', weight: 0.26 },
        { color: '#FDE68A', glow: 'rgba(253, 230, 138, 0.38)', weight: 0.1 },
      ]

      const pickTone = () => {
        const seed = Math.random()
        let cursor = 0
        for (const tone of palette) {
          cursor += tone.weight
          if (seed <= cursor) return tone
        }
        return palette[0]
      }

      const generatedStars: Star[] = []
      for (let i = 0; i < starCount; i++) {
        const tone = pickTone()
        const size = Math.random() * (isSmallScreen ? 1.8 : 2.4) + 0.7
        generatedStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size,
          color: tone.color,
          glow: tone.glow,
          drift: Math.random() * 10 - 5,
          opacity: Math.random() * 0.48 + 0.24,
          animationDuration: Math.random() * 4 + 3.5,
          animationDelay: Math.random() * 6,
        })
      }
      setStars(generatedStars)

      const generatedSparkles: Sparkle[] = []
      for (let i = 0; i < sparkleCount; i++) {
        generatedSparkles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 5 + 3,
          opacity: Math.random() * 0.18 + 0.08,
          animationDuration: Math.random() * 9 + 7,
          animationDelay: Math.random() * 8,
        })
      }
      setSparkles(generatedSparkles)
    }

    createField()
    window.addEventListener('resize', createField)

    const meteorInterval = setInterval(() => {
      const newMeteor: Meteor = {
        id: Date.now(),
        x: Math.random() * 82,
        y: Math.random() * 26,
        angle: Math.random() * 18 + 32,
        speed: Math.random() * 1.4 + 1.6,
        length: Math.random() * 96 + 72,
      }
      setMeteors(prev => [...prev.slice(-3), newMeteor])
    }, 4800)

    return () => {
      window.removeEventListener('resize', createField)
      clearInterval(meteorInterval)
    }
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none bg-[#0B0F19]" style={{ zIndex: -1 }}>
      {/* 深邃夜空底色 */}
      <div className="absolute inset-0 bg-[#0B0F19]" />

      {/* 低噪点星云层 */}
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background:
            'radial-gradient(circle at 18% 18%, rgba(0, 245, 160, 0.16), transparent 27%), radial-gradient(circle at 78% 8%, rgba(253, 230, 138, 0.10), transparent 24%), radial-gradient(circle at 68% 68%, rgba(20, 184, 166, 0.12), transparent 30%), linear-gradient(180deg, rgba(11, 15, 25, 0) 0%, rgba(4, 8, 18, 0.78) 100%)',
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: '84px 84px',
          maskImage: 'radial-gradient(circle at center, black 0%, transparent 78%)',
        }}
      />

      {/* Aceternity Sparkles 风格的薄荷星尘前景 */}
      {sparkles.map(sparkle => (
        <span
          key={sparkle.id}
          className="absolute rounded-full bg-[#00F5A0] animate-float-particle"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: `${sparkle.size}px`,
            height: `${sparkle.size}px`,
            opacity: sparkle.opacity,
            animationDuration: `${sparkle.animationDuration}s`,
            animationDelay: `${sparkle.animationDelay}s`,
            filter: 'blur(0.5px)',
            boxShadow: '0 0 18px rgba(0, 245, 160, 0.55)',
          }}
        />
      ))}

      {/* 远近两层星点 */}
      {stars.map(star => (
        <span
          key={star.id}
          className="absolute rounded-full animate-twinkle"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: star.color,
            opacity: star.opacity,
            animationDuration: `${star.animationDuration}s`,
            animationDelay: `${star.animationDelay}s`,
            transform: `translate3d(${star.drift}px, 0, 0)`,
            boxShadow: `0 0 ${star.size * 6}px ${star.glow}`,
          }}
        />
      ))}

      {/* 克制的薄荷流星 */}
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
            className="h-px rounded-full"
            style={{
              width: `${meteor.length}px`,
              background:
                'linear-gradient(90deg, rgba(255,255,255,0.95), rgba(0,245,160,0.68), transparent)',
              boxShadow: '0 0 18px rgba(0, 245, 160, 0.32)',
            }}
          />
        </div>
      ))}

      {/* 顶层柔和暗角，让内容保持可读 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.22)_72%,rgba(0,0,0,0.56)_100%)]" />
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
