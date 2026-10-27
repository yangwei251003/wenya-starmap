'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  BookOpen, Clock, Star, Play, CheckCircle, 
  ShoppingCart, Sparkles, Trophy, Target
} from 'lucide-react'
import { purchasedCoursesService } from '@/lib/purchased-courses-service'
import { getCourseById, storeCourses } from '@/lib/store-courses-data'
import { PurchasedCourse, StoreCourse } from '@/types'

export default function MyCoursesPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [userId, setUserId] = useState<string>('')
  const [purchasedCourses, setPurchasedCourses] = useState<PurchasedCourse[]>([])
  const [filter, setFilter] = useState<'all' | 'learning' | 'completed'>('all')

  useEffect(() => {
    setMounted(true)
    const user = localStorage.getItem('wenya_user')
    if (user) {
      const userData = JSON.parse(user)
      setUserId(userData.id)
      setPurchasedCourses(purchasedCoursesService.getPurchasedCourses(userData.id))
    }
  }, [])

  // 获取课程详情
  const getCourseDetails = (courseId: string): StoreCourse | undefined => {
    return getCourseById(courseId)
  }

  // 过滤课程
  const filteredCourses = purchasedCourses.filter(pc => {
    if (filter === 'learning') return pc.progress > 0 && pc.progress < 100
    if (filter === 'completed') return pc.progress >= 100
    return true
  })

  // 统计数据
  const stats = {
    total: purchasedCourses.length,
    learning: purchasedCourses.filter(c => c.progress > 0 && c.progress < 100).length,
    completed: purchasedCourses.filter(c => c.progress >= 100).length
  }

  // 渲染课程卡片
  const renderCourseCard = (pc: PurchasedCourse) => {
    const course = getCourseDetails(pc.courseId)
    if (!course) return null

    const isCompleted = pc.progress >= 100
    const isLearning = pc.progress > 0 && pc.progress < 100

    return (
      <Card key={pc.courseId} className="p-0 overflow-hidden hover:border-sprout-400/50 transition-all">
        {/* 课程封面 */}
        <div className="relative h-32 bg-gradient-to-br from-cosmos-700 to-cosmos-800 flex items-center justify-center">
          <BookOpen className="w-12 h-12 text-cosmos-500" />
          
          {/* 进度标签 */}
          <div className="absolute top-3 right-3">
            {isCompleted ? (
              <span className="px-2 py-1 bg-sprout-500 text-white text-xs rounded-full flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> 已完成
              </span>
            ) : isLearning ? (
              <span className="px-2 py-1 bg-star-500 text-white text-xs rounded-full flex items-center gap-1">
                <Play className="w-3 h-3" /> 学习中
              </span>
            ) : (
              <span className="px-2 py-1 bg-cosmos-600 text-white text-xs rounded-full">
                未开始
              </span>
            )}
          </div>

          {/* 级别标签 */}
          <div className="absolute bottom-3 left-3">
            <span className={`px-2 py-1 text-xs rounded-full ${
              course.level === 'beginner' ? 'bg-green-500/20 text-green-400' :
              course.level === 'intermediate' ? 'bg-blue-500/20 text-blue-400' :
              'bg-purple-500/20 text-purple-400'
            }`}>
              {course.level === 'beginner' ? '初级' : course.level === 'intermediate' ? '中级' : '高级'}
            </span>
          </div>
        </div>

        {/* 课程信息 */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">{course.title}</h3>
          <p className="text-sm text-cosmos-400 mb-3 line-clamp-1">{course.titleEn}</p>

          {/* 进度条 */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-cosmos-400">学习进度</span>
              <span className="text-sprout-400">{pc.progress}%</span>
            </div>
            <div className="h-2 bg-cosmos-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-sprout-400 to-star-400 transition-all"
                style={{ width: `${pc.progress}%` }}
              />
            </div>
          </div>

          {/* 课程数据 */}
          <div className="flex items-center gap-4 text-xs text-cosmos-400 mb-4">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {course.lessonsCount}课时
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-star-400" />
              {course.rating}
            </span>
          </div>

          {/* 操作按钮 */}
          <Button 
            variant={isCompleted ? 'cosmos' : 'sprout'}
            className="w-full"
            onClick={() => router.push(`/my-courses/${pc.courseId}`)}
          >
            {isCompleted ? '复习课程' : isLearning ? '继续学习' : '开始学习'}
          </Button>
        </div>
      </Card>
    )
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-sprout-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <PageHeader 
        title="我的课程"
        subtitle="My Courses"
        titleColor="sprout"
        backUrl="/dashboard"
      />

      <div className="max-w-6xl mx-auto px-4 pb-8">
        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4 text-center">
            <BookOpen className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-sm text-cosmos-400">全部课程</p>
          </Card>
          <Card className="p-4 text-center">
            <Target className="w-8 h-8 text-star-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.learning}</p>
            <p className="text-sm text-cosmos-400">学习中</p>
          </Card>
          <Card className="p-4 text-center">
            <Trophy className="w-8 h-8 text-sprout-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.completed}</p>
            <p className="text-sm text-cosmos-400">已完成</p>
          </Card>
        </div>

        {/* 筛选标签 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm transition-all ${
              filter === 'all'
                ? 'bg-sprout-400 text-white'
                : 'bg-cosmos-800 text-cosmos-300 hover:bg-cosmos-700'
            }`}
          >
            全部 ({stats.total})
          </button>
          <button
            onClick={() => setFilter('learning')}
            className={`px-4 py-2 rounded-full text-sm transition-all ${
              filter === 'learning'
                ? 'bg-star-400 text-white'
                : 'bg-cosmos-800 text-cosmos-300 hover:bg-cosmos-700'
            }`}
          >
            学习中 ({stats.learning})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-full text-sm transition-all ${
              filter === 'completed'
                ? 'bg-sprout-400 text-white'
                : 'bg-cosmos-800 text-cosmos-300 hover:bg-cosmos-700'
            }`}
          >
            已完成 ({stats.completed})
          </button>
        </div>

        {/* 课程列表 */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(renderCourseCard)}
          </div>
        ) : purchasedCourses.length === 0 ? (
          // 没有任何课程
          <Card className="p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-cosmos-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">还没有购买课程</h3>
            <p className="text-cosmos-400 mb-6">去课程商店挑选你感兴趣的课程吧！</p>
            <Button variant="star" onClick={() => router.push('/store')}>
              <Sparkles className="w-4 h-4 mr-2" />
              浏览课程商店
            </Button>
          </Card>
        ) : (
          // 筛选后没有结果
          <Card className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-cosmos-600 mx-auto mb-4" />
            <p className="text-cosmos-400">没有符合条件的课程</p>
          </Card>
        )}

        {/* 底部提示 */}
        {purchasedCourses.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="cosmos" onClick={() => router.push('/store')}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              购买更多课程
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
