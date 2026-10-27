/**
 * 星币服务 - 管理用户星币账户、交易、签到等功能
 */

import { 
  StarCoinAccount, 
  StarCoinTransaction, 
  StarCoinTransactionType,
  RechargePackage,
  RechargeOrder 
} from '@/types'

// 星币规则配置
export const STAR_COIN_RULES = {
  REGISTER_BONUS: 200,        // 新用户注册奖励
  DAILY_CHECKIN: 10,          // 普通每日签到
  HOLIDAY_CHECKIN: 20,        // 节日签到奖励
  STREAK_BONUS_3: 5,          // 连续签到3天额外奖励
  STREAK_BONUS_7: 15,         // 连续签到7天额外奖励
  STREAK_BONUS_30: 50,        // 连续签到30天额外奖励
  LESSON_COMPLETE: 5,         // 完成课程奖励
  PERFECT_SCORE: 10,          // 满分奖励
  DEFAULT_COURSE_PRICE: 50,   // 默认课程价格
}

// 节日列表（用于判断是否节日签到）
const HOLIDAYS = [
  '01-01', // 元旦
  '02-14', // 情人节
  '03-08', // 妇女节
  '05-01', // 劳动节
  '05-04', // 青年节
  '06-01', // 儿童节
  '09-10', // 教师节
  '10-01', // 国庆节
  '12-25', // 圣诞节
]

// 充值套餐
export const RECHARGE_PACKAGES: RechargePackage[] = [
  {
    id: 'pkg-1',
    name: '体验包',
    starCoins: 100,
    price: 6,
    bonusCoins: 0,
    discount: 0
  },
  {
    id: 'pkg-2',
    name: '基础包',
    starCoins: 300,
    price: 18,
    bonusCoins: 30,
    discount: 0
  },
  {
    id: 'pkg-3',
    name: '超值包',
    starCoins: 500,
    price: 28,
    bonusCoins: 80,
    isPopular: true,
    discount: 10
  },
  {
    id: 'pkg-4',
    name: '豪华包',
    starCoins: 1000,
    price: 50,
    bonusCoins: 200,
    discount: 15
  },
  {
    id: 'pkg-5',
    name: '至尊包',
    starCoins: 2000,
    price: 88,
    bonusCoins: 500,
    discount: 20
  },
  {
    id: 'pkg-6',
    name: '限时特惠',
    starCoins: 888,
    price: 38,
    bonusCoins: 188,
    isLimited: true,
    discount: 25
  }
]

class StarCoinService {
  private storageKey = 'wenya_star_coin_account'

  /**
   * 获取用户星币账户
   */
  getAccount(userId: string): StarCoinAccount {
    if (typeof window === 'undefined') {
      return this.createDefaultAccount(userId)
    }

    const stored = localStorage.getItem(`${this.storageKey}_${userId}`)
    if (stored) {
      return JSON.parse(stored)
    }

    // 创建新账户
    const account = this.createDefaultAccount(userId)
    this.saveAccount(account)
    return account
  }

  /**
   * 创建默认账户
   */
  private createDefaultAccount(userId: string): StarCoinAccount {
    return {
      userId,
      balance: 0,
      totalEarned: 0,
      totalSpent: 0,
      checkinStreak: 0,
      transactions: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  /**
   * 保存账户
   */
  private saveAccount(account: StarCoinAccount): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(`${this.storageKey}_${account.userId}`, JSON.stringify(account))
  }

  /**
   * 添加交易记录
   */
  private addTransaction(
    account: StarCoinAccount,
    type: StarCoinTransactionType,
    amount: number,
    description: string,
    relatedId?: string
  ): StarCoinTransaction {
    const transaction: StarCoinTransaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: account.userId,
      type,
      amount,
      balance: account.balance + amount,
      description,
      relatedId,
      createdAt: new Date()
    }

    account.balance += amount
    if (amount > 0) {
      account.totalEarned += amount
    } else {
      account.totalSpent += Math.abs(amount)
    }
    account.transactions.unshift(transaction)
    account.updatedAt = new Date()

    // 只保留最近100条交易记录
    if (account.transactions.length > 100) {
      account.transactions = account.transactions.slice(0, 100)
    }

    this.saveAccount(account)
    return transaction
  }

  /**
   * 新用户注册奖励
   */
  grantRegisterBonus(userId: string): StarCoinTransaction {
    const account = this.getAccount(userId)
    return this.addTransaction(
      account,
      'register_bonus',
      STAR_COIN_RULES.REGISTER_BONUS,
      `🎉 新用户注册奖励 +${STAR_COIN_RULES.REGISTER_BONUS}星币`
    )
  }

