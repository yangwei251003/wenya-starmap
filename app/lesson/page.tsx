'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BookOpen, Play, CheckCircle, Clock, Star, Filter } from 'lucide-react'
import { allLessons } from '@/lib/lessons-data'

export default function LessonPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all')
  const [completedLessons, setCompletedLessons] = useState<string[]>([])

  useEffect(() => {
    setMounted(true)
    // 加载已完成的课程
    const completed = JSON.parse(localStorage.getItem('completed_lessons') || '[]')
    setCompletedLessons(completed)
  }, [])

  // 过滤课程
  const filteredLessons = selectedLevel === 'all' 
    ? allLessons 
    : allLessons.filter(l => l.level === selectedLevel)

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-sprout-400 bg-sprout-400/20'
      case 'intermediate': return 'text-star-400 bg-star-400/20'
      case 'advanced': return 'text-red-400 bg-red-400/20'
      default: return 'text-cosmos-400 bg-cosmos-400/20'
    }
  }

  const getDifficultyText = (level: string) => {
    switch (level) {
      case 'beginner': return '初级'
      case 'intermediate': return '中级'
      case 'advanced': return '高级'
      default: return level
    }
  }

  const handleStartLesson = (lessonId: string) => {
    router.push(`/lesson/${lessonId}`)
  }

  const completedCount = filteredLessons.filter(l => completedLessons.includes(l.id)).length
  const totalXp = filteredLessons
    .filter(l => completedLessons.includes(l.id))
    .reduce((sum, l) => sum + l.xp, 0)

  return (
    <div className="min-h-screen">
      <PageHeader 
        title="课程学习" 
        subtitle="系统化的英语学习内容"
        titleColor="sprout"
        backUrl="/dashboard"
      />

      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className={`${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
          {/* 学习进度概览 */}
          <Card className="p-6 mb-6 bg-gradient-to-r from-sprout-500/20 to-star-500/20 border-sprout-400/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">学习进度</h3>
                <p className="text-cosmos-400">已完成 {completedCount} / {filteredLessons.length} 课程</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-star-400">{totalXp} XP</div>
                <p className="text-sm text-cosmos-400">累计经验</p>
              </div>
            </div>
            <div className="mt-4 h-2 bg-cosmos-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-sprout-400 to-star-400 rounded-full transition-all duration-500"
                style={{ width: `${filteredLessons.length > 0 ? (completedCount / filteredLessons.length) * 100 : 0}%` }}
              />
            </div>
          </Card>

          {/* 级别筛选 */}
          <Card className="p-4 mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-5 h-5 text-cosmos-400" />
              <span className="text-cosmos-400 text-sm">筛选：</span>
              <div className="flex gap-2">
                {[
                  { value: 'all', label: '全部' },
                  { value: 'beginner', label: '初级' },
                  { value: 'intermediate', label: '中级' },
                  { value: 'advanced', label: '高级' }
                ].map(level => (
                  <button
                    key={level.value}
                    onClick={() => setSelectedLevel(level.value as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedLevel === level.value
                        ? 'bg-sprout-400 text-white'
                        : 'bg-cosmos-800 text-cosmos-300 hover:bg-cosmos-700'
                    }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* 课程列表 */}
          <div className="space-y-4">
            {filteredLessons.map((lesson, index) => {
              const isCompleted = completedLessons.includes(lesson.id)
              
              return (
                <Card 
                  key={lesson.id}
                  className={`p-5 transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                    isCompleted ? 'border-sprout-400/30' : 'hover:border-star-400/50'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => handleStartLesson(lesson.id)}
                >
                  <div className="flex items-center gap-4">
                    {/* 状态图标 */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isCompleted 
                        ? 'bg-sprout-400/20' 
                        : 'bg-cosmos-800'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6 text-sprout-400" />
                      ) : (
                        <BookOpen className="w-6 h-6 text-cosmos-400" />
                      )}
                    </div>

                    {/* 课程信息 */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">{lesson.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getDifficultyColor(lesson.level)}`}>
                          {getDifficultyText(lesson.level)}
                        </span>
                      </div>
                      <p className="text-sm text-cosmos-400 mb-1">{lesson.titleEn}</p>
                      <p className="text-sm text-cosmos-500">{lesson.description}</p>
                    </div>

                    {/* 时长和操作 */}
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-cosmos-400 text-sm mb-2">
                        <Clock className="w-4 h-4" />
                        {lesson.duration}分钟
                      </div>
                      <div className="flex items-center gap-1 text-star-400 text-sm mb-3">
                        <Star className="w-4 h-4" />
                        +{lesson.xp} XP
                      </div>
                      {isCompleted ? (
                        <Button variant="outline" size="sm">
                          复习
                        </Button>
                      ) : (
                        <Button variant="sprout" size="sm">
                          <Play className="w-4 h-4 mr-1" />
                          开始
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {filteredLessons.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-cosmos-400">暂无课程</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
