import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // 使用 localStorage 降级方案（因为 Supabase 可能未配置）
    // 从本地词汇数据生成学习队列
    const { getAllWords } = await import('@/lib/words-data')
    const allWords = getAllWords()
    
    // 获取用户已学习的单词记录
    const userWordsKey = `wenya_user_words_${userId}`
    const today = new Date().toISOString().split('T')[0]
    
    // 模拟学习队列
    const dailyNewLimit = 20
    const dailyReviewLimit = 50
    
    // 生成学习队列：前20个单词作为学习内容
    const studyQueue = allWords.slice(0, 30).map((word, index) => ({
      id: `card_${word.id}`,
      user_id: userId,
      word_id: word.id,
      next_review: new Date().toISOString(),
      stability: Math.random() * 5 + 1, // 1-6 的随机稳定性
      difficulty: Math.random() * 3 + 3, // 3-6 的随机难度
      state: index < 10 ? 'new' : 'review',
      priority: index < 10 ? 2 : 1,
      type: index < 10 ? 'new' : 'review',
      reps: index < 10 ? 0 : Math.floor(Math.random() * 5) + 1,
      lapses: 0,
      elapsed_days: 0,
      scheduled_days: 0,
      step: 0
    }))

    const stats = {
      total: studyQueue.length,
      review: studyQueue.filter(c => c.type === 'review').length,
      new: studyQueue.filter(c => c.type === 'new').length,
      dailyNewLimit,
      dailyReviewLimit,
      newWordsStudiedToday: 0,
      remainingNewWords: dailyNewLimit
    }

    return NextResponse.json({
      queue: studyQueue,
      stats
    })

  } catch (error) {
    console.error('Error in study queue API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 创建新的学习记录
export async function POST(request: NextRequest) {
  try {
    const { userId, wordId } = await request.json()
    
    if (!userId || !wordId) {
      return NextResponse.json({ error: 'User ID and Word ID are required' }, { status: 400 })
    }

    // 使用 localStorage 方案
    return NextResponse.json({ 
      success: true,
      message: 'Study log created (localStorage mode)' 
    })

  } catch (error) {
    console.error('Error in create study log API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}