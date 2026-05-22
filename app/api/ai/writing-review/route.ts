import { NextRequest, NextResponse } from 'next/server'
import { callOpenRouterAPI } from '@/lib/openrouter'
import { buildWritingReviewPrompt, parseWritingReviewResponse } from '@/lib/ai-prompts'
import { getFallbackWritingReview } from '@/lib/ai-fallback'
import { extractJsonText } from '@/lib/ai-response'
import { env } from '@/lib/env'
import { AIWritingReview } from '@/types'

export const dynamic = 'force-dynamic'

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
    const response = await callOpenRouterAPI(
      [
        { role: 'system', content: '你是英语写作批改老师。' },
        { role: 'user', content: promptText },
      ],
      {
        model: env.openRouterModel,
        temperature: 0.2,
        maxTokens: 1400,
      }
    )

    if (response.success && response.data) {
      const parsed =
        parseWritingReviewResponse(response.data) ||
        parseWritingReviewResponse(extractJsonText(response.data) || '')
      if (parsed) {
        return NextResponse.json({
          success: true,
          data: parsed,
          isSimulated: false,
        })
      }
    }

    const fallback: AIWritingReview = getFallbackWritingReview()
    return NextResponse.json({
      success: true,
      data: fallback,
      isSimulated: true,
    })
  } catch (error) {
    console.error('Writing review error:', error)
    const fallback: AIWritingReview = getFallbackWritingReview()
    return NextResponse.json({
      success: true,
      data: fallback,
      isSimulated: true,
    })
  }
}