  /**
   * 每日签到
   */
  dailyCheckin(userId: string): { success: boolean; transaction?: StarCoinTransaction; message: string; isHoliday: boolean; streak: number } {
    const account = this.getAccount(userId)
    const today = new Date().toISOString().split('T')[0]

    // 检查是否已签到
    if (account.lastCheckinDate === today) {
      return {
        success: false,
        message: '今天已经签到过了，明天再来吧！',
        isHoliday: false,
        streak: account.checkinStreak
      }
    }

    // 检查是否连续签到
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    if (account.lastCheckinDate === yesterdayStr) {
      account.checkinStreak += 1
    } else {
      account.checkinStreak = 1
    }

    // 检查是否节日
    const monthDay = today.slice(5) // MM-DD
    const isHoliday = HOLIDAYS.includes(monthDay)

    // 计算签到奖励
    let baseReward = isHoliday ? STAR_COIN_RULES.HOLIDAY_CHECKIN : STAR_COIN_RULES.DAILY_CHECKIN
    let streakBonus = 0

    if (account.checkinStreak >= 30) {
      streakBonus = STAR_COIN_RULES.STREAK_BONUS_30
    } else if (account.checkinStreak >= 7) {
      streakBonus = STAR_COIN_RULES.STREAK_BONUS_7
    } else if (account.checkinStreak >= 3) {
      streakBonus = STAR_COIN_RULES.STREAK_BONUS_3
    }

    const totalReward = baseReward + streakBonus
    account.lastCheckinDate = today

    let description = isHoliday 
      ? `🎊 节日签到奖励 +${baseReward}星币`
      : `✅ 每日签到 +${baseReward}星币`

    if (streakBonus > 0) {
      description += ` (连续${account.checkinStreak}天额外+${streakBonus})`
    }

    const transaction = this.addTransaction(
      account,
      isHoliday ? 'holiday_checkin' : 'daily_checkin',
      totalReward,
      description
    )

    return {
      success: true,
      transaction,
      message: description,
      isHoliday,
      streak: account.checkinStreak
    }
  }

  /**
   * 购买课程
   */
  purchaseCourse(userId: string, courseId: string, courseName: string, price: number): { success: boolean; transaction?: StarCoinTransaction; message: string } {
    const account = this.getAccount(userId)

    if (account.balance < price) {
      return {
        success: false,
        message: `星币不足！需要${price}星币，当前余额${account.balance}星币`
      }
    }

    const transaction = this.addTransaction(
      account,
      'purchase_course',
      -price,
      `📚 购买课程「${courseName}」 -${price}星币`,
      courseId
    )

    return {
      success: true,
      transaction,
      message: `成功购买课程「${courseName}」！`
    }
  }

  /**
   * 充值
   */
  recharge(userId: string, packageId: string): { success: boolean; transaction?: StarCoinTransaction; order?: RechargeOrder; message: string } {
    const pkg = RECHARGE_PACKAGES.find(p => p.id === packageId)
    if (!pkg) {
      return {
        success: false,
        message: '充值套餐不存在'
      }
    }

    const account = this.getAccount(userId)
    const totalCoins = pkg.starCoins + pkg.bonusCoins

    // 创建订单
    const order: RechargeOrder = {
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      packageId,
      starCoins: pkg.starCoins,
      bonusCoins: pkg.bonusCoins,
      totalCoins,
      price: pkg.price,
      status: 'completed', // 模拟直接完成
      paymentMethod: 'demo',
      createdAt: new Date(),
      completedAt: new Date()
    }

    // 保存订单
    this.saveOrder(order)

    // 添加星币
    const transaction = this.addTransaction(
      account,
      'recharge',
      totalCoins,
      `💰 充值「${pkg.name}」 +${pkg.starCoins}星币${pkg.bonusCoins > 0 ? ` (赠送+${pkg.bonusCoins})` : ''}`,
      order.id
    )

    return {
      success: true,
      transaction,
      order,
      message: `充值成功！获得${totalCoins}星币`
    }
  }

  /**
   * 保存订单
   */
  private saveOrder(order: RechargeOrder): void {
    if (typeof window === 'undefined') return
    const orders = this.getOrders(order.userId)
    orders.unshift(order)
    localStorage.setItem(`wenya_orders_${order.userId}`, JSON.stringify(orders.slice(0, 50)))
  }

  /**
   * 获取订单列表
   */
  getOrders(userId: string): RechargeOrder[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(`wenya_orders_${userId}`)
    return stored ? JSON.parse(stored) : []
  }

  /**
   * 完成课程奖励
   */
  grantLessonCompleteReward(userId: string, lessonId: string, lessonName: string, isPerfect: boolean = false): StarCoinTransaction {
    const account = this.getAccount(userId)
    const reward = isPerfect 
      ? STAR_COIN_RULES.LESSON_COMPLETE + STAR_COIN_RULES.PERFECT_SCORE
      : STAR_COIN_RULES.LESSON_COMPLETE

    const description = isPerfect
      ? `🌟 完成课程「${lessonName}」满分奖励 +${reward}星币`
      : `✨ 完成课程「${lessonName}」 +${reward}星币`

    return this.addTransaction(
      account,
      'lesson_complete',
      reward,
      description,
      lessonId
    )
  }

  /**
   * 成就奖励
   */
  grantAchievementReward(userId: string, achievementName: string, reward: number): StarCoinTransaction {
    const account = this.getAccount(userId)
    return this.addTransaction(
      account,
      'achievement_reward',
      reward,
      `🏆 解锁成就「${achievementName}」 +${reward}星币`
    )
  }

  /**
   * 获取余额
   */
  getBalance(userId: string): number {
    return this.getAccount(userId).balance
  }

  /**
   * 获取交易记录
   */
  getTransactions(userId: string, limit: number = 20): StarCoinTransaction[] {
    return this.getAccount(userId).transactions.slice(0, limit)
  }

  /**
   * 检查是否可以签到
   */
  canCheckin(userId: string): boolean {
    const account = this.getAccount(userId)
    const today = new Date().toISOString().split('T')[0]
    return account.lastCheckinDate !== today
  }

  /**
   * 获取签到信息
   */
  getCheckinInfo(userId: string): { canCheckin: boolean; streak: number; lastDate?: string } {
    const account = this.getAccount(userId)
    const today = new Date().toISOString().split('T')[0]
    return {
      canCheckin: account.lastCheckinDate !== today,
      streak: account.checkinStreak,
      lastDate: account.lastCheckinDate
    }
  }
}

export const starCoinService = new StarCoinService()
