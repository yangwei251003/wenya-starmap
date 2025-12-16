/**
 * 进度追踪系统集成测试
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useProgressTracking } from '@/hooks/useProgressTracking'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { ProgressChart } from '@/components/dashboard/ProgressChart'
import { ProgressAnalysis } from '@/components/dashboard/ProgressAnalysis'
import { AchievementShare } from '@/components/dashboard/AchievementShare'
import { StarAchievement } from '@/types'

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    g: ({ children, ...props }: any) => <g {...props}>{children}</g>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}))

describe('Progress Tracking Integration', () => {
  describe('useProgressTracking Hook', () => {
    it('should provide all necessary data', () => {
      let hookResult: any

      function TestComponent() {
        hookResult = useProgressTracking('test-user')
        return null
      }

      render(<TestComponent />)

      expect(hookResult.stats).toBeDefined()
      expect(hookResult.trends).toBeDefined()
      expect(hookResult.analysis).toBeDefined()
      expect(hookResult.isLoading).toBeDefined()
      expect(hookResult.error).toBeDefined()
      expect(hookResult.refreshData).toBeDefined()
    })
  })

  describe('StatsCard with real data', () => {
    it('should display statistics correctly', () => {
      const mockStats = {
        totalStudyTime: 7200,
        lessonsCompleted: 10,
        exercisesCompleted: 50,
        averageScore: 85,
        currentStreak: 5,
        totalAchievements: 3,
        levelProgress: 45
      }

      render(<StatsCard stats={mockStats} />)

      expect(screen.getByText('学习统计')).toBeInTheDocument()
      expect(screen.getByText('2小时0分钟')).toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument()
      expect(screen.getByText('50')).toBeInTheDocument()
      expect(screen.getByText('85分')).toBeInTheDocument()
      expect(screen.getByText('5天')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })
  })

  describe('ProgressChart', () => {
    it('should render chart with trends data', () => {
      const mockTrends = [
        { date: '2024-01-01', studyTime: 1800, lessonsCompleted: 2, averageScore: 85 },
        { date: '2024-01-02', studyTime: 2400, lessonsCompleted: 3, averageScore: 90 },
        { date: '2024-01-03', studyTime: 3000, lessonsCompleted: 4, averageScore: 88 }
      ]

      render(<ProgressChart trends={mockTrends} type="studyTime" />)

      expect(screen.getByText('学习时长趋势')).toBeInTheDocument()
    })

    it('should render different chart types', () => {
      const mockTrends = [
        { date: '2024-01-01', studyTime: 1800, lessonsCompleted: 2, averageScore: 85 }
      ]

      const { rerender } = render(<ProgressChart trends={mockTrends} type="studyTime" />)
      expect(screen.getByText('学习时长趋势')).toBeInTheDocument()

      rerender(<ProgressChart trends={mockTrends} type="lessons" />)
      expect(screen.getByText('完成课程趋势')).toBeInTheDocument()

      rerender(<ProgressChart trends={mockTrends} type="score" />)
      expect(screen.getByText('平均分数趋势')).toBeInTheDocument()
    })
  })

  describe('ProgressAnalysis', () => {
    it('should display analysis with strengths and recommendations', () => {
      const mockAnalysis = {
        stats: {
          totalStudyTime: 7200,
          lessonsCompleted: 10,
          exercisesCompleted: 50,
          averageScore: 85,
          currentStreak: 5,
          totalAchievements: 3,
          levelProgress: 45
        },
        trends: [],
        strengths: ['整体表现优秀', '学习效率高'],
        weaknesses: [],
        recommendations: ['继续保持当前的学习节奏', '尝试挑战新的学习内容']
      }

      render(<ProgressAnalysis analysis={mockAnalysis} />)

      expect(screen.getByText('学习分析')).toBeInTheDocument()
      expect(screen.getByText('你的优势')).toBeInTheDocument()
      expect(screen.getByText('整体表现优秀')).toBeInTheDocument()
      expect(screen.getByText('学习效率高')).toBeInTheDocument()
      expect(screen.getByText('学习建议')).toBeInTheDocument()
      expect(screen.getByText('继续保持当前的学习节奏')).toBeInTheDocument()
    })

    it('should display weaknesses when present', () => {
      const mockAnalysis = {
        stats: {
          totalStudyTime: 3600,
          lessonsCompleted: 5,
          exercisesCompleted: 20,
          averageScore: 55,
          currentStreak: 1,
          totalAchievements: 1,
          levelProgress: 20
        },
        trends: [],
        strengths: [],
        weaknesses: ['需要加强基础知识', '学习表现波动较大'],
        recommendations: ['建议复习已学内容，巩固基础知识']
      }

      render(<ProgressAnalysis analysis={mockAnalysis} />)

      expect(screen.getByText('待改进')).toBeInTheDocument()
      expect(screen.getByText('需要加强基础知识')).toBeInTheDocument()
      expect(screen.getByText('学习表现波动较大')).toBeInTheDocument()
    })

    it('should show empty state when no data', () => {
      const mockAnalysis = {
        stats: {
          totalStudyTime: 0,
          lessonsCompleted: 0,
          exercisesCompleted: 0,
          averageScore: 0,
          currentStreak: 0,
          totalAchievements: 0,
          levelProgress: 0
        },
        trends: [],
        strengths: [],
        weaknesses: [],
        recommendations: []
      }

      render(<ProgressAnalysis analysis={mockAnalysis} />)

      expect(screen.getByText('继续学习以获取分析')).toBeInTheDocument()
    })
  })

  describe('AchievementShare', () => {
    const mockAchievement: StarAchievement = {
      id: 'ach-1',
      userId: 'user-1',
      type: 'first_lesson',
      title: '初次启程',
      description: '完成第一节课程',
      earnedAt: new Date('2024-01-01'),
      starPosition: { x: 100, y: 200 },
      metadata: { icon: '🌱' }
    }

    it('should render when open', () => {
      const onClose = jest.fn()

      render(
        <AchievementShare
          achievement={mockAchievement}
          isOpen={true}
          onClose={onClose}
        />
      )

      expect(screen.getByText('分享成就')).toBeInTheDocument()
      expect(screen.getByText('初次启程')).toBeInTheDocument()
      expect(screen.getByText('完成第一节课程')).toBeInTheDocument()
    })

    it('should not render when closed', () => {
      const onClose = jest.fn()

      render(
        <AchievementShare
          achievement={mockAchievement}
          isOpen={false}
          onClose={onClose}
        />
      )

      expect(screen.queryByText('分享成就')).not.toBeInTheDocument()
    })

    it('should call onClose when close button clicked', () => {
      const onClose = jest.fn()

      render(
        <AchievementShare
          achievement={mockAchievement}
          isOpen={true}
          onClose={onClose}
        />
      )

      const closeButton = screen.getByText('关闭')
      fireEvent.click(closeButton)

      expect(onClose).toHaveBeenCalled()
    })

    it('should have copy and download buttons', () => {
      const onClose = jest.fn()

      render(
        <AchievementShare
          achievement={mockAchievement}
          isOpen={true}
          onClose={onClose}
        />
      )

      expect(screen.getByText(/复制分享文本/)).toBeInTheDocument()
      expect(screen.getByText(/下载分享图片/)).toBeInTheDocument()
    })
  })

  describe('Full Integration Flow', () => {
    it('should work together in a complete dashboard', () => {
      function CompleteDashboard() {
        const { stats, trends, analysis } = useProgressTracking('test-user')

        if (!stats || !analysis) return <div>Loading...</div>

        return (
          <div>
            <StatsCard stats={stats} />
            <ProgressChart trends={trends} type="studyTime" />
            <ProgressAnalysis analysis={analysis} />
          </div>
        )
      }

      render(<CompleteDashboard />)

      // Should eventually show the dashboard components
      waitFor(() => {
        expect(screen.getByText('学习统计')).toBeInTheDocument()
      })
    })
  })
})
