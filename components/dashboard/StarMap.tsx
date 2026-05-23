'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { StarAchievement } from '@/types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

interface StarMapProps {
  achievements: StarAchievement[]
  width?: number
  height?: number
  onAchievementClick?: (achievement: StarAchievement) => void
}

type StarNodeState = 'completed' | 'current' | 'locked'

type StarNode = {
  id: string
  state: StarNodeState
  title: string
  description: string
  icon: string
  x: number
  y: number
  achievement?: StarAchievement
  earnedAt?: Date
  order: number
}

type StarParticle = {
  x: number
  y: number
  radius: number
  alpha: number
  driftX: number
  driftY: number
  phase: number
  hue: 'mint' | 'gold' | 'ice'
}

type Point = {
  x: number
  y: number
}

const routeBlueprint = [
  {
    key: 'first_lesson',
    title: '发问启程',
    description: '第一句提问点亮入口，进入语言星海。',
    icon: '✦',
  },
  {
    key: 'daily_streak',
    title: '晨读轨道',
    description: '连续学习会把星线越织越亮。',
    icon: '◎',
  },
  {
    key: 'vocabulary_master',
    title: '词汇星群',
    description: '单词开始成簇，形成可见的知识银河。',
    icon: '✧',
  },
  {
    key: 'grammar_expert',
    title: '语法灯塔',
    description: '规则不再僵硬，而是指引路径的光柱。',
    icon: '⬡',
  },
  {
    key: 'listening_champion',
    title: '听力回声',
    description: '声音被接住，理解开始回响。',
    icon: '◌',
  },
  {
    key: 'speaking_star',
    title: '口语跃迁',
    description: '表达从萌芽长成流畅的星焰。',
    icon: '✺',
  },
  {
    key: 'perfect_score',
    title: '满分光环',
    description: '一次完整通关，星图进入高亮模式。',
    icon: '◆',
  },
] as const

const stateCopy: Record<StarNodeState, string> = {
  completed: '已点亮',
  current: '正在萌芽',
  locked: '尚未解锁',
}

const stateTone: Record<StarNodeState, string> = {
  completed: '#00F5A0',
  current: '#FDE68A',
  locked: 'rgba(255,255,255,0.28)',
}

const achievementIconFallback: Partial<Record<string, string>> = {
  first_lesson: '✦',
  daily_streak: '◎',
  vocabulary_master: '✧',
  grammar_expert: '⬡',
  listening_champion: '◌',
  speaking_star: '✺',
  perfect_score: '◆',
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function hashSeed(value: string) {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index)
    hash |= 0
  }
  return Math.abs(hash)
}

function seededRandom(seed: number) {
  let value = seed % 2147483647
  if (value <= 0) value += 2147483646

  return () => {
    value = (value * 16807) % 2147483647
    return (value - 1) / 2147483646
  }
}

function sampleQuadratic(
  start: Point,
  control: Point,
  end: Point,
  t: number
) {
  const oneMinusT = 1 - t
  return {
    x: oneMinusT * oneMinusT * start.x + 2 * oneMinusT * t * control.x + t * t * end.x,
    y: oneMinusT * oneMinusT * start.y + 2 * oneMinusT * t * control.y + t * t * end.y,
  }
}

function buildFuturePoint(
  previous: Point,
  current: Point,
  index: number,
  width: number,
  height: number
) {
  const dx = current.x - previous.x
  const dy = current.y - previous.y
  const length = Math.max(Math.hypot(dx, dy), 1)
  const nx = dx / length
  const ny = dy / length
  const scale = 110 + index * 42
  const bend = index % 2 === 0 ? -38 : 34
  const x = current.x + nx * scale - ny * bend
  const y = current.y + ny * scale + nx * bend - index * 8

  return {
    x: clamp(x, 40, width - 40),
    y: clamp(y, 40, height - 40),
  }
}

