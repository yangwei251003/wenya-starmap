'use client'

import { useEffect, useMemo, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useReducedMotion } from 'framer-motion'

type StarTone = {
  color: string
  aura: string
  weight: number
}

type Star = {
  id: number
  x: number
  y: number
  radius: number
  driftX: number
  driftY: number
  pulse: number
  speed: number
  phase: number
  alpha: number
  tone: StarTone
  layer: number
}

type Nebula = {
  id: number
  x: number
  y: number
  radius: number
  stretch: number
  alpha: number
  speed: number
  phase: number
  tone: string
}

type OrbitRing = {
  id: number
  x: number
  y: number
  radius: number
  lineWidth: number
  alpha: number
  tilt: number
  speed: number
  dash: number
  accent: string
}

type AuroraRibbon = {
  id: number
  y: number
  amplitude: number
  frequency: number
  width: number
  alpha: number
  speed: number
  phase: number
  tint: string
}

type Constellation = {
  id: number
  indices: number[]
  color: string
  alpha: number
  width: number
  phase: number
}

type TrailBurst = {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  life: number
  ttl: number
  size: number
  color: string
  sparkle: number
}

type CosmosProfile = {
  mode: 'calm' | 'focus' | 'hero' | 'static'
  starCount: number
  nebulaCount: number
  ringCount: number
  auroraCount: number
  trailChance: number
  pointerRadius: number
  gridOpacity: number
  vignetteStrength: number
  darkenStrength: number
  coreGlow: number
}

const STAR_TONES: StarTone[] = [
  { color: '#F8FAFF', aura: 'rgba(255,255,255,0.55)', weight: 0.34 },
  { color: '#5AF5D6', aura: 'rgba(90,245,214,0.55)', weight: 0.22 },
  { color: '#77A7FF', aura: 'rgba(119,167,255,0.50)', weight: 0.18 },
  { color: '#FFD86B', aura: 'rgba(255,216,107,0.48)', weight: 0.16 },
  { color: '#9D7BFF', aura: 'rgba(157,123,255,0.50)', weight: 0.10 },
]

const RIBBON_TINTS = ['rgba(0,245,160,', 'rgba(90,245,214,', 'rgba(117,141,255,', 'rgba(253,224,71,', 'rgba(168,85,247,']

