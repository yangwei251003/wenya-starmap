/**
 * 星光殿堂社区服务 - 管理帖子、评论、好友、私信等功能
 */

import {
  CommunityPost,
  PostComment,
  PostAttachment,
  CommunityProfile,
  DirectMessage,
  ChatConversation,
  Friendship,
  CommunityNotification,
  EnglishLevel
} from '@/types'

// 用户称号配置
const USER_TITLES: Record<string, { minDays: number; title: string }> = {
  newcomer: { minDays: 0, title: '星际新人' },
  explorer: { minDays: 7, title: '星空探索者' },
  scholar: { minDays: 30, title: '银河学者' },
  master: { minDays: 90, title: '星辰大师' },
  legend: { minDays: 180, title: '传奇星主' }
}

// 示例帖子数据
const SAMPLE_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    authorId: 'user-sample-1',
    authorName: 'StarLearner',
    authorLevel: 'intermediate',
    authorTitle: '银河学者',
    content: '今天学习了新的语法知识，感觉英语越来越有趣了！分享一下我的学习笔记📚\n\n1. 现在完成时的用法\n2. 过去完成时的区别\n3. 常见的时态错误\n\n大家有什么学习心得也可以分享哦！',
    attachments: [],
    tags: ['学习心得', '语法', '分享'],
    likes: ['user-2', 'user-3', 'user-4'],
    comments: [
      {
        id: 'comment-1',
        postId: 'post-1',
        authorId: 'user-2',
        authorName: 'EnglishFan',
        content: '写得太好了！我也在学习时态，一起加油！💪',
        likes: ['user-1'],
        createdAt: new Date('2024-12-20T10:30:00')
      }
    ],
    shares: 5,
    views: 128,
    isPinned: true,
    createdAt: new Date('2024-12-20T09:00:00'),
    updatedAt: new Date('2024-12-20T09:00:00')
  },
  {
    id: 'post-2',
    authorId: 'user-sample-2',
    authorName: 'CosmicDreamer',
    authorLevel: 'beginner',
    authorTitle: '星空探索者',
    content: '刚开始学英语，有点紧张但也很期待！有没有初学者一起组队学习的？🌟',
    attachments: [],
    tags: ['新手', '组队学习'],
    likes: ['user-1', 'user-3'],
    comments: [],
    shares: 2,
    views: 56,
    isHot: true,
    createdAt: new Date('2024-12-20T08:00:00'),
    updatedAt: new Date('2024-12-20T08:00:00')
  },
  {
    id: 'post-3',
    authorId: 'user-sample-3',
    authorName: 'VocabMaster',
    authorLevel: 'advanced',
    authorTitle: '星辰大师',
    content: '分享一个超实用的单词记忆方法！\n\n🎯 联想记忆法：\n- abandon = a + band + on（一个乐队在演出）→ 放弃\n- abundant = a + bund + ant（一群蚂蚁在堤坝上）→ 丰富的\n\n大家试试看，效果真的很好！',
    attachments: [
      {
        id: 'attach-1',
        type: 'image',
        url: '/images/vocab-tips.png',
        name: '单词记忆技巧.png'
      }
    ],
    tags: ['词汇', '学习方法', '干货'],
    likes: ['user-1', 'user-2', 'user-4', 'user-5', 'user-6'],
    comments: [
      {
        id: 'comment-2',
        postId: 'post-3',
        authorId: 'user-4',
        authorName: 'LearningQueen',
        content: '这个方法太棒了！已收藏！',
        likes: ['user-3'],
        createdAt: new Date('2024-12-19T15:00:00')
      },
      {
        id: 'comment-3',
        postId: 'post-3',
        authorId: 'user-5',
        authorName: 'WordHunter',
        content: '感谢分享，我也来补充一个：necessary = ne + ce + ss + ary（一件衬衫一条领带两只袜子）',
        likes: ['user-3', 'user-4'],
        createdAt: new Date('2024-12-19T16:30:00')
      }
    ],
    shares: 15,
    views: 342,
    isHot: true,
    createdAt: new Date('2024-12-19T14:00:00'),
    updatedAt: new Date('2024-12-19T14:00:00')
  }
]

