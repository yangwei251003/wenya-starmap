'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  MessageCircle, Heart, Share2, Send, Image, Video, FileText, Link2,
  Users, Star, Sparkles, Crown, Award, Clock, Eye, MoreHorizontal,
  ThumbsUp, Reply, Bookmark, Flag, X, Plus, Search, Bell, Settings,
  Home, MessageSquare, UserPlus, Check, Upload, Smile, Hash
} from 'lucide-react'
import { communityService } from '@/lib/community-service'
import { CommunityPost, PostComment, PostAttachment, EnglishLevel } from '@/types'

export default function CommunityPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'community' | 'chat'>('community')
  const [userId, setUserId] = useState('')
  const [username, setUsername] = useState('')
  const [userLevel, setUserLevel] = useState<EnglishLevel>('beginner')
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [friends, setFriends] = useState<any[]>([])
  const [selectedFriend, setSelectedFriend] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [newPostContent, setNewPostContent] = useState('')
  const [newPostTags, setNewPostTags] = useState<string[]>([])
  const [attachments, setAttachments] = useState<PostAttachment[]>([])
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})
  const [expandedComments, setExpandedComments] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    const user = localStorage.getItem('wenya_user')
    if (user) {
      const userData = JSON.parse(user)
      setUserId(userData.id)
      setUsername(userData.username)
      setUserLevel(userData.level)
      setPosts(communityService.getPosts(userData.id))
      setFriends(communityService.getFriends(userData.id))
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 选择好友聊天
  const selectFriend = (friend: any) => {
    setSelectedFriend(friend)
    if (userId) {
      const msgs = communityService.getMessages(userId, friend.id)
      setMessages(msgs)
    }
  }

  // 发送消息
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedFriend || !userId) return

    const message = communityService.sendMessage(
      userId,
      username,
      selectedFriend.id,
      newMessage.trim()
    )
    setMessages([...messages, message])
    setNewMessage('')

    // AI自动回复
    if (selectedFriend.isAI) {
      setTimeout(() => {
        const aiResponse = communityService.sendMessage(
          selectedFriend.id,
          selectedFriend.username,
          userId,
          communityService.getAIResponse(newMessage)
        )
        setMessages(prev => [...prev, aiResponse])
      }, 1000)
    }
  }

  // 发布帖子
  const handleCreatePost = () => {
    if (!newPostContent.trim() || !userId) return

    const post = communityService.createPost(
      userId,
      username,
      userLevel,
      newPostContent.trim(),
      attachments,
      newPostTags
    )
    setPosts([post, ...posts])
    setNewPostContent('')
    setNewPostTags([])
    setAttachments([])
    setShowCreatePost(false)
  }

  // 点赞帖子
  const handleLikePost = (postId: string) => {
    const result = communityService.likePost(postId, userId)
    if (result.success) {
      setPosts(posts.map(p => {
        if (p.id === postId) {
          const liked = p.likes.includes(userId)
          return {
            ...p,
            likes: liked 
              ? p.likes.filter(id => id !== userId)
              : [...p.likes, userId]
          }
        }
        return p
      }))
    }
  }

  // 添加评论
  const handleAddComment = (postId: string) => {
    const content = commentInputs[postId]
    if (!content?.trim() || !userId) return

    const comment = communityService.addComment(postId, userId, username, content.trim())
    if (comment) {
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return { ...p, comments: [...p.comments, comment] }
        }
        return p
      }))
      setCommentInputs({ ...commentInputs, [postId]: '' })
    }
  }

  // 分享帖子
  const handleSharePost = (postId: string) => {
    communityService.sharePost(postId)
    setPosts(posts.map(p => {
      if (p.id === postId) {
        return { ...p, shares: p.shares + 1 }
      }
      return p
    }))
  }

  // 添加标签
  const addTag = (tag: string) => {
    if (!newPostTags.includes(tag)) {
      setNewPostTags([...newPostTags, tag])
    }
  }

  // 过滤帖子
  const filteredPosts = posts.filter(post => {
    const matchSearch = !searchQuery || 
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.authorName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchTag = !selectedTag || post.tags.includes(selectedTag)
    return matchSearch && matchTag
  })

  // 格式化时间
  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    return new Date(date).toLocaleDateString()
  }

  const hotTags = communityService.getHotTags()

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-star-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cosmos-900 via-cosmos-800 to-cosmos-900">
      {/* 顶部导航 */}
      <div className="glass sticky top-0 z-50 border-b border-cosmos-700/50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-star-400 to-yellow-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-star-400">STARLIGHT HALL</span>
            </div>

            {/* 导航标签 */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('community')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'community'
                    ? 'bg-star-400/20 text-star-400'
                    : 'text-cosmos-400 hover:text-white'
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline">Community</span>
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'chat'
                    ? 'bg-star-400/20 text-star-400'
                    : 'text-cosmos-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                <span className="hidden sm:inline">Chat & AI</span>
              </button>
            </div>

            {/* 用户信息 */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-cosmos-400">🏆 学习</span>
                  <span className="text-white font-bold">1240</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-cosmos-400">⏱️ 时长(h)</span>
                  <span className="text-white font-bold">85</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-cosmos-400">⭐ 贡献</span>
                  <span className="text-white font-bold">14</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">{username.charAt(0).toUpperCase()}</span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-white font-semibold text-sm">{username}</p>
                  <p className="text-cosmos-400 text-xs flex items-center gap-1">
                    <Crown className="w-3 h-3 text-star-400" />
                    Galaxy Scholar
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'community' ? (
          /* 社区内容 */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 左侧边栏 - 热门标签 */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="p-4">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Hash className="w-5 h-5 text-star-400" />
                  热门话题
                </h3>
                <div className="flex flex-wrap gap-2">
                  {hotTags.slice(0, 10).map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        selectedTag === tag
                          ? 'bg-star-400 text-white'
                          : 'bg-cosmos-700 text-cosmos-300 hover:bg-cosmos-600'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </Card>

              {/* 活跃用户 */}
              <Card className="p-4">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-sprout-400" />
                  活跃学友
                </h3>
                <div className="space-y-3">
                  {friends.slice(0, 5).map(friend => (
                    <div key={friend.id} className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-cosmos-700 rounded-full flex items-center justify-center text-lg">
                          {friend.avatar}
                        </div>
                        {friend.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-cosmos-800" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{friend.username}</p>
                        <p className="text-cosmos-400 text-xs">{friend.title}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => {
                        setActiveTab('chat')
                        selectFriend(friend)
                      }}>
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* 中间 - 帖子列表 */}
            <div className="lg:col-span-2 space-y-4">
              {/* 搜索和发帖 */}
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cosmos-400" />
                  <input
                    type="text"
                    placeholder="搜索帖子..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-cosmos-800 border border-cosmos-700 rounded-lg text-white placeholder-cosmos-500 focus:border-star-400 focus:outline-none"
                  />
                </div>
                <Button variant="star" onClick={() => setShowCreatePost(true)}>
                  <Plus className="w-5 h-5 mr-2" />
                  发帖
                </Button>
              </div>

              {/* 帖子列表 */}
              {filteredPosts.map(post => (
                <Card key={post.id} className="p-0 overflow-hidden">
                  {/* 帖子头部 */}
                  <div className="p-4 border-b border-cosmos-700/50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {post.authorName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold">{post.authorName}</span>
                            {post.authorTitle && (
                              <span className="px-2 py-0.5 bg-star-400/20 text-star-400 text-xs rounded-full">
                                {post.authorTitle}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-cosmos-400">
                            <span>{formatTime(post.createdAt)}</span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {post.views}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {post.isPinned && (
                          <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                            📌 置顶
                          </span>
                        )}
                        {post.isHot && (
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                            🔥 热门
                          </span>
                        )}
                        <button className="p-2 hover:bg-cosmos-700 rounded-lg transition-colors">
                          <MoreHorizontal className="w-5 h-5 text-cosmos-400" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 帖子内容 */}
                  <div className="p-4">
                    <p className="text-white whitespace-pre-wrap mb-3">{post.content}</p>
                    
                    {/* 附件 */}
                    {post.attachments.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {post.attachments.map(att => (
                          <div key={att.id} className="relative rounded-lg overflow-hidden bg-cosmos-700">
                            {att.type === 'image' && (
                              <div className="aspect-video bg-cosmos-600 flex items-center justify-center">
                                <Image className="w-8 h-8 text-cosmos-400" />
                              </div>
                            )}
                            {att.type === 'video' && (
                              <div className="aspect-video bg-cosmos-600 flex items-center justify-center">
                                <Video className="w-8 h-8 text-cosmos-400" />
                              </div>
                            )}
                            {att.type === 'file' && (
                              <div className="p-3 flex items-center gap-2">
                                <FileText className="w-6 h-6 text-blue-400" />
                                <span className="text-sm text-white truncate">{att.name}</span>
                              </div>
                            )}
                            {att.type === 'link' && (
                              <div className="p-3 flex items-center gap-2">
                                <Link2 className="w-6 h-6 text-green-400" />
                                <span className="text-sm text-white truncate">{att.name}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 标签 */}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-cosmos-700 text-cosmos-300 text-xs rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 互动按钮 */}
                  <div className="px-4 py-3 border-t border-cosmos-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleLikePost(post.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                          post.likes.includes(userId)
                            ? 'bg-red-500/20 text-red-400'
                            : 'hover:bg-cosmos-700 text-cosmos-400'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${post.likes.includes(userId) ? 'fill-current' : ''}`} />
                        <span>{post.likes.length}</span>
                      </button>
                      <button
                        onClick={() => setExpandedComments(
                          expandedComments.includes(post.id)
                            ? expandedComments.filter(id => id !== post.id)
                            : [...expandedComments, post.id]
                        )}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-cosmos-700 text-cosmos-400 transition-all"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>{post.comments.length}</span>
                      </button>
                      <button
                        onClick={() => handleSharePost(post.id)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-cosmos-700 text-cosmos-400 transition-all"
                      >
                        <Share2 className="w-5 h-5" />
                        <span>{post.shares}</span>
                      </button>
                    </div>
                    <button className="p-2 hover:bg-cosmos-700 rounded-lg text-cosmos-400 transition-all">
                      <Bookmark className="w-5 h-5" />
                    </button>
                  </div>

                  {/* 评论区 */}
                  {expandedComments.includes(post.id) && (
                    <div className="px-4 pb-4 border-t border-cosmos-700/50">
                      {/* 评论列表 */}
                      {post.comments.length > 0 && (
                        <div className="space-y-3 py-3">
                          {post.comments.map(comment => (
                            <div key={comment.id} className="flex gap-3">
                              <div className="w-8 h-8 bg-cosmos-700 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-sm">
                                  {comment.authorName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1 bg-cosmos-800/50 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-white text-sm font-medium">{comment.authorName}</span>
                                  <span className="text-cosmos-500 text-xs">{formatTime(comment.createdAt)}</span>
                                </div>
                                <p className="text-cosmos-300 text-sm">{comment.content}</p>
                                <div className="flex items-center gap-3 mt-2">
                                  <button className="text-cosmos-400 text-xs hover:text-star-400 flex items-center gap-1">
                                    <ThumbsUp className="w-3 h-3" />
                                    {comment.likes.length}
                                  </button>
                                  <button className="text-cosmos-400 text-xs hover:text-star-400 flex items-center gap-1">
                                    <Reply className="w-3 h-3" />
                                    回复
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 评论输入 */}
                      <div className="flex gap-3 pt-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm">{username.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            placeholder="写下你的评论..."
                            value={commentInputs[post.id] || ''}
                            onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                            className="flex-1 px-4 py-2 bg-cosmos-800 border border-cosmos-700 rounded-lg text-white placeholder-cosmos-500 focus:border-star-400 focus:outline-none text-sm"
                          />
                          <Button variant="star" size="sm" onClick={() => handleAddComment(post.id)}>
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* 右侧边栏 - 学习排行 */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="p-4">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  学习排行榜
                </h3>
                <div className="space-y-3">
                  {[
                    { name: 'StarMaster', score: 2580, rank: 1 },
                    { name: 'CosmicLearner', score: 2340, rank: 2 },
                    { name: 'GalaxyKing', score: 2120, rank: 3 },
                    { name: username, score: 1240, rank: 4 },
                    { name: 'NovaStar', score: 980, rank: 5 }
                  ].map((user, idx) => (
                    <div key={idx} className={`flex items-center gap-3 p-2 rounded-lg ${
                      user.name === username ? 'bg-star-400/10 border border-star-400/30' : ''
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        user.rank === 1 ? 'bg-yellow-500 text-white' :
                        user.rank === 2 ? 'bg-gray-400 text-white' :
                        user.rank === 3 ? 'bg-orange-600 text-white' :
                        'bg-cosmos-700 text-cosmos-300'
                      }`}>
                        {user.rank}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{user.name}</p>
                        <p className="text-cosmos-400 text-xs">{user.score} 积分</p>
                      </div>
                      {user.rank <= 3 && (
                        <span className="text-lg">
                          {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : '🥉'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* 今日打卡 */}
              <Card className="p-4 bg-gradient-to-br from-sprout-500/20 to-star-500/20 border-sprout-400/30">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Check className="w-5 h-5 text-sprout-400" />
                  今日学习打卡
                </h3>
                <p className="text-cosmos-300 text-sm mb-3">已有 <span className="text-sprout-400 font-bold">128</span> 人完成打卡</p>
                <Button variant="sprout" className="w-full">
                  <Sparkles className="w-4 h-4 mr-2" />
                  立即打卡
                </Button>
              </Card>
            </div>
          </div>
        ) : (

          /* 聊天界面 */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-180px)]">
            {/* 好友列表 */}
            <div className="lg:col-span-1">
              <Card className="h-full p-0 overflow-hidden">
                <div className="p-4 border-b border-cosmos-700/50">
                  <h3 className="text-lg font-semibold text-star-400 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    好友列表 Friends
                  </h3>
                </div>
                <div className="overflow-y-auto h-[calc(100%-60px)]">
                  {friends.map(friend => (
                    <button
                      key={friend.id}
                      onClick={() => selectFriend(friend)}
                      className={`w-full p-4 flex items-center gap-3 hover:bg-cosmos-700/50 transition-all border-b border-cosmos-700/30 ${
                        selectedFriend?.id === friend.id ? 'bg-cosmos-700/50' : ''
                      }`}
                    >
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                          friend.isAI ? 'bg-gradient-to-br from-blue-500 to-purple-500' : 'bg-cosmos-700'
                        }`}>
                          {friend.avatar}
                        </div>
                        {friend.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-cosmos-800" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{friend.username}</span>
                          {friend.isAI && (
                            <span className="px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded">AI</span>
                          )}
                        </div>
                        <p className="text-cosmos-400 text-xs">
                          {friend.isOnline ? (friend.isAI ? 'AI Tutor' : 'online') : 'offline'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            {/* 聊天区域 */}
            <div className="lg:col-span-3">
              <Card className="h-full p-0 overflow-hidden flex flex-col">
                {selectedFriend ? (
                  <>
                    {/* 聊天头部 */}
                    <div className="p-4 border-b border-cosmos-700/50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                          selectedFriend.isAI ? 'bg-gradient-to-br from-blue-500 to-purple-500' : 'bg-cosmos-700'
                        }`}>
                          {selectedFriend.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold">{selectedFriend.username}</span>
                            {selectedFriend.isAI && (
                              <span className="px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded">AI</span>
                            )}
                          </div>
                          <p className="text-cosmos-400 text-xs">{selectedFriend.title}</p>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-cosmos-700 rounded-lg text-cosmos-400">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>

                    {/* 消息列表 */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {/* 欢迎消息 */}
                      {messages.length === 0 && selectedFriend.isAI && (
                        <div className="flex gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                            {selectedFriend.avatar}
                          </div>
                          <div className="bg-cosmos-700/50 rounded-2xl rounded-tl-none p-4 max-w-md">
                            <p className="text-white">Welcome to Starlight Hall! I am your AI tutor. Ask me anything about your studies.</p>
                            <p className="text-cosmos-500 text-xs mt-2">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      )}

                      {messages.map(msg => (
                        <div
                          key={msg.id}
                          className={`flex gap-3 ${msg.senderId === userId ? 'flex-row-reverse' : ''}`}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            msg.senderId === userId
                              ? 'bg-gradient-to-br from-purple-400 to-pink-500'
                              : selectedFriend.isAI
                              ? 'bg-gradient-to-br from-blue-500 to-purple-500'
                              : 'bg-cosmos-700'
                          }`}>
                            {msg.senderId === userId ? username.charAt(0).toUpperCase() : selectedFriend.avatar}
                          </div>
                          <div className={`rounded-2xl p-4 max-w-md ${
                            msg.senderId === userId
                              ? 'bg-star-500/20 rounded-tr-none'
                              : 'bg-cosmos-700/50 rounded-tl-none'
                          }`}>
                            <p className="text-white">{msg.content}</p>
                            <p className="text-cosmos-500 text-xs mt-2">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* 消息输入 */}
                    <div className="p-4 border-t border-cosmos-700/50">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-2">
                          <button className="p-2 hover:bg-cosmos-700 rounded-lg text-cosmos-400 transition-all">
                            <Image className="w-5 h-5" />
                          </button>
                          <button className="p-2 hover:bg-cosmos-700 rounded-lg text-cosmos-400 transition-all">
                            <FileText className="w-5 h-5" />
                          </button>
                          <button className="p-2 hover:bg-cosmos-700 rounded-lg text-cosmos-400 transition-all">
                            <Smile className="w-5 h-5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder={`Message ${selectedFriend.username}...`}
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          className="flex-1 px-4 py-3 bg-cosmos-800 border border-cosmos-700 rounded-lg text-white placeholder-cosmos-500 focus:border-star-400 focus:outline-none"
                        />
                        <Button variant="star" onClick={handleSendMessage}>
                          <Send className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="w-16 h-16 text-cosmos-600 mx-auto mb-4" />
                      <p className="text-cosmos-400">选择一个好友开始聊天</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* 发帖弹窗 */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl p-0 overflow-hidden animate-fade-in-up">
            <div className="p-4 border-b border-cosmos-700/50 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">发布新帖子</h3>
              <button
                onClick={() => setShowCreatePost(false)}
                className="p-2 hover:bg-cosmos-700 rounded-lg text-cosmos-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* 用户信息 */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{username.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-white font-semibold">{username}</p>
                  <p className="text-cosmos-400 text-sm">发布到社区</p>
                </div>
              </div>

              {/* 内容输入 */}
              <textarea
                placeholder="分享你的学习心得、问题或想法..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="w-full h-40 p-4 bg-cosmos-800 border border-cosmos-700 rounded-lg text-white placeholder-cosmos-500 focus:border-star-400 focus:outline-none resize-none"
              />

              {/* 附件按钮 */}
              <div className="flex items-center gap-3">
                <span className="text-cosmos-400 text-sm">添加：</span>
                <button className="flex items-center gap-2 px-3 py-2 bg-cosmos-700 hover:bg-cosmos-600 rounded-lg text-cosmos-300 transition-all">
                  <Image className="w-4 h-4" />
                  图片
                </button>
                <button className="flex items-center gap-2 px-3 py-2 bg-cosmos-700 hover:bg-cosmos-600 rounded-lg text-cosmos-300 transition-all">
                  <Video className="w-4 h-4" />
                  视频
                </button>
                <button className="flex items-center gap-2 px-3 py-2 bg-cosmos-700 hover:bg-cosmos-600 rounded-lg text-cosmos-300 transition-all">
                  <FileText className="w-4 h-4" />
                  文件
                </button>
                <button className="flex items-center gap-2 px-3 py-2 bg-cosmos-700 hover:bg-cosmos-600 rounded-lg text-cosmos-300 transition-all">
                  <Link2 className="w-4 h-4" />
                  链接
                </button>
              </div>

              {/* 标签选择 */}
              <div>
                <p className="text-cosmos-400 text-sm mb-2">选择标签：</p>
                <div className="flex flex-wrap gap-2">
                  {hotTags.slice(0, 8).map(tag => (
                    <button
                      key={tag}
                      onClick={() => addTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        newPostTags.includes(tag)
                          ? 'bg-star-400 text-white'
                          : 'bg-cosmos-700 text-cosmos-300 hover:bg-cosmos-600'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
                {newPostTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-cosmos-400 text-sm">已选：</span>
                    {newPostTags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-star-400/20 text-star-400 text-sm rounded-full flex items-center gap-1"
                      >
                        #{tag}
                        <button onClick={() => setNewPostTags(newPostTags.filter(t => t !== tag))}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-cosmos-700/50 flex justify-end gap-3">
              <Button variant="cosmos" onClick={() => setShowCreatePost(false)}>
                取消
              </Button>
              <Button
                variant="star"
                onClick={handleCreatePost}
                disabled={!newPostContent.trim()}
              >
                <Send className="w-4 h-4 mr-2" />
                发布
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
