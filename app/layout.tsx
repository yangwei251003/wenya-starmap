import type { Metadata } from 'next'
import './globals.css'
import { StarryBackground } from '@/components/ui/StarryBackground'
import QueryProvider from '@/components/providers/QueryProvider'

// 使用系统字体替代Google Fonts以避免网络问题
const fontClass = 'font-sans'

export const metadata: Metadata = {
  title: '问芽星图 - WenYa StarMap',
  description: 'AI驱动的智慧英语学习平台，以嫩芽成长和璀璨繁星为主题',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={`${fontClass} bg-cosmos-900 text-white min-h-screen`}>
        <QueryProvider>
          {/* 动态星空背景 - 固定在最底层 */}
          <StarryBackground />
          
          {/* 主要内容 - 确保在星空之上 */}
          <main className="relative z-10 min-h-screen">
            {children}
          </main>
        </QueryProvider>
      </body>
    </html>
  )
}
