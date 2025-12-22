import { NextRequest, NextResponse } from 'next/server'
import { fsrs, Rating, State, Card } from '@/utils/fsrs'

export async function POST(request: NextRequest) {
  try {
    const { userId, wordId, rating, reviewTime } = await request.json()
    
    if (!userId || !wordId || rating === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 验证评分范围
    if (rating < 1 || rating > 4) {
      return NextResponse.json({ error: 'Rating must be between 1 and 4' }, { status: 400 })
    }

    const now = reviewTime ? new Date(reviewTime) : new Date()

    // 使用 localStorage 降级方案
    const userWordsKey = `wenya_user_words_${userId}`
    const reviewLogsKey = `wenya_review_logs_${userId}`
    
    // 获取用户单词数据
    let userWords: any[] = []
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(userWordsKey)
      userWords = stored ? JSON.parse(stored) : []
    }

    // 查找或创建单词记录
    let wordRecord = userWords.find(w => w.wordId === wordId)
    
    if (!wordRecord) {
      // 创建新记录
      wordRecord = {
        wordId,
        userId,
        due: now.toISOString(),
        stability: 0,
        difficulty: 4.0,
        elapsed_days: 0,
        scheduled_days: 0,
        reps: 0,
        lapses: 0,
        state: State.New,
        last_review: null
      }
      userWords.push(wordRecord)
    }

    // 转换为 FSRS Card 格式
    const card: Card = {
      id: wordId,
      due: new Date(wordRecord.due),
      stability: wordRecord.stability,
      difficulty: wordRecord.difficulty,
      elapsed_days: wordRecord.elapsed_days,
      scheduled_days: wordRecord.scheduled_days,
      reps: wordRecord.reps,
      lapses: wordRecord.lapses,
      state: wordRecord.state as State,
      last_review: wordRecord.last_review ? new Date(wordRecord.last_review) : undefined
    }

    // 使用 FSRS 算法计算新的调度
    const scheduling = fsrs.repeat(card, now)
    let newCard: Card
    
    switch (rating) {
      case Rating.Again:
        newCard = scheduling.again.card
        break
      case Rating.Hard:
        newCard = scheduling.hard.card
        break
      case Rating.Good:
        newCard = scheduling.good.card
        break
      case Rating.Easy:
        newCard = scheduling.easy.card
        break
      default:
        newCard = scheduling.good.card
    }

    // 更新 last_review
    newCard.last_review = now

    // 更新记录
    const updatedRecord = {
      ...wordRecord,
      last_review: newCard.last_review.toISOString(),
      due: newCard.due.toISOString(),
      stability: newCard.stability,
      difficulty: newCard.difficulty,
      state: newCard.state,
      reps: newCard.reps,
      lapses: newCard.lapses,
      elapsed_days: newCard.elapsed_days,
      scheduled_days: newCard.scheduled_days,
      updated_at: now.toISOString()
    }

    // 更新数组
    const index = userWords.findIndex(w => w.wordId === wordId)
    if (index >= 0) {
      userWords[index] = updatedRecord
    }

    // 保存到 localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(userWordsKey, JSON.stringify(userWords))
      
      // 保存复习日志
      const reviewLogs = JSON.parse(localStorage.getItem(reviewLogsKey) || '[]')
      reviewLogs.push({
        userId,
        wordId,
        rating,
        elapsed_days: newCard.elapsed_days,
        scheduled_days: newCard.scheduled_days,
        review_time: now.toISOString(),
        previous_state: card.state
      })
      localStorage.setItem(reviewLogsKey, JSON.stringify(reviewLogs))
    }

    // 计算记忆强度
    const memoryStrength = fsrs.getMemoryStrength(newCard, now)

    return NextResponse.json({
      success: true,
      data: {
        id: wordId,
        word_id: wordId,
        next_review: newCard.due.toISOString(),
        stability: newCard.stability,
        difficulty: newCard.difficulty,
        state: newCard.state,
        memory_strength: memoryStrength,
        scheduled_days: newCard.scheduled_days
      }
    })

  } catch (error) {
    console.error('Error in review API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}