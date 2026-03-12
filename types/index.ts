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

// ==================== 星币系统类型 ====================

// 星币交易类型
export type StarCoinTransactionType = 
  | 'register_bonus'      // 注册奖励
  | 'daily_checkin'       // 每日签到
  | 'holiday_checkin'     // 节日签到
  | 'purchase_course'     // 购买课程
  | 'recharge'            // 充值
  | 'refund'              // 退款
  | 'achievement_reward'  // 成就奖励
  | 'lesson_complete'     // 完成课程奖励

// 星币交易记录
export interface StarCoinTransaction {
  id: string
  userId: string
  type: StarCoinTransactionType
  amount: number          // 正数为收入，负数为支出
  balance: number         // 交易后余额
  description: string
  relatedId?: string      // 关联的课程ID或充值订单ID
  createdAt: Date
}

// 用户星币账户
export interface StarCoinAccount {
  userId: string
  balance: number
  totalEarned: number     // 累计获得
  totalSpent: number      // 累计消费
  lastCheckinDate?: string // 上次签到日期
  checkinStreak: number   // 连续签到天数
  transactions: StarCoinTransaction[]
  createdAt: Date
  updatedAt: Date
}

// 充值套餐
export interface RechargePackage {
  id: string
  name: string
  starCoins: number       // 星币数量
  price: number           // 价格（元）
  bonusCoins: number      // 赠送星币
  discount?: number       // 折扣百分比
  isPopular?: boolean     // 是否热门
  isLimited?: boolean     // 是否限时
}

// 充值订单
export interface RechargeOrder {
  id: string
  userId: string
  packageId: string
  starCoins: number
  bonusCoins: number
  totalCoins: number
  price: number
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  paymentMethod?: string
  createdAt: Date
  completedAt?: Date
}

// 商店课程（可购买的课程）
export interface StoreCourse {
  id: string
  title: string
  titleEn: string
  description: string
  level: EnglishLevel
  category: string
  price: number           // 星币价格
  originalPrice?: number  // 原价（用于显示折扣）
  duration: number        // 课程时长（分钟）
  lessonsCount: number    // 课时数量
  rating: number          // 评分 1-5
  studentsCount: number   // 学习人数
  coverImage?: string     // 封面图片
  tags: string[]          // 标签
  isFree?: boolean        // 是否免费
  isNew?: boolean         // 是否新课
  isHot?: boolean         // 是否热门
  instructor?: string     // 讲师
  createdAt: Date
}

// 用户已购课程
export interface PurchasedCourse {
  userId: string
  courseId: string
  purchaseDate: Date
  price: number
  progress: number        // 学习进度 0-100
  lastStudyDate?: Date
}

