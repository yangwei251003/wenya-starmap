import { NextRequest, NextResponse } from 'next/server'
import { callGLMAPI } from '@/lib/api'
import { buildWritingReviewPrompt, parseWritingReviewResponse } from '@/lib/ai-prompts'
import { getFallbackWritingReview } from '@/lib/ai-fallback'
import { AIWritingReview } from '@/types'

export async function POST(request: NextRequest) {
  let requestBody: any = {}

  try {
    requestBody = await request.json()
  } catch (parseError) {
    console.error('Writing review parse error:', parseError)
    return NextResponse.json(
      { success: false, error: '请求格式错误' },
      { status: 400 }
    )
  }

  const { prompt, essay, level } = requestBody

  if (!prompt || !essay) {
    return NextResponse.json(
      { success: false, error: '题目或作文不能为空' },
      { status: 400 }
    )
  }

  try {
    const promptText = buildWritingReviewPrompt({ prompt, essay, level })
    const messages = [
      { role: 'system', content: '你是英语写作批改老师。' },
      { role: 'user', content: promptText }
    ]

    const response = await callGLMAPI(messages, 'glm-4-flash')

    if (response.success && response.data) {
      const parsed = parseWritingReviewResponse(response.data)
      if (parsed) {
        return NextResponse.json({
          success: true,
          data: parsed,
          isSimulated: false
        })
      }
    }

    const fallback: AIWritingReview = getFallbackWritingReview()
    return NextResponse.json({
      success: true,
      data: fallback,
      isSimulated: true
    })
  } catch (error) {
    console.error('Writing review error:', error)
    const fallback: AIWritingReview = getFallbackWritingReview()
    return NextResponse.json({
      success: true,
      data: fallback,
      isSimulated: true
    })
  }
}