function createBackgroundParticles(width: number, height: number) {
  const seed = hashSeed(`${width}:${height}:wenya-star-map`)
  const rand = seededRandom(seed)
  const total = clamp(Math.round((width * height) / 9000), 18, 42)
  const particles: StarParticle[] = []

  for (let index = 0; index < total; index += 1) {
    const hue = index % 5 === 0 ? 'gold' : index % 3 === 0 ? 'ice' : 'mint'
    particles.push({
      x: rand() * width,
      y: rand() * height,
      radius: 0.7 + rand() * 1.9,
      alpha: 0.12 + rand() * 0.42,
      driftX: (rand() - 0.5) * (0.18 + rand() * 0.35),
      driftY: (rand() - 0.5) * (0.12 + rand() * 0.28),
      phase: rand() * Math.PI * 2,
      hue,
    })
  }

  return particles
}

function buildStarNodes(achievements: StarAchievement[], width: number, height: number) {
  const baseNodes: StarNode[] = achievements.map((achievement, index) => {
    const blueprint = routeBlueprint[index % routeBlueprint.length]
    const isCurrent = index === achievements.length - 1

    return {
      id: achievement.id,
      state: isCurrent ? 'current' : 'completed',
      title: achievement.title || blueprint.title,
      description: achievement.description || blueprint.description,
      icon:
        achievement.metadata?.icon ||
        achievementIconFallback[achievement.type] ||
        blueprint.icon,
      x: achievement.starPosition.x,
      y: achievement.starPosition.y,
      achievement,
      earnedAt: achievement.earnedAt,
      order: index,
    }
  })

  if (baseNodes.length === 0) {
    const intro = routeBlueprint[0]
    baseNodes.push({
      id: 'seed-current',
      state: 'current',
      title: intro.title,
      description: '从第一句发问开始，星图会自动长出路径。',
      icon: intro.icon,
      x: width * 0.18,
      y: height * 0.7,
      order: 0,
    })
  }

  const lockedTargetCount = Math.max(2, Math.min(3, Math.max(routeBlueprint.length - baseNodes.length, 0)))
  const trailingBlueprint = routeBlueprint.slice(baseNodes.length, baseNodes.length + lockedTargetCount)
  const fallbackBlueprint = Array.from({ length: lockedTargetCount }, (_, index) => ({
    key: `future-${index + 1}`,
    title: `待点亮路径 ${index + 1}`,
    description: '继续发问，让下一段星线慢慢显形。',
    icon: '✦',
  }))
  const futureBlueprint = trailingBlueprint.length > 0 ? trailingBlueprint : fallbackBlueprint
  const anchor = baseNodes[baseNodes.length - 1]
  const previous: Point = baseNodes[baseNodes.length - 2] ?? {
    x: Math.max(40, anchor.x - width * 0.16),
    y: Math.min(height - 40, anchor.y + height * 0.12),
  }

  let chainPrevious = previous
  let chainCurrent: Point = anchor
  const chainedLockedNodes: StarNode[] = futureBlueprint.map((step, index) => {
    const future = buildFuturePoint(chainPrevious, chainCurrent, index + 1, width, height)
    const node: StarNode = {
      id: `locked-${step.key}`,
      state: 'locked',
      title: step.title,
      description: step.description,
      icon: step.icon,
      x: future.x,
      y: future.y,
      order: baseNodes.length + index,
    }
    chainPrevious = chainCurrent
    chainCurrent = future
    return node
  })

  return [...baseNodes, ...chainedLockedNodes]
}

function buildSegments(nodes: StarNode[]) {
  return nodes.slice(1).map((node, index) => {
    const previous = nodes[index]
    const control = {
      x: (previous.x + node.x) / 2 + (index % 2 === 0 ? 22 : -22),
      y: (previous.y + node.y) / 2 - 36 - index * 4,
    }

    return {
      id: `${previous.id}-${node.id}`,
      state: node.state,
      previous,
      node,
      control,
      d: `M ${previous.x} ${previous.y} Q ${control.x} ${control.y} ${node.x} ${node.y}`,
      midpoint: sampleQuadratic(previous, control, node, 0.5),
    }
  })
}

