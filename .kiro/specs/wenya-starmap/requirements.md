# 成长星图 (Growth Starmap) - 需求文档

## 简介

成长星图是一个智能化的学习记录和指引中心，通过实时分析用户的学习数据，提供个性化的学习建议和可视化展示。系统确保每个学习记录都是有效的，避免重复学习已完全掌握的内容，按照科学的时间间隔安排复习和新学习，让网站智能化地为用户服务，提供精准的学习指引。所有学习数据都实时记录并统计，确保信息的准确性。

## 术语表

- **Growth_Starmap_System**: 成长星图系统
- **User**: 使用问芽星图学习英语的学生
- **Word_Record**: 单词学习记录，包含单词ID、用户ID、记忆稳定性、难度、下次复习时间等数据
- **Course_Record**: 课程学习记录，包含课程ID、用户ID、完成进度、掌握程度等数据
- **Retrievability**: 可提取概率，表示当前时刻用户能够回忆起某个单词的概率（0-1之间）
- **Stability**: 记忆稳定性，数值越大表示单词越不容易被遗忘
- **Mastery_Level**: 掌握程度，分为新学习、学习中、复习中、已掌握四个级别
- **Learning_Path**: 个性化学习路径，基于用户当前水平和学习目标生成的学习建议
- **Smart_Scheduler**: 智能调度器，根据遗忘曲线和用户表现安排学习和复习时间
- **Progress_Analytics**: 进度分析，实时统计和分析用户的学习成果和趋势
- **Duplicate_Prevention**: 重复防护，避免用户重复学习已完全掌握的内容
- **Real_Time_Tracking**: 实时追踪，即时记录和更新用户的学习活动和成果

## 需求

### 需求 1: 智能学习内容筛选

**用户故事:** 作为学习者，我希望系统能够智能筛选学习内容，避免重复学习已经完全掌握的单词或课程

#### 验收标准

1. WHEN the Growth_Starmap_System evaluates learning content THEN the Growth_Starmap_System SHALL exclude words with Mastery_Level of "已掌握" and Stability greater than 90 days
2. WHEN the Growth_Starmap_System generates study recommendations THEN the Growth_Starmap_System SHALL prioritize content based on Retrievability scores and learning urgency
3. WHEN a User attempts to study mastered content THEN the Growth_Starmap_System SHALL display a confirmation dialog explaining the content is already mastered
4. WHEN the Growth_Starmap_System detects repeated high performance THEN the Growth_Starmap_System SHALL automatically promote content to mastered status
5. WHEN the Growth_Starmap_System filters content THEN the Growth_Starmap_System SHALL maintain a minimum variety of 5 different content types in recommendations

### 需求 2: 智能复习调度系统

**用户故事:** 作为学习者，我希望系统能够按照科学的时间间隔安排我的复习和新学习，确保学习效果最大化

#### 验收标准

1. WHEN the Smart_Scheduler calculates review timing THEN the Smart_Scheduler SHALL use FSRS algorithm to determine optimal review intervals based on individual forgetting curves
2. WHEN the Smart_Scheduler generates daily plans THEN the Smart_Scheduler SHALL balance new learning and review content in a 3:7 ratio
3. WHEN a User's Retrievability drops below 0.8 THEN the Smart_Scheduler SHALL prioritize that content for immediate review
4. WHEN the Smart_Scheduler detects optimal learning windows THEN the Smart_Scheduler SHALL send personalized study reminders
5. WHEN the Smart_Scheduler plans future sessions THEN the Smart_Scheduler SHALL adapt intervals based on User's recent performance trends

### 需求 3: 个性化学习路径生成

**用户故事:** 作为学习者，我希望系统能够为我提供个性化的学习指引，让网站智能化地为我服务

#### 验收标准

1. WHEN the Growth_Starmap_System analyzes User performance THEN the Growth_Starmap_System SHALL generate personalized Learning_Path recommendations based on strengths and weaknesses
2. WHEN the Growth_Starmap_System provides guidance THEN the Growth_Starmap_System SHALL offer specific next-step suggestions with reasoning explanations
3. WHEN a User completes learning activities THEN the Growth_Starmap_System SHALL dynamically adjust the Learning_Path based on new performance data
4. WHEN the Growth_Starmap_System detects learning difficulties THEN the Growth_Starmap_System SHALL suggest alternative learning strategies or prerequisite content
5. WHEN the Growth_Starmap_System generates recommendations THEN the Growth_Starmap_System SHALL consider User's available time, energy level, and learning preferences

