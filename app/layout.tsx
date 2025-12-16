import type { Metadata } from 'next'
import './globals.css'

// 使用系统字体替代Google Fonts以避免网络问题
const fontClass = 'font-sans'

export const metadata: Metadata = {
  title: '问芽星图 - WenYa StarMap',
  description: 'AI驱动的智慧英语学习平台，以嫩芽成长和璀璨繁星为主题',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={`${fontClass} bg-cosmos-900 text-white min-h-screen`}>
        <div className="relative min-h-screen">
          {/* 星空背景 */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-cosmos-800 to-cosmos-900" />
            {/* 星星装饰 */}
            <div className="absolute top-10 left-10 w-2 h-2 bg-star-400 rounded-full animate-star-twinkle" />
            <div className="absolute top-20 right-20 w-1 h-1 bg-star-300 rounded-full animate-star-twinkle" style={{ animationDelay: '1s' }} />
            <div className="absolute top-40 left-1/3 w-1.5 h-1.5 bg-star-500 rounded-full animate-star-twinkle" style={{ animationDelay: '2s' }} />
            <div className="absolute bottom-20 right-1/4 w-2 h-2 bg-star-400 rounded-full animate-star-twinkle" style={{ animationDelay: '0.5s' }} />
          </div>
          
          {/* 主要内容 */}
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}