import { NextRequest, NextResponse } from 'next/server'
import { callGLMAPI } from '@/lib/api'
import { buildExplainPrompt, parseExplainResponse } from '@/lib/ai-prompts'
import { getFallbackExplain } from '@/lib/ai-fallback'
import { AIExplainItem } from '@/types'

export async function POST(request: NextRequest) {
  let requestBody: any = {}

  try {
    requestBody = await request.json()
  } catch (parseError) {
    console.error('Explain request parse error:', parseError)
    return NextResponse.json(
      { success: false, error: '请求格式错误' },
      { status: 400 }
    )
  }

  const { question, correctAnswer, userAnswer, type } = requestBody

  if (!question || !correctAnswer) {
    return NextResponse.json(
      { success: false, error: '缺少题目或答案' },
      { status: 400 }
    )
  }

  try {
    const prompt = buildExplainPrompt({ question, correctAnswer, userAnswer, type })
    const messages = [
      { role: 'system', content: '你是专业英语教师，擅长纠错与讲解。' },
      { role: 'user', content: prompt }
    ]

    const response = await callGLMAPI(messages, 'glm-4-flash')

    if (response.success && response.data) {
      const parsed = parseExplainResponse(response.data)
      if (parsed) {
        return NextResponse.json({
          success: true,
          data: parsed,
          isSimulated: false
        })
      }
    }

    const fallback: AIExplainItem = getFallbackExplain(question, correctAnswer, userAnswer || '')
    return NextResponse.json({
      success: true,
      data: fallback,
      isSimulated: true
    })
  } catch (error) {
    console.error('Explain error:', error)
    const fallback: AIExplainItem = getFallbackExplain(question, correctAnswer, userAnswer || '')
    return NextResponse.json({
      success: true,
      data: fallback,
      isSimulated: true
    })
  }
}
