# 星光殿堂 (Starlight Hall) - 设计文档

## Overview

星光殿堂是问芽星图平台的社区交流模块，提供完整的社交功能体验。该模块采用现代化的UI设计，与平台整体的宇宙星空主题保持一致，为用户打造一个温馨、活跃的学习社区。

### 核心功能
- 社区动态发布与浏览
- 点赞、评论、转发互动
- 好友系统与实时聊天
- AI导师对话
- 通知与消息系统

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    星光殿堂 (Starlight Hall)                  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   社区模块   │  │   聊天模块   │  │      好友模块        │  │
│  │  Community  │  │    Chat     │  │      Friends        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    数据服务层                            ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   ││
│  │  │PostService│ │ChatService│ │FriendSvc │ │NotifySvc │   ││
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐│
│  │                  本地存储 (localStorage)                 ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 页面组件

#### 1. StarlightHallPage (`app/community/page.tsx`)
主页面组件，包含两个主要视图：
- **社区视图 (Community)**: 动态流、发帖、互动
- **聊天视图 (Chat & AI)**: 好友聊天、AI导师

```typescript
interface StarlightHallPageProps {
  initialView?: 'community' | 'chat'
}
```

#### 2. CommunityFeed (`components/community/CommunityFeed.tsx`)
社区动态流组件

```typescript
interface CommunityFeedProps {
  posts: Post[]
  onLoadMore: () => void
  onLike: (postId: string) => void
  onComment: (postId: string, content: string) => void
  onShare: (postId: string) => void
  onBookmark: (postId: string) => void
}
```

#### 3. PostCard (`components/community/PostCard.tsx`)
单个帖子卡片组件

```typescript
interface PostCardProps {
  post: Post
  currentUserId: string
  onLike: () => void
  onComment: () => void
  onShare: () => void
  onBookmark: () => void
  onUserClick: (userId: string) => void
}
```

#### 4. PostEditor (`components/community/PostEditor.tsx`)
发帖编辑器组件

```typescript
interface PostEditorProps {
  onSubmit: (post: CreatePostData) => void
  onCancel: () => void
}

interface CreatePostData {
  content: string
  images?: File[]
  video?: File
  files?: File[]
  links?: string[]
  category: PostCategory
  tags: string[]
}
```

#### 5. CommentSection (`components/community/CommentSection.tsx`)
评论区组件

```typescript
interface CommentSectionProps {
  postId: string
  comments: Comment[]
  onAddComment: (content: string, parentId?: string) => void
  onLikeComment: (commentId: string) => void
  onDeleteComment: (commentId: string) => void
}
```

#### 6. FriendList (`components/community/FriendList.tsx`)
好友列表组件

```typescript
interface FriendListProps {
  friends: Friend[]
  onSelectFriend: (friendId: string) => void
  onRemoveFriend: (friendId: string) => void
  selectedFriendId?: string
}
```

#### 7. ChatWindow (`components/community/ChatWindow.tsx`)
聊天窗口组件

```typescript
interface ChatWindowProps {
  chatId: string
  messages: Message[]
  recipient: User | AITutor
  onSendMessage: (content: string, type: MessageType) => void
  onSendFile: (file: File) => void
}
```

#### 8. UserProfileCard (`components/community/UserProfileCard.tsx`)
用户资料卡片组件

```typescript
interface UserProfileCardProps {
  user: CommunityUser
  isFriend: boolean
  onAddFriend: () => void
  onRemoveFriend: () => void
  onSendMessage: () => void
}
```

### 服务层接口

#### CommunityService (`lib/community-service.ts`)

