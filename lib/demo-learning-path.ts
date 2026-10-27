// 学习路径功能演示脚本
// 此脚本演示AI导师和学习路径生成的核心功能

import { learningPathService } from './learning-path'
import { EnglishLevel, UserPerformance } from '@/types'

/**
 * 演示学习路径生成功能
 */
async function demonstrateLearningPath() {
  console.log('=== 问芽星图 - 学习路径生成演示 ===\n')

  try {
    // 1. 为新用户创建学习路径
    console.log('1. 为新用户创建个性化学习路径...')
    const userId = 'demo-user-001'
    const assessmentData = {
      level: 'beginner' as EnglishLevel,
      targetLevel: 'intermediate' as EnglishLevel,
      scores: {
        vocabulary: 60,
        grammar: 70,
        listening: 50,
        speaking: 55,
        reading: 65,
        writing: 60,
      },
    }

    const learningPath = await learningPathService.createPathForNewUser(
      userId,
      assessmentData
    )

    console.log('✓ 学习路径创建成功！')
    console.log(`  - 用户ID: ${learningPath.userId}`)
    console.log(`  - 当前等级: ${learningPath.currentLevel}`)
    console.log(`  - 目标等级: ${learningPath.targetLevel}`)
    console.log(`  - 推荐课程数: ${learningPath.recommendedNext.length}`)
    console.log(`  - 初始进度: ${learningPath.progress}%\n`)

    // 2. 获取下一个推荐课程
    console.log('2. 获取下一个推荐课程...')
    const nextLesson = learningPathService.getNextRecommendation(learningPath)
    
    if (nextLesson) {
      console.log('✓ 推荐课程：')
      console.log(`  - 课程ID: ${nextLesson.id}`)
      console.log(`  - 标题: ${nextLesson.title}`)
      console.log(`  - 描述: ${nextLesson.description}`)
      console.log(`  - 等级: ${nextLesson.level}`)
      console.log(`  - 预计时间: ${nextLesson.estimatedTime}分钟\n`)

      // 3. 模拟用户完成课程
      console.log('3. 模拟用户完成课程并更新学习路径...')
      const performance: UserPerformance = {
        userId: userId,
        lessonId: nextLesson.id,
        answers: [
          { exerciseId: 'ex-1', userAnswer: 'answer1', isCorrect: true, timeSpent: 30 },
          { exerciseId: 'ex-2', userAnswer: 'answer2', isCorrect: true, timeSpent: 25 },
          { exerciseId: 'ex-3', userAnswer: 'answer3', isCorrect: false, timeSpent: 40 },
          { exerciseId: 'ex-4', userAnswer: 'answer4', isCorrect: true, timeSpent: 35 },
        ],
        timeSpent: 130,
        accuracy: 0.75, // 75% 正确率
      }

      const updatedPath = await learningPathService.updatePath(
        learningPath,
        performance,
        [nextLesson.id]
      )

      console.log('✓ 学习路径更新成功！')
      console.log(`  - 完成课程数: ${updatedPath.completedLessons.length}`)
      console.log(`  - 当前等级: ${updatedPath.currentLevel}`)
      console.log(`  - 更新后进度: ${updatedPath.progress}%`)
      console.log(`  - 剩余推荐课程: ${updatedPath.recommendedNext.length}\n`)

      // 4. 获取下一个推荐
      console.log('4. 获取更新后的下一个推荐课程...')
      const nextLesson2 = learningPathService.getNextRecommendation(updatedPath)
      
      if (nextLesson2) {
        console.log('✓ 新推荐课程：')
        console.log(`  - 课程ID: ${nextLesson2.id}`)
        console.log(`  - 标题: ${nextLesson2.title}`)
        console.log(`  - 等级: ${nextLesson2.level}\n`)
      }
    }

    console.log('=== 演示完成 ===')
    console.log('\n核心功能验证：')
    console.log('✓ 智谱GLM API客户端集成')
    console.log('✓ 基于评估结果的个性化学习建议生成')
    console.log('✓ Learning_Path数据模型创建')
    console.log('✓ 学习路径动态调整逻辑')

  } catch (error) {
    console.error('❌ 演示过程中出现错误:', error)
    if (error instanceof Error) {
      console.error('错误详情:', error.message)
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  demonstrateLearningPath()
}

export { demonstrateLearningPath }
