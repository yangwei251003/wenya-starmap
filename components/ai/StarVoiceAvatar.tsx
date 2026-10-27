'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Mic, MicOff, Sparkles } from 'lucide-react'

interface StarVoiceAvatarProps {
  active?: boolean
  speaking?: boolean
  muted?: boolean
  energy?: number
}

type NovaState = 'idle' | 'thinking' | 'speaking' | 'muted'

const stateCopy: Record<NovaState, { label: string; title: string; description: string }> = {
  idle: {
    label: '待命',
    title: 'NovaSprout',
    description: '把一个问题交给我，星光会从这里开始发芽。',
  },
  thinking: {
    label: '正在萌芽',
    title: 'NovaSprout',
    description: '我在整理你的语言线索，让答案长成清晰路径。',
  },
  speaking: {
    label: '星光回应',
    title: 'NovaSprout',
    description: '答案正在随声音律动，把理解送到你耳边。',
  },
  muted: {
    label: '静默模式',
    title: 'NovaSprout',
    description: '语音已关闭，我仍会用文字继续为你指路。',
  },
}

const sproutPaths = {
  idle: 'M50 78 C42 68 42 51 50 42 C58 51 58 68 50 78 Z',
  thinking: 'M50 78 C39 66 42 48 50 38 C60 48 61 66 50 78 Z',
  speaking: 'M50 80 C36 65 40 43 50 31 C64 43 65 66 50 80 Z',
  muted: 'M50 76 C43 66 44 53 50 45 C56 53 57 66 50 76 Z',
}

function clampEnergy(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(1, value))
}

