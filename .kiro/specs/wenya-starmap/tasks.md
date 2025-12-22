# 成长星图 (Growth Starmap) - 实施计划

- [x] 1. 实现FSRS算法核心
  - 创建`lib/fsrs-algorithm.ts`文件
  - 实现`calculateRetrievability`函数（基于stability和elapsed time）
  - 实现`updateMemoryParams`函数（答题后更新参数）
  - 实现`calculateNextReview`函数（计算下次复习时间）
  - _需求: 7.3_

- [x] 1.1 编写FSRS算法的基于属性测试
  - **Property 1: FSRS算法一致性**
  - **验证需求: Requirements 7.3**

- [x] 2. 创建扩展的学习记录数据模型和服务
  - 在`types/index.ts`中定义`WordRecord`、`CourseRecord`、`LearningSession`和`UserLearningProfile`接口
  - 创建`lib/word-record-service.ts`
  - 实现学习记录的CRUD操作
  - 实现自动更新记录的逻辑（答题后触发）
  - 添加掌握程度和信心分数字段
  - _需求: 7.1, 7.2, 9.2_

- [x] 2.1 编写学习记录自动更新的基于属性测试
  - **Property 2: 自动更新学习记录**
  - **验证需求: Requirements 7.1**

- [x] 2.2 编写会话数据自动记录的基于属性测试
  - **Property 3: 自动记录会话数据**
  - **验证需求: Requirements 7.2**

- [-] 3. 实现智能内容筛选服务



  - 创建`lib/content-filter-service.ts`
  - 实现`filterMasteredContent`函数（排除已掌握内容）
  - 实现`prioritizeByRetrievability`函数（按可提取概率排序）
  - 实现`maintainContentVariety`函数（保持内容多样性）
  - 实现`detectMasteryPromotion`函数（自动提升掌握状态）
  - _需求: 1.1, 1.2, 1.4, 1.5_

- [-] 3.1 编写内容筛选准确性的基于属性测试

  - **Property 4: 智能内容筛选准确性**
  - **验证需求: Requirements 1.1**

- [ ] 3.2 编写学习优先级排序的基于属性测试
  - **Property 5: 学习优先级排序**
  - **验证需求: Requirements 1.2**

- [ ] 3.3 编写自动掌握状态提升的基于属性测试
  - **Property 6: 自动掌握状态提升**
  - **验证需求: Requirements 1.4**

- [ ] 3.4 编写内容多样性维护的基于属性测试
  - **Property 7: 内容多样性维护**
  - **验证需求: Requirements 1.5**

- [ ] 4. 实现智能复习调度系统
  - 创建`lib/smart-scheduler-service.ts`
  - 实现`calculateOptimalIntervals`函数（FSRS间隔计算）
  - 实现`balanceNewAndReview`函数（3:7比例平衡）
  - 实现`prioritizeLowRetrievability`函数（优先低可提取概率）
  - 实现`detectOptimalWindows`函数（检测最佳学习时间）
  - 实现`adaptToPerformance`函数（基于表现调整间隔）
  - _需求: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 4.1 编写FSRS复习间隔计算的基于属性测试
  - **Property 8: FSRS复习间隔计算**
  - **验证需求: Requirements 2.1**

- [ ] 4.2 编写新学习与复习平衡的基于属性测试
  - **Property 9: 新学习与复习平衡**
  - **验证需求: Requirements 2.2**

- [ ] 4.3 编写低可提取概率优先复习的基于属性测试
  - **Property 10: 低可提取概率优先复习**
  - **验证需求: Requirements 2.3**

- [ ] 4.4 编写性能趋势自适应的基于属性测试
  - **Property 11: 性能趋势自适应**
  - **验证需求: Requirements 2.5**

- [ ] 5. 实现个性化学习路径生成
  - 创建`lib/learning-path-ai-service.ts`
  - 实现`analyzeUserPerformance`函数（分析用户表现）
  - 实现`generatePersonalizedPath`函数（生成个性化路径）
  - 实现`provideGuidanceWithReasoning`函数（提供带推理的指导）
  - 实现`dynamicallyAdjustPath`函数（动态调整路径）
  - 实现`detectLearningDifficulties`函数（检测学习困难）
  - 实现`considerUserFactors`函数（考虑用户因素）
  - _需求: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 5.1 编写个性化学习路径生成的基于属性测试
  - **Property 12: 个性化学习路径生成**
  - **验证需求: Requirements 3.1**