function buildNodePoints(x: number, y: number, size: number) {
  const points: string[] = []
  const outerRadius = size
  const innerRadius = size * 0.45

  for (let index = 0; index < 5; index += 1) {
    const outerAngle = (Math.PI * 2 * index) / 5 - Math.PI / 2
    points.push(`${x + Math.cos(outerAngle) * outerRadius},${y + Math.sin(outerAngle) * outerRadius}`)
    const innerAngle = (Math.PI * 2 * index) / 5 - Math.PI / 2 + Math.PI / 5
    points.push(`${x + Math.cos(innerAngle) * innerRadius},${y + Math.sin(innerAngle) * innerRadius}`)
  }

  return points.join(' ')
}

export function StarMap({
  achievements,
  width = 600,
  height = 400,
  onAchievementClick,
}: StarMapProps) {
  const reducedMotion = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)

  const backgroundParticles = useMemo(
    () => createBackgroundParticles(width, height),
    [width, height]
  )

  const nodes = useMemo(
    () => buildStarNodes(achievements, width, height),
    [achievements, width, height]
  )

  const segments = useMemo(() => buildSegments(nodes), [nodes])

  const summary = useMemo(() => {
    const completed = nodes.filter(node => node.state === 'completed').length
    const current = nodes.find(node => node.state === 'current')
    const locked = nodes.filter(node => node.state === 'locked').length

    return { completed, current, locked }
  }, [nodes])

  const activeNode = useMemo(
    () => nodes.find(node => node.id === hoveredNodeId) ?? nodes.find(node => node.state === 'current') ?? nodes[0],
    [hoveredNodeId, nodes]
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
    let frame = 0
    let cancelled = false
    const resize = () => {
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      canvas.style.width = '100%'
      canvas.style.height = '100%'
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const render = (now: number) => {
      if (cancelled) return
      context.clearRect(0, 0, width, height)

      backgroundParticles.forEach((particle, index) => {
        const sway = now * 0.00016 + particle.phase + index * 0.15
        const x = particle.x + Math.sin(sway * 1.7) * (particle.driftX * 20)
        const y = particle.y + Math.cos(sway * 1.2) * (particle.driftY * 20)
        const alphaBoost = 0.5 + Math.sin(sway * 2.3) * 0.25
        const hueMap = {
          mint: '0, 245, 160',
          gold: '253, 224, 71',
          ice: '197, 244, 255',
        } as const
        const color = hueMap[particle.hue]

        context.beginPath()
        context.fillStyle = `rgba(${color}, ${particle.alpha * alphaBoost})`
        context.shadowColor = `rgba(${color}, ${particle.alpha * 0.8})`
        context.shadowBlur = particle.radius * 6
        context.arc(x, y, particle.radius, 0, Math.PI * 2)
        context.fill()
      })

      if (!reducedMotion) {
        frame = window.requestAnimationFrame(render)
      }
    }

    resize()

    if (!reducedMotion) {
      frame = window.requestAnimationFrame(render)
    } else {
      render(0)
    }

    return () => {
      cancelled = true
      if (frame) {
        window.cancelAnimationFrame(frame)
      }
    }
  }, [backgroundParticles, reducedMotion, width, height])

  const hoveredNode = activeNode

  return (
    <Card variant="cosmos" className="relative overflow-hidden p-0">
      <CardHeader className="relative z-10 border-b border-white/5 px-5 pt-5">
        <CardTitle className="flex items-center justify-between gap-3 text-white">
          <span className="flex items-center gap-2">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#00F5A0] shadow-[0_0_18px_rgba(0,245,160,0.75)]" />
            语言星图
          </span>
          <span className="text-sm font-normal text-cosmos-300">
            {summary.completed} 已点亮 · {summary.locked} 待点亮
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="relative px-0 pb-0">
        <div
          className="relative overflow-hidden"
          style={{
            minHeight: height,
          }}
        >
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full opacity-90"
          />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,245,160,0.09),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(253,224,71,0.08),transparent_32%)]" />

          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="relative z-10 block h-auto w-full"
            role="img"
            aria-label="语言星图"
          >
            <defs>
              <linearGradient id="wenya-line-completed" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00F5A0" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#FDE68A" stopOpacity="0.95" />
              </linearGradient>
              <linearGradient id="wenya-line-locked" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.14)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.14)" stopOpacity="0.55" />
              </linearGradient>
              <filter id="wenya-glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="wenya-soft-glow">
                <feGaussianBlur stdDeviation="6" result="softBlur" />
                <feMerge>
                  <feMergeNode in="softBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {backgroundParticles.slice(0, 18).map((particle, index) => (
              <circle
                key={`bg-star-${index}`}
                cx={particle.x}
                cy={particle.y}
                r={particle.radius}
                fill={particle.hue === 'gold' ? '#FDE68A' : particle.hue === 'ice' ? '#DDFBFF' : '#FFFFFF'}
                opacity={particle.alpha}
                className="animate-star-twinkle"
                style={{
                  animationDelay: `${index * 120}ms`,
                }}
              />
            ))}

            {segments.map((segment, index) => {
              const completed = segment.state !== 'locked'
              const stroke = completed ? 'url(#wenya-line-completed)' : 'url(#wenya-line-locked)'
              const dash = segment.state === 'locked' ? '6 10' : '1 0'
              const particles = segment.state === 'locked' ? 1 : 2

              return (
                <g key={segment.id}>
                  <motion.path
                    d={segment.d}
                    fill="none"
                    stroke={stroke}
                    strokeWidth={segment.state === 'locked' ? 1.4 : 2.4}
                    strokeLinecap="round"
                    strokeDasharray={dash}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: segment.state === 'locked' ? 0.34 : 1 }}
                    transition={{
                      duration: segment.state === 'locked' ? 0.75 : 0.95,
                      ease: 'easeOut',
                      delay: index * 0.12,
                    }}
                    style={{
                      filter: segment.state === 'locked' ? 'none' : 'url(#wenya-glow)',
                    }}
                  />

                  {!reducedMotion &&
                    Array.from({ length: particles }).map((_, particleIndex) => {
                      const tOffset = particleIndex * 0.34 + (segment.state === 'locked' ? 0.18 : 0)
                      const samples = [0, 0.35, 0.7, 1].map((t) =>
                        sampleQuadratic(segment.previous, segment.control, segment.node, t)
                      )

                      return (
                        <motion.circle
                          key={`${segment.id}-particle-${particleIndex}`}
                          r={segment.state === 'locked' ? 1.3 : 1.8}
                          fill={segment.state === 'locked' ? '#FFFFFF' : '#00F5A0'}
                          opacity={segment.state === 'locked' ? 0.45 : 0.85}
                          initial={{ cx: samples[0].x, cy: samples[0].y, opacity: 0 }}
                          animate={{
                            cx: samples.map(sample => sample.x),
                            cy: samples.map(sample => sample.y),
                            opacity: segment.state === 'locked' ? [0, 0.45, 0.35, 0] : [0, 0.85, 0.6, 0],
                          }}
                          transition={{
                            duration: segment.state === 'locked' ? 3.6 : 2.8,
                            repeat: Infinity,
                            ease: 'linear',
                            delay: index * 0.16 + tOffset,
                          }}
                          style={{
                            filter: 'drop-shadow(0 0 8px rgba(0,245,160,0.65))',
                          }}
                        />
                      )
                    })}
                </g>
              )
            })}

            {nodes.map((node, index) => {
              const isHovered = hoveredNodeId === node.id
              const isInteractive = node.state !== 'locked'
              const size = node.state === 'current' ? 15 : node.state === 'completed' ? 13 : 11
              const delay = 0.14 * index

              return (
                <motion.g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  initial={{ opacity: 0, scale: 0.4, y: 8 }}
                  animate={{ opacity: mounted ? 1 : 0, scale: mounted ? 1 : 0.4, y: 0 }}
                  transition={{
                    duration: 0.55,
                    ease: 'easeOut',
                    delay,
                  }}
                  whileHover={isInteractive && !reducedMotion ? { scale: 1.08 } : undefined}
                  whileTap={isInteractive && !reducedMotion ? { scale: 0.98 } : undefined}
                  role={isInteractive ? 'button' : undefined}
                  tabIndex={isInteractive ? 0 : undefined}
                  aria-label={`${node.title}，${stateCopy[node.state]}`}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  onFocus={() => setHoveredNodeId(node.id)}
                  onBlur={() => setHoveredNodeId(null)}
                  onClick={() => {
                    if (isInteractive && node.achievement) {
                      onAchievementClick?.(node.achievement)
                    }
                  }}
                  onKeyDown={(event) => {
                    if (!isInteractive || !node.achievement) return
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      onAchievementClick?.(node.achievement)
                    }
                  }}
                  className={isInteractive ? 'cursor-pointer' : 'cursor-default'}
                  style={{
                    transformOrigin: 'center',
                  }}
                >
                  {node.state === 'current' && !reducedMotion && (
                    <motion.circle
                      r={24}
                      fill="none"
                      stroke="#FDE68A"
                      strokeOpacity={0.35}
                      strokeWidth="1.2"
                      animate={{ r: [22, 28, 22], opacity: [0.15, 0.45, 0.15] }}
                      transition={{
                        duration: 2.4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      filter="url(#wenya-soft-glow)"
                    />
                  )}

                  {node.state === 'completed' && !reducedMotion && (
                    <motion.circle
                      r={18}
                      fill="#00F5A0"
                      fillOpacity={0.14}
                      animate={{ opacity: [0.18, 0.42, 0.18], r: [16, 20, 16] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  )}

                  <circle
                    r={node.state === 'locked' ? size + 1 : size + 2}
                    fill={node.state === 'locked' ? 'rgba(255,255,255,0.06)' : node.state === 'current' ? 'rgba(253,230,138,0.12)' : 'rgba(0,245,160,0.12)'}
                    stroke={stateTone[node.state]}
                    strokeWidth={node.state === 'locked' ? 1 : 1.4}
                  />

                  {node.state !== 'locked' && (
                    <polygon
                      points={buildNodePoints(0, 0, size)}
                      fill={node.state === 'current' ? '#FDE68A' : '#00F5A0'}
                      filter="url(#wenya-glow)"
                      opacity={node.state === 'current' ? 1 : 0.92}
                    />
                  )}

                  {node.state === 'locked' && (
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      className="select-none fill-white/80 text-[10px] font-semibold"
                    >
                      {node.icon}
                    </text>
                  )}

                  {isHovered && (
                    <motion.circle
                      r={node.state === 'locked' ? 20 : 26}
                      fill={node.state === 'locked' ? 'rgba(255,255,255,0.08)' : 'rgba(0,245,160,0.14)'}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </motion.g>
              )
            })}
          </svg>

          {hoveredNode && (
            <motion.div
              key={hoveredNode.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="absolute bottom-4 left-4 right-4 rounded-lg border border-white/10 bg-[#0B0F19]/85 p-4 backdrop-blur-xl"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-sm"
                    style={{
                      color: stateTone[hoveredNode.state],
                      boxShadow:
                        hoveredNode.state === 'current'
                          ? '0 0 18px rgba(253,230,138,0.22)'
                          : '0 0 18px rgba(0,245,160,0.16)',
                    }}
                  >
                    {hoveredNode.icon}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-white">{hoveredNode.title}</div>
                    <div className="text-xs text-cosmos-300">{stateCopy[hoveredNode.state]}</div>
                  </div>
                </div>
                {hoveredNode.earnedAt && (
                  <div className="text-xs text-cosmos-400">
                    {new Date(hoveredNode.earnedAt).toLocaleDateString('zh-CN')}
                  </div>
                )}
              </div>
              <p className="text-sm leading-6 text-cosmos-200">
                {hoveredNode.description}
              </p>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
