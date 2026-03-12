import { AIDiagnosis, AIExplainItem, AIWritingReview } from '@/types'

export interface DiagnosisInput {
  userId?: string
  level?: string
  learningData?: any
  studyStats?: {
    streak?: number
    todayCompleted?: number
    accuracy?: number
    totalMastered?: number
  }
}

export interface ExplainInput {
  question: string
  correctAnswer: string
  userAnswer: string
  type?: string
}

export interface WritingReviewInput {
  prompt: string
  essay: string
  level?: string
}

export function buildDiagnosisPrompt(input: DiagnosisInput): string {
  const level = input.level || 'intermediate'
  const stats = input.studyStats || {}
  const learningData = input.learningData || {}

  return `
你是“问芽星图”的AI学习诊断官。请根据用户学习数据生成学习诊断报告。

用户水平：${level}
学习概况：
- 连续学习天数：${stats.streak ?? 0}
- 今日学习量：${stats.todayCompleted ?? 0}
- 准确率：${stats.accuracy ?? 0}%
- 已掌握单词：${stats.totalMastered ?? 0}

成长星图数据摘要（可能为空）：
${JSON.stringify(learningData, null, 2)}

请以JSON格式输出，严格包含以下字段：
{
  "strengths": string[],
  "weaknesses": string[],
  "recommendations": string[],
  "weekPlan": string[],
  "dailyPlan": {
    "title": string,
    "items": [
      {
        "title": string,
        "action": string,
        "url": string,
        "reason": string
      }
    ]
  }
}

要求：
1) strengths/weaknesses/recommendations 分别给 3 条
2) weekPlan 给 7 条（按周一~周日或第1天~第7天）
3) dailyPlan.items 固定给 3 条，url 必须从以下中选择：
   - /study
   - /study-fsrs
   - /quiz
   - /chat
   - /vocab
回答仅输出JSON，不要多余解释。
`.trim()
}

export function buildExplainPrompt(input: ExplainInput): string {
  return `
你是英语教师，请对学生的错误答案进行解析与纠正。

题目：${input.question}
题型：${input.type || 'unknown'}
正确答案：${input.correctAnswer}
学生答案：${input.userAnswer}

请以JSON格式输出，严格包含以下字段：
{
  "issue": string,
  "correction": string,
  "explanation": string,
  "example": string
}

要求：
1) issue 说明错误点
2) correction 给出正确表达或答案
3) explanation 用简短中文解释
4) example 给出一个英文示例句
只输出JSON。
`.trim()
}

export function buildWritingReviewPrompt(input: WritingReviewInput): string {
  return `
你是英语写作批改老师，请对学生作文进行打分与改写。

题目：${input.prompt}
学生作文：${input.essay}
学生水平：${input.level || 'intermediate'}

请以JSON格式输出，严格包含以下字段：
{
  "score": number,
  "issues": string[],
  "corrections": [
    { "original": string, "corrected": string, "note": string }
  ],
  "improvedVersion": string,
  "advancedExpressions": string[]
}

要求：
1) score 0-100
2) issues 给出3条
3) corrections 给出2-4条
4) advancedExpressions 给出3条（短语或句型）
只输出JSON。
`.trim()
}

export function parseDiagnosisResponse(raw: string): AIDiagnosis | null {
  return safeParseJSON<AIDiagnosis>(raw)
}

export function parseExplainResponse(raw: string): AIExplainItem | null {
  return safeParseJSON<AIExplainItem>(raw)
}

export function parseWritingReviewResponse(raw: string): AIWritingReview | null {
  return safeParseJSON<AIWritingReview>(raw)
}

function safeParseJSON<T>(raw: string): T | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}