// 示例好友数据
const SAMPLE_FRIENDS = [
  {
    id: 'friend-ai',
    username: 'Star Guide AI',
    avatar: '🤖',
    bio: 'I am your AI tutor. Ask me anything about your studies.',
    level: 'advanced' as EnglishLevel,
    title: 'AI导师',
    isOnline: true,
    isAI: true
  },
  {
    id: 'friend-1',
    username: 'Sarah Star',
    avatar: '👩',
    bio: '热爱英语学习，一起进步！',
    level: 'intermediate' as EnglishLevel,
    title: '银河学者',
    isOnline: true
  },
  {
    id: 'friend-2',
    username: 'Cosmic Dan',
    avatar: '👨',
    bio: '每天学习一点点',
    level: 'beginner' as EnglishLevel,
    title: '星空探索者',
    isOnline: false
  }
]

class CommunityService {
  private postsKey = 'wenya_community_posts'
  private friendsKey = 'wenya_friends'
  private messagesKey = 'wenya_messages'
  private profileKey = 'wenya_community_profile'

  // ==================== 帖子相关 ====================

  /**
   * 获取所有帖子
   */
  getPosts(userId?: string): CommunityPost[] {
    if (typeof window === 'undefined') return SAMPLE_POSTS

    const stored = localStorage.getItem(this.postsKey)
    const userPosts: CommunityPost[] = stored ? JSON.parse(stored) : []
    
    // 合并示例帖子和用户帖子
    const allPosts = [...userPosts, ...SAMPLE_POSTS]
    
    // 按时间排序，置顶帖子优先
    return allPosts.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }

  /**
   * 创建帖子
   */
  createPost(
    userId: string,
    username: string,
    level: EnglishLevel,
    content: string,
    attachments: PostAttachment[] = [],
    tags: string[] = []
  ): CommunityPost {
    const profile = this.getProfile(userId)
    
    const post: CommunityPost = {
      id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      authorId: userId,
      authorName: username,
      authorLevel: level,
      authorTitle: profile?.title || this.calculateTitle(profile?.studyDays || 0),
      content,
      attachments,
      tags,
      likes: [],
      comments: [],
      shares: 0,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const posts = this.getUserPosts()
    posts.unshift(post)
    this.savePosts(posts)

    // 更新用户资料
    if (profile) {
      profile.postsCount += 1
      this.saveProfile(profile)
    }

    return post
  }

  /**
   * 获取用户发布的帖子
   */
  private getUserPosts(): CommunityPost[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(this.postsKey)
    return stored ? JSON.parse(stored) : []
  }

  /**
   * 保存帖子
   */
  private savePosts(posts: CommunityPost[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.postsKey, JSON.stringify(posts))
  }

  /**
   * 点赞帖子
   */
  likePost(postId: string, userId: string): { success: boolean; likesCount: number } {
    const posts = this.getUserPosts()
    const postIndex = posts.findIndex(p => p.id === postId)
    
    if (postIndex === -1) {
      // 检查是否是示例帖子
      const samplePost = SAMPLE_POSTS.find(p => p.id === postId)
      if (samplePost) {
        if (samplePost.likes.includes(userId)) {
          samplePost.likes = samplePost.likes.filter(id => id !== userId)
        } else {
          samplePost.likes.push(userId)
        }
        return { success: true, likesCount: samplePost.likes.length }
      }
      return { success: false, likesCount: 0 }
    }

    const post = posts[postIndex]
    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter(id => id !== userId)
    } else {
      post.likes.push(userId)
    }
    
    this.savePosts(posts)
    return { success: true, likesCount: post.likes.length }
  }

  /**
   * 添加评论
   */
  addComment(
    postId: string,
    userId: string,
    username: string,
    content: string,
    replyTo?: string,
    replyToName?: string
  ): PostComment | null {
    const posts = this.getUserPosts()
    const postIndex = posts.findIndex(p => p.id === postId)
    
    const comment: PostComment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      postId,
      authorId: userId,
      authorName: username,
      content,
      likes: [],
      replyTo,
      replyToName,
      createdAt: new Date()
    }

    if (postIndex !== -1) {
      posts[postIndex].comments.push(comment)
      this.savePosts(posts)
      return comment
    }

    // 处理示例帖子的评论
    const samplePost = SAMPLE_POSTS.find(p => p.id === postId)
    if (samplePost) {
      samplePost.comments.push(comment)
      return comment
    }

