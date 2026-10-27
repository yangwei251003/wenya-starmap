'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  ShoppingCart, Star, Clock, Users, Tag, Search, Filter,
  Coins, CheckCircle, Sparkles, Crown, Zap, Gift, BookOpen
} from 'lucide-react'
import { storeCourses, courseCategories, getCourseById } from '@/lib/store-courses-data'
import { StoreCourse, EnglishLevel } from '@/types'

export default function StorePage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [userId, setUserId] = useState<string>('')
  const [starCoins, setStarCoins] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [purchasedIds, setPurchasedIds] = useState<string[]>([])
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<StoreCourse | null>(null)
  const [purchaseResult, setPurchaseResult] = useState<{ success: boolean; message: string } | null>(null)

  const loadStoreData = async (uid: string) => {
    const [profileRes, purchasesRes] = await Promise.all([
      fetch(`/api/profile?userId=${encodeURIComponent(uid)}`),
      fetch(`/api/store/purchases?userId=${encodeURIComponent(uid)}`),
    ])

    if (profileRes.ok) {
      const profileJson = await profileRes.json()
      setStarCoins(profileJson.data?.star_coins ?? 0)
    } else {
      setStarCoins(0)
    }

    if (purchasesRes.ok) {
      const purchasesJson = await purchasesRes.json()
      setPurchasedIds((purchasesJson.data || []).map((item: any) => item.course_id))
    } else {
      setPurchasedIds([])
    }
  }

  useEffect(() => {
    setMounted(true)
    const user = localStorage.getItem('wenya_user')
    if (user) {
      const userData = JSON.parse(user)
      setUserId(userData.id)
      loadStoreData(userData.id)
    }
  }, [])

  // 过滤课程
  const filteredCourses = storeCourses.filter(course => {
    const matchCategory = selectedCategory === 'all' || course.category === selectedCategory
    const matchLevel = selectedLevel === 'all' || course.level === selectedLevel
    const matchSearch = !searchQuery || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.tags.some(tag => tag.includes(searchQuery))
    return matchCategory && matchLevel && matchSearch
  })

  // 处理购买
  const handlePurchase = (course: StoreCourse) => {
    setSelectedCourse(course)
    setPurchaseResult(null)
    setShowPurchaseModal(true)
  }

  // 确认购买
  const confirmPurchase = () => {
    if (!selectedCourse || !userId) return

    fetch('/api/store/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, courseId: selectedCourse.id }),
    })
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) {
          return { success: false, message: data.error || '购买失败' }
        }
        return { success: true, message: '购买成功！' }
      })
      .then(async (result) => {
        setPurchaseResult(result)
        if (result.success) {
          await loadStoreData(userId)
          setPurchasedIds(prev => [...prev, selectedCourse.id])
        }
      })
  }

  // 进入课程学习
  const goToLearn = (courseId: string) => {
    router.push(`/my-courses/${courseId}`)
  }

  // 渲染课程卡片
  const renderCourseCard = (course: StoreCourse) => {
    const isPurchased = purchasedIds.includes(course.id)
    const canAfford = course.isFree || course.price === 0 || starCoins >= course.price

    return (
      <Card key={course.id} className="p-0 overflow-hidden hover:border-star-400/50 transition-all group">
        {/* 课程封面 */}
        <div className="relative h-40 bg-gradient-to-br from-cosmos-700 to-cosmos-800 flex items-center justify-center">
          <BookOpen className="w-16 h-16 text-cosmos-500 group-hover:text-star-400 transition-colors" />
          
          {/* 标签 */}
          <div className="absolute top-3 left-3 flex gap-2">
            {course.isFree && (
              <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full flex items-center gap-1">
                <Gift className="w-3 h-3" /> 免费
              </span>
            )}
            {course.isNew && (
              <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> 新课
              </span>
            )}
            {course.isHot && (
              <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full flex items-center gap-1">
                <Zap className="w-3 h-3" /> 热门
              </span>
            )}
          </div>

          {/* 已购标记 */}
          {isPurchased && (
            <div className="absolute top-3 right-3 px-2 py-1 bg-sprout-500 text-white text-xs rounded-full flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> 已购
            </div>
          )}

          {/* 级别标签 */}
          <div className="absolute bottom-3 right-3">
            <span className={`px-2 py-1 text-xs rounded-full ${
              course.level === 'beginner' ? 'bg-green-500/20 text-green-400' :
              course.level === 'intermediate' ? 'bg-blue-500/20 text-blue-400' :
              'bg-purple-500/20 text-purple-400'
            }`}>
              {course.level === 'beginner' ? '初级' : course.level === 'intermediate' ? '中级' : '高级'}
            </span>
          </div>
        </div>

        {/* 课程信息 */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">{course.title}</h3>
          <p className="text-sm text-cosmos-400 mb-3 line-clamp-2">{course.description}</p>

          {/* 课程数据 */}
          <div className="flex items-center gap-4 text-xs text-cosmos-400 mb-3">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-star-400" />
              {course.rating}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {course.studentsCount.toLocaleString()}人
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {course.lessonsCount}课时
            </span>
          </div>

          {/* 标签 */}
          <div className="flex flex-wrap gap-1 mb-4">
            {course.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-cosmos-700 text-cosmos-300 text-xs rounded">
                {tag}
              </span>
            ))}
          </div>

          {/* 价格和操作 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {course.isFree || course.price === 0 ? (
                <span className="text-lg font-bold text-green-400">免费</span>
              ) : (
                <>
                  <span className="text-lg font-bold text-star-400 flex items-center gap-1">
                    <Coins className="w-4 h-4" />
                    {course.price}
                  </span>
                  {course.originalPrice && (
                    <span className="text-sm text-cosmos-500 line-through">
                      {course.originalPrice}
                    </span>
                  )}
                </>
              )}
            </div>

            {isPurchased ? (
              <Button 
                variant="sprout" 
                size="sm"
                onClick={() => goToLearn(course.id)}
              >
                去学习
              </Button>
            ) : (
              <Button 
                variant={canAfford ? 'star' : 'cosmos'}
                size="sm"
                onClick={() => handlePurchase(course)}
                disabled={!canAfford && !course.isFree}
              >
                {course.isFree ? '免费领取' : canAfford ? '立即购买' : '星币不足'}
              </Button>
            )}
          </div>
        </div>
      </Card>
    )
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-star-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <PageHeader 
        title="课程商店"
        subtitle="Course Store"
        titleColor="star"
        backUrl="/dashboard"
      />

      <div className="max-w-7xl mx-auto px-4 pb-8">
        {/* 星币余额卡片 */}
        <Card className="p-4 mb-6 bg-gradient-to-r from-star-500/20 to-yellow-500/20 border-star-400/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-star-400/20 rounded-xl flex items-center justify-center">
                <Coins className="w-6 h-6 text-star-400" />
              </div>
              <div>
                <p className="text-sm text-cosmos-400">我的星币</p>
                <p className="text-2xl font-bold text-star-400">{starCoins.toLocaleString()}</p>
              </div>
            </div>
            <Button variant="star" onClick={() => router.push('/recharge')}>
              <Crown className="w-4 h-4 mr-2" />
              充值星币
            </Button>
          </div>
        </Card>

        {/* 搜索和筛选 */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* 搜索框 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cosmos-400" />
            <input
              type="text"
              placeholder="搜索课程..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-cosmos-800 border border-cosmos-700 rounded-lg text-white placeholder-cosmos-500 focus:border-star-400 focus:outline-none"
            />
          </div>

          {/* 级别筛选 */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-4 py-3 bg-cosmos-800 border border-cosmos-700 rounded-lg text-white focus:border-star-400 focus:outline-none"
          >
            <option value="all">全部级别</option>
            <option value="beginner">初级</option>
            <option value="intermediate">中级</option>
            <option value="advanced">高级</option>
          </select>
        </div>

        {/* 分类标签 */}
        <div className="flex flex-wrap gap-2 mb-6">
          {courseCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                selectedCategory === cat.id
                  ? 'bg-star-400 text-white'
                  : 'bg-cosmos-800 text-cosmos-300 hover:bg-cosmos-700'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* 课程统计 */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-cosmos-400">
            共 <span className="text-white font-semibold">{filteredCourses.length}</span> 门课程
          </p>
          <p className="text-cosmos-400">
            已购 <span className="text-sprout-400 font-semibold">{purchasedIds.length}</span> 门
          </p>
        </div>

        {/* 课程列表 */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(renderCourseCard)}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Search className="w-16 h-16 text-cosmos-600 mx-auto mb-4" />
            <p className="text-cosmos-400">没有找到符合条件的课程</p>
          </Card>
        )}
      </div>

      {/* 购买确认弹窗 */}
      {showPurchaseModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 animate-fade-in-up">
            {purchaseResult ? (
              // 购买结果
              <div className="text-center">
                {purchaseResult.success ? (
                  <>
                    <div className="w-20 h-20 bg-sprout-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-10 h-10 text-sprout-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">购买成功！</h3>
                    <p className="text-cosmos-300 mb-6">{purchaseResult.message}</p>
                    <div className="flex gap-3">
                      <Button 
                        variant="cosmos" 
                        className="flex-1"
                        onClick={() => setShowPurchaseModal(false)}
                      >
                        继续浏览
                      </Button>
                      <Button 
                        variant="sprout" 
                        className="flex-1"
                        onClick={() => {
                          setShowPurchaseModal(false)
                          goToLearn(selectedCourse.id)
                        }}
                      >
                        立即学习
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-red-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Coins className="w-10 h-10 text-red-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">购买失败</h3>
                    <p className="text-cosmos-300 mb-6">{purchaseResult.message}</p>
                    <div className="flex gap-3">
                      <Button 
                        variant="cosmos" 
                        className="flex-1"
                        onClick={() => setShowPurchaseModal(false)}
                      >
                        取消
                      </Button>
                      <Button 
                        variant="star" 
                        className="flex-1"
                        onClick={() => {
                          setShowPurchaseModal(false)
                          router.push('/recharge')
                        }}
                      >
                        去充值
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              // 确认购买
              <>
                <h3 className="text-xl font-bold text-white mb-4 text-center">确认购买</h3>
                
                <div className="bg-cosmos-800/50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-white mb-1">{selectedCourse.title}</h4>
                  <p className="text-sm text-cosmos-400 mb-3">{selectedCourse.description}</p>
                  <div className="flex items-center gap-4 text-sm text-cosmos-400">
                    <span>{selectedCourse.lessonsCount}课时</span>
                    <span>{selectedCourse.duration}分钟</span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-star-400" />
                      {selectedCourse.rating}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-t border-cosmos-700">
                  <span className="text-cosmos-400">课程价格</span>
                  <span className="text-lg font-bold text-star-400 flex items-center gap-1">
                    <Coins className="w-4 h-4" />
                    {selectedCourse.isFree ? '免费' : selectedCourse.price}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-t border-cosmos-700">
                  <span className="text-cosmos-400">当前余额</span>
                  <span className="text-lg font-bold text-white flex items-center gap-1">
                    <Coins className="w-4 h-4 text-star-400" />
                    {starCoins}
                  </span>
                </div>

                {!selectedCourse.isFree && selectedCourse.price > 0 && (
                  <div className="flex items-center justify-between py-3 border-t border-cosmos-700">
                    <span className="text-cosmos-400">购买后余额</span>
                    <span className={`text-lg font-bold ${starCoins >= selectedCourse.price ? 'text-sprout-400' : 'text-red-400'}`}>
                      {starCoins - selectedCourse.price}
                    </span>
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  <Button 
                    variant="cosmos" 
                    className="flex-1"
                    onClick={() => setShowPurchaseModal(false)}
                  >
                    取消
                  </Button>
                  <Button 
                    variant="star" 
                    className="flex-1"
                    onClick={confirmPurchase}
                  >
                    {selectedCourse.isFree ? '免费领取' : '确认购买'}
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
