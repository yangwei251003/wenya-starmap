'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { 
  Trophy, Medal, Crown, Star, Flame, 
  TrendingUp, Users, Award, Zap,
  ChevronUp, ChevronDown, Minus
} from 'lucide-react'

interface LeaderBoardUser {
  id: string
  username: string
  avatar?: string
  rank: number
  score: number
  streak: number
  wordsLearned: number
  accuracy: number
  change: 'up' | 'down' | 'same'
  isCurrentUser?: boolean
}

interface LeaderBoardProps {
  userId: string
  currentUserStats: {
    streak: number
    todayCompleted: number
    accuracy: number
    totalMastered: number
  }
}

export default function LeaderBoard({ userId, currentUserStats }: LeaderBoardProps) {
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly' | 'allTime'>('weekly')
  const [leaderData, setLeaderData] = useState<LeaderBoardUser[]>([])
  const [currentUserRank, setCurrentUserRank] = useState<LeaderBoardUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 模拟排行榜数据
  useEffect(() => {
    const generateLeaderBoard = () => {
      setIsLoading(true)
      
      setTimeout(() => {
        // 生成模拟用户数据
        const users: LeaderBoardUser[] = [
          {
            id: '1',
            username: '学霸小星',
            rank: 1,
            score: 2850,
            streak: 45,
            wordsLearned: 1250,
            accuracy: 94,
            change: 'up'
          },
          {
            id: '2',
            username: '词汇达人',
            rank: 2,
            score: 2720,
            streak: 38,
            wordsLearned: 1180,
            accuracy: 91,
            change: 'same'
          },
          {
            id: '3',
            username: '英语之星',
            rank: 3,
            score: 2650,
            streak: 42,
            wordsLearned: 1100,
            accuracy: 89,
            change: 'down'
          },
          {
            id: '4',
            username: '记忆大师',
            rank: 4,
            score: 2580,
            streak: 35,
            wordsLearned: 1050,
            accuracy: 92,
            change: 'up'
          },
          {
            id: '5',
            username: '坚持不懈',
            rank: 5,
            score: 2450,
            streak: 28,
            wordsLearned: 980,
            accuracy: 87,
            change: 'up'
          },
          {
            id: '6',
            username: '学习之光',
            rank: 6,
            score: 2380,
            streak: 31,
            wordsLearned: 920,
            accuracy: 85,
            change: 'down'
          },
          {
            id: '7',
            username: '词汇新星',
            rank: 7,
            score: 2320,
            streak: 25,
            wordsLearned: 890,
            accuracy: 88,
            change: 'up'
          }
        ]

        // 计算当前用户排名（模拟）
        const currentUserScore = currentUserStats.totalMastered * 2 + currentUserStats.streak * 10 + currentUserStats.accuracy * 5
        const currentUser: LeaderBoardUser = {
          id: userId,
          username: '我',
          rank: 12,
          score: currentUserScore,
          streak: currentUserStats.streak,
          wordsLearned: currentUserStats.totalMastered,
          accuracy: currentUserStats.accuracy,
          change: 'up',
          isCurrentUser: true
        }

        setLeaderData(users)
        setCurrentUserRank(currentUser)
        setIsLoading(false)
      }, 1000)
    }

    generateLeaderBoard()
  }, [activeTab, userId, currentUserStats])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return (
          <div className="w-6 h-6 bg-cosmos-700 rounded-full flex items-center justify-center text-cosmos-300 text-sm font-bold">
            {rank}
          </div>
        )
    }
  }

  const getChangeIcon = (change: 'up' | 'down' | 'same') => {
    switch (change) {
      case 'up':
        return <ChevronUp className="w-4 h-4 text-green-400" />
      case 'down':
        return <ChevronDown className="w-4 h-4 text-red-400" />
      case 'same':
        return <Minus className="w-4 h-4 text-cosmos-400" />
    }
  }

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'weekly': return '本周'
      case 'monthly': return '本月'
      case 'allTime': return '总榜'
      default: return tab
    }
  }

  return (
    <div className="space-y-4">
      {/* 排行榜头部 */}
      <Card className="p-4 bg-gradient-to-r from-star-500/20 to-purple-500/20 border-star-400/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-star-400 to-purple-400 rounded-full flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">学习排行榜</h3>
            <p className="text-cosmos-300 text-sm">与全球学习者一起进步</p>
          </div>
        </div>

        {/* 标签切换 */}
        <div className="flex bg-cosmos-800/30 rounded-lg p-1">
          {(['weekly', 'monthly', 'allTime'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-star-400 text-white'
                  : 'text-cosmos-400 hover:text-white'
              }`}
            >
              {getTabLabel(tab)}
            </button>
          ))}
        </div>
      </Card>

      {/* 前三名特殊展示 */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-star-400" />
          <h4 className="text-white font-semibold">本期冠军</h4>
        </div>

        {isLoading ? (
          <div className="flex justify-center gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="w-20 h-20 bg-cosmos-700/30 rounded-full mb-2" />
                <div className="h-4 bg-cosmos-700/30 rounded mb-1" />
                <div className="h-3 bg-cosmos-700/30 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center gap-6">
            {leaderData.slice(0, 3).map((user, index) => (
              <div key={user.id} className="text-center">
                <div className={`relative mb-3 ${index === 0 ? 'scale-110' : ''}`}>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                    index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                    'bg-gradient-to-br from-amber-600 to-amber-800'
                  }`}>
                    {user.username.charAt(0)}
                  </div>
                  <div className="absolute -top-2 -right-2">
                    {getRankIcon(user.rank)}
                  </div>
                </div>
                <div className="text-white font-medium text-sm mb-1">{user.username}</div>
                <div className="text-star-400 font-bold text-lg">{user.score}</div>
                <div className="text-cosmos-400 text-xs">
                  {user.streak}天连续 · {user.accuracy}%准确率
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 完整排行榜 */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-sprout-400" />
            <h4 className="text-white font-semibold">完整排名</h4>
          </div>
          <div className="text-cosmos-400 text-sm">
            共 {leaderData.length + 1000} 位学习者
          </div>
        </div>

        <div className="space-y-2">
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-cosmos-700/30 rounded-lg" />
              </div>
            ))
          ) : (
            <>
              {leaderData.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 bg-cosmos-800/30 rounded-lg hover:bg-cosmos-800/50 transition-all"
                >
                  <div className="flex items-center gap-2">
                    {getRankIcon(user.rank)}
                    {getChangeIcon(user.change)}
                  </div>
                  
                  <div className="w-8 h-8 bg-gradient-to-br from-sprout-400 to-star-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {user.username.charAt(0)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="text-white font-medium">{user.username}</div>
                    <div className="text-cosmos-400 text-sm flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Flame className="w-3 h-3 text-orange-400" />
                        {user.streak}天
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-green-400" />
                        {user.accuracy}%
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-cyan-400" />
                        {user.wordsLearned}词
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-star-400 font-bold">{user.score}</div>
                    <div className="text-cosmos-500 text-xs">积分</div>
                  </div>
                </div>
              ))}

              {/* 当前用户排名 */}
              {currentUserRank && currentUserRank.rank > 7 && (
                <>
                  <div className="flex items-center justify-center py-2">
                    <div className="text-cosmos-500 text-sm">...</div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-sprout-500/20 to-star-500/20 border border-sprout-400/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      {getRankIcon(currentUserRank.rank)}
                      {getChangeIcon(currentUserRank.change)}
                    </div>
                    
                    <div className="w-8 h-8 bg-gradient-to-br from-sprout-400 to-star-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      我
                    </div>
                    
                    <div className="flex-1">
                      <div className="text-white font-medium flex items-center gap-2">
                        {currentUserRank.username}
                        <span className="px-2 py-0.5 bg-sprout-400/20 text-sprout-400 text-xs rounded-full">
                          我的排名
                        </span>
                      </div>
                      <div className="text-cosmos-400 text-sm flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-400" />
                          {currentUserRank.streak}天
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-green-400" />
                          {currentUserRank.accuracy}%
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-cyan-400" />
                          {currentUserRank.wordsLearned}词
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-star-400 font-bold">{currentUserRank.score}</div>
                      <div className="text-cosmos-500 text-xs">积分</div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </Card>

      {/* 积分说明 */}
      <Card className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-400/30">
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-4 h-4 text-purple-400" />
          <h5 className="text-white font-medium">积分规则</h5>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-sprout-400 rounded-full" />
            <span className="text-cosmos-300">学会1个单词 = 2分</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-400 rounded-full" />
            <span className="text-cosmos-300">连续学习1天 = 10分</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-star-400 rounded-full" />
            <span className="text-cosmos-300">准确率奖励 = 准确率×5</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full" />
            <span className="text-cosmos-300">完成挑战 = 50分</span>
          </div>
        </div>
      </Card>
    </div>
  )
}