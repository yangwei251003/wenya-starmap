/**
 * 课程商店数据
 * 包含可购买的课程列表
 */

import { StoreCourse, EnglishLevel } from '@/types'

export const storeCourses: StoreCourse[] = [
  // ==================== 免费课程 ====================
  {
    id: 'free-1',
    title: '英语入门基础',
    titleEn: 'English Basics',
    description: '零基础学英语，从字母和发音开始，轻松入门英语世界',
    level: 'beginner',
    category: 'foundation',
    price: 0,
    duration: 60,
    lessonsCount: 5,
    rating: 4.8,
    studentsCount: 12580,
    tags: ['免费', '零基础', '入门'],
    isFree: true,
    isHot: true,
    instructor: 'Emma老师',
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'free-2',
    title: '日常问候与自我介绍',
    titleEn: 'Greetings & Self Introduction',
    description: '学习最基本的英语问候语和自我介绍，开启你的英语之旅',
    level: 'beginner',
    category: 'conversation',
    price: 0,
    duration: 45,
    lessonsCount: 4,
    rating: 4.9,
    studentsCount: 8920,
    tags: ['免费', '日常会话', '实用'],
    isFree: true,
    instructor: 'Tom老师',
    createdAt: new Date('2024-01-15')
  },

  // ==================== 初级课程 ====================
  {
    id: 'beginner-store-1',
    title: '生活英语100句',
    titleEn: '100 Daily English Sentences',
    description: '精选100句最实用的日常英语，涵盖购物、餐厅、交通等场景',
    level: 'beginner',
    category: 'conversation',
    price: 50,
    originalPrice: 80,
    duration: 120,
    lessonsCount: 10,
    rating: 4.7,
    studentsCount: 5680,
    tags: ['日常会话', '实用', '场景'],
    isHot: true,
    instructor: 'Lisa老师',
    createdAt: new Date('2024-02-01')
  },
  {
    id: 'beginner-store-2',
    title: '英语发音训练营',
    titleEn: 'Pronunciation Training',
    description: '系统学习英语发音规则，纠正发音问题，说出地道英语',
    level: 'beginner',
    category: 'pronunciation',
    price: 60,
    originalPrice: 100,
    duration: 150,
    lessonsCount: 12,
    rating: 4.8,
    studentsCount: 4320,
    tags: ['发音', '口语', '纠音'],
    isNew: true,
    instructor: 'Mike老师',
    createdAt: new Date('2024-03-01')
  },
  {
    id: 'beginner-store-3',
    title: '基础语法精讲',
    titleEn: 'Essential Grammar',
    description: '从零开始学语法，掌握英语句子结构和基本时态',
    level: 'beginner',
    category: 'grammar',
    price: 45,
    duration: 100,
    lessonsCount: 8,
    rating: 4.6,
    studentsCount: 6890,
    tags: ['语法', '基础', '系统'],
    instructor: 'Sarah老师',
    createdAt: new Date('2024-02-15')
  },
  {
    id: 'beginner-store-4',
    title: '旅游英语速成',
    titleEn: 'Travel English',
    description: '出国旅游必备英语，机场、酒店、问路、购物全覆盖',
    level: 'beginner',
    category: 'travel',
    price: 55,
    originalPrice: 88,
    duration: 90,
    lessonsCount: 8,
    rating: 4.9,
    studentsCount: 7650,
    tags: ['旅游', '实用', '场景'],
    isHot: true,
    instructor: 'David老师',
    createdAt: new Date('2024-03-15')
  },
  {
    id: 'beginner-store-5',
    title: '英语词汇1000',
    titleEn: '1000 Essential Words',
    description: '精选1000个高频词汇，配合例句和练习，快速扩充词汇量',
    level: 'beginner',
    category: 'vocabulary',
    price: 40,
    duration: 200,
    lessonsCount: 20,
    rating: 4.5,
    studentsCount: 9120,
    tags: ['词汇', '高频', '记忆'],
    instructor: 'Amy老师',
    createdAt: new Date('2024-01-20')
  },

  // ==================== 中级课程 ====================
  {
    id: 'intermediate-store-1',
    title: '商务英语入门',
    titleEn: 'Business English Basics',
    description: '职场必备英语技能，邮件写作、会议表达、商务礼仪',
    level: 'intermediate',
    category: 'business',
    price: 80,
    originalPrice: 120,
    duration: 180,
    lessonsCount: 15,
    rating: 4.8,
    studentsCount: 4560,
    tags: ['商务', '职场', '实用'],
    isHot: true,
    instructor: 'James老师',
    createdAt: new Date('2024-02-20')
  },
  {
    id: 'intermediate-store-2',
    title: '英语听力突破',
    titleEn: 'Listening Breakthrough',
    description: '提升英语听力能力，从慢速到正常语速，逐步突破',
    level: 'intermediate',
    category: 'listening',
    price: 70,
    originalPrice: 100,
    duration: 160,
    lessonsCount: 12,
    rating: 4.7,
    studentsCount: 5230,
    tags: ['听力', '突破', '进阶'],
    isNew: true,
    instructor: 'Emily老师',
    createdAt: new Date('2024-04-01')
  },
  {
    id: 'intermediate-store-3',
    title: '英语口语流利说',
    titleEn: 'Fluent Speaking',
    description: '突破口语瓶颈，学习地道表达，提升口语流利度',
    level: 'intermediate',
    category: 'speaking',
    price: 75,
    duration: 150,
    lessonsCount: 12,
    rating: 4.9,
    studentsCount: 6780,
    tags: ['口语', '流利', '地道'],
    isHot: true,
    instructor: 'Chris老师',
    createdAt: new Date('2024-03-20')
  },
  {
    id: 'intermediate-store-4',
    title: '英语阅读理解',
    titleEn: 'Reading Comprehension',
    description: '提升阅读速度和理解能力，掌握阅读技巧和策略',
    level: 'intermediate',
    category: 'reading',
    price: 65,
    duration: 140,
    lessonsCount: 10,
    rating: 4.6,
    studentsCount: 3890,
    tags: ['阅读', '理解', '技巧'],
    instructor: 'Rachel老师',
    createdAt: new Date('2024-02-28')
  },
  {
    id: 'intermediate-store-5',
    title: '英语写作基础',
    titleEn: 'Writing Fundamentals',
    description: '学习英语写作技巧，从句子到段落，提升写作能力',
    level: 'intermediate',
    category: 'writing',
    price: 70,
    duration: 130,
    lessonsCount: 10,
    rating: 4.7,
    studentsCount: 4120,
    tags: ['写作', '技巧', '表达'],
    instructor: 'Kevin老师',
    createdAt: new Date('2024-03-10')
  },

  // ==================== 高级课程 ====================
  {
    id: 'advanced-store-1',
    title: '高级商务英语',
    titleEn: 'Advanced Business English',
    description: '高级商务场景英语，谈判、演讲、报告写作全覆盖',
    level: 'advanced',
    category: 'business',
    price: 120,
    originalPrice: 180,
    duration: 240,
    lessonsCount: 20,
    rating: 4.9,
    studentsCount: 2890,
    tags: ['高级', '商务', '专业'],
    isHot: true,
    instructor: 'William老师',
    createdAt: new Date('2024-04-10')
  },
  {
    id: 'advanced-store-2',
    title: '雅思备考冲刺',
    titleEn: 'IELTS Preparation',
    description: '雅思考试全面备考，听说读写四项技能系统提升',
    level: 'advanced',
    category: 'exam',
    price: 150,
    originalPrice: 200,
    duration: 300,
    lessonsCount: 25,
    rating: 4.8,
    studentsCount: 3560,
    tags: ['雅思', '考试', '备考'],
    isNew: true,
    instructor: 'Jennifer老师',
    createdAt: new Date('2024-04-15')
  },
  {
    id: 'advanced-store-3',
    title: '托福高分攻略',
    titleEn: 'TOEFL High Score',
    description: '托福考试高分技巧，真题解析，模拟训练',
    level: 'advanced',
    category: 'exam',
    price: 150,
    originalPrice: 200,
    duration: 280,
    lessonsCount: 22,
    rating: 4.7,
    studentsCount: 2780,
    tags: ['托福', '考试', '高分'],
    instructor: 'Robert老师',
    createdAt: new Date('2024-04-20')
  },
  {
    id: 'advanced-store-4',
    title: '英语演讲与辩论',
    titleEn: 'Public Speaking & Debate',
    description: '提升英语演讲能力，学习辩论技巧，增强表达自信',
    level: 'advanced',
    category: 'speaking',
    price: 100,
    duration: 180,
    lessonsCount: 15,
    rating: 4.8,
    studentsCount: 1980,
    tags: ['演讲', '辩论', '高级'],
    instructor: 'Daniel老师',
    createdAt: new Date('2024-03-25')
  },
  {
    id: 'advanced-store-5',
    title: '学术英语写作',
    titleEn: 'Academic Writing',
    description: '学术论文写作技巧，引用规范，学术表达',
    level: 'advanced',
    category: 'writing',
    price: 110,
    originalPrice: 150,
    duration: 200,
    lessonsCount: 16,
    rating: 4.6,
    studentsCount: 2340,
    tags: ['学术', '写作', '论文'],
    instructor: 'Sophia老师',
    createdAt: new Date('2024-04-05')
  },

  // ==================== 特色课程 ====================
  {
    id: 'special-1',
    title: '美剧英语学习',
    titleEn: 'Learn English from TV Shows',
    description: '通过热门美剧学习地道英语表达，轻松有趣',
    level: 'intermediate',
    category: 'entertainment',
    price: 60,
    originalPrice: 90,
    duration: 120,
    lessonsCount: 10,
    rating: 4.9,
    studentsCount: 8920,
    tags: ['美剧', '有趣', '地道'],
    isHot: true,
    instructor: 'Alex老师',
    createdAt: new Date('2024-03-05')
  },
  {
    id: 'special-2',
    title: '英文歌曲学英语',
    titleEn: 'Learn English through Songs',
    description: '通过经典英文歌曲学习英语，提升听力和发音',
    level: 'beginner',
    category: 'entertainment',
    price: 45,
    duration: 80,
    lessonsCount: 8,
    rating: 4.8,
    studentsCount: 6540,
    tags: ['音乐', '有趣', '轻松'],
    isNew: true,
    instructor: 'Olivia老师',
    createdAt: new Date('2024-04-25')
  },
  {
    id: 'special-3',
    title: '新闻英语精读',
    titleEn: 'News English Reading',
    description: '通过阅读英语新闻提升阅读能力，了解时事热点',
    level: 'intermediate',
    category: 'reading',
    price: 55,
    duration: 100,
    lessonsCount: 10,
    rating: 4.7,
    studentsCount: 3450,
    tags: ['新闻', '阅读', '时事'],
    instructor: 'Mark老师',
    createdAt: new Date('2024-03-30')
  }
]

