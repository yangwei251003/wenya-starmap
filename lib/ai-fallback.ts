import { AIDiagnosis, AIExplainItem, AIWritingReview } from '@/types'

export function getFallbackDiagnosis(): AIDiagnosis {
  return {
    strengths: [
      '学习节奏稳定，具备持续学习的习惯',
      '基础词汇掌握良好，能够完成常见练习',
      '学习投入度较高，愿意尝试新内容'
    ],
    weaknesses: [
      '复习频率偏低，容易遗忘已学内容',
      '语法细节掌握不够系统',
      '输出型练习（写作/口语）偏少'
    ],
    recommendations: [
      '优先完成今日复习单词，巩固记忆',
      '每天做1组练习题，保持综合能力',
      '每周完成1次短文写作，提升表达'
    ],
    weekPlan: [
      '第1天：复习 + 10个新词',
      '第2天：听力/口语练习',
      '第3天：语法重点巩固',
      '第4天：阅读理解训练',
      '第5天：写作小练笔',
      '第6天：综合练习（测验）',
      '第7天：总结与复盘'
    ],
    dailyPlan: {
      title: '今日行动清单',
      items: [
        {
          title: '先完成复习单词',
          action: '进入复习模式',
          url: '/study-fsrs',
          reason: '防止遗忘，提高巩固效率'
        },
        {
          title: '完成一组互动练习',
          action: '开始练习',
          url: '/quiz',
          reason: '检验综合能力'
        },
        {
          title: '与AI进行5分钟对话',
          action: '进入对话',
          url: '/chat',
          reason: '提升口语表达自信'
        }
      ]
    }
  }
}

export function getFallbackExplain(
  question: string,
  correctAnswer: string,
  userAnswer: string
): AIExplainItem {
  return {
    issue: `答案与正确表达不一致（你的答案：${userAnswer || '空'}）`,
    correction: correctAnswer,
    explanation: '请注意关键单词或语法结构，保持时态与主谓一致。',
    example: 'I usually go to school by bus.'
  }
}

export function getFallbackWritingReview(): AIWritingReview {
  return {
    score: 78,
    issues: [
      '句式较单一，缺少复杂结构',
      '部分词汇重复使用，可增加同义替换',
      '逻辑衔接不够明显，需要过渡词'
    ],
    corrections: [
      {
        original: 'I think English is very important.',
        corrected: 'I believe English plays a vital role.',
        note: '使用更高级的表达'
      },
      {
        original: 'We should learn English every day.',
        corrected: 'We should practice English daily to build consistency.',
        note: '补充目的性表达'
      }
    ],
    improvedVersion:
      'English is an essential skill in modern life. By practicing daily, learners can build confidence and communicate more effectively in both academic and real-world situations.',
    advancedExpressions: [
      'play a vital role in',
      'build consistency',
      'communicate more effectively'
    ]
  }
}
