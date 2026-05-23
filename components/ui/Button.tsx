'use client'

import React, { forwardRef, type ReactNode } from 'react'
import { motion, type HTMLMotionProps, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'sprout' | 'star' | 'cosmos' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  children: ReactNode
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  sprout:
    'border border-[#00F5A0]/22 bg-[linear-gradient(135deg,rgba(0,245,160,0.98),rgba(4,120,87,0.88))] text-[#03110b] shadow-[0_0_0_1px_rgba(0,245,160,0.2),0_14px_34px_rgba(0,245,160,0.16)]',
  star:
    'border border-[#FDE68A]/24 bg-[linear-gradient(135deg,rgba(253,224,71,0.98),rgba(245,158,11,0.9))] text-[#0B0F19] shadow-[0_0_0_1px_rgba(253,230,138,0.2),0_14px_34px_rgba(253,224,71,0.16)]',
  cosmos:
    'border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(30,41,59,0.92))] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_16px_36px_rgba(2,6,23,0.42)]',
  outline:
    'border border-[#00F5A0]/36 bg-white/[0.03] text-[#B8FFE7] shadow-[0_0_0_1px_rgba(0,245,160,0.06),0_12px_30px_rgba(15,23,42,0.28)]',
}

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-9 px-3 text-sm rounded-lg',
  md: 'h-11 px-5 text-sm rounded-lg',
  lg: 'h-12 px-6 text-base rounded-xl',
}

function ButtonBase(
  {
    variant = 'sprout',
    size = 'md',
    isLoading = false,
    className,
    children,
    disabled,
    type,
    onPointerMove,
    onPointerLeave,
    ...props
  }: ButtonProps,
  ref: React.ForwardedRef<HTMLButtonElement>
) {
  const reducedMotion = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 260, damping: 22, mass: 0.35 })
  const springY = useSpring(y, { stiffness: 260, damping: 22, mass: 0.35 })

  const handlePointerMove: React.PointerEventHandler<HTMLButtonElement> = (event) => {
    onPointerMove?.(event)
    if (reducedMotion) return

    const rect = event.currentTarget.getBoundingClientRect()
    const offsetX = (event.clientX - rect.left - rect.width / 2) / rect.width
    const offsetY = (event.clientY - rect.top - rect.height / 2) / rect.height

    x.set(offsetX * 8)
    y.set(offsetY * 8)
  }

  const handlePointerLeave: React.PointerEventHandler<HTMLButtonElement> = (event) => {
    onPointerLeave?.(event)
    x.set(0)
    y.set(0)
  }

  const loadingLabel = '正在点亮路径...'

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      data-variant={variant}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={reducedMotion ? undefined : { x: springX, y: springY }}
      whileHover={reducedMotion ? undefined : { scale: 1.015 }}
      whileTap={reducedMotion ? undefined : { scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 420, damping: 26, mass: 0.4 }}
      className={cn(
        'group relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap font-medium tracking-normal',
        'transition-[transform,box-shadow,border-color,background-color,color] duration-300 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00F5A0]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F19]',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-55',
        'before:pointer-events-none before:absolute before:inset-px before:rounded-[inherit] before:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.24),transparent_48%)] before:opacity-0 before:transition-opacity before:duration-300 group-hover:before:opacity-100',
        'after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(110deg,transparent_18%,rgba(255,255,255,0.14)_35%,transparent_52%)] after:translate-x-[-120%] after:opacity-0 after:transition-[transform,opacity] after:duration-700 group-hover:after:translate-x-[120%] group-hover:after:opacity-100',
        'backdrop-blur-md will-change-transform',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100',
          variant === 'sprout' && 'bg-[radial-gradient(circle_at_center,rgba(0,245,160,0.22),transparent_62%)]',
          variant === 'star' && 'bg-[radial-gradient(circle_at_center,rgba(253,230,138,0.18),transparent_62%)]',
          variant === 'cosmos' && 'bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_65%)]',
          variant === 'outline' && 'bg-[radial-gradient(circle_at_center,rgba(0,245,160,0.14),transparent_62%)]'
        )}
      />

      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100',
          variant === 'sprout' && 'bg-[#00F5A0]/18',
          variant === 'star' && 'bg-[#FDE68A]/18',
          variant === 'cosmos' && 'bg-white/10',
          variant === 'outline' && 'bg-[#00F5A0]/12'
        )}
      />

      <span className="relative z-10 inline-flex items-center gap-2">
        {isLoading ? (
          <>
            <span
              aria-hidden="true"
              className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin"
            />
            <span>{loadingLabel}</span>
          </>
        ) : (
          children
        )}
      </span>
    </motion.button>
  )
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(ButtonBase)
Button.displayName = 'Button'