export function StarVoiceAvatar({
  active = false,
  speaking = false,
  muted = false,
  energy = 0,
}: StarVoiceAvatarProps) {
  const reducedMotion = useReducedMotion()
  const novaState: NovaState = muted ? 'muted' : speaking ? 'speaking' : active ? 'thinking' : 'idle'
  const copy = stateCopy[novaState]
  const audioEnergy = clampEnergy(energy)
  const isAlive = novaState === 'thinking' || novaState === 'speaking'
  const pulseScale = novaState === 'speaking' ? 1.08 + audioEnergy * 0.16 : novaState === 'thinking' ? 1.04 : 1
  const glowOpacity = muted ? 0.12 : isAlive ? 0.46 + audioEnergy * 0.24 : 0.24

  const ringTransition = reducedMotion
    ? { duration: 0.2 }
    : {
        duration: novaState === 'speaking' ? 1.45 : 2.4,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      }

  return (
    <div className="flex items-center gap-4">
      <motion.div
        className="relative flex h-24 w-24 shrink-0 items-center justify-center"
        whileHover={reducedMotion ? undefined : { scale: 1.02 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      >
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(0,245,160,0.16),transparent_66%)] blur-xl" />

        {[0, 1, 2].map((ring) => (
          <motion.span
            key={ring}
            aria-hidden="true"
            className={`absolute rounded-full border ${
              muted
                ? 'border-cosmos-600/50'
                : ring === 0
                  ? 'border-[#00F5A0]/45'
                  : ring === 1
                    ? 'border-star-300/30'
                    : 'border-white/10'
            }`}
            style={{
              inset: `${ring * 9}px`,
              boxShadow: ring === 0 ? `0 0 28px rgba(0,245,160,${glowOpacity})` : undefined,
            }}
            animate={
              reducedMotion
                ? undefined
                : {
                    scale: isAlive ? [1, pulseScale + ring * 0.025, 1] : [1, 1.025, 1],
                    opacity: muted ? 0.38 : isAlive ? [0.46, 0.82, 0.46] : [0.28, 0.48, 0.28],
                  }
            }
            transition={{
              ...ringTransition,
              delay: ring * 0.18,
            }}
          />
        ))}

        {!muted && !reducedMotion && (
          <motion.span
            aria-hidden="true"
            className="absolute inset-1 rounded-full border border-[#00F5A0]/18"
            animate={{
              rotate: 360,
              scale: novaState === 'speaking' ? [1, 1.04 + audioEnergy * 0.08, 1] : 1,
            }}
            transition={{
              rotate: { duration: 9, repeat: Infinity, ease: 'linear' },
              scale: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
            }}
          />
        )}

        <motion.svg
          viewBox="0 0 100 100"
          className="relative z-10 h-20 w-20 overflow-visible"
          role="img"
          aria-label={`NovaSprout ${copy.label}`}
          animate={
            reducedMotion
              ? undefined
              : {
                  y: novaState === 'speaking' ? [0, -2 - audioEnergy * 2, 0] : novaState === 'thinking' ? [0, -1, 0] : 0,
                }
          }
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <defs>
            <radialGradient id="nova-core" cx="50%" cy="44%" r="56%">
              <stop offset="0%" stopColor="#EFFFF8" />
              <stop offset="44%" stopColor={muted ? '#64748B' : '#00F5A0'} />
              <stop offset="100%" stopColor={muted ? '#111827' : '#0B0F19'} />
            </radialGradient>
            <linearGradient id="nova-leaf-left" x1="20%" x2="82%" y1="20%" y2="86%">
              <stop offset="0%" stopColor="#EFFFF8" stopOpacity="0.95" />
              <stop offset="100%" stopColor={muted ? '#64748B' : '#00F5A0'} stopOpacity="0.95" />
            </linearGradient>
            <filter id="nova-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <motion.circle
            cx="50"
            cy="55"
            r={muted ? 27 : 29 + audioEnergy * 3}
            fill="rgba(11,15,25,0.82)"
            stroke={muted ? 'rgba(148,163,184,0.45)' : 'rgba(0,245,160,0.42)'}
            strokeWidth="1.4"
          />

          <motion.path
            d={sproutPaths[novaState]}
            fill="url(#nova-core)"
            filter={muted ? undefined : 'url(#nova-glow)'}
            animate={{
              d: sproutPaths[novaState],
              scale: reducedMotion ? 1 : novaState === 'speaking' ? [1, 1.04 + audioEnergy * 0.12, 1] : 1,
            }}
            transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: '50px 62px' }}
          />

          <motion.path
            d="M49 58 C39 47 30 44 21 48 C29 62 40 66 50 60"
            fill="url(#nova-leaf-left)"
            opacity={muted ? 0.42 : 0.92}
            animate={
              reducedMotion
                ? undefined
                : {
                    rotate: novaState === 'speaking' ? [-2, -7 - audioEnergy * 4, -2] : [-1, -4, -1],
                  }
            }
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '50px 58px' }}
          />

          <motion.path
            d="M51 58 C61 47 70 44 79 48 C71 62 60 66 50 60"
            fill="url(#nova-leaf-left)"
            opacity={muted ? 0.42 : 0.92}
            animate={
              reducedMotion
                ? undefined
                : {
                    rotate: novaState === 'speaking' ? [2, 7 + audioEnergy * 4, 2] : [1, 4, 1],
                  }
            }
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.08 }}
            style={{ transformOrigin: '50px 58px' }}
          />

          <motion.circle
            cx="50"
            cy="38"
            r={muted ? 2.2 : 3 + audioEnergy * 2.6}
            fill={muted ? '#94A3B8' : '#FDE68A'}
            filter={muted ? undefined : 'url(#nova-glow)'}
            animate={
              reducedMotion
                ? undefined
                : {
                    opacity: muted ? 0.45 : [0.72, 1, 0.72],
                    cy: novaState === 'speaking' ? [38, 35 - audioEnergy * 2, 38] : [38, 36.5, 38],
                  }
            }
            transition={{ duration: 1.35, repeat: Infinity, ease: 'easeInOut' }}
          />

          {!muted && (
            <>
              {[17, 31, 68, 83].map((x, index) => (
                <motion.circle
                  key={x}
                  cx={x}
                  cy={index % 2 === 0 ? 29 : 74}
                  r={index === 1 ? 1.5 : 1.2}
                  fill={index === 2 ? '#FDE68A' : '#FFFFFF'}
                  opacity="0.72"
                  animate={
                    reducedMotion
                      ? undefined
                      : {
                          opacity: [0.18, 0.82, 0.18],
                          scale: [0.8, 1.24, 0.8],
                        }
                  }
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: index * 0.28,
                  }}
                />
              ))}
            </>
          )}
        </motion.svg>

        <div className="absolute -right-1 -top-1 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-[#0B0F19]/90 text-[#00F5A0] shadow-[0_0_18px_rgba(0,245,160,0.25)] backdrop-blur">
          {muted ? <MicOff className="h-3.5 w-3.5 text-cosmos-400" /> : <Mic className="h-3.5 w-3.5" />}
        </div>
      </motion.div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-white">{copy.title}</p>
          <span
            className={`rounded-full border px-2 py-0.5 text-xs ${
              muted
                ? 'border-cosmos-600/60 bg-cosmos-800/70 text-cosmos-400'
                : speaking
                  ? 'border-star-300/30 bg-star-400/15 text-star-200'
                  : active
                    ? 'border-[#00F5A0]/30 bg-[#00F5A0]/12 text-[#B9FFE4]'
                    : 'border-white/10 bg-white/5 text-cosmos-300'
            }`}
          >
            {copy.label}
          </span>
        </div>

        <p className="mt-1 text-sm leading-6 text-cosmos-400">{copy.description}</p>

        <div className="mt-3 flex items-center gap-2" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((bar) => {
            const activeBar = novaState === 'speaking' || (novaState === 'thinking' && bar < 3)
            const height = novaState === 'speaking' ? 9 + bar * 3 + audioEnergy * 16 : activeBar ? 10 + bar * 2 : 6

            return (
              <motion.span
                key={bar}
                className={`w-1.5 rounded-full ${muted ? 'bg-cosmos-700' : activeBar ? 'bg-[#00F5A0]' : 'bg-white/15'}`}
                animate={
                  reducedMotion || !activeBar
                    ? { height }
                    : {
                        height: [height * 0.55, height, height * 0.7],
                        opacity: [0.42, 1, 0.62],
                      }
                }
                transition={{
                  duration: novaState === 'speaking' ? 0.68 : 1.2,
                  repeat: activeBar && !reducedMotion ? Infinity : 0,
                  ease: 'easeInOut',
                  delay: bar * 0.08,
                }}
                style={{
                  height,
                  boxShadow: activeBar && !muted ? '0 0 12px rgba(0,245,160,0.4)' : undefined,
                }}
              />
            )
          })}
          <Sparkles className={`ml-1 h-4 w-4 ${muted ? 'text-cosmos-600' : 'text-star-300'}`} />
        </div>
      </div>
    </div>
  )
}