```typescript
interface CommunityService {
  // 帖子相关
  getPosts(options: GetPostsOptions): Post[]
  createPost(data: CreatePostData): Post
  deletePost(postId: string): boolean
  
  // 互动相关
  likePost(postId: string, userId: string): boolean
  unlikePost(postId: string, userId: string): boolean
  addComment(postId: string, comment: CreateCommentData): Comment
  deleteComment(commentId: string): boolean
  sharePost(postId: string, targetUserId: string): boolean
  bookmarkPost(postId: string, userId: string): boolean
  
  // 搜索和筛选
  searchPosts(query: string): Post[]
  filterByCategory(category: PostCategory): Post[]
  filterByTag(tag: string): Post[]
}
```

#### FriendService (`lib/friend-service.ts`)

```typescript
interface FriendService {
  getFriends(userId: string): Friend[]
  sendFriendRequest(fromUserId: string, toUserId: string): FriendRequest
  acceptFriendRequest(requestId: string): boolean
  rejectFriendRequest(requestId: string): boolean
  removeFriend(userId: string, friendId: string): boolean
  searchUsers(query: string): CommunityUser[]
  getOnlineStatus(userId: string): boolean
}
```

#### ChatService (`lib/chat-service.ts`)

```typescript
interface ChatService {
  getConversations(userId: string): Conversation[]
  getMessages(conversationId: string): Message[]
  sendMessage(conversationId: string, message: CreateMessageData): Message
  markAsRead(conversationId: string): void
  getUnreadCount(userId: string): number
}
```

#### NotificationService (`lib/notification-service.ts`)

```typescript
interface NotificationService {
  getNotifications(userId: string): Notification[]
  createNotification(data: CreateNotificationData): Notification
  markAsRead(notificationId: string): void
  markAllAsRead(userId: string): void
  getUnreadCount(userId: string): number
}
```

## Data Models

### Post (帖子)

```typescript
interface Post {
  id: string
  authorId: string
  author: CommunityUser
  content: string
  images: string[]           // 图片URL列表
  video?: string             // 视频URL
  files: PostFile[]          // 附件列表
  links: LinkPreview[]       // 链接预览
  category: PostCategory
  tags: string[]
  likes: string[]            // 点赞用户ID列表
  likeCount: number
  commentCount: number
  shareCount: number
  bookmarks: string[]        // 收藏用户ID列表
  createdAt: Date
  updatedAt: Date
}

interface PostFile {
  id: string
  name: string
  type: string
  size: number
  url: string
}

interface LinkPreview {
  url: string
  title?: string
  description?: string
  image?: string
}

type PostCategory = 
  | 'learning'      // 学习分享
  | 'question'      // 问题求助
  | 'resource'      // 资源分享
  | 'discussion'    // 话题讨论
  | 'achievement'   // 成就展示
  | 'daily'         // 日常打卡
```

### Comment (评论)

```typescript
interface Comment {
  id: string
  postId: string
  authorId: string
  author: CommunityUser
  content: string
  parentId?: string          // 父评论ID（用于回复）
  likes: string[]
  likeCount: number
  createdAt: Date
}
```

### CommunityUser (社区用户)

```typescript
interface CommunityUser {
  id: string
  username: string
  avatar?: string
  level: EnglishLevel
  bio?: string
  starCoins: number
  studyTime: number          // 学习时长（分钟）
  postCount: number
  friendCount: number
  isOnline: boolean
  lastActiveAt: Date
}
```

### Friend (好友)

```typescript
interface Friend {
  userId: string
  friendId: string
  user: CommunityUser
  addedAt: Date
}

interface FriendRequest {
  id: string
  fromUserId: string
  toUserId: string
  fromUser: CommunityUser
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: Date
}
```

### Message (消息)

```typescript
interface Message {
  id: string
  conversationId: string
  senderId: string
  sender: CommunityUser | AITutor
  content: string
  type: MessageType
  fileUrl?: string
  fileName?: string
  isRead: boolean
  createdAt: Date
}

type MessageType = 'text' | 'image' | 'file' | 'shared_post'

interface Conversation {
  id: string
  participants: string[]
  lastMessage?: Message
  unreadCount: number
  updatedAt: Date
}

interface AITutor {
  id: 'ai-tutor'
  name: 'Star Guide AI'
  avatar: string
  isAI: true
}
```

