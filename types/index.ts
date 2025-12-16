// 基础类型定义

export type EnglishLevel = 'beginner' | 'intermediate' | 'advanced'

export type AchievementType = 
  | 'first_lesson'
  | 'daily_streak'
  | 'perfect_score'
  | 'vocabulary_master'
  | 'grammar_expert'
  | 'listening_champion'
  | 'speaking_star'

// 用户相关接口
export interface User {
  id: string
  username: string
  email: string
  level: EnglishLevel
  starAchievements: StarAchievement[]
  learningPath: LearningPath
  createdAt: Date
  updatedAt: Date
}

// 学习路径接口
export interface LearningPath {
  id: string
  userId: string
  currentLevel: EnglishLevel
  targetLevel: EnglishLevel
  completedLessons: string[]
  recommendedNext: Lesson[]
  progress: number // 0-100
  createdAt: Date
  updatedAt: Date
}

// 星辰成就接口
export interface StarAchievement {
  id: string
  userId: string
  type: AchievementType
  title: string
  description: string
  earnedAt: Date
  starPosition: { x: number; y: number } // 星图中的位置
  metadata?: Record<string, any>
}

// 课程接口
export interface Lesson {
  id: string
  title: string
  description: string
  level: EnglishLevel
  category: string
  content: LessonContent
  exercises: Exercise[]
  estimatedTime: number // 分钟
  order: number
  isActive: boolean
  createdAt: Date
}

// 课程内容接口
export interface LessonContent {
  type: 'text' | 'audio' | 'video' | 'interactive'
  data: string | object
  resources?: string[]
}

// 练习接口
export interface Exercise {
  id: string
  lessonId?: string
  type: ExerciseType
  question: string
  options?: string[] // 选择题选项
  correctAnswer: string
  explanation: string
  difficulty: number // 1-5
  timeLimit?: number // 秒
}

export type ExerciseType = 
  | 'multiple_choice'
  | 'fill_blank'
  | 'speaking'
  | 'listening'
  | 'reading_comprehension'
  | 'writing'

// 学习进度接口
export interface Progress {
  id: string
  userId: string
  lessonId: string
  status: 'not_started' | 'in_progress' | 'completed'
  score?: number
  timeSpent: number // 秒
  completedAt?: Date
  createdAt: Date
}

// AI导师接口
export interface AITutor {
  generateContent(prompt: string, userLevel: EnglishLevel): Promise<string>
  evaluateAnswer(question: string, answer: string): Promise<Evaluation>
  provideFeedback(performance: UserPerformance): Promise<Feedback>
}

// 评估结果接口
export interface Evaluation {
  isCorrect: boolean
  score: number // 0-100
  feedback: string
  suggestions?: string[]
  nextRecommendation?: string
}

// 用户表现接口
export interface UserPerformance {
  userId: string
  lessonId?: string
  exerciseId?: string
  answers: Answer[]
  timeSpent: number
  accuracy: number
}

// 答案接口
export interface Answer {
  exerciseId: string
  userAnswer: string
  isCorrect: boolean
  timeSpent: number
}

// 反馈接口
export interface Feedback {
  message: string
  encouragement: string
  areas_to_improve: string[]
  next_steps: string[]
  estimated_progress: number
}

// API响应接口
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  timestamp: string
}

// 错误接口
export interface APIError {
  code: string
  message: string
  details?: any
}

// 学习会话接口
export interface LearningSession {
  id: string
  userId: string
  startTime: Date
  endTime?: Date
  lessonsCompleted: string[]
  exercisesCompleted: string[]
  totalScore: number
  timeSpent: number
  achievements: string[]
}

// 统计数据接口
export interface LearningStats {
  totalStudyTime: number // 秒
  lessonsCompleted: number
  exercisesCompleted: number
  averageScore: number
  currentStreak: number // 连续学习天数
  totalAchievements: number
  levelProgress: number // 当前等级进度 0-100
}

// 主题配置接口
export interface ThemeConfig {
  sproutColors: {
    primary: string
    secondary: string
    accent: string
  }
  starColors: {
    primary: string
    secondary: string
    accent: string
  }
  cosmosColors: {
    background: string
    surface: string
    text: string
  }
}