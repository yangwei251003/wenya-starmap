import { NextRequest, NextResponse } from 'next/server'
import { env, hasOpenAIRealtime } from '@/lib/env'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const REALTIME_SESSION_URL = 'https://api.openai.com/v1/realtime/client_secrets'

export async function POST(request: NextRequest) {
  if (!hasOpenAIRealtime()) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'OPENAI_NOT_CONFIGURED',
          message: '语音通话服务未配置 OPENAI_API_KEY',
        },
      },
      { status: 200 }
    )
  }

  let body: {
    level?: string
    topic?: string
    userId?: string
  } = {}

  try {
    body = await request.json()
  } catch {
    body = {}
  }

  const level = body.level || 'intermediate'
  const topic = body.topic || 'daily English conversation'

  const instructions = `You are Xingyu, the voice AI English tutor for WenYa StarMap.
Speak naturally and warmly. Keep turns concise enough for a phone-like conversation.
Help the learner practice English, gently correct mistakes, and briefly explain key phrases in Chinese when useful.
Learner level: ${level}. Conversation topic: ${topic}.`

  try {
    const response = await fetch(REALTIME_SESSION_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session: {
          type: 'realtime',
          model: env.openAiRealtimeModel,
          audio: {
            input: {
              format: { type: 'audio/pcm', rate: 24000 },
              transcription: { model: 'gpt-4o-mini-transcribe' },
              turn_detection: { type: 'server_vad' },
            },
            output: {
              format: { type: 'audio/pcm', rate: 24000 },
              voice: 'alloy',
            },
          },
          instructions,
        },
      }),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'OPENAI_REALTIME_ERROR',
            message: data?.error?.message || '无法创建语音通话临时会话',
          },
        },
        { status: response.status }
      )
    }

    if (supabaseAdmin && body.userId) {
      await supabaseAdmin.from('voice_sessions').insert({
        user_id: body.userId,
        provider: 'openai',
        model: env.openAiRealtimeModel,
        topic,
        status: 'created',
        metadata: {
          level,
          sessionId: data?.session_id || data?.id || null,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        model: env.openAiRealtimeModel,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'OPENAI_REALTIME_EXCEPTION',
          message: '语音通话服务暂时不可用',
        },
      },
      { status: 500 }
    )
  }
}
