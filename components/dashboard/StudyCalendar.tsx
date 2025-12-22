'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { 
  Calendar, ChevronLeft, ChevronRight, 
  Flame, CheckCircle, Target,
  TrendingUp
} from 'lucide-react'

interface StudyDay {
  date: string
  studyCount: number
  streak: boolean
  completed: boolean
  accuracy: number
}

interface StudyCalendarProps {
  userId: string
}

export default function StudyCalendar({ userId }: StudyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [studyData, setStudyData] = useState<StudyDay[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [monthStats, setMonthStats] = useState({
    totalDays: 0,
    studyDays: 0,
    totalWords: 0,
    avgAccuracy: 0,
    longestStreak: 0
  })

  // 生成日历数据
  useEffect(() => {
    const generateCalendarData = () => {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      const data: StudyDay[] = []
      
      let totalWords = 0
      let totalAccuracy = 0
      let studyDaysCount = 0
      let currentStreak = 0
      let longestStreak = 0

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day)
        const dateStr = date.toISOString().split('T')[0]
        
        // 模拟学习数据（基于真实数据 + 随机生成）
        const sessionData = localStorage.getItem(`wenya_study_session_${userId}_${dateStr}`)
        let studyCount = 0
        let accuracy = 0
        
        if (sessionData) {
          const session = JSON.parse(sessionData)
          studyCount = session.totalWords || 0
          accuracy = session.correctCount > 0 ? Math.round((session.correctCount / session.totalWords) * 100) : 0
        } else if (date < new Date() && Math.random() > 0.3) {
          // 为过去的日期生成一些模拟数据
          studyCount = Math.floor(Math.random() * 25) + 5
          accuracy = Math.floor(Math.random() * 30) + 70
        }

        const completed = studyCount >= 10
        const streak = completed && (currentStreak > 0 || day === 1)
        
        if (completed) {
          studyDaysCount++
          totalWords += studyCount
          totalAccuracy += accuracy
          currentStreak++
          longestStreak = Math.max(longestStreak, currentStreak)
        } else {
          currentStreak = 0
        }

        data.push({
          date: dateStr,
          studyCount,
          streak,
          completed,
          accuracy
        })
      }

      setStudyData(data)
      setMonthStats({
        totalDays: daysInMonth,
        studyDays: studyDaysCount,
        totalWords,
        avgAccuracy: studyDaysCount > 0 ? Math.round(totalAccuracy / studyDaysCount) : 0,
        longestStreak
      })
    }

    generateCalendarData()
  }, [currentDate, userId])

  const getDayColor = (day: StudyDay) => {
    if (!day.completed) return 'bg-cosmos-800/30'
    if (day.studyCount >= 30) return 'bg-sprout-500'
    if (day.studyCount >= 20) return 'bg-sprout-400'
    if (day.studyCount >= 10) return 'bg-sprout-300'
    return 'bg-sprout-200'
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
    setSelectedDate(null)
  }

  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ]

  const weekDays = ['日', '一', '二', '三', '四', '五', '六']

  // 获取月份第一天是星期几
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  
  // 生成日历网格
  const calendarDays: (StudyDay | null)[] = []
  
  // 添加空白天数
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null)
  }
  
  // 添加实际天数
  studyData.forEach((day) => {
    calendarDays.push(day)
  })

  const selectedDay = selectedDate ? studyData.find(d => d.date === selectedDate) : null

  return (
    <Card className="p-6 bg-gradient-to-br from-sprout-500/10 to-star-500/10 border-sprout-400/30">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-sprout-400 to-star-400 rounded-full flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">学习日历</h3>
            <p className="text-cosmos-300 text-sm">追踪每日学习足迹</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-1 hover:bg-cosmos-700 rounded text-cosmos-400 hover:text-white transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-white font-medium min-w-[80px] text-center">
            {currentDate.getFullYear()}年{monthNames[currentDate.getMonth()]}
          </span>
          <button
            onClick={() => navigateMonth('next')}
            className="p-1 hover:bg-cosmos-700 rounded text-cosmos-400 hover:text-white transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 月度统计 */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-cosmos-800/30 rounded-lg p-2 text-center">
          <div className="text-sprout-400 font-bold text-sm">{monthStats.studyDays}</div>
          <div className="text-cosmos-400 text-xs">学习天数</div>
        </div>
        <div className="bg-cosmos-800/30 rounded-lg p-2 text-center">
          <div className="text-star-400 font-bold text-sm">{monthStats.totalWords}</div>
          <div className="text-cosmos-400 text-xs">总单词</div>
        </div>
        <div className="bg-cosmos-800/30 rounded-lg p-2 text-center">
          <div className="text-orange-400 font-bold text-sm">{monthStats.avgAccuracy}%</div>
          <div className="text-cosmos-400 text-xs">平均准确率</div>
        </div>
        <div className="bg-cosmos-800/30 rounded-lg p-2 text-center">
          <div className="text-purple-400 font-bold text-sm">{monthStats.longestStreak}</div>
          <div className="text-cosmos-400 text-xs">最长连续</div>
        </div>
      </div>

      {/* 星期标题 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-cosmos-400 text-xs py-1">
            {day}
          </div>
        ))}
      </div>

      {/* 日历网格 */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`aspect-square flex items-center justify-center text-xs rounded cursor-pointer transition-all hover:scale-110 ${
              day 
                ? `${getDayColor(day)} text-white hover:ring-2 hover:ring-sprout-400 ${
                    selectedDate === day.date ? 'ring-2 ring-star-400' : ''
                  }`
                : 'bg-transparent'
            }`}
            onClick={() => day && setSelectedDate(day.date)}
            title={day ? `${day.date}: ${day.studyCount}个单词` : ''}
          >
            {day && (
              <div className="flex flex-col items-center">
                <span className="font-medium">
                  {new Date(day.date).getDate()}
                </span>
                {day.streak && (
                  <Flame className="w-2 h-2 text-orange-300 mt-0.5" />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 强度说明 */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-cosmos-400">学习强度</span>
        <div className="flex items-center gap-1">
          <span className="text-cosmos-500">少</span>
          {[0, 1, 2, 3, 4].map(level => (
            <div
              key={level}
              className={`w-2 h-2 rounded-sm ${
                level === 0 ? 'bg-cosmos-700' :
                level === 1 ? 'bg-sprout-200' :
                level === 2 ? 'bg-sprout-300' :
                level === 3 ? 'bg-sprout-400' : 'bg-sprout-500'
              }`}
            />
          ))}
          <span className="text-cosmos-500">多</span>
        </div>
      </div>

      {/* 选中日期详情 */}
      {selectedDay && (
        <div className="mt-4 p-3 bg-cosmos-800/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">
              {new Date(selectedDay.date).toLocaleDateString('zh-CN')}
            </span>
            {selectedDay.completed && (
              <CheckCircle className="w-4 h-4 text-sprout-400" />
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Target className="w-3 h-3 text-cyan-400" />
              <span className="text-cosmos-300">{selectedDay.studyCount} 个单词</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span className="text-cosmos-300">{selectedDay.accuracy}% 准确率</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}