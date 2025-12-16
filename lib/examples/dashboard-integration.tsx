// 学习仪表板集成示例
// 展示如何在仪表板中使用学习路径功能

'use client'

import { useEffect, useState } from 'react'
import { learningPathService } from '@/lib/learning-path'
import { LearningPath, Lesson, EnglishLevel } from '@/types'

/**
 * 学习仪表板组件示例
 * 展示如何集成AI导师和学习路径功能
 */
export function DashboardWithLearningPath() {
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null)
  const [nextLesson, setNextLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLearningPath()
  }, [])

  async function loadLearningPath() {
    try {
      setLoading(true)
      
      // 在实际应用中，这里应该从API获取用户的学习路径
      // 这里演示如何创建新的学习路径
      const userId = 'current-user-id' // 从认证上下文获取
      
      // 检查用户是否已有学习路径
      // const existingPath = await fetchLearningPathFromAPI(userId)
      
      // 如果没有，创建新的学习路径
      const path = await learningPathService.createPathForNewUser(userId, {
        level: 'beginner',
        targetLevel: 'intermediate',
        scores: {
          vocabulary: 60,
          grammar: 65,
          listening: 55,
          speaking: 50,
          reading: 70,
          writing: 58,
        },
      })

      setLearningPath(path)

      // 获取下一个推荐课程
      const next = learningPathService.getNextRecommendation(path)
      setNextLesson(next)
    } catch (error) {
      console.error('加载学习路径失败:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleLessonComplete(lessonId: string) {
    if (!learningPath) return

    try {
      // 模拟用户表现数据
      const performance = {
        userId: learningPath.userId,
        lessonId,
        answers: [
          { exerciseId: 'ex-1', userAnswer: 'ans', isCorrect: true, timeSpent: 30 },
          { exerciseId: 'ex-2', userAnswer: 'ans', isCorrect: true, timeSpent: 25 },
        ],
        timeSpent: 55,
        accuracy: 1.0,
      }

      // 更新学习路径
      const updatedPath = await learningPathService.updatePath(
        learningPath,
        performance,
        [lessonId]
      )

      setLearningPath(updatedPath)

      // 获取新的推荐课程
      const next = learningPathService.getNextRecommendation(updatedPath)
      setNextLesson(next)

      // 检查是否升级
      if (updatedPath.currentLevel !== learningPath.currentLevel) {
        alert(`恭喜！你已升级到 ${getLevelName(updatedPath.currentLevel)} 等级！`)
      }
    } catch (error) {
      console.error('更新学习路径失败:', error)
    }
  }

  function getLevelName(level: EnglishLevel): string {
    const names = {
      beginner: '初级',
      intermediate: '中级',
      advanced: '高级',
    }
    return names[level]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sprout-400 mx-auto mb-4"></div>
          <p className="text-cosmos-300">加载学习路径中...</p>
        </div>
      </div>
    )
  }

  if (!learningPath) {
    return (
      <div className="text-center p-8">
        <p className="text-cosmos-300">无法加载学习路径</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-sprout-400 to-star-400 bg-clip-text text-transparent mb-2">
            学习仪表板
          </h1>
          <p className="text-cosmos-300">你的成长星图</p>
        </div>

        {/* 学习进度卡片 */}
        <div className="cosmos-card mb-6">
          <h2 className="text-2xl font-bold text-cosmos-100 mb-4">学习进度</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-cosmos-300 text-sm mb-1">当前等级</p>
              <p className="text-2xl font-bold text-sprout-400">
                {getLevelName(learningPath.currentLevel)}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-cosmos-300 text-sm mb-1">目标等级</p>
              <p className="text-2xl font-bold text-star-400">
                {getLevelName(learningPath.targetLevel)}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-cosmos-300 text-sm mb-1">完成课程</p>
              <p className="text-2xl font-bold text-cosmos-100">
                {learningPath.completedLessons.length}
              </p>
            </div>
          </div>

          {/* 进度条 */}
          <div className="mb-2">
            <div className="flex justify-between text-sm text-cosmos-300 mb-1">
              <span>整体进度</span>
              <span>{learningPath.progress}%</span>
            </div>
            <div className="w-full bg-cosmos-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-sprout-400 to-star-400 h-3 rounded-full transition-all duration-500"
                style={{ width: `${learningPath.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* 下一个推荐课程 */}
        {nextLesson && (
          <div className="cosmos-card mb-6">
            <h2 className="text-2xl font-bold text-cosmos-100 mb-4">推荐课程</h2>
            
            <div className="border border-cosmos-600 rounded-lg p-4 hover:border-sprout-400 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-semibold text-cosmos-100 mb-1">
                    {nextLesson.title}
                  </h3>
                  <p className="text-cosmos-300 text-sm">
                    {nextLesson.description}
                  </p>
                </div>
                <span className="px-3 py-1 bg-sprout-400/20 text-sprout-400 rounded-full text-sm">
                  {getLevelName(nextLesson.level)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-cosmos-300">
                  <span>⏱️ {nextLesson.estimatedTime} 分钟</span>
                  <span>📚 {nextLesson.category}</span>
                </div>
                
                <button
                  onClick={() => handleLessonComplete(nextLesson.id)}
                  className="px-6 py-2 bg-gradient-to-r from-sprout-400 to-star-400 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  开始学习
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 推荐课程列表 */}
        <div className="cosmos-card">
          <h2 className="text-2xl font-bold text-cosmos-100 mb-4">学习路径</h2>
          
          <div className="space-y-3">
            {learningPath.recommendedNext.slice(0, 5).map((lesson, index) => {
              const isCompleted = learningPath.completedLessons.includes(lesson.id)
              const isCurrent = nextLesson?.id === lesson.id
              
              return (
                <div
                  key={lesson.id}
                  className={`border rounded-lg p-3 transition-colors ${
                    isCompleted
                      ? 'border-star-400/50 bg-star-400/5'
                      : isCurrent
                      ? 'border-sprout-400 bg-sprout-400/5'
                      : 'border-cosmos-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {isCompleted ? '⭐' : isCurrent ? '🌱' : '📖'}
                      </span>
                      <div>
                        <h4 className="font-semibold text-cosmos-100">
                          {lesson.title}
                        </h4>
                        <p className="text-sm text-cosmos-300">
                          {lesson.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-cosmos-300">
                        {lesson.estimatedTime} 分钟
                      </p>
                      {isCompleted && (
                        <p className="text-xs text-star-400">已完成</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 使用说明：
 * 
 * 1. 在 app/dashboard/page.tsx 中导入并使用此组件：
 * 
 *    import { DashboardWithLearningPath } from '@/lib/examples/dashboard-integration'
 *    
 *    export default function DashboardPage() {
 *      return <DashboardWithLearningPath />
 *    }
 * 
 * 2. 在实际应用中，需要：
 *    - 从认证上下文获取当前用户ID
 *    - 从API获取用户的学习路径（而不是每次创建新的）
 *    - 将学习路径保存到数据库
 *    - 添加错误处理和加载状态
 *    - 集成真实的课程数据
 * 
 * 3. API端点建议：
 *    - GET /api/learning-path/:userId - 获取学习路径
 *    - POST /api/learning-path - 创建学习路径
 *    - PUT /api/learning-path/:id - 更新学习路径
 *    - POST /api/learning-path/:id/complete-lesson - 完成课程
 */
