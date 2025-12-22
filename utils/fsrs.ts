/**
 * FSRS (Free Spaced Repetition Scheduler) Algorithm Implementation
 * 基于科学研究的间隔重复算法，支持4个评级系统
 */

export enum Rating {
  Again = 1,  // 忘记了
  Hard = 2,   // 困难
  Good = 3,   // 良好
  Easy = 4    // 简单
}

export enum State {
  New = 0,        // 新卡片
  Learning = 1,   // 学习中
  Review = 2,     // 复习中
  Relearning = 3  // 重新学习
}

export interface Card {
  id: string
  due: Date
  stability: number
  difficulty: number
  elapsed_days: number
  scheduled_days: number
  reps: number
  lapses: number
  state: State
  last_review?: Date
}

export interface ReviewLog {
  rating: Rating
  elapsed_days: number
  scheduled_days: number
  review: Date
  state: State
}

export interface SchedulingInfo {
  card: Card
  review_log: ReviewLog
}

export interface SchedulingCards {
  again: SchedulingInfo
  hard: SchedulingInfo
  good: SchedulingInfo
  easy: SchedulingInfo
}

// FSRS 参数配置
export class FSRSParameters {
  // 请求保留率 (desired retention rate)
  request_retention: number = 0.9
  
  // 最大间隔天数
  maximum_interval: number = 36500
  
  // 学习步骤 (分钟)
  learning_steps: number[] = [1, 10]
  
  // 重新学习步骤 (分钟)
  relearning_steps: number[] = [10]
  
  // 初始难度
  initial_difficulty: number = 4.0
  
  // 难度衰减因子
  difficulty_decay: number = -0.5
  
  // 稳定性增长因子
  stability_factor: number = 1.0
  
  // FSRS 权重参数 (基于研究优化的17个参数)
  w: number[] = [
    0.4072, 1.1829, 3.1262, 15.4722, 7.2102,
    0.5316, 1.0651, 0.0234, 1.616, 0.1544,
    1.0824, 1.9813, 0.0953, 0.2975, 2.2042,
    0.2407, 2.9466
  ]
}

export class FSRS {
  private p: FSRSParameters

  constructor(parameters?: Partial<FSRSParameters>) {
    this.p = { ...new FSRSParameters(), ...parameters }
  }

  /**
   * 计算记忆可提取性 (Retrievability)
   * R(t,S) = (1 + FACTOR * t / S) ^ DECAY
   */
  private calculateRetrievability(elapsed_days: number, stability: number): number {
    const FACTOR = 19 / 81 // 基于研究的常数
    const DECAY = -8 / 9   // 基于研究的常数
    
    if (stability <= 0) return 0
    return Math.pow(1 + FACTOR * elapsed_days / stability, DECAY)
  }

  /**
   * 计算初始稳定性
   */
  private initStability(rating: Rating): number {
    return Math.max(this.p.w[rating - 1], 0.1)
  }

  /**
   * 计算初始难度
   */
  private initDifficulty(rating: Rating): number {
    const difficulty = this.p.w[4] - Math.exp(this.p.w[5] * (rating - 1)) + 1
    return Math.min(Math.max(difficulty, 1), 10)
  }

  /**
   * 计算下次间隔
   */
  private nextInterval(stability: number): number {
    const interval = stability * (Math.log(this.p.request_retention) / Math.log(0.9))
    return Math.min(Math.max(Math.round(interval), 1), this.p.maximum_interval)
  }

  /**
   * 计算复习后的稳定性
   */
  private nextStability(
    difficulty: number,
    stability: number,
    retrievability: number,
    rating: Rating,
    state: State
  ): number {
    let hard_penalty = 1
    let easy_bonus = 1

    if (rating === Rating.Hard) {
      hard_penalty = this.p.w[15]
    } else if (rating === Rating.Easy) {
      easy_bonus = this.p.w[16]
    }

    if (state === State.Review) {
      const success_rate = Math.exp(this.p.w[8] * (rating - 3))
      const difficulty_factor = Math.exp(this.p.w[9] * (1 - difficulty))
      const retrievability_factor = Math.exp(this.p.w[10] * (1 - retrievability))
      
      return stability * (1 + success_rate * difficulty_factor * retrievability_factor * hard_penalty * easy_bonus)
    } else {
      return this.initStability(rating)
    }
  }