function hashString(input: string) {
  let hash = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function createRandom(seed: number) {
  let value = seed || 1
  return () => {
    value ^= value << 13
    value ^= value >>> 17
    value ^= value << 5
    return (value >>> 0) / 4294967296
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function lerp(start: number, end: number, amount: number) {
  return start + (end - start) * amount
}

function pickTone(rand: () => number) {
  const seed = rand()
  let cursor = 0
  for (const tone of STAR_TONES) {
    cursor += tone.weight
    if (seed <= cursor) return tone
  }
  return STAR_TONES[0]
}

function profileForPath(pathname: string, reducedMotion: boolean): CosmosProfile {
  const lowMotion = reducedMotion ? 0.62 : 1

  if (
    pathname.startsWith('/auth') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/demo') ||
    pathname.startsWith('/test-') ||
    pathname.startsWith('/mobile') ||
    pathname.startsWith('/study/summary') ||
    pathname.startsWith('/study-v2/summary') ||
    pathname.startsWith('/progress-demo')
  ) {
    return {
      mode: 'static',
      starCount: 0,
      nebulaCount: 0,
      ringCount: 0,
      auroraCount: 0,
      trailChance: 0,
      pointerRadius: 0,
      gridOpacity: 0,
      vignetteStrength: 0,
      darkenStrength: 0,
      coreGlow: 0,
    }
  }

  if (
    pathname === '/' ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/services') ||
    pathname.startsWith('/growth-starmap') ||
    pathname.startsWith('/memory-dashboard') ||
    pathname.startsWith('/competition') ||
    pathname.startsWith('/community')
  ) {
    return {
      mode: 'hero',
      starCount: Math.round(175 * lowMotion),
      nebulaCount: 5,
      ringCount: 5,
      auroraCount: 4,
      trailChance: reducedMotion ? 0 : 0.14,
      pointerRadius: 420,
      gridOpacity: 0.09,
      vignetteStrength: 0.58,
      darkenStrength: 0.28,
      coreGlow: 1.25,
    }
  }

  if (
    pathname.startsWith('/study') ||
    pathname.startsWith('/vocab') ||
    pathname.startsWith('/lesson') ||
    pathname.startsWith('/reading') ||
    pathname.startsWith('/quiz') ||
    pathname.startsWith('/ai-writing') ||
    pathname.startsWith('/chat') ||
    pathname.startsWith('/my-courses') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/store') ||
    pathname.startsWith('/recharge')
  ) {
    return {
      mode: 'focus',
      starCount: Math.round(120 * lowMotion),
      nebulaCount: 5,
      ringCount: 3,
      auroraCount: 4,
      trailChance: reducedMotion ? 0 : 0.07,
      pointerRadius: 320,
      gridOpacity: 0.06,
      vignetteStrength: 0.5,
      darkenStrength: 0.34,
      coreGlow: 0.95,
    }
  }

  return {
    mode: 'calm',
    starCount: Math.round(88 * lowMotion),
    nebulaCount: 4,
    ringCount: 3,
    auroraCount: 3,
    trailChance: reducedMotion ? 0 : 0.04,
    pointerRadius: 260,
    gridOpacity: 0.045,
    vignetteStrength: 0.42,
    darkenStrength: 0.4,
    coreGlow: 0.72,
  }
}

function buildStars(rand: () => number, profile: CosmosProfile) {
  const stars: Star[] = []
  for (let i = 0; i < profile.starCount; i += 1) {
    const tone = pickTone(rand)
    const layer = rand() < 0.55 ? 0 : rand() < 0.82 ? 1 : 2
    const baseRadius = layer === 0 ? lerp(1.5, 2.8, rand()) : layer === 1 ? lerp(0.9, 2, rand()) : lerp(0.5, 1.4, rand())
    stars.push({
      id: i,
      x: rand(),
      y: rand(),
      radius: baseRadius,
      driftX: lerp(4, 22, rand()) * (rand() < 0.5 ? -1 : 1),
      driftY: lerp(3, 16, rand()) * (rand() < 0.5 ? -1 : 1),
      pulse: lerp(0.3, 1.2, rand()),
      speed: lerp(0.00024, 0.00075, rand()),
      phase: rand() * Math.PI * 2,
      alpha: lerp(0.2, 0.95, rand()),
      tone,
      layer,
    })
  }
  return stars
}

function buildNebulae(rand: () => number, profile: CosmosProfile) {
  const nebulae: Nebula[] = []
  const tones = [
    'rgba(0,245,160,',
    'rgba(90,245,214,',
    'rgba(77,124,255,',
    'rgba(250,204,21,',
    'rgba(168,85,247,',
  ]

  for (let i = 0; i < profile.nebulaCount; i += 1) {
    nebulae.push({
      id: i,
      x: rand(),
      y: rand() * 0.72 + 0.06,
      radius: lerp(0.18, 0.42, rand()),
      stretch: lerp(0.9, 1.8, rand()),
      alpha: lerp(0.08, 0.18, rand()),
      speed: lerp(0.00005, 0.00012, rand()),
      phase: rand() * Math.PI * 2,
      tone: tones[Math.floor(rand() * tones.length)],
    })
  }

  return nebulae
}

function buildOrbits(rand: () => number, profile: CosmosProfile) {
  const rings: OrbitRing[] = []
  for (let i = 0; i < profile.ringCount; i += 1) {
    rings.push({
      id: i,
      x: lerp(0.22, 0.78, rand()),
      y: lerp(0.22, 0.7, rand()),
      radius: lerp(90, 360, rand()),
      lineWidth: lerp(0.8, 1.9, rand()),
      alpha: lerp(0.08, 0.2, rand()),
      tilt: lerp(-0.6, 0.6, rand()),
      speed: lerp(0.00008, 0.00018, rand()) * (rand() < 0.5 ? -1 : 1),
      dash: lerp(10, 28, rand()),
      accent: STAR_TONES[Math.floor(rand() * STAR_TONES.length)]?.aura ?? 'rgba(255,255,255,0.4)',
    })
  }
  return rings
}

function buildAuroras(rand: () => number, profile: CosmosProfile) {
  const ribbons: AuroraRibbon[] = []
  for (let i = 0; i < profile.auroraCount; i += 1) {
    ribbons.push({
      id: i,
      y: lerp(0.06, 0.56, rand()),
      amplitude: lerp(18, 72, rand()),
      frequency: lerp(0.004, 0.011, rand()),
      width: lerp(28, 72, rand()),
      alpha: lerp(0.06, 0.16, rand()),
      speed: lerp(0.00015, 0.0004, rand()) * (rand() < 0.5 ? -1 : 1),
      phase: rand() * Math.PI * 2,
      tint: RIBBON_TINTS[Math.floor(rand() * RIBBON_TINTS.length)] ?? 'rgba(90,245,214,',
    })
  }
  return ribbons
}

function buildConstellations(rand: () => number, stars: Star[]) {
  const bright = stars
    .map((star, index) => ({ star, index }))
    .filter(({ star }) => star.layer <= 1 && star.alpha > 0.45)
    .sort((a, b) => b.star.alpha - a.star.alpha)

  const constellations: Constellation[] = []
  const chainCount = Math.max(3, Math.min(7, Math.floor(stars.length / 35)))

  for (let i = 0; i < chainCount; i += 1) {
    const picks: number[] = []
    const desired = 3 + Math.floor(rand() * 3)
    const pool = bright.length > 0 ? bright : stars.map((star, index) => ({ star, index }))

    while (picks.length < desired && pool.length > 0) {
      const candidate = pool[Math.floor(rand() * pool.length)]
      if (!candidate) break
      if (!picks.includes(candidate.index)) picks.push(candidate.index)
    }

    picks.sort((a, b) => stars[a].x - stars[b].x)

    constellations.push({
      id: i,
      indices: picks,
      color: STAR_TONES[i % STAR_TONES.length]?.aura ?? 'rgba(255,255,255,0.38)',
      alpha: lerp(0.16, 0.38, rand()),
      width: lerp(0.8, 1.7, rand()),
      phase: rand() * Math.PI * 2,
    })
  }

  return constellations
}

function rgbaFrom(hex: string, alpha: number) {
  const normalized = hex.replace('#', '')
  const full = normalized.length === 3
    ? normalized
        .split('')
        .map(ch => ch + ch)
        .join('')
    : normalized
  const value = Number.parseInt(full, 16)
  const r = (value >> 16) & 255
  const g = (value >> 8) & 255
  const b = value & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function StarryBackground() {
  const pathname = usePathname() || '/'
  const reducedMotion = useReducedMotion() === true
  const profile = useMemo(() => profileForPath(pathname, reducedMotion), [pathname, reducedMotion])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (profile.mode === 'static') return

    const canvas = canvasRef.current
    if (!canvas) return

    const liveContext = canvas.getContext('2d')
    if (!liveContext) return

    const backgroundCanvas = document.createElement('canvas')
    const backgroundContext = backgroundCanvas.getContext('2d')
    if (!backgroundContext) return

    let context = liveContext
    const dpr = Math.min(window.devicePixelRatio || 1, profile.mode === 'hero' ? 1.35 : 1.2)
    const seed = hashString(`${pathname}|${profile.mode}|${reducedMotion ? 'reduce' : 'motion'}`)
    const rand = createRandom(seed)

    let width = 0
    let height = 0
    let raf = 0
    let lastTime = performance.now()
    let trailId = 0
    let pointerX = window.innerWidth * 0.5
    let pointerY = window.innerHeight * 0.42
    let pointerActive = false
    let spawnTimer = 0
    let burstCooldown = 0
    let backgroundDirty = true
    let lastBackgroundPaint = 0
    let trails: TrailBurst[] = []

    const stars = buildStars(rand, profile)
    const nebulae = buildNebulae(rand, profile)
    const rings = buildOrbits(rand, profile)
    const auroras = buildAuroras(rand, profile)
    const constellations = buildConstellations(rand, stars)

    const resize = () => {
      width = Math.max(1, window.innerWidth)
      height = Math.max(1, window.innerHeight)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      backgroundCanvas.width = Math.floor(width * dpr)
      backgroundCanvas.height = Math.floor(height * dpr)
      liveContext.setTransform(dpr, 0, 0, dpr, 0, 0)
      backgroundContext.setTransform(dpr, 0, 0, dpr, 0, 0)
      backgroundDirty = true
    }

    const spawnTrail = (x: number, y: number) => {
      const angle = rand() * Math.PI * 2
      const power = lerp(0.7, 1.8, rand()) * (profile.mode === 'hero' ? 1.15 : 1)
      const tone = STAR_TONES[Math.floor(rand() * STAR_TONES.length)] ?? STAR_TONES[0]
      trails.push({
        id: trailId += 1,
        x,
        y,
        vx: Math.cos(angle) * power * lerp(140, 280, rand()),
        vy: Math.sin(angle) * power * lerp(50, 130, rand()) - lerp(18, 42, rand()),
        life: lerp(1.4, 2.8, rand()),
        ttl: lerp(1.4, 2.8, rand()),
        size: lerp(1.2, 2.8, rand()),
        color: tone.color,
        sparkle: rand(),
      })
    }

    const onPointerMove = (event: PointerEvent) => {
      pointerX = event.clientX
      pointerY = event.clientY
      pointerActive = true
    }

    const onPointerLeave = () => {
      pointerActive = false
    }

    const drawBackground = () => {
      const sky = context.createLinearGradient(0, 0, 0, height)
      sky.addColorStop(0, '#030611')
      sky.addColorStop(0.42, '#050916')
      sky.addColorStop(1, '#02040A')
      context.fillStyle = sky
      context.fillRect(0, 0, width, height)

      context.save()
      context.globalCompositeOperation = 'screen'

      const glowScale = profile.coreGlow
      const leftGlow = context.createRadialGradient(width * 0.18, height * 0.22, 0, width * 0.18, height * 0.22, width * 0.55)
      leftGlow.addColorStop(0, rgbaFrom('#00F5A0', 0.13 * glowScale))
      leftGlow.addColorStop(0.42, rgbaFrom('#00F5A0', 0.04 * glowScale))
      leftGlow.addColorStop(1, 'rgba(0,0,0,0)')
      context.fillStyle = leftGlow
      context.fillRect(0, 0, width, height)

      const rightGlow = context.createRadialGradient(width * 0.82, height * 0.18, 0, width * 0.82, height * 0.18, width * 0.48)
      rightGlow.addColorStop(0, rgbaFrom('#77A7FF', 0.12 * glowScale))
      rightGlow.addColorStop(0.48, rgbaFrom('#77A7FF', 0.035 * glowScale))
      rightGlow.addColorStop(1, 'rgba(0,0,0,0)')
      context.fillStyle = rightGlow
      context.fillRect(0, 0, width, height)

      const lowerGlow = context.createRadialGradient(width * 0.54, height * 0.92, 0, width * 0.54, height * 0.92, width * 0.6)
      lowerGlow.addColorStop(0, rgbaFrom('#FDE047', 0.06 * glowScale))
      lowerGlow.addColorStop(0.36, rgbaFrom('#FDE047', 0.02 * glowScale))
      lowerGlow.addColorStop(1, 'rgba(0,0,0,0)')
      context.fillStyle = lowerGlow
      context.fillRect(0, 0, width, height)

      context.restore()
    }

    const drawNebulae = (time: number) => {
      context.save()
      context.globalCompositeOperation = 'screen'

      for (const nebula of nebulae) {
        const centerX = width * nebula.x + Math.sin(time * nebula.speed + nebula.phase) * width * 0.03
        const centerY = height * nebula.y + Math.cos(time * nebula.speed * 1.2 + nebula.phase) * height * 0.025
        const radiusX = width * nebula.radius
        const radiusY = height * nebula.radius * nebula.stretch * 0.44
        const gradient = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(radiusX, radiusY))
        gradient.addColorStop(0, `${nebula.tone}${nebula.alpha})`)
        gradient.addColorStop(0.55, `${nebula.tone}${nebula.alpha * 0.38})`)
        gradient.addColorStop(1, 'rgba(0,0,0,0)')
        context.fillStyle = gradient
        context.beginPath()
        context.ellipse(centerX, centerY, radiusX, radiusY, nebula.phase * 0.18, 0, Math.PI * 2)
        context.fill()
      }

      context.restore()
    }

    const drawGrid = (time: number) => {
      context.save()
      context.translate(width * 0.5, height * 0.66)
      context.rotate(-0.09)
      context.globalAlpha = profile.gridOpacity
      context.strokeStyle = 'rgba(159, 255, 224, 1)'
      context.lineWidth = 1
      const gap = profile.mode === 'hero' ? 72 : profile.mode === 'focus' ? 92 : 108
      const verticalCount = Math.ceil((width * 1.6) / gap)
      const horizontalCount = Math.ceil((height * 1.1) / gap)
      const offset = (time * 0.0015) % gap

      for (let i = -verticalCount; i <= verticalCount; i += 1) {
        const x = i * gap + offset
        context.beginPath()
        context.moveTo(x, -height)
        context.lineTo(x, height)
        context.stroke()
      }

      for (let i = -horizontalCount; i <= horizontalCount; i += 1) {
        const y = i * gap + offset * 0.72
        context.beginPath()
        context.moveTo(-width, y)
        context.lineTo(width, y)
        context.stroke()
      }

      context.restore()
    }

    const drawAurora = (time: number) => {
      context.save()
      context.globalCompositeOperation = 'screen'

      for (const ribbon of auroras) {
        const bandY = height * ribbon.y + Math.sin(time * ribbon.speed + ribbon.phase) * height * 0.04
        const steps = 24
        const gradient = context.createLinearGradient(0, bandY - ribbon.width, 0, bandY + ribbon.width)
        gradient.addColorStop(0, `${ribbon.tint}0)`)
        gradient.addColorStop(0.45, `${ribbon.tint}${ribbon.alpha})`)
        gradient.addColorStop(0.7, `${ribbon.tint}${ribbon.alpha * 0.48})`)
        gradient.addColorStop(1, `${ribbon.tint}0)`)

        context.beginPath()
        for (let step = 0; step <= steps; step += 1) {
          const ratio = step / steps
          const x = ratio * (width + 160) - 80
          const wave = Math.sin(ratio * Math.PI * 2 * ribbon.frequency * width + time * ribbon.speed * 1200 + ribbon.phase)
          const wave2 = Math.cos(ratio * Math.PI * 4 + ribbon.phase * 0.8 + time * ribbon.speed * 900)
          const y = bandY + wave * ribbon.amplitude + wave2 * ribbon.amplitude * 0.34
          if (step === 0) context.moveTo(x, y)
          else context.lineTo(x, y)
        }

        context.strokeStyle = gradient
        context.lineWidth = ribbon.width
        context.shadowBlur = 24
        context.shadowColor = `${ribbon.tint}${ribbon.alpha})`
        context.stroke()
      }

      context.restore()
    }

    const drawOrbits = (time: number) => {
      context.save()
      context.globalCompositeOperation = 'lighter'

      for (const ring of rings) {
        const centerX = width * ring.x
        const centerY = height * ring.y
        const spin = time * ring.speed + ring.id * 0.8

        context.save()
        context.translate(centerX, centerY)
        context.rotate(ring.tilt)
        context.strokeStyle = ring.accent
        context.shadowColor = ring.accent
        context.shadowBlur = 18
        context.lineWidth = ring.lineWidth
        context.globalAlpha = ring.alpha
        context.setLineDash([ring.dash, ring.dash * 1.6])
        context.lineDashOffset = -time * (ring.speed < 0 ? -1 : 1) * 80
        context.beginPath()
        context.ellipse(0, 0, ring.radius * 1.12, ring.radius * 0.72, 0, 0, Math.PI * 2)
        context.stroke()

        const sparkX = Math.cos(spin) * ring.radius * 1.12
        const sparkY = Math.sin(spin) * ring.radius * 0.72
        const sparkGradient = context.createRadialGradient(sparkX, sparkY, 0, sparkX, sparkY, ring.radius * 0.18)
        sparkGradient.addColorStop(0, rgbaFrom('#F8FAFF', 0.92))
        sparkGradient.addColorStop(0.45, ring.accent)
        sparkGradient.addColorStop(1, 'rgba(0,0,0,0)')
        context.globalAlpha = 1
        context.fillStyle = sparkGradient
        context.beginPath()
        context.arc(sparkX, sparkY, ring.radius * 0.12, 0, Math.PI * 2)
        context.fill()
        context.restore()
      }

      context.restore()
    }

    const drawConstellations = (time: number) => {
      context.save()
      context.globalCompositeOperation = 'screen'

      for (const constellation of constellations) {
        const nodes = constellation.indices.map(index => stars[index]).filter(Boolean)
        if (nodes.length < 2) continue

        context.beginPath()
        nodes.forEach((star, index) => {
          const x = star.x * width + Math.sin(time * star.speed + star.phase + constellation.phase) * star.driftX * 0.18
          const y = star.y * height + Math.cos(time * star.speed * 1.1 + star.phase + constellation.phase) * star.driftY * 0.16
          if (index === 0) context.moveTo(x, y)
          else context.lineTo(x, y)
        })
        context.strokeStyle = constellation.color
        context.lineWidth = constellation.width
        context.globalAlpha = constellation.alpha
        context.shadowBlur = 12
        context.shadowColor = constellation.color
        context.stroke()
      }

      context.restore()
    }

    const drawStars = (time: number) => {
      context.save()
      context.globalCompositeOperation = 'lighter'

      for (const star of stars) {
        const baseX = star.x * width
        const baseY = star.y * height
        const wave = Math.sin(time * star.speed * 1000 + star.phase) * star.pulse
        const swayX = Math.sin(time * 0.00018 + star.phase) * star.driftX * 0.18
        const swayY = Math.cos(time * 0.00022 + star.phase * 1.17) * star.driftY * 0.16

        const dx = baseX + swayX
        const dy = baseY + swayY
        const distance = pointerActive ? Math.hypot(pointerX - dx, pointerY - dy) : Number.POSITIVE_INFINITY
        const influence = pointerActive ? clamp(1 - distance / profile.pointerRadius, 0, 1) : 0
        const radius = star.radius * (0.72 + wave * 0.36 + influence * 0.74)
        const alpha = clamp(star.alpha * (0.42 + wave * 0.5 + influence * 0.6), 0.08, 1)

        context.save()
        context.translate(dx, dy)
        context.shadowColor = star.tone.aura
        context.shadowBlur = star.layer === 2
          ? profile.coreGlow * 3
          : (profile.coreGlow * 12 + star.layer * 4) * (1 + influence * 0.65)
        context.fillStyle = rgbaFrom(star.tone.color, alpha)

        context.beginPath()
        context.arc(0, 0, radius, 0, Math.PI * 2)
        context.fill()

        if (star.layer <= 1) {
          context.strokeStyle = rgbaFrom(star.tone.color, clamp(alpha * 0.65, 0.08, 0.8))
          context.lineWidth = Math.max(0.75, radius * 0.45)
          context.beginPath()
          context.moveTo(-radius * 2.2, 0)
          context.lineTo(radius * 2.2, 0)
          context.moveTo(0, -radius * 2.2)
          context.lineTo(0, radius * 2.2)
          context.stroke()
        }

        if (star.layer === 0) {
          context.strokeStyle = rgbaFrom('#FFFFFF', clamp(alpha * 0.38, 0.08, 0.35))
          context.lineWidth = 0.8
          context.beginPath()
          context.moveTo(-radius * 2.8, -radius * 0.5)
          context.lineTo(radius * 2.8, radius * 0.5)
          context.moveTo(-radius * 2.8, radius * 0.5)
          context.lineTo(radius * 2.8, -radius * 0.5)
          context.stroke()
        }

        if (influence > 0.25) {
          const glow = context.createRadialGradient(0, 0, 0, 0, 0, radius * 12)
          glow.addColorStop(0, rgbaFrom(star.tone.color, 0.45 * influence))
          glow.addColorStop(0.35, rgbaFrom(star.tone.color, 0.15 * influence))
          glow.addColorStop(1, 'rgba(0,0,0,0)')
          context.fillStyle = glow
          context.beginPath()
          context.arc(0, 0, radius * 12, 0, Math.PI * 2)
          context.fill()
        }

        context.restore()
      }

      context.restore()
    }

    const drawTrails = (time: number, delta: number) => {
      if (!reducedMotion) {
        spawnTimer += delta
        burstCooldown += delta
        const shouldSpawn = profile.mode === 'hero' ? 3.2 : profile.mode === 'focus' ? 4.8 : 6.5

        if (spawnTimer > shouldSpawn) {
          spawnTimer = 0
          if (rand() < profile.trailChance) {
            const originX = rand() * width
            const originY = rand() * height * 0.34 + height * 0.02
            spawnTrail(originX, originY)
          }
        }

        if (pointerActive && burstCooldown > 0.13 && rand() < 0.2) {
          burstCooldown = 0
          spawnTrail(pointerX, pointerY)
        }
      }

      context.save()
      context.globalCompositeOperation = 'lighter'

      trails = trails
        .map(trail => ({
          ...trail,
          x: trail.x + trail.vx * delta,
          y: trail.y + trail.vy * delta,
          life: trail.life - delta,
        }))
        .filter(trail => trail.life > 0)
        .slice(-6)

      for (const trail of trails) {
        const progress = clamp(1 - trail.life / trail.ttl, 0, 1)
        const fade = clamp(trail.life / trail.ttl, 0, 1)
        const length = lerp(36, 130, progress)
        const angle = Math.atan2(trail.vy, trail.vx)
        const headX = trail.x
        const headY = trail.y
        const tailX = headX - Math.cos(angle) * length
        const tailY = headY - Math.sin(angle) * length

        const gradient = context.createLinearGradient(tailX, tailY, headX, headY)
        gradient.addColorStop(0, 'rgba(0,0,0,0)')
        gradient.addColorStop(0.45, rgbaFrom(trail.color, 0.18 * fade))
        gradient.addColorStop(0.78, rgbaFrom(trail.color, 0.4 * fade))
        gradient.addColorStop(1, rgbaFrom('#FFFFFF', 0.92 * fade))

        context.save()
        context.shadowColor = trail.color
        context.shadowBlur = 22
        context.strokeStyle = gradient
        context.lineWidth = trail.size
        context.lineCap = 'round'
        context.beginPath()
        context.moveTo(tailX, tailY)
        context.lineTo(headX, headY)
        context.stroke()

        const headGlow = context.createRadialGradient(headX, headY, 0, headX, headY, trail.size * 12)
        headGlow.addColorStop(0, rgbaFrom('#FFFFFF', 0.88 * fade))
        headGlow.addColorStop(0.28, rgbaFrom('#5AF5D6', 0.38 * fade))
        headGlow.addColorStop(1, 'rgba(0,0,0,0)')
        context.fillStyle = headGlow
        context.beginPath()
        context.arc(headX, headY, trail.size * 7, 0, Math.PI * 2)
        context.fill()

        if (trail.sparkle > 0.66) {
          context.strokeStyle = rgbaFrom('#FDE047', 0.32 * fade)
          context.lineWidth = 0.8
          context.beginPath()
          context.moveTo(headX - trail.size * 5, headY)
          context.lineTo(headX + trail.size * 5, headY)
          context.moveTo(headX, headY - trail.size * 5)
          context.lineTo(headX, headY + trail.size * 5)
          context.stroke()
        }

        context.restore()
      }

      context.restore()
    }

    const drawPointerGlow = () => {
      if (!pointerActive) return

      context.save()
      context.globalCompositeOperation = 'screen'
      const gradient = context.createRadialGradient(pointerX, pointerY, 0, pointerX, pointerY, profile.pointerRadius)
      gradient.addColorStop(0, 'rgba(90, 245, 214, 0.18)')
      gradient.addColorStop(0.24, 'rgba(90, 245, 214, 0.1)')
      gradient.addColorStop(0.52, 'rgba(119, 167, 255, 0.04)')
      gradient.addColorStop(1, 'rgba(0,0,0,0)')
      context.fillStyle = gradient
      context.fillRect(0, 0, width, height)
      context.restore()
    }

    const drawVignette = () => {
      context.save()
      const vignette = context.createRadialGradient(width * 0.5, height * 0.42, Math.min(width, height) * 0.15, width * 0.5, height * 0.42, Math.max(width, height) * 0.76)
      vignette.addColorStop(0, 'rgba(0,0,0,0)')
      vignette.addColorStop(0.58, `rgba(0,0,0,${profile.darkenStrength * 0.5})`)
      vignette.addColorStop(1, `rgba(0,0,0,${profile.vignetteStrength})`)
      context.fillStyle = vignette
      context.fillRect(0, 0, width, height)
      context.restore()
    }

    const renderStaticLayer = (time: number) => {
      const previousContext = context
      context = backgroundContext
      drawBackground()
      drawNebulae(time)
      drawAurora(time)
      drawGrid(time)
      drawOrbits(time)
      drawConstellations(time)
      drawVignette()
      context = previousContext
      lastBackgroundPaint = time
      backgroundDirty = false
    }

    const frame = (time: number) => {
      const delta = Math.min(0.032, (time - lastTime) / 1000)
      lastTime = time

      const refreshInterval = reducedMotion ? 1100 : profile.mode === 'hero' ? 190 : 280
      if (backgroundDirty || time - lastBackgroundPaint > refreshInterval) {
        renderStaticLayer(time)
      }

      context = liveContext
      liveContext.clearRect(0, 0, width, height)
      liveContext.drawImage(backgroundCanvas, 0, 0, width, height)
      drawStars(time)
      drawTrails(time, delta)
      drawPointerGlow()

      raf = window.requestAnimationFrame(frame)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerleave', onPointerLeave)
    window.addEventListener('blur', onPointerLeave)
    raf = window.requestAnimationFrame(frame)

    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('blur', onPointerLeave)
    }
  }, [pathname, profile, reducedMotion])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden bg-[#030611]"
      style={{ zIndex: 0 }}
    >
      {profile.mode === 'static' ? (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(33,54,89,0.24),transparent_36%),radial-gradient(circle_at_70%_25%,rgba(0,245,160,0.08),transparent_28%),linear-gradient(180deg,rgba(4,8,18,0.96)_0%,rgba(6,10,22,1)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.018)_0%,rgba(255,255,255,0)_28%,rgba(255,255,255,0.012)_50%,rgba(255,255,255,0)_74%,rgba(255,255,255,0.018)_100%)] opacity-45" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.14)_58%,rgba(0,0,0,0.58)_100%)]" />
        </>
      ) : (
        <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(9,32,54,0.32),transparent_38%),radial-gradient(circle_at_bottom,rgba(0,245,160,0.08),transparent_34%),linear-gradient(180deg,rgba(2,6,17,0.1)_0%,rgba(2,6,17,0.38)_70%,rgba(2,6,17,0.78)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0)_28%,rgba(255,255,255,0.02)_50%,rgba(255,255,255,0)_74%,rgba(255,255,255,0.03)_100%)] opacity-40 mix-blend-screen" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.12)_58%,rgba(0,0,0,0.58)_100%)]" />
        </>
      )}
    </div>
  )
}

export function MeteorShower() {
  const delays = [0, 2, 4, 6, 8, 10]
  const durations = [3.4, 3.9, 4.2, 3.6, 4.4, 3.8]

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-meteor-fall"
          style={{
            left: `${10 + i * 15}%`,
            top: '-5%',
            animationDelay: `${delays[i]}s`,
            animationDuration: `${durations[i]}s`,
          }}
        >
          <div className="h-0.5 w-32 rounded-full bg-gradient-to-r from-white via-yellow-200 to-transparent transform rotate-45" />
        </div>
      ))}
    </div>
  )
}

export function FloatingParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: (i * 13.7) % 100,
        y: (i * 7.9 + 19) % 100,
        size: 2 + ((i * 1.7) % 4),
        duration: 10 + ((i * 0.9) % 10),
      })),
    [],
  )

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {particles.map((particle, i) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-sprout-400/30 animate-float-particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${(i * 0.37) % 5}s`,
          }}
        />
      ))}
    </div>
  )
}
