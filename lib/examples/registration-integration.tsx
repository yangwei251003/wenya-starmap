// 注册流程集成示例
// 展示如何在用户注册时创建学习路径

'use client'

import { useState } from 'react'
import { learningPathService } from '@/lib/learning-path'
import { EnglishLevel } from '@/types'

/**
 * 注册表单组件示例
 * 展示如何在注册时集成英语水平评估和学习路径生成
 */
export function RegistrationWithAssessment() {
  const [step, setStep] = useState<'info' | 'assessment' | 'complete'>('info')
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    level: 'beginner' as EnglishLevel,
  })
  const [assessmentScores, setAssessmentScores] = useState({
    vocabulary: 50,
    grammar: 50,
    listening: 50,
    speaking: 50,
    reading: 50,
    writing: 50,
  })
  const [loading, setLoading] = useState(false)

  async function handleRegistration() {
    try {
      setLoading(true)

      // 1. 创建用户账户
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('注册失败')
      }

      const { user } = await response.json()

      // 2. 生成个性化学习路径
      const learningPath = await learningPathService.createPathForNewUser(
        user.id,
        {
          level: formData.level,
          targetLevel: getDefaultTargetLevel(formData.level),
          scores: assessmentScores,
        }
      )

      // 3. 保存学习路径到数据库
      await fetch('/api/learning-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(learningPath),
      })

      // 4. 显示欢迎界面
      setStep('complete')

      // 5. 触发成长动画（在实际应用中）
      // triggerWelcomeAnimation()

    } catch (error) {
      console.error('注册过程出错:', error)
      alert('注册失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  function getDefaultTargetLevel(currentLevel: EnglishLevel): EnglishLevel {
    if (currentLevel === 'beginner') return 'intermediate'
    if (currentLevel === 'intermediate') return 'advanced'
    return 'advanced'
  }

  // 步骤1: 基本信息
  if (step === 'info') {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="cosmos-card">
          <h2 className="text-2xl font-bold text-cosmos-100 mb-6">创建账户</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-cosmos-200 mb-2">
                用户名
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-2 bg-cosmos-800 border border-cosmos-600 rounded-lg text-cosmos-100 focus:border-sprout-400 focus:outline-none"
                placeholder="请输入用户名"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cosmos-200 mb-2">
                邮箱
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 bg-cosmos-800 border border-cosmos-600 rounded-lg text-cosmos-100 focus:border-sprout-400 focus:outline-none"
                placeholder="请输入邮箱"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cosmos-200 mb-2">
                密码
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 bg-cosmos-800 border border-cosmos-600 rounded-lg text-cosmos-100 focus:border-sprout-400 focus:outline-none"
                placeholder="请输入密码"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cosmos-200 mb-2">
                当前英语水平
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value as EnglishLevel })}
                className="w-full px-4 py-2 bg-cosmos-800 border border-cosmos-600 rounded-lg text-cosmos-100 focus:border-sprout-400 focus:outline-none"
              >
                <option value="beginner">初级 (Beginner)</option>
                <option value="intermediate">中级 (Intermediate)</option>
                <option value="advanced">高级 (Advanced)</option>
              </select>
            </div>

            <button
              onClick={() => setStep('assessment')}
              className="w-full py-3 bg-gradient-to-r from-sprout-400 to-star-400 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              下一步：能力评估
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 步骤2: 能力评估
  if (step === 'assessment') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="cosmos-card">
          <h2 className="text-2xl font-bold text-cosmos-100 mb-2">能力评估</h2>
          <p className="text-cosmos-300 mb-6">
            请评估你在各个方面的英语能力（0-100分）
          </p>

          <div className="space-y-6">
            {Object.entries(assessmentScores).map(([key, value]) => {
              const labels: Record<string, string> = {
                vocabulary: '词汇量',
                grammar: '语法',
                listening: '听力',
                speaking: '口语',
                reading: '阅读',
                writing: '写作',
              }

              return (
                <div key={key}>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-cosmos-200">
                      {labels[key]}
                    </label>
                    <span className="text-sm text-sprout-400 font-semibold">
                      {value} 分
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={value}
                    onChange={(e) =>
                      setAssessmentScores({
                        ...assessmentScores,
                        [key]: parseInt(e.target.value),
                      })
                    }
                    className="w-full h-2 bg-cosmos-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              )
            })}
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={() => setStep('info')}
              className="flex-1 py-3 border border-cosmos-600 text-cosmos-200 rounded-lg font-semibold hover:border-cosmos-500 transition-colors"
            >
              上一步
            </button>
            <button
              onClick={handleRegistration}
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-sprout-400 to-star-400 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? '创建中...' : '完成注册'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 步骤3: 完成
  return (
    <div className="max-w-md mx-auto p-6">
      <div className="cosmos-card text-center">
        <div className="text-6xl mb-4">🌱✨</div>
        <h2 className="text-3xl font-bold text-cosmos-100 mb-2">
          欢迎加入问芽星图！
        </h2>
        <p className="text-cosmos-300 mb-6">
          你的个性化学习路径已经准备好了
        </p>

        <div className="bg-cosmos-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-cosmos-300 mb-2">你的学习目标</p>
          <p className="text-lg font-semibold text-sprout-400">
            从 {getLevelName(formData.level)} 到{' '}
            {getLevelName(getDefaultTargetLevel(formData.level))}
          </p>
        </div>

        <button
          onClick={() => (window.location.href = '/dashboard')}
          className="w-full py-3 bg-gradient-to-r from-sprout-400 to-star-400 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          开始学习之旅
        </button>
      </div>
    </div>
  )

  function getLevelName(level: EnglishLevel): string {
    const names = {
      beginner: '初级',
      intermediate: '中级',
      advanced: '高级',
    }
    return names[level]
  }
}

/**
 * 使用说明：
 * 
 * 1. 在 app/auth/register/page.tsx 中使用：
 * 
 *    import { RegistrationWithAssessment } from '@/lib/examples/registration-integration'
 *    
 *    export default function RegisterPage() {
 *      return <RegistrationWithAssessment />
 *    }
 * 
 * 2. 需要的API端点：
 * 
 *    POST /api/auth/register
 *    - 接收: { username, email, password, level }
 *    - 返回: { user: { id, username, email, level } }
 * 
 *    POST /api/learning-path
 *    - 接收: LearningPath对象
 *    - 返回: { success: boolean, learningPath: LearningPath }
 * 
 * 3. 集成要点：
 *    - 用户注册成功后立即生成学习路径
 *    - 基于评估分数个性化推荐课程
 *    - 保存学习路径到数据库以便后续使用
 *    - 显示欢迎界面和成长动画
 *    - 重定向到学习仪表板
 */
