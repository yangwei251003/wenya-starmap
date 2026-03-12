import { NextRequest, NextResponse } from 'next/server'
import { callGLMAPI } from '@/lib/api'
import { buildDiagnosisPrompt, parseDiagnosisResponse } from '@/lib/ai-prompts'
import { getFallbackDiagnosis } from '@/lib/ai-fallback'
import { AIDiagnosis } from '@/types'

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
    const messages = [
      { role: 'system', content: '你是专业的英语学习诊断官。' },
      { role: 'user', content: prompt }
    ]

    const response = await callGLMAPI(messages, 'glm-4-flash')

    if (response.success && response.data) {
      const parsed = parseDiagnosisResponse(response.data)
      if (parsed) {
        return NextResponse.json({
          success: true,
          data: parsed,
          isSimulated: false
        })
      }
    }

    const fallback: AIDiagnosis = getFallbackDiagnosis()
    return NextResponse.json({
      success: true,
      data: fallback,
      isSimulated: true
    })
  } catch (error) {
    console.error('Diagnosis error:', error)
    const fallback: AIDiagnosis = getFallbackDiagnosis()
    return NextResponse.json({
      success: true,
      data: fallback,
      isSimulated: true
    })
  }
}