  /**
   * 计算复习后的难度
   */
  private nextDifficulty(difficulty: number, rating: Rating): number {
    const delta = this.p.w[6] * (rating - 3)
    const difficulty_change = Math.exp(delta) * (11 - difficulty) * this.p.w[7]
    const next_difficulty = difficulty + difficulty_change
    
    return Math.min(Math.max(next_difficulty, 1), 10)
  }

  /**
   * 计算遗忘后的稳定性
   */
  private nextForgetStability(
    difficulty: number,
    stability: number,
    retrievability: number
  ): number {
    return this.p.w[11] * Math.pow(difficulty, -this.p.w[12]) * 
           (Math.pow(stability + 1, this.p.w[13]) - 1) * 
           Math.exp((1 - retrievability) * this.p.w[14])
  }

  /**
   * 创建新卡片
   */
  createEmptyCard(now: Date = new Date()): Card {
    return {
      id: '',
      due: now,
      stability: 0,
      difficulty: 0,
      elapsed_days: 0,
      scheduled_days: 0,
      reps: 0,
      lapses: 0,
      state: State.New,
      last_review: undefined
    }
  }

  /**
   * 计算所有可能的调度选项
   */
  repeat(card: Card, now: Date): SchedulingCards {
    if (card.state === State.New) {
      return this.repeatNew(card, now)
    } else {
      return this.repeatReview(card, now)
    }
  }

  /**
   * 处理新卡片的调度
   */
  private repeatNew(card: Card, now: Date): SchedulingCards {
    const again_card = { ...card }
    const hard_card = { ...card }
    const good_card = { ...card }
    const easy_card = { ...card }

    // Again: 进入学习状态，1分钟后复习
    again_card.state = State.Learning
    again_card.due = new Date(now.getTime() + this.p.learning_steps[0] * 60 * 1000)
    again_card.stability = this.initStability(Rating.Again)
    again_card.difficulty = this.initDifficulty(Rating.Again)

    // Hard: 进入学习状态，10分钟后复习
    hard_card.state = State.Learning
    hard_card.due = new Date(now.getTime() + this.p.learning_steps[1] * 60 * 1000)
    hard_card.stability = this.initStability(Rating.Hard)
    hard_card.difficulty = this.initDifficulty(Rating.Hard)

    // Good: 直接进入复习状态
    good_card.state = State.Review
    good_card.stability = this.initStability(Rating.Good)
    good_card.difficulty = this.initDifficulty(Rating.Good)
    good_card.scheduled_days = this.nextInterval(good_card.stability)
    good_card.due = new Date(now.getTime() + good_card.scheduled_days * 24 * 60 * 60 * 1000)
    good_card.reps = 1

    // Easy: 直接进入复习状态，更长间隔
    easy_card.state = State.Review
    easy_card.stability = this.initStability(Rating.Easy)
    easy_card.difficulty = this.initDifficulty(Rating.Easy)
    easy_card.scheduled_days = this.nextInterval(easy_card.stability)
    easy_card.due = new Date(now.getTime() + easy_card.scheduled_days * 24 * 60 * 60 * 1000)
    easy_card.reps = 1

    return {
      again: { card: again_card, review_log: this.createReviewLog(card, Rating.Again, now) },
      hard: { card: hard_card, review_log: this.createReviewLog(card, Rating.Hard, now) },
      good: { card: good_card, review_log: this.createReviewLog(card, Rating.Good, now) },
      easy: { card: easy_card, review_log: this.createReviewLog(card, Rating.Easy, now) }
    }
  }

