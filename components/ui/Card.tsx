'use client'

import React, { forwardRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardProps {
  variant?: 'sprout' | 'star' | 'cosmos'
  className?: string
  children: React.ReactNode
  onClick?: () => void
  style?: React.CSSProperties
}

const surfaceClasses: Record<NonNullable<CardProps['variant']>, string> = {
  sprout:
    'border-[#00F5A0]/18 bg-[linear-gradient(180deg,rgba(6,16,20,0.88),rgba(8,18,23,0.72))] shadow-[0_0_0_1px_rgba(0,245,160,0.07),0_20px_54px_rgba(0,0,0,0.34)]',
  star:
    'border-[#FDE68A]/16 bg-[linear-gradient(180deg,rgba(18,14,8,0.88),rgba(10,16,26,0.72))] shadow-[0_0_0_1px_rgba(253,224,71,0.06),0_20px_54px_rgba(0,0,0,0.34)]',
  cosmos:
    'border-white/10 bg-[linear-gradient(180deg,rgba(11,15,25,0.94),rgba(11,15,25,0.76))] shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_20px_54px_rgba(2,6,23,0.42)]',
}

const glowClasses: Record<NonNullable<CardProps['variant']>, string> = {
  sprout: 'bg-[radial-gradient(circle_at_top_left,rgba(0,245,160,0.22),transparent_52%)]',
  star: 'bg-[radial-gradient(circle_at_top_left,rgba(253,224,71,0.18),transparent_52%)]',
  cosmos: 'bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_56%)]',
}

function CardBase(
  { variant = 'cosmos', className, children, onClick, style }: CardProps,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const reducedMotion = useReducedMotion()
  const interactive = typeof onClick === 'function'

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (!interactive) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick?.()
    }
  }

  return (
    <motion.div
      ref={ref}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      data-clickable={interactive || undefined}
      data-variant={variant}
      className={cn(
        'group relative isolate overflow-hidden rounded-lg border p-6 text-white',
        'backdrop-blur-xl transition-[border-color,box-shadow,transform] duration-300 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00F5A0]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F19]',
        'will-change-transform',
        interactive && 'cursor-pointer',
        surfaceClasses[variant],
        className
      )}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      style={style}
      whileHover={reducedMotion ? undefined : { y: -3, scale: 1.008 }}
      whileTap={reducedMotion || !interactive ? undefined : { scale: 0.995 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26, mass: 0.5 }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_30%,rgba(255,255,255,0.02))]"
      />
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100',
          glowClasses[variant]
        )}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 top-0 h-px bg-white/15 opacity-80"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-px bg-white/8"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-px bg-white/8"
      />
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}

export const Card = forwardRef<HTMLDivElement, CardProps>(CardBase)
Card.displayName = 'Card'

interface CardHeaderProps {
  className?: string
  children: React.ReactNode
}

export function CardHeader({ className, children }: CardHeaderProps) {
  return (
    <div className={cn('mb-4 space-y-1.5', className)}>
      {children}
    </div>
  )
}

interface CardTitleProps {
  className?: string
  children: React.ReactNode
}

export function CardTitle({ className, children }: CardTitleProps) {
  return (
    <h3 className={cn('text-lg font-semibold tracking-tight text-white/95 sm:text-xl', className)}>
      {children}
    </h3>
  )
}

interface CardContentProps {
  className?: string
  children: React.ReactNode
}

export function CardContent({ className, children }: CardContentProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
    </div>
  )
}