- [ ] 5.2 编写学习指导推理解释的基于属性测试
  - **Property 13: 学习指导推理解释**
  - **验证需求: Requirements 3.2**

- [ ] 5.3 编写动态路径调整的基于属性测试
  - **Property 14: 动态路径调整**
  - **验证需求: Requirements 3.3**

- [ ] 5.4 编写学习困难检测的基于属性测试
  - **Property 15: 学习困难检测**
  - **验证需求: Requirements 3.4**

- [ ] 5.5 编写用户因素考虑的基于属性测试
  - **Property 16: 用户因素考虑**
  - **验证需求: Requirements 3.5**

- [ ] 6. 实现实时学习记录追踪系统
  - 创建`lib/real-time-tracking-service.ts`
  - 实现`trackLearningActivity`函数（实时追踪学习活动）
  - 实现`updateRecordsImmediately`函数（立即更新记录）
  - 实现`triggerAnalyticsRecalculation`函数（触发分析重算）
  - 实现`ensureDataFreshness`函数（确保数据新鲜度）
  - 实现`maintainDataConsistency`函数（维护数据一致性）
  - _需求: 4.1, 4.3, 4.4, 4.5_

- [ ] 6.1 编写实时记录更新的基于属性测试
  - **Property 17: 实时记录更新**
  - **验证需求: Requirements 4.1**

- [ ] 6.2 编写分析重算触发的基于属性测试
  - **Property 18: 分析重算触发**
  - **验证需求: Requirements 4.3**

- [ ] 6.3 编写数据新鲜度保证的基于属性测试
  - **Property 19: 数据新鲜度保证**
  - **验证需求: Requirements 4.4**

- [ ] 6.4 编写数据一致性维护的基于属性测试
  - **Property 20: 数据一致性维护**
  - **验证需求: Requirements 4.5**

- [ ] 7. 实现学习成果准确性保障系统
  - 创建`lib/accuracy-monitor-service.ts`
  - 实现`validateInputData`函数（验证输入数据）
  - 实现`detectDataInconsistencies`函数（检测数据不一致）
  - 实现`showConfidenceIndicators`函数（显示信心指标）
  - _需求: 5.1, 5.2, 5.4_

- [ ] 7.1 编写数据完整性验证的基于属性测试
  - **Property 21: 数据完整性验证**
  - **验证需求: Requirements 5.1**

- [ ] 7.2 编写数据不一致检测的基于属性测试
  - **Property 22: 数据不一致检测**
  - **验证需求: Requirements 5.2**

- [ ] 7.3 编写信心指标显示的基于属性测试
  - **Property 23: 信心指标显示**
  - **验证需求: Requirements 5.4**

- [ ] 8. 创建星座图可视化组件
  - 创建`components/starmap/StarConstellation.tsx`
  - 使用D3.js实现交互式星座图
  - 实现星星亮度基于掌握程度的映射
  - 实现学习路径的连线显示
  - 添加里程碑星星的特殊标记
  - 实现点击星星查看详情的交互
  - _需求: 6.1, 6.2, 6.3_

- [ ] 8.1 编写星座图里程碑显示的基于属性测试
  - **Property 24: 星座图里程碑显示**
  - **验证需求: Requirements 6.1**

- [ ] 8.2 编写成就高亮显示的基于属性测试
  - **Property 25: 成就高亮显示**
  - **验证需求: Requirements 6.2**

- [ ] 8.3 编写成就动画触发的基于属性测试
  - **Property 26: 成就动画触发**
  - **验证需求: Requirements 6.3**

- [ ] 9. 创建学习指导组件
  - 创建`components/starmap/LearningGuidance.tsx`
  - 实现个性化推荐显示
  - 添加推理解释文本
  - 实现优先级和时间估算显示
  - 添加接受推荐的交互按钮
  - 显示当前连续天数和下个里程碑
  - _需求: 3.2, 3.5_

- [ ] 9.1 编写学习指导推理的单元测试
  - 测试推荐内容和推理解释的显示

- [ ] 10. 创建进度分析组件
  - 创建`components/starmap/ProgressAnalytics.tsx`
  - 使用Recharts实现学习趋势图表
  - 显示学习速度、保持率、掌握进展
  - 实现优势和劣势区域分析
  - 添加时间范围切换功能
  - _需求: 6.4_

- [ ] 10.1 编写统计指标显示的基于属性测试
  - **Property 27: 统计指标显示**
  - **验证需求: Requirements 6.4**

