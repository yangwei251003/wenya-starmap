# 星光殿堂 (Starlight Hall) - 社区交流功能需求文档

## Introduction

星光殿堂是问芽星图平台的社区交流功能模块，为用户提供一个学习交流、分享资源、结交学友的互动空间。该功能模块包含社区动态发布、文件/视频/链接分享、好友系统、实时聊天、点赞评论转发等核心社交功能，旨在打造一个充满活力的英语学习社区。

## Glossary

- **星光殿堂 (Starlight Hall)**: 社区交流功能的总称
- **动态 (Post)**: 用户发布的内容，包含文字、图片、视频、文件或链接
- **星友 (Star Friend)**: 平台上的好友
- **星币 (Star Coin)**: 平台虚拟货币
- **学习圈 (Learning Circle)**: 用户的好友圈子
- **资源分享 (Resource Share)**: 用户上传的学习资料
- **AI导师 (Star Guide AI)**: 平台的AI学习助手

## Requirements

### Requirement 1: 社区动态发布

**User Story:** As a user, I want to publish posts with text, images, videos, files, and links, so that I can share my learning experiences and resources with the community.

#### Acceptance Criteria

1. WHEN a user clicks the post creation button THEN the system SHALL display a post editor with text input, media upload options, and link input fields
2. WHEN a user uploads an image THEN the system SHALL accept JPG, PNG, GIF formats up to 10MB and display a preview
3. WHEN a user uploads a video THEN the system SHALL accept MP4, WebM formats up to 100MB and display a thumbnail preview
4. WHEN a user uploads a file THEN the system SHALL accept PDF, DOC, DOCX, PPT, PPTX formats up to 50MB and display file information
5. WHEN a user adds a network link THEN the system SHALL validate the URL format and display a link preview card
6. WHEN a user submits a post THEN the system SHALL save the post and display it in the community feed immediately
7. WHEN a post contains multiple media types THEN the system SHALL display them in an organized gallery layout

### Requirement 2: 社区动态浏览

**User Story:** As a user, I want to browse community posts in a feed, so that I can discover learning content and interact with other learners.

#### Acceptance Criteria

1. WHEN a user visits the community page THEN the system SHALL display posts in reverse chronological order with infinite scroll
2. WHEN displaying a post THEN the system SHALL show author avatar, username, level badge, post time, content, and interaction buttons
3. WHEN a post contains media THEN the system SHALL display images in a responsive grid and videos with play controls
4. WHEN a user scrolls to the bottom THEN the system SHALL load more posts automatically
5. WHEN a user filters posts by category THEN the system SHALL display only posts matching the selected category
6. WHEN a user searches posts THEN the system SHALL return posts containing the search keywords in title or content

### Requirement 3: 点赞功能

**User Story:** As a user, I want to like posts and comments, so that I can show appreciation for helpful content.

#### Acceptance Criteria

1. WHEN a user clicks the like button on a post THEN the system SHALL increment the like count and highlight the button
2. WHEN a user clicks the like button again THEN the system SHALL decrement the like count and remove the highlight
3. WHEN displaying a post THEN the system SHALL show the total like count and whether the current user has liked it
4. WHEN a post receives a like THEN the system SHALL notify the post author
5. WHEN a user likes a comment THEN the system SHALL increment the comment like count

### Requirement 4: 评论功能

**User Story:** As a user, I want to comment on posts and reply to other comments, so that I can engage in discussions with the community.

#### Acceptance Criteria

1. WHEN a user submits a comment THEN the system SHALL add the comment to the post and display it immediately
2. WHEN a user replies to a comment THEN the system SHALL display the reply nested under the parent comment
3. WHEN displaying comments THEN the system SHALL show commenter avatar, username, comment time, content, and like count
4. WHEN a post receives a comment THEN the system SHALL notify the post author
5. WHEN a user deletes their own comment THEN the system SHALL remove the comment and update the comment count
6. WHEN displaying a post THEN the system SHALL show the total comment count

### Requirement 5: 转发分享功能

**User Story:** As a user, I want to share posts with my friends, so that I can spread useful learning content.

#### Acceptance Criteria

1. WHEN a user clicks the share button THEN the system SHALL display share options including share to friends and copy link
2. WHEN a user shares to a friend THEN the system SHALL send the post as a message to the selected friend
3. WHEN a user copies the link THEN the system SHALL copy the post URL to clipboard and show confirmation
4. WHEN displaying a post THEN the system SHALL show the total share count
5. WHEN a shared post is viewed THEN the system SHALL display the original post with a "shared by" attribution

