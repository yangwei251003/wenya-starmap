import { NextRequest, NextResponse } from 'next/server'
import { callOpenRouterAPI } from '@/lib/openrouter'

function buildSystemPrompt(level: string, context: string): string {
  const levelDescriptions: Record<string, string> = {
    beginner: '初学者，需要简单、清晰、温柔的中英双语引导。',
    intermediate: '中级学习者，可以使用更自然的英语和适量中文解释。',
    advanced: '高级学习者，尽量以英语为主，并提供更地道的表达。',
  }

  const contextDescriptions: Record<string, string> = {
    general: '日常英语陪练与答疑',
    vocabulary: '词汇学习与记忆',
    grammar: '语法讲解与纠错',
    speaking: '口语表达与对话训练',
    writing: '写作润色与批改',
  }

  return `你是“问芽星图”的AI英语导师“星语”。

品牌语气：温柔、明亮、鼓励式、带一点星空感。

学习者水平：${levelDescriptions[level] || levelDescriptions.intermediate}
当前场景：${contextDescriptions[context] || contextDescriptions.general}

要求：
1. 先给出自然的英文回应。
2. 再用中文简要解释关键点。
3. 发现错误时要温和纠正，并给出更好的表达。
4. 尽量把回复写得像一段真正能陪伴学习者的对话。
5. 不要机械堆术语，保持轻盈、准确、友好。`
}

function getSimulatedResponse(message: string): string {
  const lowerMessage = message.toLowerCase()

  if (/(hello|hi|hey)/i.test(message)) {
    return 'Hello! 很高兴见到你。Let us turn today into a small bright step in English.'
  }

  if (lowerMessage.includes('help')) {
    return 'Of course. 当然可以。Tell me your question, and I will help you untangle it gently.'
  }

  return `That is a lovely question. 这是个很好的问题。

You said: "${message}"

I can help you refine it, explain it, or practice a reply together.`
}

export async function POST(request: NextRequest) {
  let requestBody: any = {}

  try {
    requestBody = await request.json()
  } catch (parseError) {
    return NextResponse.json(
      { success: false, error: '请求格式错误' },
      { status: 400 }
    )
  }

  const { message, messages, level = 'intermediate', context = 'general' } = requestBody

  const userMessages = Array.isArray(messages) && messages.length
    ? messages
    : message
      ? [{ role: 'user', content: message }]
      : []

  if (!userMessages.length) {
    return NextResponse.json(
      { success: false, error: '消息不能为空' },
      { status: 400 }
    )
  }

  try {
    const response = await callOpenRouterAPI(
      [
        { role: 'system', content: buildSystemPrompt(level, context) },
        ...userMessages,
      ],
      {
        temperature: 0.7,
        maxTokens: 1200,
      }
    )

    if (response.success && response.data) {
      return NextResponse.json({
        success: true,
        data: {
          reply: response.data,
          isSimulated: false,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        reply: getSimulatedResponse(message || userMessages[0].content),
        isSimulated: true,
        error: response.error?.message || 'AI服务暂时不可用，已启用降级回复',
      },
    })
  } catch (error) {
    return NextResponse.json({
      success: true,
      data: {
        reply: getSimulatedResponse(message || userMessages[0].content),
        isSimulated: true,
        error: 'AI调用异常，已启用降级回复',
      },
    })
  }
}
