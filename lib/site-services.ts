export type SiteServiceTier = 'core' | 'support' | 'system'

export interface SiteService {
  href: string
  title: string
  summary: string
  action: string
  tier: SiteServiceTier
  icon: string
}

export const siteServices: SiteService[] = [
  {
    href: '/chat',
    title: 'AI 对话陪练',
    summary: '把不懂的句子、语法和表达直接问清楚。',
    action: '去发问',
    tier: 'core',
    icon: 'bot',
  },
  {
    href: '/vocab',
    title: '背单词',
    summary: '按掌握度安排今日词库，复习和新词自动补位。',
    action: '开始记词',
    tier: 'core',
    icon: 'book',
  },
  {
    href: '/growth-starmap',
    title: '成长星图',
    summary: '查看学习进度、能力节点和已点亮路径。',
    action: '看星图',
    tier: 'core',
    icon: 'stars',
  },
  {
    href: '/lesson',
    title: '课程学习',
    summary: '按主题学习基础内容，适合系统补课。',
    action: '选课程',
    tier: 'core',
    icon: 'route',
  },
  {
    href: '/reading',
    title: '英文阅读',
    summary: '获取英文阅读材料，用真实语境练理解。',
    action: '去阅读',
    tier: 'support',
    icon: 'newspaper',
  },
  {
    href: '/quiz',
    title: '练习测验',
    summary: '用小测检查词汇、阅读和语法掌握情况。',
    action: '做测验',
    tier: 'support',
    icon: 'check',
  },
  {
    href: '/ai-writing',
    title: 'AI 写作工坊',
    summary: '提交英文表达，获得修改和结构建议。',
    action: '练写作',
    tier: 'support',
    icon: 'pen',
  },
  {
    href: '/memory-dashboard',
    title: '记忆驾驶舱',
    summary: '查看遗忘曲线、复习压力和词汇状态。',
    action: '看记忆',
    tier: 'support',
    icon: 'brain',
  },
  {
    href: '/community',
    title: '星光社区',
    summary: '打卡、分享学习记录，也能看同伴动态。',
    action: '进社区',
    tier: 'support',
    icon: 'users',
  },
  {
    href: '/store',
    title: '课程商店',
    summary: '购买课程包和学习服务。',
    action: '去商店',
    tier: 'support',
    icon: 'store',
  },
  {
    href: '/my-courses',
    title: '我的课程',
    summary: '管理已经购买或领取的课程。',
    action: '看课程',
    tier: 'support',
    icon: 'library',
  },
  {
    href: '/recharge',
    title: '星币补给',
    summary: '充值星币，用于课程和权益兑换。',
    action: '去补给',
    tier: 'support',
    icon: 'wallet',
  },
  {
    href: '/profile',
    title: '个人档案',
    summary: '管理账号、学习身份和偏好。',
    action: '看档案',
    tier: 'support',
    icon: 'user',
  },
  {
    href: '/competition',
    title: '评审中心',
    summary: '面向展示和比赛的项目说明。',
    action: '看展示',
    tier: 'system',
    icon: 'award',
  },
  {
    href: '/admin',
    title: '后台管理',
    summary: '管理数据、内容和系统状态。',
    action: '进后台',
    tier: 'system',
    icon: 'shield',
  },
]

export const coreServices = siteServices.filter((service) => service.tier === 'core')
export const supportServices = siteServices.filter((service) => service.tier === 'support')
export const systemServices = siteServices.filter((service) => service.tier === 'system')
