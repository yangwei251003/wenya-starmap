// AI导师服务 - 智谱GLM API集成

import { 
  AITutor, 
  Evaluation, 
  Feedback, 
  UserPerformance, 
  EnglishLevel 
} from '@/types'
import { callGLMAPI } from './api'
import { AppError, ErrorType, ErrorSeverity, logger } from './error-handler'
import { performanceMonitor } from './performance-monitor'
import { aiRateLimiter } from './security'

/**
 * AI导师实现类
 * 使用智谱GLM API提供个性化学习体验
 */
export class GLMAITutor implements AITutor {
  /**
   * 生成个性化学习内容
   * @param prompt - 内容生成提示
   * @param userLevel - 用户英语水平
   * @returns 生成的内容
   */
  async generateContent(prompt: string, userLevel: EnglishLevel): Promise<string> {
    // 速率限制检查
    if (!aiRateLimiter.allowRequest('generateContent')) {
      throw new AppError(
        'AI服务请求过于频繁',
        ErrorType.AI_SERVICE_ERROR,
        ErrorSeverity.MEDIUM,
        '请求过于频繁，请稍后再试'
      )
    }

    performanceMonitor.startTimer('ai-generate-content')
    logger.info('Generating AI content', { userLevel, promptLength: prompt.length })

    try {
      const systemPrompt = this.buildSystemPrompt(userLevel)
      
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ]

      const response = await callGLMAPI(messages)

      if (!response.success || !response.data) {
        // 如果API调用失败，返回模拟内容而不是抛出错误
        logger.warn('GLM API failed, using fallback content', { error: response.error })
        return this.getFallbackContent(prompt, userLevel)
      }

      const duration = performanceMonitor.endTimer('ai-generate-content', { 
        success: true,
        contentLength: response.data.length 
      })

      logger.info('AI content generated successfully', { 
        duration: `${duration.toFixed(2)}ms`,
        contentLength: response.data.length 
      })

      return response.data
    } catch (error) {
      performanceMonitor.endTimer('ai-generate-content', { success: false })
      throw error
    }
  }

  /**
   * 评估用户答案
   * @param question - 问题内容
   * @param answer - 用户答案
   * @returns 评估结果
   */
  async evaluateAnswer(question: string, answer: string): Promise<Evaluation> {
    // 速率限制检查
    if (!aiRateLimiter.allowRequest('evaluateAnswer')) {
      throw new AppError(
        'AI评估请求过于频繁',
        ErrorType.AI_SERVICE_ERROR,
        ErrorSeverity.MEDIUM,
        '请求过于频繁，请稍后再试'
      )
    }

    performanceMonitor.startTimer('ai-evaluate-answer')
    logger.info('Evaluating answer with AI', { 
      questionLength: question.length,
      answerLength: answer.length 
    })

    try {
      const prompt = `
请评估以下英语学习问题的答案：

问题：${question}
学生答案：${answer}

请以JSON格式返回评估结果，包含以下字段：
- isCorrect: boolean (答案是否正确)
- score: number (0-100分)
- feedback: string (详细反馈)
- suggestions: string[] (改进建议，可选)
- nextRecommendation: string (下一步学习建议，可选)

只返回JSON，不要其他文字。
`

      const messages = [
        { role: 'system', content: '你是一位专业的英语教师，擅长评估学生的答案并提供建设性反馈。' },
        { role: 'user', content: prompt }
      ]

      const response = await callGLMAPI(messages)

      if (!response.success || !response.data) {
        // 如果API调用失败，返回默认评估结果
        logger.warn('GLM API failed for answer evaluation, using fallback', { error: response.error })
        return this.getFallbackEvaluation(question, answer)
      }

      try {
        // 尝试解析JSON响应
        const evaluation = JSON.parse(response.data) as Evaluation
        
        const duration = performanceMonitor.endTimer('ai-evaluate-answer', { 
          success: true,
          isCorrect: evaluation.isCorrect 
        })

        logger.info('Answer evaluated successfully', { 
          duration: `${duration.toFixed(2)}ms`,
          isCorrect: evaluation.isCorrect,
          score: evaluation.score 
        })

        return evaluation
      } catch (error) {
        logger.warn('Failed to parse AI evaluation response', { error })
        
        performanceMonitor.endTimer('ai-evaluate-answer', { 
          success: false,
          parseError: true 
        })

        // 如果解析失败，返回默认评估
        return {
          isCorrect: false,
          score: 0,
          feedback: response.data || '评估失败，请重试',
          suggestions: ['请检查答案格式'],
        }
      }
    } catch (error) {
      performanceMonitor.endTimer('ai-evaluate-answer', { success: false })
      throw error
    }
  }

  /**
   * 提供学习反馈
   * @param performance - 用户表现数据
   * @returns 反馈信息
   */
  async provideFeedback(performance: UserPerformance): Promise<Feedback> {
    const prompt = `
请为以下学习表现提供反馈：

用户ID: ${performance.userId}
完成练习数: ${performance.answers.length}
正确率: ${(performance.accuracy * 100).toFixed(1)}%
用时: ${Math.floor(performance.timeSpent / 60)}分钟

答题详情:
${performance.answers.map((a, i) => 
  `${i + 1}. 练习${a.exerciseId}: ${a.isCorrect ? '✓ 正确' : '✗ 错误'} (用时${a.timeSpent}秒)`
).join('\n')}

请以JSON格式返回反馈，包含以下字段：
- message: string (总体评价)
- encouragement: string (鼓励的话)
- areas_to_improve: string[] (需要改进的方面)
- next_steps: string[] (下一步学习建议)
- estimated_progress: number (预估进步百分比 0-100)

只返回JSON，不要其他文字。
`

    const messages = [
      { role: 'system', content: '你是一位温暖、鼓励学生的英语教师，善于发现学生的进步并提供建设性建议。' },
      { role: 'user', content: prompt }
    ]

    const response = await callGLMAPI(messages)

    if (!response.success || !response.data) {
      // 如果API调用失败，返回默认反馈
      logger.warn('GLM API failed for feedback generation, using fallback', { error: response.error })
      return this.getFallbackFeedback(performance)
    }

    try {
      const feedback = JSON.parse(response.data) as Feedback
      return feedback
    } catch (error) {
      // 返回默认反馈
      return {
        message: '继续加油！',
        encouragement: '你正在不断进步！',
        areas_to_improve: ['继续练习'],
        next_steps: ['完成更多练习'],
        estimated_progress: Math.round(performance.accuracy * 100),
      }
    }
  }

  /**
   * 获取模拟内容（当API不可用时使用）
   * @param prompt - 原始提示
   * @param userLevel - 用户水平
   * @returns 模拟内容
   */
  private getFallbackContent(prompt: string, userLevel: EnglishLevel): string {
    // 基于提示内容和用户水平返回合适的模拟内容
    if (prompt.includes('学习路径') || prompt.includes('learning path')) {
      return this.getFallbackLearningPath(userLevel)
    }
    
    if (prompt.includes('课程') || prompt.includes('lesson')) {
      return this.getFallbackLesson(userLevel)
    }
    
    if (prompt.includes('练习') || prompt.includes('exercise')) {
      return this.getFallbackExercise(userLevel)
    }
    
    // 默认通用内容
    return this.getFallbackGeneral(userLevel)
  }

  /**
   * 获取模拟学习路径内容
   */
  private getFallbackLearningPath(userLevel: EnglishLevel): string {
    const paths = {
      beginner: `基础英语学习路径：
1. 字母和发音基础
2. 基础词汇（日常用品、颜色、数字）
3. 简单句型结构
4. 基础语法（现在时、过去时）
5. 日常对话练习`,
      
      intermediate: `中级英语学习路径：
1. 扩展词汇（工作、旅行、兴趣爱好）
2. 复杂句型和语法
3. 阅读理解练习
4. 听力技能提升
5. 写作基础训练`,
      
      advanced: `高级英语学习路径：
1. 高级词汇和习语
2. 复杂语法结构
3. 学术写作技巧
4. 商务英语应用
5. 文化背景理解`
    }
    
    return paths[userLevel] || paths.intermediate
  }

  /**
   * 获取模拟课程内容
   */
  private getFallbackLesson(userLevel: EnglishLevel): string {
    return `这是一个${userLevel}水平的英语课程。课程内容包括词汇学习、语法练习和实际应用。请继续学习以提高您的英语水平。`
  }

  /**
   * 获取模拟练习内容
   */
  private getFallbackExercise(userLevel: EnglishLevel): string {
    return `这是一个适合${userLevel}水平的练习。请根据您的学习进度完成相应的练习题目。`
  }

  /**
   * 获取通用模拟内容
   */
  private getFallbackGeneral(userLevel: EnglishLevel): string {
    return `欢迎使用问芽星图英语学习平台！这是为${userLevel}水平学习者准备的内容。请继续您的学习之旅。`
  }

  /**
   * 获取模拟评估结果（当API不可用时使用）
   */
  private getFallbackEvaluation(question: string, answer: string): Evaluation {
    // 简单的评估逻辑：检查答案是否不为空
    const isCorrect = answer.trim().length > 0
    const score = isCorrect ? 80 : 0
    
    return {
      isCorrect,
      score,
      feedback: isCorrect 
        ? "Good job! 做得不错！Keep practicing to improve further. 继续练习以进一步提高。"
        : "Please provide an answer. 请提供一个答案。Try again! 再试一次！",
      suggestions: isCorrect 
        ? ["继续练习类似题目", "尝试更难的练习"]
        : ["仔细阅读题目", "复习相关知识点"],
      nextRecommendation: "继续下一个练习"
    }
  }

  /**
   * 获取模拟反馈（当API不可用时使用）
   */
  private getFallbackFeedback(performance: UserPerformance): Feedback {
    const accuracy = performance.accuracy || 0
    
    return {
      message: accuracy > 0.8 ? '表现优秀！' : accuracy > 0.6 ? '继续加油！' : '需要更多练习',
      encouragement: '你正在不断进步！每一次练习都让你更接近目标。',
      areas_to_improve: accuracy < 0.7 ? ['基础语法', '词汇积累'] : ['高级表达', '流利度'],
      next_steps: ['完成更多练习', '复习错题', '扩展词汇量'],
      estimated_progress: Math.round(accuracy * 100)
    }
  }

  /**
   * 构建系统提示词
   * @param userLevel - 用户英语水平
   * @returns 系统提示词
   */
  private buildSystemPrompt(userLevel: EnglishLevel): string {
    const levelDescriptions = {
      beginner: '初学者（A1-A2水平），需要简单的词汇和句子结构',
      intermediate: '中级学习者（B1-B2水平），可以理解较复杂的内容',
      advanced: '高级学习者（C1-C2水平），可以处理复杂和专业的内容'
    }

    return `你是一位专业的英语教师，正在为${levelDescriptions[userLevel]}提供个性化学习内容。
请根据学生的水平调整内容难度，使用适当的词汇和语法结构。
保持内容有趣、实用，并提供清晰的解释。`
  }
}

/**
 * 创建AI导师实例
 * @returns AI导师实例
 */
export function createAITutor(): AITutor {
  return new GLMAITutor()
}

/**
 * 默认AI导师实例
 */
export const aiTutor = createAITutor()
