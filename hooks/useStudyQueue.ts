import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/react-query'
import { Rating } from '@/utils/fsrs'

interface StudyCard {
  id: string
  user_id: string
  word_id: string
  next_review: string
  stability: number
  difficulty: number
  state: 'new' | 'learning' | 'review' | 'relearning'
  priority: number
  type: 'review' | 'new'
}

interface StudyQueueResponse {
  queue: StudyCard[]
  stats: {
    total: number
    review: number
    new: number
    dailyNewLimit: number
    dailyReviewLimit: number
    newWordsStudiedToday: number
    remainingNewWords: number
  }
}

interface ReviewRequest {
  userId: string
  wordId: string
  rating: Rating
  reviewTime?: string
}

interface ReviewResponse {
  success: boolean
  data: {
    id: string
    word_id: string
    next_review: string
    stability: number
    difficulty: number
    state: string
    memory_strength: number
    scheduled_days: number
  }
}

// 获取学习队列
export const useStudyQueue = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.studyQueue(userId),
    queryFn: async (): Promise<StudyQueueResponse> => {
      const response = await fetch(`/api/study/queue?userId=${userId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch study queue')
      }
      return response.json()
    },
    enabled: !!userId,
  })
}

// 提交复习
export const useSubmitReview = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: ReviewRequest): Promise<ReviewResponse> => {
      const response = await fetch('/api/study/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        throw new Error('Failed to submit review')
      }

      return response.json()
    },
    onMutate: async (variables) => {
      // 乐观更新：立即从队列中移除卡片
      const queueKey = queryKeys.studyQueue(variables.userId)
      
      // 取消正在进行的查询
      await queryClient.cancelQueries({ queryKey: queueKey })
      
      // 获取当前数据
      const previousQueue = queryClient.getQueryData<StudyQueueResponse>(queueKey)
      
      if (previousQueue) {
        // 从队列中移除当前卡片
        const updatedQueue = {
          ...previousQueue,
          queue: previousQueue.queue.filter(card => card.word_id !== variables.wordId),
          stats: {
            ...previousQueue.stats,
            total: previousQueue.stats.total - 1,
            [previousQueue.queue.find(card => card.word_id === variables.wordId)?.type === 'new' ? 'new' : 'review']: 
              previousQueue.stats[previousQueue.queue.find(card => card.word_id === variables.wordId)?.type === 'new' ? 'new' : 'review'] - 1
          }
        }
        
        // 乐观更新缓存
        queryClient.setQueryData(queueKey, updatedQueue)
      }
      
      // 返回上下文用于回滚
      return { previousQueue }
    },
    onError: (error, variables, context) => {
      // 发生错误时回滚
      if (context?.previousQueue) {
        queryClient.setQueryData(
          queryKeys.studyQueue(variables.userId),
          context.previousQueue
        )
      }
    },
    onSettled: (data, error, variables) => {
      // 无论成功还是失败，都重新获取数据以确保一致性
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.studyQueue(variables.userId) 
      })
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.studyStats(variables.userId) 
      })
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.memoryData(variables.userId) 
      })
    },
  })
}

// 创建新的学习记录
export const useCreateStudyLog = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, wordId }: { userId: string; wordId: string }) => {
      const response = await fetch('/api/study/queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, wordId }),
      })

      if (!response.ok) {
        throw new Error('Failed to create study log')
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      // 刷新学习队列
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.studyQueue(variables.userId) 
      })
    },
  })
}