// 用户相关接口
export interface User {
  id: string
  username: string
  email: string
  level: EnglishLevel
  starCoins: number       // 星币余额
  starAchievements: StarAchievement[]
  learningPath: LearningPath
  purchasedCourses: string[] // 已购课程ID列表
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
  audioText?: string // 听力题的音频文本
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

// ==================== AI 功能新增类型 ====================

export interface AIStudyPlanItem {
  title: string
  action: string
  url: string
  reason?: string
}

export interface AIStudyPlan {
  title: string
  items: AIStudyPlanItem[]
}

export interface AIDiagnosis {
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  weekPlan: string[]
  dailyPlan: AIStudyPlan
}

export interface AIExplainItem {
  issue: string
  correction: string
  explanation: string
  example: string
}

export interface AIWritingReview {
  score: number
  issues: string[]
  corrections: Array<{ original: string; corrected: string; note: string }>
  improvedVersion: string
  advancedExpressions: string[]
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


// ==================== 星光殿堂社区类型 ====================

// 帖子类型
export type PostType = 'text' | 'image' | 'video' | 'file' | 'link'

// 附件类型
export interface PostAttachment {
  id: string
  type: 'image' | 'video' | 'file' | 'link'
  url: string
  name: string
  size?: number           // 文件大小（字节）
  thumbnail?: string      // 缩略图
  duration?: number       // 视频时长（秒）
}

// 社区帖子
export interface CommunityPost {
  id: string
  authorId: string
  authorName: string
  authorAvatar?: string
  authorLevel: EnglishLevel
  authorTitle?: string    // 用户称号
  content: string
  attachments: PostAttachment[]
  tags: string[]
  likes: string[]         // 点赞用户ID列表
  comments: PostComment[]
  shares: number          // 分享次数
  views: number           // 浏览次数
  isPinned?: boolean      // 是否置顶
  isHot?: boolean         // 是否热门
  createdAt: Date
  updatedAt: Date
}

// 帖子评论
export interface PostComment {
  id: string
  postId: string
  authorId: string
  authorName: string
  authorAvatar?: string
  content: string
  likes: string[]
  replyTo?: string        // 回复的评论ID
  replyToName?: string    // 回复的用户名
  createdAt: Date
}

// 好友关系
export interface Friendship {
  id: string
  userId: string
  friendId: string
  status: 'pending' | 'accepted' | 'blocked'
  createdAt: Date
  acceptedAt?: Date
}

// 社区用户资料
export interface CommunityProfile {
  userId: string
  username: string
  avatar?: string
  bio?: string            // 个人简介
  level: EnglishLevel
  title?: string          // 称号
  studyDays: number       // 学习天数
  postsCount: number      // 发帖数
  likesReceived: number   // 获赞数
  friendsCount: number    // 好友数
  isOnline: boolean
  lastActiveAt: Date
}

// 私信消息
export interface DirectMessage {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string
  receiverId: string
  content: string
  attachments?: PostAttachment[]
  isRead: boolean
  createdAt: Date
}

// 聊天会话
export interface ChatConversation {
  id: string
  participantIds: string[]
  lastMessage?: DirectMessage
  unreadCount: number
  updatedAt: Date
}

// 通知类型
export type NotificationType = 
  | 'like_post'
  | 'comment_post'
  | 'reply_comment'
  | 'friend_request'
  | 'friend_accepted'
  | 'share_post'
  | 'mention'

// 通知
export interface CommunityNotification {
  id: string
  userId: string
  type: NotificationType
  fromUserId: string
  fromUserName: string
  relatedPostId?: string
  relatedCommentId?: string
  content: string
  isRead: boolean
  createdAt: Date
}


// ==================== 单词学习系统类型 ====================

// 单词数据
export interface Word {
  id: string
  word: string              // 英文单词
  meaning: string           // 中文释义
  phonetic: string          // 音标
  example: string           // 例句
  exampleCn: string         // 例句翻译
  chunk?: string            // 高亮短语
  confusingWords?: string[] // 易混词
  tags: string[]            // 标签 (CET4, CET6, IELTS等)
  audioUrl?: string         // 发音音频
}

// 用户单词学习记录
export interface UserWord {
  userId: string
  wordId: string
  nextReviewTime: Date      // 下次复习时间
  interval: number          // 复习间隔（天）
  quality: number           // 上次掌握度 (0-2)
  easeFactor: number        // 难度因子
  repetitions: number       // 复习次数
  createdAt: Date
  updatedAt: Date
}

// 复习质量
export type ReviewQuality = 0 | 1 | 2  // 0:不认识, 1:模糊, 2:认识

// 学习会话统计
export interface StudySession {
  userId: string
  date: string              // YYYY-MM-DD
  totalWords: number        // 今日学习总数
  newWords: number          // 新学单词数
  reviewedWords: number     // 复习单词数
  correctCount: number      // 正确数
  wrongCount: number        // 错误数
  studyTime: number         // 学习时长（秒）
}

// 单词学习进度
export interface WordProgress {
  todayTotal: number        // 今日待学习总数
  todayCompleted: number    // 今日已完成
  todayNew: number          // 今日新词
  todayReview: number       // 今日复习
  streak: number            // 连续学习天数
  totalMastered: number     // 已掌握总数
}


// ==================== 记忆驾驶舱 (Memory Dashboard) 类型 ====================

// 单词记录状态
export type WordRecordStatus = 'new' | 'learning' | 'review' | 'mastered'

// 单词学习记录（FSRS算法核心数据模型）
export interface WordRecord {
  id: string
  userId: string
  wordId: string
  
  // 记忆状态
  status: WordRecordStatus
  stability: number         // 记忆稳定性（天）
  difficulty: number        // 单词难度 0-1
  retrievability: number    // 当前可提取概率 0-1
  
  // 时间戳
  nextReviewDate: Date
  lastReviewDate: Date
  createdAt: Date
  
  // 统计
  reviewCount: number
  correctCount: number
  lapseCount: number        // 遗忘次数
}

// 学习会话记录（用于专注度分析）
export interface MemoryStudySession {
  id: string
  userId: string
  wordId: string
  
  // 会话数据
  startTime: Date
  endTime: Date
  grade: 1 | 2 | 3 | 4     // 1=完全忘记, 2=困难, 3=良好, 4=轻松
  responseTime: number      // 毫秒
  
  // 上下文
  hour: number              // 0-23，用于专注度分析
  deviceType: 'mobile' | 'desktop'
}
