'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/react-query'
import { Battery, Brain, TrendingUp, Clock } from 'lucide-react'
import { Card } from '@/components/ui/Card'

interface MemoryData {
  word_id: string
  stability: number
  difficulty: number
  memory_strength: number
  next_review: string
  state: string
}

interface MemoryVisualizationProps {
  userId: string
}

export default function MemoryVisualization({ userId }: MemoryVisualizationProps) {
  const { data: memoryData, isLoading } = useQuery({
    queryKey: queryKeys.memoryData(userId),
    queryFn: async (): Promise<MemoryData[]> => {
      const response = await fetch(`/api/memory/data?userId=${userId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch memory data')
      }
      return response.json()
    },
    enabled: !!userId,
    refetchInterval: 30000, // 每30秒刷新一次
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-4 bg-cosmos-700 rounded mb-2" />
            <div className="h-8 bg-cosmos-700 rounded mb-2" />
            <div className="h-2 bg-cosmos-700 rounded" />
          </Card>
        ))}
      </div>
    )
  }

  if (!memoryData?.length) {
    return (
      <Card className="p-6 text-center">
        <Brain className="w-12 h-12 text-cosmos-400 mx-auto mb-4" />
        <p className="text-cosmos-400">暂无记忆数据</p>
      </Card>
    )
  }

  // 计算统计数据
  const avgMemoryStrength = Math.round(
    memoryData.reduce((sum, item) => sum + item.memory_strength, 0) / memoryData.length
  )
  
  const strongMemories = memoryData.filter(item => item.memory_strength >= 80).length
  const weakMemories = memoryData.filter(item => item.memory_strength < 50).length
  const avgDifficulty = (
    memoryData.reduce((sum, item) => sum + item.difficulty, 0) / memoryData.length
  ).toFixed(1)

  // 获取需要复习的单词数量
  const now = new Date()
  const needReview = memoryData.filter(item => new Date(item.next_review) <= now).length

  return (
    <div className="space-y-6">
      {/* 总体统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-sprout-500/20 to-sprout-600/10 border-sprout-400/30">
          <div className="flex items-center gap-3 mb-2">
            <Battery className="w-5 h-5 text-sprout-400" />
            <span className="text-cosmos-300 text-sm">平均记忆强度</span>
          </div>
          <div className="text-2xl font-bold text-white">{avgMemoryStrength}%</div>
          <div className="w-full h-2 bg-cosmos-700 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-sprout-500 transition-all"
              style={{ width: `${avgMemoryStrength}%` }}
            />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-star-500/20 to-star-600/10 border-star-400/30">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-star-400" />
            <span className="text-cosmos-300 text-sm">记忆牢固</span>
          </div>
          <div className="text-2xl font-bold text-white">{strongMemories}</div>
          <div className="text-xs text-cosmos-400 mt-1">≥80% 强度</div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-orange-400/30">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-orange-400" />
            <span className="text-cosmos-300 text-sm">需要复习</span>
          </div>
          <div className="text-2xl font-bold text-white">{needReview}</div>
          <div className="text-xs text-cosmos-400 mt-1">待复习单词</div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-400/30">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <span className="text-cosmos-300 text-sm">平均难度</span>
          </div>
          <div className="text-2xl font-bold text-white">{avgDifficulty}</div>
          <div className="text-xs text-cosmos-400 mt-1">1-10 难度值</div>
        </Card>
      </div>

      {/* 记忆强度分布 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Battery className="w-5 h-5 text-sprout-400" />
          记忆强度分布
        </h3>
        
        <div className="space-y-3">
          {/* 强记忆 (80-100%) */}
          <div className="flex items-center gap-4">
            <div className="w-20 text-sm text-cosmos-400">80-100%</div>
            <div className="flex-1 h-6 bg-cosmos-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-sprout-500 to-sprout-400 transition-all"
                style={{ width: `${(strongMemories / memoryData.length) * 100}%` }}
              />
            </div>
            <div className="w-12 text-sm text-sprout-400 text-right">{strongMemories}</div>
          </div>

          {/* 中等记忆 (50-79%) */}
          <div className="flex items-center gap-4">
            <div className="w-20 text-sm text-cosmos-400">50-79%</div>
            <div className="flex-1 h-6 bg-cosmos-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all"
                style={{ 
                  width: `${(memoryData.filter(item => item.memory_strength >= 50 && item.memory_strength < 80).length / memoryData.length) * 100}%` 
                }}
              />
            </div>
            <div className="w-12 text-sm text-yellow-400 text-right">
              {memoryData.filter(item => item.memory_strength >= 50 && item.memory_strength < 80).length}
            </div>
          </div>

          {/* 弱记忆 (0-49%) */}
          <div className="flex items-center gap-4">
            <div className="w-20 text-sm text-cosmos-400">0-49%</div>
            <div className="flex-1 h-6 bg-cosmos-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all"
                style={{ width: `${(weakMemories / memoryData.length) * 100}%` }}
              />
            </div>
            <div className="w-12 text-sm text-red-400 text-right">{weakMemories}</div>
          </div>
        </div>
      </Card>

      {/* 最近学习的单词 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">最近学习记录</h3>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {memoryData.slice(0, 10).map((item, index) => (
            <div key={item.word_id} className="flex items-center justify-between p-3 bg-cosmos-800/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-cosmos-700 rounded-full flex items-center justify-center text-xs text-cosmos-300">
                  {index + 1}
                </div>
                <div>
                  <div className="text-white font-medium">{item.word_id}</div>
                  <div className="text-xs text-cosmos-400">
                    状态: {item.state} | 难度: {item.difficulty.toFixed(1)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-white">{item.memory_strength}%</div>
                  <div className="text-xs text-cosmos-400">
                    {new Date(item.next_review).toLocaleDateString()}
                  </div>
                </div>
                <div className="w-12 h-2 bg-cosmos-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      item.memory_strength >= 80 ? 'bg-sprout-500' :
                      item.memory_strength >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${item.memory_strength}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}