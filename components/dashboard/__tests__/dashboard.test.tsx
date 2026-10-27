import React from 'react'
import { act, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ProgressCard } from '../ProgressCard'
import { StatsCard } from '../StatsCard'
import { StarMap } from '../StarMap'
import { GrowthAnimation } from '../GrowthAnimation'
import { RecommendedLessons } from '../RecommendedLessons'
import { EnglishLevel, LearningStats, StarAchievement, Lesson } from '@/types'

describe('Dashboard Components', () => {
  describe('ProgressCard', () => {
    it('renders progress information correctly', () => {
      render(
        <ProgressCard
          currentLevel="beginner"
          targetLevel="intermediate"
          progress={35}
          completedLessons={5}
          totalLessons={15}
        />
      )

      expect(screen.getByText('学习进度')).toBeInTheDocument()
      expect(screen.getByText('35%')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument()
    })
  })

  describe('StatsCard', () => {
    it('renders learning statistics correctly', () => {
      const mockStats: LearningStats = {
        totalStudyTime: 7200,
        lessonsCompleted: 8,
        exercisesCompleted: 45,
        averageScore: 87,
        currentStreak: 5,
        totalAchievements: 5,
        levelProgress: 35
      }

      render(<StatsCard stats={mockStats} />)

      expect(screen.getByText('学习统计')).toBeInTheDocument()
      expect(screen.getByText('2小时0分钟')).toBeInTheDocument()
      expect(screen.getByText('8')).toBeInTheDocument()
      expect(screen.getByText('45')).toBeInTheDocument()
      expect(screen.getByText('87分')).toBeInTheDocument()
      expect(screen.getByText('5天')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
    })
  })

  describe('StarMap', () => {
    it('renders star map with achievements', () => {
      const mockAchievements: StarAchievement[] = [
        {
          id: 'ach-1',
          userId: 'user-1',
          type: 'first_lesson',
          title: '初次启程',
          description: '完成第一节课程',
          earnedAt: new Date(),
          starPosition: { x: 100, y: 100 }
        }
      ]

      render(<StarMap achievements={mockAchievements} />)

      expect(screen.getByText('语言星图')).toBeInTheDocument()
      expect(screen.getByText(/0\s*已点亮\s*·\s*3\s*待点亮/)).toBeInTheDocument()
    })
  })

  describe('GrowthAnimation', () => {
    it('does not render when not visible', () => {
      const { container } = render(
        <GrowthAnimation isVisible={false} />
      )

      expect(container.firstChild).toBeNull()
    })

    it('renders when visible', () => {
      jest.useFakeTimers()

      render(
        <GrowthAnimation isVisible={true} achievementTitle="测试成就" />
      )

      act(() => {
        jest.advanceTimersByTime(1500)
      })

      // Animation should be visible
      expect(screen.getByText('测试成就')).toBeInTheDocument()

      jest.useRealTimers()
    })
  })

  describe('RecommendedLessons', () => {
    it('renders recommended lessons list', () => {
      const mockLessons: Lesson[] = [
        {
          id: 'lesson-1',
          title: '基础问候语',
          description: '学习日常问候',
          level: 'beginner' as EnglishLevel,
          category: 'speaking',
          content: { type: 'text', data: 'content' },
          exercises: [],
          estimatedTime: 15,
          order: 1,
          isActive: true,
          createdAt: new Date()
        }
      ]

      render(<RecommendedLessons lessons={mockLessons} />)

      expect(screen.getByText('推荐课程')).toBeInTheDocument()
      expect(screen.getByText('基础问候语')).toBeInTheDocument()
      expect(screen.getByText('学习日常问候')).toBeInTheDocument()
      expect(screen.getByText('15分钟')).toBeInTheDocument()
    })

    it('shows empty state when no lessons', () => {
      render(<RecommendedLessons lessons={[]} />)

      expect(screen.getByText('暂无推荐课程')).toBeInTheDocument()
    })
  })
})