  /**
   * 处理复习卡片的调度
   */
  private repeatReview(card: Card, now: Date): SchedulingCards {
    const elapsed_days = card.last_review 
      ? Math.max(0, (now.getTime() - card.last_review.getTime()) / (24 * 60 * 60 * 1000))
      : 0
    
    const retrievability = this.calculateRetrievability(elapsed_days, card.stability)

    const again_card = { ...card }
    const hard_card = { ...card }
    const good_card = { ...card }
    const easy_card = { ...card }

    // Again: 进入重新学习状态
    again_card.state = State.Relearning
    again_card.due = new Date(now.getTime() + this.p.relearning_steps[0] * 60 * 1000)
    again_card.stability = this.nextForgetStability(card.difficulty, card.stability, retrievability)
    again_card.difficulty = this.nextDifficulty(card.difficulty, Rating.Again)
    again_card.lapses += 1

    // Hard: 缩短间隔
    hard_card.stability = this.nextStability(card.difficulty, card.stability, retrievability, Rating.Hard, card.state)
    hard_card.difficulty = this.nextDifficulty(card.difficulty, Rating.Hard)
    hard_card.scheduled_days = Math.max(1, Math.round(this.nextInterval(hard_card.stability) * 1.2))
    hard_card.due = new Date(now.getTime() + hard_card.scheduled_days * 24 * 60 * 60 * 1000)
    hard_card.reps += 1

    // Good: 正常间隔
    good_card.stability = this.nextStability(card.difficulty, card.stability, retrievability, Rating.Good, card.state)
    good_card.difficulty = this.nextDifficulty(card.difficulty, Rating.Good)
    good_card.scheduled_days = this.nextInterval(good_card.stability)
    good_card.due = new Date(now.getTime() + good_card.scheduled_days * 24 * 60 * 60 * 1000)
    good_card.reps += 1

    // Easy: 延长间隔
    easy_card.stability = this.nextStability(card.difficulty, card.stability, retrievability, Rating.Easy, card.state)
    easy_card.difficulty = this.nextDifficulty(card.difficulty, Rating.Easy)
    easy_card.scheduled_days = Math.round(this.nextInterval(easy_card.stability) * 1.3)
    easy_card.due = new Date(now.getTime() + easy_card.scheduled_days * 24 * 60 * 60 * 1000)
    easy_card.reps += 1

    // 更新 elapsed_days
    ;[again_card, hard_card, good_card, easy_card].forEach(c => {
      c.elapsed_days = elapsed_days
    })

    return {
      again: { card: again_card, review_log: this.createReviewLog(card, Rating.Again, now) },
      hard: { card: hard_card, review_log: this.createReviewLog(card, Rating.Hard, now) },
      good: { card: good_card, review_log: this.createReviewLog(card, Rating.Good, now) },
      easy: { card: easy_card, review_log: this.createReviewLog(card, Rating.Easy, now) }
    }
  }

  /**
   * 创建复习日志
   */
  private createReviewLog(card: Card, rating: Rating, now: Date): ReviewLog {
    const elapsed_days = card.last_review 
      ? Math.max(0, (now.getTime() - card.last_review.getTime()) / (24 * 60 * 60 * 1000))
      : 0

    return {
      rating,
      elapsed_days,
      scheduled_days: card.scheduled_days,
      review: now,
      state: card.state
    }
  }

  /**
   * 获取记忆强度百分比 (用于UI显示)
   */
  getMemoryStrength(card: Card, now: Date = new Date()): number {
    if (card.state === State.New) return 0
    
    const elapsed_days = card.last_review 
      ? Math.max(0, (now.getTime() - card.last_review.getTime()) / (24 * 60 * 60 * 1000))
      : 0
    
    const retrievability = this.calculateRetrievability(elapsed_days, card.stability)
    return Math.round(retrievability * 100)
  }

  /**
   * 预测下次复习时间
   */
  getNextReviewTime(card: Card, rating: Rating, now: Date = new Date()): Date {
    const scheduling = this.repeat(card, now)
    
    switch (rating) {
      case Rating.Again:
        return scheduling.again.card.due
      case Rating.Hard:
        return scheduling.hard.card.due
      case Rating.Good:
        return scheduling.good.card.due
      case Rating.Easy:
        return scheduling.easy.card.due
      default:
        return scheduling.good.card.due
    }
  }
}

// 导出默认实例
export const fsrs = new FSRS()

// 工具函数
export const createCard = (id: string, now: Date = new Date()): Card => {
  const card = fsrs.createEmptyCard(now)
  card.id = id
  return card
}

export const reviewCard = (card: Card, rating: Rating, now: Date = new Date()): Card => {
  const scheduling = fsrs.repeat(card, now)
  
  switch (rating) {
    case Rating.Again:
      return { ...scheduling.again.card, last_review: now }
    case Rating.Hard:
      return { ...scheduling.hard.card, last_review: now }
    case Rating.Good:
      return { ...scheduling.good.card, last_review: now }
    case Rating.Easy:
      return { ...scheduling.easy.card, last_review: now }
    default:
      return { ...scheduling.good.card, last_review: now }
  }
}