- [ ] 11. 创建智能调度器组件
  - 创建`components/starmap/SmartScheduler.tsx`
  - 显示今日学习计划和每周预测
  - 实现拖拽重新安排时间功能
  - 添加完成标记和进度更新
  - 显示新学习和复习的平衡比例
  - _需求: 2.2, 2.3_

- [ ] 11.1 编写调度平衡比例的单元测试
  - 测试3:7比例的显示和维护

- [ ] 12. 创建实时追踪器组件
  - 创建`components/starmap/RealTimeTracker.tsx`
  - 显示当前学习会话的实时数据
  - 实现今日统计和连续天数显示
  - 添加专注度监控和效率分数
  - 实现学习会话的开始/结束控制
  - _需求: 4.1, 4.4_

- [ ] 12.1 编写实时数据显示的单元测试
  - 测试会话数据和统计信息的实时更新

- [ ] 13. 创建成就庆祝组件
  - 创建`components/starmap/AchievementCelebration.tsx`
  - 实现里程碑达成的动画效果
  - 显示新解锁的成就和奖励
  - 添加分享成就的功能
  - 实现成就历史的查看
  - _需求: 6.3_

- [ ] 13.1 编写成就庆祝动画的单元测试
  - 测试动画触发和成就显示

- [ ] 14. 创建成长星图主页面
  - 更新`app/dashboard/page.tsx`为成长星图主页面
  - 集成所有6个核心组件
  - 实现响应式自适应布局
  - 添加WebSocket实时数据连接
  - 实现组件间的数据流和状态同步
  - 添加加载状态和错误处理
  - _需求: 8.1, 8.2, 8.3, 8.4_

- [ ] 14.1 编写响应式适配的基于属性测试
  - **Property 28: 响应式图表适配**
  - **验证需求: Requirements 8.3**

- [ ] 14.2 编写跨设备同步的基于属性测试
  - **Property 29: 跨设备数据同步**
  - **验证需求: Requirements 8.4**

- [ ] 15. 实现用户数据隔离和安全
  - 在所有API端点添加用户认证检查
  - 确保查询只返回当前用户的数据
  - 实现登出时清除客户端缓存
  - 添加数据访问权限验证
  - _需求: 9.2, 9.3, 9.5_

- [ ] 15.1 编写用户数据隔离的基于属性测试
  - **Property 30: 用户数据隔离**
  - **验证需求: Requirements 9.2, 9.3**

- [ ] 15.2 编写缓存清理的基于属性测试
  - **Property 31: 缓存清理**
  - **验证需求: Requirements 9.5**

- [ ] 16. 集成到现有学习流程
  - 更新`app/study/page.tsx`集成智能内容筛选
  - 在`app/vocab/page.tsx`中集成实时记录追踪
  - 在`app/quiz/page.tsx`中集成智能调度建议
  - 在`app/lesson/page.tsx`中集成学习路径指导
  - 确保所有学习活动都触发成长星图更新
  - _需求: 1.1, 4.1, 7.1, 7.2_

- [ ] 16.1 编写学习流程集成测试
  - 测试学习活动→星图更新的完整流程

- [ ] 17. 实现数据缓存和性能优化
  - 创建`lib/starmap-cache-service.ts`
  - 实现智能推荐结果缓存（30分钟过期）
  - 添加学习路径缓存和增量更新
  - 实现WebSocket连接池管理
  - 添加性能监控和优化建议
  - _需求: 4.2, 8.5_

- [ ] 17.1 编写缓存性能的单元测试
  - 测试缓存命中率和更新机制

- [ ] 18. 添加错误处理和降级机制
  - 实现智能引擎失败时的降级策略
  - 添加实时追踪中断时的数据恢复
  - 实现网络断开时的离线模式
  - 添加数据冲突时的自动解决机制
  - _需求: 5.2, 4.5_

- [ ] 18.1 编写错误恢复的单元测试
  - 测试各种错误场景的降级和恢复

- [ ] 19. 检查点 - 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户

- [ ] 20. 添加用户引导和帮助系统
  - 创建首次使用的成长星图引导
  - 添加各组件的交互式帮助提示
  - 实现学习建议的详细解释
  - 添加个性化设置和偏好配置
  - _需求: 3.2, 6.1_

- [ ] 20.1 编写用户引导的单元测试
  - 测试引导流程和帮助系统的显示