// 按级别获取课程
export function getCoursesByLevel(level: EnglishLevel): StoreCourse[] {
  return storeCourses.filter(c => c.level === level)
}

// 按类别获取课程
export function getCoursesByCategory(category: string): StoreCourse[] {
  return storeCourses.filter(c => c.category === category)
}

// 获取免费课程
export function getFreeCourses(): StoreCourse[] {
  return storeCourses.filter(c => c.isFree)
}

// 获取热门课程
export function getHotCourses(): StoreCourse[] {
  return storeCourses.filter(c => c.isHot)
}

// 获取新课程
export function getNewCourses(): StoreCourse[] {
  return storeCourses.filter(c => c.isNew)
}

// 搜索课程
export function searchCourses(keyword: string): StoreCourse[] {
  const lowerKeyword = keyword.toLowerCase()
  return storeCourses.filter(c => 
    c.title.toLowerCase().includes(lowerKeyword) ||
    c.titleEn.toLowerCase().includes(lowerKeyword) ||
    c.description.toLowerCase().includes(lowerKeyword) ||
    c.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
  )
}

// 获取课程详情
export function getCourseById(id: string): StoreCourse | undefined {
  return storeCourses.find(c => c.id === id)
}

// 课程分类
export const courseCategories = [
  { id: 'all', name: '全部', icon: '📚' },
  { id: 'foundation', name: '基础入门', icon: '🌱' },
  { id: 'conversation', name: '日常会话', icon: '💬' },
  { id: 'grammar', name: '语法学习', icon: '📖' },
  { id: 'vocabulary', name: '词汇扩展', icon: '📝' },
  { id: 'pronunciation', name: '发音训练', icon: '🎤' },
  { id: 'listening', name: '听力提升', icon: '🎧' },
  { id: 'speaking', name: '口语表达', icon: '🗣️' },
  { id: 'reading', name: '阅读理解', icon: '📰' },
  { id: 'writing', name: '写作技巧', icon: '✍️' },
  { id: 'business', name: '商务英语', icon: '💼' },
  { id: 'travel', name: '旅游英语', icon: '✈️' },
  { id: 'exam', name: '考试备考', icon: '🎯' },
  { id: 'entertainment', name: '趣味学习', icon: '🎬' }
]
