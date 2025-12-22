import { NextRequest, NextResponse } from 'next/server'

// AI对话接口
export async function POST(request: NextRequest) {
  let requestBody: any = {}
  
  try {
    // 安全地解析请求体
    requestBody = await request.json()
  } catch (parseError) {
    console.error('Request body parse error:', parseError)
    return NextResponse.json({
      success: false,
      error: '请求格式错误'
    }, { status: 400 })
  }

  const { message, level = 'intermediate', context = 'general' } = requestBody

  if (!message) {
    return NextResponse.json({
      success: false,
      error: '消息不能为空'
    }, { status: 400 })
  }

  try {
    // 检查API Key
    const apiKey = process.env.GLM_API_KEY
    const apiUrl = process.env.GLM_API_URL || 'https://open.bigmodel.cn/api/paas/v4/chat/completions'

    if (!apiKey) {
      // 如果没有配置API Key，返回模拟响应
      return NextResponse.json({
        success: true,
        data: {
          reply: getSimulatedResponse(message, level),
          isSimulated: true
        }
      })
    }

    // 构建系统提示词
    const systemPrompt = buildSystemPrompt(level, context)

    // 调用智谱GLM API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'glm-4-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('GLM API Error:', response.status, errorText)
      
      // API调用失败，返回模拟响应
      return NextResponse.json({
        success: true,
        data: {
          reply: getSimulatedResponse(message, level),
          isSimulated: true,
          apiError: `API错误: ${response.status}`
        }
      })
    }

    const data = await response.json()
    console.log('GLM API Success:', data.choices?.[0]?.message?.content)
    const aiReply = data.choices?.[0]?.message?.content || '抱歉，我暂时无法回复。'

    return NextResponse.json({
      success: true,
      data: {
        reply: aiReply,
        isSimulated: false
      }
    })

  } catch (error) {
    console.error('AI Chat Error:', error)
    
    // 返回模拟响应作为降级方案
    return NextResponse.json({
      success: true,
      data: {
        reply: getSimulatedResponse(message, level),
        isSimulated: true,
        error: 'API调用异常，使用模拟响应'
      }
    })
  }
}

// 构建系统提示词
function buildSystemPrompt(level: string, context: string): string {
  const levelDescriptions: Record<string, string> = {
    beginner: '初学者，需要简单的词汇和句子，多用中文解释',
    intermediate: '中级学习者，可以使用较复杂的句子，中英文混合',
    advanced: '高级学习者，可以使用复杂的表达和习语，以英文为主'
  }

  const contextDescriptions: Record<string, string> = {
    general: '日常英语对话练习',
    vocabulary: '词汇学习和记忆',
    grammar: '语法讲解和练习',
    speaking: '口语表达练习',
    writing: '写作指导'
  }

  return `你是"问芽星图"平台的AI英语导师，名叫"星语"。

学生水平：${levelDescriptions[level] || levelDescriptions.intermediate}
学习场景：${contextDescriptions[context] || contextDescriptions.general}

你的职责：
1. 用友好、鼓励的语气与学生交流
2. 使用中英双语回复，帮助学生理解
3. 纠正学生的语法和表达错误，并解释原因
4. 根据学生水平调整回复的难度
5. 适时给出学习建议和鼓励

回复格式：
- 先用英文回复
- 然后用中文解释或翻译关键内容
- 如果学生有错误，温和地指出并纠正

记住：你是一位耐心、专业、有趣的英语老师！`
}

// 模拟响应（当没有配置API Key时使用）
function getSimulatedResponse(message: string, level: string): string {
  const responses = [
    {
      pattern: /hello|hi|hey/i,
      reply: "Hello! 你好！It's great to see you here. 很高兴见到你！How can I help you with your English today? 今天我能帮你什么英语问题呢？"
    },
    {
      pattern: /how are you/i,
      reply: "I'm doing great, thank you for asking! 我很好，谢谢你的关心！And how about you? 你呢？Are you ready to learn some English today? 准备好今天学习英语了吗？"
    },
    {
      pattern: /thank|thanks/i,
      reply: "You're welcome! 不客气！I'm always happy to help. 我很乐意帮助你。Keep up the good work! 继续加油！"
    },
    {
      pattern: /bye|goodbye/i,
      reply: "Goodbye! 再见！It was nice chatting with you. 很高兴和你聊天。See you next time! 下次见！Keep practicing! 继续练习哦！"
    },
    {
      pattern: /help|learn/i,
      reply: "I'd love to help you learn English! 我很乐意帮你学习英语！What would you like to practice today? 你今天想练习什么？We can work on vocabulary, grammar, or just have a conversation. 我们可以练习词汇、语法，或者只是聊聊天。"
    }
  ]

  // 查找匹配的响应
  for (const item of responses) {
    if (item.pattern.test(message)) {
      return item.reply
    }
  }

  // 默认响应
  const lowerMessage = message.toLowerCase()
  
  // 根据消息内容提供更智能的响应
  if (lowerMessage.includes('想') || lowerMessage.includes('think')) {
    return `That's interesting! 这很有趣！Let me help you with that. 让我来帮助你。

In English, we might say: "想" can be translated as "want", "think", or "miss" depending on the context.

For example:
- 我想学英语 = I want to learn English
- 我想你 = I miss you
- 我想是的 = I think so

Would you like to practice more? 想要继续练习吗？

💡 提示：这是演示模式。如需完整AI对话功能，请联系管理员配置API密钥。`
  }
  
  return `Great question! 很好的问题！

You said: "${message}"

Let me help you with that. 让我来帮助你。This is a practice conversation to help you learn English. 这是一个帮助你学习英语的练习对话。

Here are some tips for learning English:
学习英语的一些建议：
- Practice every day 每天练习
- Don't be afraid to make mistakes 不要害怕犯错
- Listen to English content 多听英语内容
- Speak as much as possible 尽可能多说

Would you like to continue practicing? 想要继续练习吗？

💡 提示：当前为演示模式。完整AI功能需要配置API密钥。`
}