### 需求 4: 实时学习记录追踪

**用户故事:** 作为学习者，我希望系统能够实时记录并统计我的学习记录和学习成果，让各项数据都跟着变化

#### 验收标准

1. WHEN a User completes any learning activity THEN the Real_Time_Tracking SHALL immediately update Word_Record and Course_Record with new performance data
2. WHEN the Real_Time_Tracking processes learning data THEN the Real_Time_Tracking SHALL update all related statistics within 2 seconds
3. WHEN the Real_Time_Tracking detects data changes THEN the Real_Time_Tracking SHALL trigger automatic recalculation of Progress_Analytics
4. WHEN a User views progress information THEN the Real_Time_Tracking SHALL display the most current data without requiring manual refresh
5. WHEN the Real_Time_Tracking updates records THEN the Real_Time_Tracking SHALL maintain data consistency across all related learning metrics

### 需求 5: 学习成果准确性保障

**用户故事:** 作为学习者，我希望系统能够确保呈现信息的准确性，让我能够信任系统提供的学习数据和建议

#### 验收标准

1. WHEN the Growth_Starmap_System calculates learning metrics THEN the Growth_Starmap_System SHALL validate all input data for completeness and accuracy before processing
2. WHEN the Growth_Starmap_System detects data inconsistencies THEN the Growth_Starmap_System SHALL flag errors and request data verification
3. WHEN the Growth_Starmap_System stores learning records THEN the Growth_Starmap_System SHALL implement data integrity checks and backup mechanisms
4. WHEN the Growth_Starmap_System displays progress statistics THEN the Growth_Starmap_System SHALL show confidence levels and data freshness indicators
5. WHEN the Growth_Starmap_System processes concurrent updates THEN the Growth_Starmap_System SHALL prevent data conflicts using transaction locks

### 需求 7: 自动化数据收集和同步

**用户故事:** 作为学习者，我不想手动记录任何数据，系统应该自动追踪我的学习活动并保持数据同步

#### 验收标准

1. WHEN User completes any exercise THEN the Growth_Starmap_System SHALL automatically update Word_Record with new Stability and Retrievability values
2. WHEN User answers a question THEN the Growth_Starmap_System SHALL record the timestamp, accuracy, and response time without User input
3. WHEN calculating learning metrics THEN the Growth_Starmap_System SHALL use FSRS algorithm to compute Retrievability based on elapsed time and Stability
4. WHEN User views any dashboard THEN the Growth_Starmap_System SHALL display real-time calculated metrics without requiring manual data entry
5. WHEN background calculations occur THEN the Growth_Starmap_System SHALL complete all metric updates within 2 seconds

### 需求 8: 响应式界面和跨设备同步

**用户故事:** 作为学习者，我想在不同设备上查看成长星图，并保持学习进度同步

#### 验收标准

1. WHEN User accesses Growth_Starmap_System on mobile device THEN the Growth_Starmap_System SHALL render all visualizations in mobile-optimized layout
2. WHEN User accesses Growth_Starmap_System on desktop THEN the Growth_Starmap_System SHALL display all modules in an adaptive grid layout
3. WHEN screen size changes THEN the Growth_Starmap_System SHALL adapt chart dimensions and maintain readability
4. WHEN User switches between devices THEN the Growth_Starmap_System SHALL synchronize all learning progress and recommendations
5. WHEN rendering complex visualizations THEN the Growth_Starmap_System SHALL maintain 60fps animation performance

### 需求 9: 数据安全和隐私保护

**用户故事:** 作为学习者，我想确保我的学习数据安全存储且只有我能访问

#### 验收标准

1. WHEN the Growth_Starmap_System stores learning records THEN the Growth_Starmap_System SHALL persist all required fields with encryption and backup mechanisms
2. WHEN User logs in THEN the Growth_Starmap_System SHALL only display that User's learning data and recommendations
3. WHEN the Growth_Starmap_System performs calculations THEN the Growth_Starmap_System SHALL use only the authenticated User's learning records
4. WHEN data is transmitted THEN the Growth_Starmap_System SHALL use encrypted connections for all API requests
5. WHEN User logs out THEN the Growth_Starmap_System SHALL clear all cached learning data from the client
