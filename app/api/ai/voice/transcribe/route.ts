import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/lib/env'

export const dynamic = 'force-dynamic'

const GROQ_TRANSCRIPTION_URL = 'https://api.groq.com/openai/v1/audio/transcriptions'
const OPENAI_TRANSCRIPTION_URL = 'https://api.openai.com/v1/audio/transcriptions'
const MAX_AUDIO_BYTES = 25 * 1024 * 1024
const OPENAI_TRANSCRIPTION_MODEL = 'gpt-4o-mini-transcribe'

export async function POST(request: NextRequest) {
  const provider = env.openAiApiKey ? 'openai' : env.groqApiKey ? 'groq' : ''

  if (!provider) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'TRANSCRIPTION_NOT_CONFIGURED',
          message: '服务端语音识别未配置 OPENAI_API_KEY 或 GROQ_API_KEY',
        },
      },
      { status: 200 }
    )
  }

  try {
    const incomingForm = await request.formData()
    const audio = incomingForm.get('audio')
    const language = String(incomingForm.get('language') || 'en')

    if (!(audio instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_AUDIO',
            message: '请上传语音片段',
          },
        },
        { status: 400 }
      )
    }

    if (audio.size <= 0 || audio.size > MAX_AUDIO_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_AUDIO_SIZE',
            message: '语音片段为空或超过 25MB',
          },
        },
        { status: 400 }
      )
    }

    const providerForm = new FormData()
    providerForm.append('file', audio, audio.name || 'voice.webm')
    providerForm.append('model', provider === 'openai' ? OPENAI_TRANSCRIPTION_MODEL : env.voiceTranscriptionModel)
    providerForm.append('response_format', 'json')
    providerForm.append('language', language)
    providerForm.append('temperature', '0')

    const response = await fetch(provider === 'openai' ? OPENAI_TRANSCRIPTION_URL : GROQ_TRANSCRIPTION_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${provider === 'openai' ? env.openAiApiKey : env.groqApiKey}`,
      },
      body: providerForm,
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TRANSCRIPTION_FAILED',
            message: data?.error?.message || '语音识别失败，请稍后重试',
          },
        },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        text: String(data?.text || '').trim(),
        provider,
        model: provider === 'openai' ? OPENAI_TRANSCRIPTION_MODEL : env.voiceTranscriptionModel,
      },
    })
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'TRANSCRIPTION_EXCEPTION',
          message: '语音识别服务暂时不可用',
        },
      },
      { status: 500 }
    )
  }
}
