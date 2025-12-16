import Link from 'next/link'
import { Sprout, Star, BookOpen, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 导航栏 */}
      <nav className="p-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Sprout className="w-8 h-8 text-sprout-400" />
          <span className="text-2xl font-bold bg-gradient-to-r from-sprout-400 to-star-400 bg-clip-text text-transparent">
            问芽星图
          </span>
        </div>
        <div className="flex space-x-4">
          <Link href="/auth/login" className="btn-sprout">
            登录
          </Link>
          <Link href="/auth/register" className="btn-star">
            注册
          </Link>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-4xl mx-auto">
          {/* 主标题 */}
          <div className="mb-8 animate-sprout-grow">
            <h1 className="text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-sprout-400 via-star-400 to-sprout-400 bg-clip-text text-transparent">
                问芽星图
              </span>
            </h1>
            <p className="text-xl text-cosmos-300 mb-2">WenYa StarMap</p>
            <p className="text-lg text-cosmos-400">
              AI驱动的智慧英语学习平台
            </p>
          </div>

          {/* 副标题 */}
          <div className="mb-12 animate-float">
            <p className="text-2xl text-cosmos-200 mb-4">
              从嫩芽破土到璀璨繁星
            </p>
            <p className="text-lg text-cosmos-300">
              让每一次学习都成为成长的见证，让每一个进步都闪耀如星辰
            </p>
          </div>

          {/* 特色功能 */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="sprout-card text-center animate-sprout-grow" style={{ animationDelay: '0.2s' }}>
              <BookOpen className="w-12 h-12 text-sprout-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-sprout-300">AI个性化学习</h3>
              <p className="text-cosmos-300">
                智能分析你的学习水平，定制专属学习路径
              </p>
            </div>

            <div className="star-card text-center animate-sprout-grow" style={{ animationDelay: '0.4s' }}>
              <Star className="w-12 h-12 text-star-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-star-300">成就可视化</h3>
              <p className="text-cosmos-300">
                每个学习成果都化作星辰，点亮你的专属星图
              </p>
            </div>

            <div className="cosmos-card text-center animate-sprout-grow" style={{ animationDelay: '0.6s' }}>
              <Users className="w-12 h-12 text-cosmos-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-cosmos-200">互动练习</h3>
              <p className="text-cosmos-300">
                听说读写全方位练习，AI实时反馈助你进步
              </p>
            </div>
          </div>

          {/* 行动按钮 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/demo" className="btn-star text-lg px-8 py-4">
              🚀 立即体验
            </Link>
            <Link href="/auth/register" className="btn-sprout text-lg px-8 py-4">
              开始学习之旅
            </Link>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="p-6 text-center text-cosmos-400">
        <p>&copy; 2024 问芽星图 WenYa StarMap. 让学习如星辰般闪耀.</p>
      </footer>
    </div>
  )
}