    return null
  }

  /**
   * 分享帖子
   */
  sharePost(postId: string): boolean {
    const posts = this.getUserPosts()
    const postIndex = posts.findIndex(p => p.id === postId)
    
    if (postIndex !== -1) {
      posts[postIndex].shares += 1
      this.savePosts(posts)
      return true
    }

    const samplePost = SAMPLE_POSTS.find(p => p.id === postId)
    if (samplePost) {
      samplePost.shares += 1
      return true
    }

    return false
  }

  // ==================== 好友相关 ====================

  /**
   * 获取好友列表
   */
  getFriends(userId: string): typeof SAMPLE_FRIENDS {
    // 返回示例好友数据
    return SAMPLE_FRIENDS
  }

  /**
   * 添加好友
   */
  addFriend(userId: string, friendId: string): Friendship {
    const friendship: Friendship = {
      id: `friendship_${Date.now()}`,
      userId,
      friendId,
      status: 'pending',
      createdAt: new Date()
    }

    const friends = this.getUserFriends(userId)
    friends.push(friendship)
    this.saveFriends(userId, friends)

    return friendship
  }

  private getUserFriends(userId: string): Friendship[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(`${this.friendsKey}_${userId}`)
    return stored ? JSON.parse(stored) : []
  }

  private saveFriends(userId: string, friends: Friendship[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(`${this.friendsKey}_${userId}`, JSON.stringify(friends))
  }

  // ==================== 私信相关 ====================

  /**
   * 获取聊天消息
   */
  getMessages(userId: string, friendId: string): DirectMessage[] {
    if (typeof window === 'undefined') return []
    
    const key = this.getConversationKey(userId, friendId)
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : []
  }

  /**
   * 发送消息
   */
  sendMessage(
    senderId: string,
    senderName: string,
    receiverId: string,
    content: string,
    attachments?: PostAttachment[]
  ): DirectMessage {
    const message: DirectMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId,
      senderName,
      receiverId,
      content,
      attachments,
      isRead: false,
      createdAt: new Date()
    }

    const key = this.getConversationKey(senderId, receiverId)
    const messages = this.getMessages(senderId, receiverId)
    messages.push(message)
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(messages))
    }

    return message
  }

  /**
   * 获取AI回复
   */
  getAIResponse(userMessage: string): string {
    const responses = [
      "That's a great question! Let me help you with that.",
      "I understand. Here's what I suggest for your learning journey...",
      "Excellent progress! Keep up the good work! 🌟",
      "Let me explain this concept in a simpler way...",
      "Practice makes perfect! Try this exercise...",
      "You're doing amazing! Here's a tip to improve further..."
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  private getConversationKey(userId1: string, userId2: string): string {
    const sorted = [userId1, userId2].sort()
    return `${this.messagesKey}_${sorted[0]}_${sorted[1]}`
  }

  // ==================== 用户资料相关 ====================

  /**
   * 获取用户社区资料
   */
  getProfile(userId: string): CommunityProfile | null {
    if (typeof window === 'undefined') return null
    
    const stored = localStorage.getItem(`${this.profileKey}_${userId}`)
    if (stored) {
      return JSON.parse(stored)
    }

    // 创建默认资料
    const user = localStorage.getItem('wenya_user')
    if (user) {
      const userData = JSON.parse(user)
      const profile: CommunityProfile = {
        userId,
        username: userData.username,
        level: userData.level,
        title: '星际新人',
        studyDays: 1,
        postsCount: 0,
        likesReceived: 0,
        friendsCount: 3,
        isOnline: true,
        lastActiveAt: new Date()
      }
      this.saveProfile(profile)
      return profile
    }

    return null
  }

  /**
   * 保存用户资料
   */
  saveProfile(profile: CommunityProfile): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(`${this.profileKey}_${profile.userId}`, JSON.stringify(profile))
  }

  /**
   * 计算用户称号
   */
  calculateTitle(studyDays: number): string {
    if (studyDays >= 180) return USER_TITLES.legend.title
    if (studyDays >= 90) return USER_TITLES.master.title
    if (studyDays >= 30) return USER_TITLES.scholar.title
    if (studyDays >= 7) return USER_TITLES.explorer.title
    return USER_TITLES.newcomer.title
  }

  // ==================== 热门标签 ====================

  /**
   * 获取热门标签
   */
  getHotTags(): string[] {
    return [
      '学习心得', '语法', '词汇', '口语', '听力',
      '考试', '雅思', '托福', '日常英语', '商务英语',
      '学习方法', '打卡', '求助', '分享', '讨论'
    ]
  }
}

export const communityService = new CommunityService()
