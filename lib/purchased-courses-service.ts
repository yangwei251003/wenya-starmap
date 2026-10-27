/**
 * 已购课程服务 - 管理用户购买的课程
 */

import { PurchasedCourse } from '@/types'
import { starCoinService } from './star-coin-service'
import { getCourseById } from './store-courses-data'

class PurchasedCoursesService {
  private storageKey = 'wenya_purchased_courses'

  /**
   * 获取用户已购课程列表
   */
  getPurchasedCourses(userId: string): PurchasedCourse[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(`${this.storageKey}_${userId}`)
    return stored ? JSON.parse(stored) : []
  }

  /**
   * 检查用户是否已购买某课程
   */
  hasPurchased(userId: string, courseId: string): boolean {
    const courses = this.getPurchasedCourses(userId)
    return courses.some(c => c.courseId === courseId)
  }

  /**
   * 购买课程
   */
  purchaseCourse(userId: string, courseId: string): { success: boolean; message: string } {
    // 检查是否已购买
    if (this.hasPurchased(userId, courseId)) {
      return {
        success: false,
        message: '您已经购买过这门课程了'
      }
    }

    // 获取课程信息
    const course = getCourseById(courseId)
    if (!course) {
      return {
        success: false,
        message: '课程不存在'
      }
    }

    // 免费课程直接添加
    if (course.isFree || course.price === 0) {
      this.addPurchasedCourse(userId, courseId, 0)
      return {
        success: true,
        message: `成功领取免费课程「${course.title}」！`
      }
    }

    // 扣除星币
    const result = starCoinService.purchaseCourse(userId, courseId, course.title, course.price)
    if (!result.success) {
      return result
    }

    // 添加到已购课程
    this.addPurchasedCourse(userId, courseId, course.price)

    return {
      success: true,
      message: `成功购买课程「${course.title}」！`
    }
  }

  /**
   * 添加已购课程
   */
  private addPurchasedCourse(userId: string, courseId: string, price: number): void {
    const courses = this.getPurchasedCourses(userId)
    
    const purchasedCourse: PurchasedCourse = {
      userId,
      courseId,
      purchaseDate: new Date(),
      price,
      progress: 0
    }

    courses.push(purchasedCourse)
    this.savePurchasedCourses(userId, courses)
  }

  /**
   * 保存已购课程列表
   */
  private savePurchasedCourses(userId: string, courses: PurchasedCourse[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(`${this.storageKey}_${userId}`, JSON.stringify(courses))
  }

  /**
   * 更新课程学习进度
   */
  updateProgress(userId: string, courseId: string, progress: number): void {
    const courses = this.getPurchasedCourses(userId)
    const course = courses.find(c => c.courseId === courseId)
    
    if (course) {
      course.progress = Math.min(100, Math.max(0, progress))
      course.lastStudyDate = new Date()
      this.savePurchasedCourses(userId, courses)
    }
  }

  /**
   * 获取课程学习进度
   */
  getProgress(userId: string, courseId: string): number {
    const courses = this.getPurchasedCourses(userId)
    const course = courses.find(c => c.courseId === courseId)
    return course?.progress || 0
  }

  /**
   * 获取已购课程数量
   */
  getPurchasedCount(userId: string): number {
    return this.getPurchasedCourses(userId).length
  }

  /**
   * 获取正在学习的课程（有进度但未完成）
   */
  getInProgressCourses(userId: string): PurchasedCourse[] {
    return this.getPurchasedCourses(userId).filter(c => c.progress > 0 && c.progress < 100)
  }

  /**
   * 获取已完成的课程
   */
  getCompletedCourses(userId: string): PurchasedCourse[] {
    return this.getPurchasedCourses(userId).filter(c => c.progress >= 100)
  }
}

export const purchasedCoursesService = new PurchasedCoursesService()
