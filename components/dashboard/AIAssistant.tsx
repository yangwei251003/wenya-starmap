'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { 
  Bot, MessageCircle, Lightbulb, TrendingUp, 
  Clock, Target, Sparkles, ChevronRight,
  Brain, Zap, Star
} from 'lucide-react'

interface AIRecommendation {
  id: string
  type: 'study' | 'review' | 'break' | 'challenge'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  action: string
}

interface AIAssistantProps {
  userId: string
  studyStats: {
    streak: number
    todayCompleted: number
    accuracy: number
    totalMastered: number
  }
}

export default function AIAssistant({ userId, studyStats }: AIAssistantProps) {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [isThinking, setIsThinking] = useState(true)
  const [currentTip, setCurrentTip] = useState(0)

  // AI 学习建议
  const learningTips = [
    "🧠 记忆黄金时间：早上9-11点和晚上7-9点是记忆的最佳时段",
    "🔄 间隔复习法：学习后1小时、1天、3天、7天、15天复习效果最佳",
    "🎯 专注力训练：每次学习25分钟，休息5分钟，保持高效专注",
    "📊 错误分析：重点关注错误率高的单词类型，针对性加强",
    "🌟 成就激励：设定小目标，每完成一个就奖励自己"
  ]

  useEffect(() => {
    // 模拟 AI 分析用户数据
    const analyzeUserData = () => {
      setIsThinking(true)
      
      setTimeout(() => {
        const newRecommendations: AIRecommendation[] = []

        // 基于连续学习天数的建议
        if (studyStats.streak === 0) {
          newRecommendations.push({
            id: 'start-streak',
            type: 'study',
            title: '开始你的学习之旅',
            description: '今天是开始连续学习的好日子！建议从10个简单单词开始。',
            priority: 'high',
            action: '开始学习'
          })
        } else if (studyStats.streak >= 7) {
          newRecommendations.push({
            id: 'maintain-streak',
            type: 'challenge',
            title: `🔥 ${studyStats.streak}天连续学习！`,
            description: '你的坚持令人钦佩！可以尝试增加学习难度或新的学习模式。',
            priority: 'medium',
            action: '挑战模式'
          })
        }

        // 基于今日完成情况的建议
        if (studyStats.todayCompleted === 0) {
          newRecommendations.push({
            id: 'daily-start',
            type: 'study',
            title: '今日学习计划',
            description: '建议先复习昨天的单词，然后学习5-10个新单词。',
            priority: 'high',
            action: '开始今日学习'
          })
        } else if (studyStats.todayCompleted >= 20) {
          newRecommendations.push({
            id: 'take-break',
            type: 'break',
            title: '适度休息',
            description: '今天学习量已经很充足了！建议休息一下，避免过度疲劳。',
            priority: 'medium',
            action: '查看成果'
          })
        }

        // 基于准确率的建议
        if (studyStats.accuracy < 70 && studyStats.todayCompleted > 0) {
          newRecommendations.push({
            id: 'review-focus',
            type: 'review',
            title: '加强复习',
            description: '今日准确率较低，建议重点复习已学单词，巩固基础。',
            priority: 'high',
            action: '复习模式'
          })
        } else if (studyStats.accuracy >= 90) {
          newRecommendations.push({
            id: 'advance-level',
            type: 'challenge',
            title: '提升挑战',
            description: '准确率很高！可以尝试更难的词汇或增加学习量。',
            priority: 'medium',
            action: '高级词汇'
          })
        }

        // 基于掌握单词数的建议
        if (studyStats.totalMastered >= 100) {
          newRecommendations.push({
            id: 'milestone',
            type: 'challenge',
            title: '🎉 词汇里程碑',
            description: `已掌握${studyStats.totalMastered}个单词！可以开始学习短语和句型了。`,
            priority: 'low',
            action: '学习短语'
          })
        }

        // 如果没有特殊建议，添加通用建议
        if (newRecommendations.length === 0) {
          newRecommendations.push({
            id: 'general',
            type: 'study',
            title: '保持学习节奏',
            description: '学习状态良好！继续保持当前的学习节奏和方法。',
            priority: 'medium',
            action: '继续学习'
          })
        }

        setRecommendations(newRecommendations)
        setIsThinking(false)
      }, 1500)
    }

    analyzeUserData()
  }, [studyStats])

  // 轮播学习小贴士
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % learningTips.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [learningTips.length])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-400/50 bg-red-500/10'
      case 'medium': return 'border-star-400/50 bg-star-500/10'
      case 'low': return 'border-sprout-400/50 bg-sprout-500/10'
      default: return 'border-cosmos-400/50 bg-cosmos-500/10'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'study': return <Target className="w-5 h-5 text-cyan-400" />
      case 'review': return <TrendingUp className="w-5 h-5 text-orange-400" />
      case 'break': return <Clock className="w-5 h-5 text-purple-400" />
      case 'challenge': return <Zap className="w-5 h-5 text-star-400" />
      default: return <Lightbulb className="w-5 h-5 text-sprout-400" />
    }
  }

  return (
    <div className="space-y-4">
      {/* AI 助手头部 */}
      <Card className="p-4 bg-gradient-to-r from-sprout-500/20 to-star-500/20 border-sprout-400/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-sprout-400 to-star-400 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">AI 学习助手</h3>
            <p className="text-cosmos-300 text-sm">智能分析，个性化建议</p>
          </div>
          {isThinking && (
            <div className="ml-auto">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-sprout-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-sprout-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-sprout-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>

        {/* 学习小贴士轮播 */}
        <div className="bg-cosmos-800/30 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-star-400" />
            <span className="text-star-400 text-sm font-medium">学习小贴士</span>
          </div>
          <p className="text-cosmos-300 text-sm leading-relaxed">
            {learningTips[currentTip]}
          </p>
        </div>

        {/* 快速统计 */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-cosmos-800/30 rounded-lg p-2">
            <div className="text-orange-400 font-bold text-lg">{studyStats.streak}</div>
            <div className="text-cosmos-400 text-xs">连续天</div>
          </div>
          <div className="bg-cosmos-800/30 rounded-lg p-2">
            <div className="text-cyan-400 font-bold text-lg">{studyStats.todayCompleted}</div>
            <div className="text-cosmos-400 text-xs">今日学习</div>
          </div>
          <div className="bg-cosmos-800/30 rounded-lg p-2">
            <div className="text-sprout-400 font-bold text-lg">{studyStats.accuracy}%</div>
            <div className="text-cosmos-400 text-xs">准确率</div>
          </div>
          <div className="bg-cosmos-800/30 rounded-lg p-2">
            <div className="text-star-400 font-bold text-lg">{studyStats.totalMastered}</div>
            <div className="text-cosmos-400 text-xs">已掌握</div>
          </div>
        </div>
      </Card>

      {/* AI 建议列表 */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-sprout-400" />
          <h4 className="text-white font-semibold">智能建议</h4>
          {isThinking && <span className="text-cosmos-400 text-sm">分析中...</span>}
        </div>

        <div className="space-y-3">
          {isThinking ? (
            // 加载状态
            [...Array(2)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-cosmos-700/30 rounded-lg" />
              </div>
            ))
          ) : (
            // AI 建议
            recommendations.map((rec) => (
              <div
                key={rec.id}
                className={`p-3 rounded-lg border transition-all hover:scale-[1.02] cursor-pointer ${getPriorityColor(rec.priority)}`}
                onClick={() => {
                  // 根据建议类型跳转到对应页面
                  if (typeof window !== 'undefined') {
                    if (rec.type === 'study' || rec.type === 'review') {
                      window.location.href = '/study'
                    } else if (rec.type === 'challenge') {
                      window.location.href = '/study-fsrs'
                    }
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getTypeIcon(rec.type)}
                  </div>
                  <div className="flex-1">
                    <h5 className="text-white font-medium mb-1">{rec.title}</h5>
                    <p className="text-cosmos-300 text-sm mb-2">{rec.description}</p>
                    <button className="text-sprout-400 text-sm font-medium hover:text-sprout-300 transition-colors flex items-center gap-1">
                      {rec.action}
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* AI 对话入口 */}
      <Card className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-400/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5 text-purple-400" />
            <div>
              <h4 className="text-white font-medium">AI 学习顾问</h4>
              <p className="text-cosmos-300 text-sm">有学习问题？随时问我</p>
            </div>
          </div>
          <button 
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/chat'
              }
            }}
            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            开始对话
          </button>
        </div>
      </Card>
    </div>
  )
}