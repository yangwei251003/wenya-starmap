import React from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export function Input({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substring(2)}`

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-cosmos-200">
          {label}
        </label>
      )}
      
      <input
        id={inputId}
        className={cn(
          'input-field w-full',
          error && 'border-red-400 focus:border-red-400 focus:ring-red-400/20',
          className
        )}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-cosmos-400">{helperText}</p>
      )}
    </div>
  )
}