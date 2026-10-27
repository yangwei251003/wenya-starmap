/**
 * 演示图表数据生成器
 * 为成长星图提供模拟数据，确保图表正常显示
 */

export const generateDemoMemoryData = () => {
  const words = ['abandon', 'ability', 'absence', 'absolute', 'absorb', 'abstract', 'academic', 'accept', 'access', 'accident']
  
  return words.map((word, index) => ({
    word: word.substring(0, 6) + '...',
    retention: Math.max(20, 100 - index * 8 + Math.random() * 15),
    difficulty: Math.random() > 0.7 ? 80 : Math.random() > 0.4 ? 50 : 20,
    nextReview: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
  }))
}

export const generateDemoVocabularyData = () => {
  const data = []
  let mastered = 0
  let learning = 0
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    // 模拟学习进度
    const dailyMastered = Math.floor(Math.random() * 3) + 1
    const dailyLearning = Math.floor(Math.random() * 5) + 2
    
    mastered += dailyMastered
    learning += dailyLearning
    
    data.push({
      date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      mastered: mastered,
      learning: learning,
      total: mastered + learning
    })
  }
  
  return data
}

export const generateDemoHeatmapData = () => {
  const data = []
  
  for (let i = 364; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    // 模拟学习活动，周末活动较少
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    const baseActivity = isWeekend ? 0.3 : 0.7
    
    let count = 0
    if (Math.random() < baseActivity) {
      count = Math.floor(Math.random() * 25) + 1
    }
    
    let level = 0
    if (count > 0) level = 1
    if (count > 5) level = 2
    if (count > 10) level = 3
    if (count > 20) level = 4
    
    data.push({
      date: dateStr,
      count,
      level
    })
  }
  
  return data
}