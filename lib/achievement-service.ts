// 成就系统服务

import { 
  StarAchievement, 
  AchievementType,
  EnglishLevel 
} from '@/types'

/**
 * 成就配置接口
 */
export interface AchievementConfig {
  type: AchievementType
  title: string
  description: string
  icon: string
  condition: (data: any) => boolean
}

/**
 * 成就服务类
 */
export class AchievementService {
  private achievements: Map<AchievementType, AchievementConfig>

  constructor() {
    this.achievements = new Map()
    this.initializeAchievements()
  }

  /**
   * 初始化成就配置
   */
  private initializeAchievements() {
    const configs: AchievementConfig[] = [
      {
        type: 'first_lesson',
        title: '初次绽放',
        description: '完成第一节课程',
        icon: '🌱',
        condition: (data) => data.lessonsCompleted === 1
      },
      {
        type: 'daily_streak',
        title: '坚持之星',
        description: '连续学习7天',
        icon: '⭐',
        condition: (data) => data.currentStreak >= 7
      },
      {
        type: 'perfect_score',
        title: '完美答题',
        description: '练习全部答对',
        icon: '💯',
        condition: (data) => data.accuracy === 1.0
      },
      {
        type: 'vocabulary_master',
        title: '词汇大师',
        description: '掌握100个新单词',
        icon: '📚',
        condition: (data) => data.vocabularyCount >= 100
      },
      {
        type: 'grammar_expert',
        title: '语法专家',
        description: '语法练习获得90分以上',
        icon: '✍️',
        condition: (data) => data.score >= 90
      },
      {
        type: 'listening_champion',
        title: '听力冠军',
        description: '听力练习表现优秀',
        icon: '👂',
        condition: (data) => data.listeningAccuracy >= 0.8
      },
      {
        type: 'speaking_star',
        title: '口语之星',
        description: '口语练习表现出色',
        icon: '🗣️',
        condition: (data) => data.speakingScore >= 85
      }
    ]

    configs.forEach(config => {
      this.achievements.set(config.type, config)
    })
  }

  /**
   * 检查并授予成就
   */
  checkAchievements(
    userId: string,
    data: any,
    existingAchievements: StarAchievement[]
  ): StarAchievement[] {
    const newAchievements: StarAchievement[] = []
    const existingTypes = new Set(existingAchievements.map(a => a.type))

    this.achievements.forEach((config, type) => {
      // 如果已经获得该成就，跳过
      if (existingTypes.has(type)) return

      // 检查是否满足条件
      if (config.condition(data)) {
        newAchievements.push(this.createAchievement(userId, config))
      }
    })

    return newAchievements
  }

  /**
   * 创建成就
   */
  private createAchievement(
    userId: string,
    config: AchievementConfig
  ): StarAchievement {
    return {
      id: `achievement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: config.type,
      title: config.title,
      description: config.description,
      earnedAt: new Date(),
      starPosition: this.generateStarPosition(),
      metadata: {
        icon: config.icon
      }
    }
  }

  /**
   * 生成星星位置（在星图中）
   */
  private generateStarPosition(): { x: number; y: number } {
    // 生成随机但美观的星星位置
    // 避免边缘和重叠
    const margin = 10
    const x = margin + Math.random() * (100 - 2 * margin)
    const y = margin + Math.random() * (100 - 2 * margin)
    
    return { x, y }
  }

  /**
   * 获取成就配置
   */
  getAchievementConfig(type: AchievementType): AchievementConfig | undefined {
    return this.achievements.get(type)
  }

  /**
   * 获取所有成就配置
   */
  getAllAchievementConfigs(): AchievementConfig[] {
    return Array.from(this.achievements.values())
  }

  /**
   * 计算成就进度
   */
  calculateProgress(
    userAchievements: StarAchievement[]
  ): number {
    const totalAchievements = this.achievements.size
    const earnedAchievements = userAchievements.length
    
    return totalAchievements > 0 
      ? (earnedAchievements / totalAchievements) * 100 
      : 0
  }

  /**
   * 获取下一个可获得的成就
   */
  getNextAchievements(
    existingAchievements: StarAchievement[],
    limit: number = 3
  ): AchievementConfig[] {
    const existingTypes = new Set(existingAchievements.map(a => a.type))
    const nextAchievements: AchievementConfig[] = []

    this.achievements.forEach((config, type) => {
      if (!existingTypes.has(type) && nextAchievements.length < limit) {
        nextAchievements.push(config)
      }
    })

    return nextAchievements
  }
}

/**
 * 创建成就服务实例
 */
export function createAchievementService(): AchievementService {
  return new AchievementService()
}

/**
 * 默认成就服务实例
 */
export const achievementService = createAchievementService()
