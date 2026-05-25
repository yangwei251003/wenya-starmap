'use client'

import { useMemo, useState } from 'react'
import type { ComponentType } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpen,
  Bot,
  Compass,
  Grid3X3,
  Route,
  Sparkles,
  Star,
  X,
} from 'lucide-react'

import { coreServices } from '@/lib/site-services'

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  bot: Bot,
  book: BookOpen,
  stars: Star,
  route: Route,
}

const hiddenRoutes = ['/', '/services', '/auth/login', '/auth/register']

export function ServiceLauncher() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const shouldHide = useMemo(() => {
    if (!pathname) return true
    return hiddenRoutes.some((path) => pathname === path)
  }, [pathname])

  if (shouldHide) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-[min(92vw,360px)] rounded-lg border border-white/10 bg-[#07111D]/92 p-3 text-white shadow-[0_24px_70px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00F5A0]/12 text-[#00F5A0]">
                <Compass className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold">核心功能</p>
                <p className="text-xs text-cosmos-400">先做这几件事就不迷路</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-2 text-cosmos-400 transition-colors hover:bg-white/6 hover:text-white"
              aria-label="关闭服务入口"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {coreServices.map((service) => {
              const Icon = iconMap[service.icon] || Sparkles
              return (
                <Link
                  key={service.href}
                  href={service.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-white/8 bg-white/[0.04] p-3 transition-all hover:-translate-y-0.5 hover:border-[#00F5A0]/28 hover:bg-[#00F5A0]/8"
                >
                  <Icon className="mb-2 h-4 w-4 text-[#00F5A0]" />
                  <p className="text-sm font-medium text-white">{service.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-cosmos-400">{service.summary}</p>
                </Link>
              )
            })}
          </div>

          <Link
            href="/services"
            onClick={() => setOpen(false)}
            className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-star-300/18 bg-star-300/10 px-4 py-3 text-sm font-medium text-star-100 transition-colors hover:border-star-300/32"
          >
            <Grid3X3 className="h-4 w-4" />
            查看全部服务
          </Link>
        </div>
      )}

      <button
        onClick={() => setOpen((value) => !value)}
        className="flex h-12 items-center gap-2 rounded-full border border-[#00F5A0]/24 bg-[#07111D]/88 px-4 text-sm font-medium text-[#B9FFE4] shadow-[0_16px_40px_rgba(0,0,0,0.36)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-[#00F5A0]/42"
        aria-expanded={open}
      >
        {open ? <X className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
        服务
      </button>
    </div>
  )
}
