'use client'

import { Mic, Sparkles, Star } from 'lucide-react'

interface StarVoiceAvatarProps {
  active?: boolean
  speaking?: boolean
  muted?: boolean
}

export function StarVoiceAvatar({ active = false, speaking = false, muted = false }: StarVoiceAvatarProps) {
  const isActive = active || speaking

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-20 w-20 flex items-center justify-center">
        <div className={`absolute inset-0 rounded-full border ${isActive ? 'border-star-400/60' : 'border-cosmos-700'}`} />
        <div className={`absolute inset-2 rounded-full border ${isActive ? 'border-sprout-400/40' : 'border-cosmos-700/70'}`} />
        <div className={`absolute inset-4 rounded-full bg-cosmos-900 flex items-center justify-center transition-all duration-300 ${isActive ? 'shadow-[0_0_24px_rgba(251,191,36,0.28)]' : ''}`}>
          {muted ? (
            <Mic className="w-6 h-6 text-cosmos-500" />
          ) : (
            <Star className={`w-6 h-6 ${speaking ? 'text-star-300 animate-pulse' : 'text-sprout-300'}`} />
          )}
        </div>
        {isActive && (
          <>
            <span className="absolute inset-0 rounded-full border border-star-400/25 animate-ping" />
            <span className="absolute -right-1 -top-1 text-star-400">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </span>
          </>
        )}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-white font-semibold">星语</p>
          <span className={`text-xs px-2 py-0.5 rounded-full ${speaking ? 'bg-star-400/20 text-star-300' : active ? 'bg-sprout-400/20 text-sprout-300' : 'bg-cosmos-800 text-cosmos-400'}`}>
            {muted ? '静音' : speaking ? '正在回应' : active ? '正在思考' : '待命'}
          </span>
        </div>
        <p className="text-cosmos-400 text-sm mt-1">
          {muted ? '语音已关闭，仍可继续文字互动。' : speaking ? '正在把答案送进你的耳朵里。' : active ? '我在整理你的语言星图。' : '准备好一起发问了吗？'}
        </p>
      </div>
    </div>
  )
}
