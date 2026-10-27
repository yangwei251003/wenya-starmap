import { NextRequest, NextResponse } from 'next/server'
import { callOpenRouterAPI } from '@/lib/openrouter'
import { buildDiagnosisPrompt, parseDiagnosisResponse } from '@/lib/ai-prompts'
import { getFallbackDiagnosis } from '@/lib/ai-fallback'
import { extractJsonText } from '@/lib/ai-response'
import { env } from '@/lib/env'
import { AIDiagnosis } from '@/types'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  let requestBody: any = {}

  try {
    requestBody = await request.json()
  } catch (parseError) {
    console.error('Diagnosis request parse error:', parseError)
    return NextResponse.json(
      { success: false, error: '请求格式错误' },
      { status: 400 }
    )
  }

  try {
    const prompt = buildDiagnosisPrompt(requestBody)
    const response = await callOpenRouterAPI(
      [
        { role: 'system', content: '你是专业的英语学习诊断官。' },
        { role: 'user', content: prompt },
      ],
      {
        model: env.openRouterModel,
        temperature: 0.35,
        maxTokens: 1400,
      }
    )

    if (response.success && response.data) {
      const parsed = parseDiagnosisResponse(response.data) || parseDiagnosisResponse(extractJsonText(response.data) || '')
      if (parsed) {
        return NextResponse.json({
          success: true,
          data: parsed,
          isSimulated: false,
        })
      }
    }

    const fallback: AIDiagnosis = getFallbackDiagnosis()
    return NextResponse.json({
      success: true,
      data: fallback,
      isSimulated: true,
    })
  } catch (error) {
    console.error('Diagnosis error:', error)
    const fallback: AIDiagnosis = getFallbackDiagnosis()
    return NextResponse.json({
      success: true,
      data: fallback,
      isSimulated: true,
    })
  }
}
