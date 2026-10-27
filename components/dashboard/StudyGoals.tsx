'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { 
  Target, CheckCircle, Clock, Flame, 
  Star, Trophy, Zap, TrendingUp,
  Calendar, Award, Sparkles
} from 'lucide-react'

interface StudyGoal {
  id: string
  title: string
  description: string
  target: number
  current: number
  unit: string
  type: 'daily' | 'weekly' | 'monthly'
  icon: string
  color: string
  completed: boolean
}

interface StudyGoalsProps {
  userId: string
  studyStats: {
    streak: number
    todayCompleted: number
    accuracy: number
    totalMastered: number
  }
}

export default function StudyGoals({ userId, studyStats }: StudyGoalsProps) {
  const [goals, setGoals] = useState<StudyGoal[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily')

  useEffect(() => {
    // 生成学习目标
    const generateGoals = () => {
      const dailyGoals: StudyGoal[] = [
        {
          id: 'daily-words',
          title: '每日单词',
          description: '完成今日单词学习目标',
          target: 20,
          current: studyStats.todayCompleted,
          unit: '个',
          type: 'daily',
          icon: 'target',
          color: 'cyan',
          completed: studyStats.todayCompleted >= 20
        },
        {
          id: 'daily-accuracy',
          title: '准确率',
          description: '保持高准确率学习',
          target: 85,
          current: studyStats.accuracy,
          unit: '%',
          type: 'daily',
          icon: 'zap',
          color: 'green',
          completed: studyStats.accuracy >= 85
        },
        {
          id: 'daily-streak',
          title: '连续学习',
          description: '保持学习连续性',
          target: 1,
          current: studyStats.streak > 0 ? 1 : 0,
          unit: '天',
          type: 'daily',
          icon: 'flame',
          color: 'orange',
          completed: studyStats.streak > 0
        }
      ]

      const weeklyGoals: StudyGoal[] = [
        {
          id: 'weekly-words',
          title: '周学习量',
          description: '本周学习单词总数',
          target: 140,
          current: studyStats.todayCompleted * 7, // 模拟一周数据
          unit: '个',
          type: 'weekly',
          icon: 'trophy',
          color: 'star',
          completed: (studyStats.todayCompleted * 7) >= 140
        },
        {
          id: 'weekly-days',
          title: '学习天数',
          description: '本周学习天数',
          target: 5,
          current: Math.min(studyStats.streak, 5),
          unit: '天',
          type: 'weekly',
          icon: 'calendar',
          color: 'purple',
          completed: studyStats.streak >= 5
        }
      ]

      const monthlyGoals: StudyGoal[] = [
        {
          id: 'monthly-mastery',
          title: '掌握词汇',
          description: '本月新掌握的单词',
          target: 500,
          current: studyStats.totalMastered,
          unit: '个',
          type: 'monthly',
          icon: 'award',
          color: 'sprout',
          completed: studyStats.totalMastered >= 500
        },
        {
          id: 'monthly-streak',
          title: '连续学习',
          description: '本月连续学习天数',
          target: 20,
          current: studyStats.streak,
          unit: '天',
          type: 'monthly',
          icon: 'flame',
          color: 'orange',
          completed: studyStats.streak >= 20
        }
      ]

      switch (selectedPeriod) {
        case 'daily':
          setGoals(dailyGoals)
          break
        case 'weekly':
          setGoals(weeklyGoals)
          break
        case 'monthly':
          setGoals(monthlyGoals)
          break
      }
    }

    generateGoals()
  }, [selectedPeriod, studyStats])

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'target': return <Target className="w-5 h-5" />
      case 'zap': return <Zap className="w-5 h-5" />
      case 'flame': return <Flame className="w-5 h-5" />
      case 'trophy': return <Trophy className="w-5 h-5" />
      case 'calendar': return <Calendar className="w-5 h-5" />
      case 'award': return <Award className="w-5 h-5" />
      default: return <Star className="w-5 h-5" />
    }
  }

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'cyan': return 'text-cyan-400 bg-cyan-400/20'
      case 'green': return 'text-green-400 bg-green-400/20'
      case 'orange': return 'text-orange-400 bg-orange-400/20'
      case 'star': return 'text-star-400 bg-star-400/20'
      case 'purple': return 'text-purple-400 bg-purple-400/20'
      case 'sprout': return 'text-sprout-400 bg-sprout-400/20'
      default: return 'text-cosmos-400 bg-cosmos-400/20'
    }
  }

  const completedGoals = goals.filter(g => g.completed).length
  const totalGoals = goals.length
  const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0

  return (
    <Card className="p-6 bg-gradient-to-br from-star-500/10 to-purple-500/10 border-star-400/30">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-star-400 to-purple-400 rounded-full flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">学习目标</h3>
            <p className="text-cosmos-300 text-sm">追踪学习进度</p>
          </div>
        </div>
        
        {/* 完成度环形进度 */}
        <div className="relative w-12 h-12">
          <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-cosmos-700"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={`${completionRate}, 100`}
              className="text-star-400"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-xs font-bold">{completionRate}%</span>
          </div>
        </div>
      </div>

      {/* 时间段切换 */}
      <div className="flex bg-cosmos-800/30 rounded-lg p-1 mb-4">
        {(['daily', 'weekly', 'monthly'] as const).map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              selectedPeriod === period
                ? 'bg-star-400 text-white'
                : 'text-cosmos-400 hover:text-white'
            }`}
          >
            {period === 'daily' ? '今日' : period === 'weekly' ? '本周' : '本月'}
          </button>
        ))}
      </div>

      {/* 目标列表 */}
      <div className="space-y-3">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className={`p-3 rounded-lg border transition-all ${
              goal.completed 
                ? 'bg-sprout-500/10 border-sprout-400/30' 
                : 'bg-cosmos-800/30 border-cosmos-600/30'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getColorClasses(goal.color)}`}>
                {getIcon(goal.icon)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-white font-medium text-sm">{goal.title}</h4>
                  {goal.completed && (
                    <CheckCircle className="w-4 h-4 text-sprout-400" />
                  )}
                </div>
                <p className="text-cosmos-400 text-xs">{goal.description}</p>
              </div>
              <div className="text-right">
                <div className="text-white font-bold text-sm">
                  {goal.current}/{goal.target}
                </div>
                <div className="text-cosmos-500 text-xs">{goal.unit}</div>
              </div>
            </div>
            
            {/* 进度条 */}
            <div className="w-full h-2 bg-cosmos-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  goal.completed ? 'bg-sprout-400' : 'bg-star-400'
                }`}
                style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 底部统计 */}
      <div className="mt-4 pt-4 border-t border-cosmos-600/30">
        <div className="flex items-center justify-between text-sm">
          <span className="text-cosmos-400">目标完成度</span>
          <div className="flex items-center gap-2">
            <span className="text-white font-medium">{completedGoals}/{totalGoals}</span>
            {completionRate === 100 && (
              <Sparkles className="w-4 h-4 text-star-400 animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}