### Requirement 6: 好友系统

**User Story:** As a user, I want to add friends and manage my friend list, so that I can build a learning network.

#### Acceptance Criteria

1. WHEN a user sends a friend request THEN the system SHALL notify the recipient and add the request to pending list
2. WHEN a user accepts a friend request THEN the system SHALL add both users to each other's friend list
3. WHEN a user rejects a friend request THEN the system SHALL remove the request from pending list
4. WHEN a user views their friend list THEN the system SHALL display friends with avatar, username, level, and online status
5. WHEN a user removes a friend THEN the system SHALL remove both users from each other's friend list
6. WHEN a user searches for users THEN the system SHALL return matching users with option to send friend request

### Requirement 7: 实时聊天功能

**User Story:** As a user, I want to chat with my friends in real-time, so that I can discuss learning topics and practice English.

#### Acceptance Criteria

1. WHEN a user opens a chat with a friend THEN the system SHALL display the chat history and a message input field
2. WHEN a user sends a text message THEN the system SHALL deliver it to the recipient and display it in the chat
3. WHEN a user sends an image or file THEN the system SHALL upload and deliver it to the recipient
4. WHEN a user receives a message THEN the system SHALL display a notification and update the chat list
5. WHEN displaying the chat list THEN the system SHALL show recent conversations sorted by last message time
6. WHEN a user is typing THEN the system SHALL show a typing indicator to the recipient

### Requirement 8: AI导师聊天

**User Story:** As a user, I want to chat with the AI tutor, so that I can get help with my English learning questions.

#### Acceptance Criteria

1. WHEN a user opens the AI tutor chat THEN the system SHALL display a welcome message and chat interface
2. WHEN a user sends a question THEN the system SHALL process it and return an AI-generated response
3. WHEN the AI responds THEN the system SHALL display the response with proper formatting for code, lists, and emphasis
4. WHEN displaying the AI chat THEN the system SHALL show the AI tutor with a distinct avatar and "AI" badge
5. WHEN a user asks about vocabulary or grammar THEN the system SHALL provide educational explanations with examples

### Requirement 9: 用户资料展示

**User Story:** As a user, I want to view other users' profiles, so that I can learn about their learning progress and connect with them.

#### Acceptance Criteria

1. WHEN a user views a profile THEN the system SHALL display avatar, username, level, star coins, study time, and contribution count
2. WHEN viewing a profile THEN the system SHALL show the user's recent posts and achievements
3. WHEN viewing a profile THEN the system SHALL display friend status and option to add/remove friend
4. WHEN a user edits their own profile THEN the system SHALL allow updating avatar, username, and bio
5. WHEN displaying user level THEN the system SHALL show a visual badge indicating beginner, intermediate, or advanced

### Requirement 10: 通知系统

**User Story:** As a user, I want to receive notifications for social interactions, so that I can stay engaged with the community.

#### Acceptance Criteria

1. WHEN a user receives a like, comment, or friend request THEN the system SHALL create a notification
2. WHEN displaying notifications THEN the system SHALL show notification type, sender, content preview, and time
3. WHEN a user clicks a notification THEN the system SHALL navigate to the relevant content
4. WHEN a user has unread notifications THEN the system SHALL display a badge count on the notification icon
5. WHEN a user marks notifications as read THEN the system SHALL update the read status and badge count

### Requirement 11: 内容分类与标签

**User Story:** As a user, I want to categorize and tag my posts, so that others can easily find relevant content.

#### Acceptance Criteria

1. WHEN creating a post THEN the system SHALL allow selecting a category from predefined options
2. WHEN creating a post THEN the system SHALL allow adding custom tags up to 5 tags per post
3. WHEN browsing posts THEN the system SHALL allow filtering by category
4. WHEN clicking a tag THEN the system SHALL display all posts with that tag
5. WHEN displaying trending content THEN the system SHALL show popular tags and categories

### Requirement 12: 资源收藏功能

**User Story:** As a user, I want to bookmark posts and resources, so that I can easily find them later.

#### Acceptance Criteria

1. WHEN a user clicks the bookmark button THEN the system SHALL add the post to the user's saved items
2. WHEN a user views their saved items THEN the system SHALL display all bookmarked posts
3. WHEN a user removes a bookmark THEN the system SHALL remove the post from saved items
4. WHEN displaying a post THEN the system SHALL indicate whether the user has bookmarked it