### Notification (通知)

```typescript
interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  content: string
  relatedId?: string         // 相关帖子/评论/用户ID
  senderId?: string
  sender?: CommunityUser
  isRead: boolean
  createdAt: Date
}

type NotificationType = 
  | 'like'
  | 'comment'
  | 'reply'
  | 'share'
  | 'friend_request'
  | 'friend_accepted'
  | 'mention'
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: File Upload Validation
*For any* uploaded file, the system should accept it if and only if its type matches the allowed types and its size is within the limit for that file type.
**Validates: Requirements 1.2, 1.3, 1.4**

### Property 2: URL Validation
*For any* string input as a link, the system should correctly identify whether it is a valid URL format.
**Validates: Requirements 1.5**

### Property 3: Post Chronological Order
*For any* list of posts displayed in the feed, they should be sorted in descending order by creation time.
**Validates: Requirements 2.1**

### Property 4: Category Filter Consistency
*For any* category filter applied, all returned posts should have that exact category.
**Validates: Requirements 2.5**

### Property 5: Search Result Relevance
*For any* search query, all returned posts should contain the search term in either title or content.
**Validates: Requirements 2.6**

### Property 6: Like Toggle Idempotence
*For any* post, liking then unliking should return the like count to its original value.
**Validates: Requirements 3.1, 3.2**

### Property 7: Comment Count Consistency
*For any* post, the comment count should equal the number of comments associated with that post.
**Validates: Requirements 4.1, 4.5, 4.6**

### Property 8: Friend Relationship Bidirectionality
*For any* accepted friend request, both users should appear in each other's friend list.
**Validates: Requirements 6.2**

### Property 9: Friend Removal Bidirectionality
*For any* friend removal, both users should be removed from each other's friend list.
**Validates: Requirements 6.5**

### Property 10: Conversation Sort Order
*For any* list of conversations, they should be sorted in descending order by last message time.
**Validates: Requirements 7.5**

### Property 11: Notification Count Accuracy
*For any* user, the unread notification badge count should equal the number of unread notifications.
**Validates: Requirements 10.4**

### Property 12: Tag Limit Enforcement
*For any* post, the number of tags should not exceed 5.
**Validates: Requirements 11.2**

### Property 13: Tag Filter Consistency
*For any* tag filter applied, all returned posts should contain that tag.
**Validates: Requirements 11.4**

## Error Handling

### 文件上传错误
- 文件类型不支持：显示"不支持的文件格式，请上传 [支持的格式]"
- 文件过大：显示"文件大小超过限制（最大 [限制大小]）"
- 上传失败：显示"上传失败，请重试"并提供重试按钮

### 网络错误
- 加载失败：显示"加载失败，请检查网络连接"并提供刷新按钮
- 发送失败：显示"发送失败"并保留用户输入，提供重试选项

### 权限错误
- 未登录：跳转到登录页面
- 无权限操作：显示"您没有权限执行此操作"

### 数据验证错误
- 内容为空：显示"请输入内容"
- 内容过长：显示"内容超过字数限制（最多 [限制字数] 字）"
- 标签过多：显示"最多添加5个标签"

## Testing Strategy

### 单元测试
使用 Jest 进行单元测试：
- 测试数据服务的 CRUD 操作
- 测试文件验证逻辑
- 测试 URL 验证逻辑
- 测试排序和筛选逻辑

### 属性测试
使用 fast-check 进行属性测试：
- 文件类型和大小验证
- URL 格式验证
- 排序一致性
- 筛选结果正确性
- 计数准确性
- 双向关系一致性

### 集成测试
- 发帖流程测试
- 互动功能测试
- 好友系统测试
- 聊天功能测试

### 测试标注格式
每个属性测试必须使用以下格式标注：
`**Feature: starlight-hall, Property {number}: {property_text}**`
