'use client'

import { useState, useEffect, useRef } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Send, Bot, User, Sparkles, Lightbulb, RefreshCw, Volume2, VolumeX } from 'lucide-react'
import { speechService } from '@/lib/speech-service'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isPlaying?: boolean
}

const suggestedTopics = [
  { icon: '🌍', text: '聊聊旅行经历' },
  { icon: '📚', text: '讨论一本书' },
  { icon: '🎬', text: '推荐一部电影' },
  { icon: '🍳', text: '分享美食食谱' },
]

// AI响应将通过API获取

export default function ChatPage() {
  const [mounted, setMounted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI English tutor. 你好！我是你的AI英语导师。How can I help you today? 今天我能帮你什么？",
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [speechEnabled, setSpeechEnabled] = useState(true)
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // 调用AI API
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputValue,
          level: 'intermediate',
          context: 'general'
        })
      })
      
      const data = await response.json()
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.data?.reply || "I'm having trouble responding right now. 我现在无法回复。",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])

      // 如果启用了语音，自动播放AI回复
      if (speechEnabled && aiMessage.content) {
        setTimeout(() => {
          handlePlayMessage(aiMessage.id, aiMessage.content)
        }, 500)
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I'm having some technical difficulties. 抱歉，我遇到了一些技术问题。Please try again! 请再试一次！",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handlePlayMessage = async (messageId: string, content: string) => {
    if (playingMessageId === messageId) {
      // 如果正在播放这条消息，则停止
      speechService.stop()
      setPlayingMessageId(null)
      return
    }

    // 停止其他正在播放的消息
    if (playingMessageId) {
      speechService.stop()
    }

    setPlayingMessageId(messageId)

    try {
      // 提取英文部分进行朗读（简单的处理方式）
      const englishText = extractEnglishText(content)
      if (englishText) {
        await speechService.speak(englishText, { rate: 0.8, pitch: 1 })
      }
    } catch (error) {
      console.error('语音播放失败:', error)
    } finally {
      setPlayingMessageId(null)
    }
  }

  // 提取英文文本的简单函数
  const extractEnglishText = (text: string): string => {
    // 移除中文字符，保留英文、标点和空格
    const englishOnly = text.replace(/[\u4e00-\u9fff\u3400-\u4dbf]/g, '')
    // 清理多余的空格和标点
    return englishOnly.replace(/\s+/g, ' ').trim()
  }

  const handleTopicClick = (topic: string) => {
    setInputValue(topic)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClearChat = () => {
    speechService.stop()
    setPlayingMessageId(null)
    setMessages([{
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI English tutor. 你好！我是你的AI英语导师。How can I help you today? 今天我能帮你什么？",
      timestamp: new Date()
    }])
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader 
        title="AI对话" 
        subtitle="与AI导师互动学习"
        titleColor="purple"
        backUrl="/dashboard"
      />

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 pb-4 flex flex-col">
        {/* 语音控制 */}
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setSpeechEnabled(!speechEnabled)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
              speechEnabled 
                ? 'bg-sprout-400/20 text-sprout-400 hover:bg-sprout-400/30' 
                : 'bg-cosmos-800/50 text-cosmos-500 hover:bg-cosmos-700/50'
            }`}
            title={speechEnabled ? '关闭语音' : '开启语音'}
          >
            {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="text-sm">{speechEnabled ? '语音开启' : '语音关闭'}</span>
          </button>
        </div>
        {/* 聊天区域 */}
        <Card className={`flex-1 flex flex-col overflow-hidden ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in-up`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* 头像 */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'assistant' 
                    ? 'bg-gradient-to-br from-purple-400 to-purple-600' 
                    : 'bg-gradient-to-br from-sprout-400 to-sprout-600'
                }`}>
                  {message.role === 'assistant' ? (
                    <Bot className="w-5 h-5 text-white" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* 消息内容 */}
                <div className={`max-w-[75%] ${message.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block px-4 py-3 rounded-2xl ${
                    message.role === 'assistant'
                      ? 'bg-cosmos-800 text-cosmos-200 rounded-tl-none'
                      : 'bg-gradient-to-r from-sprout-500 to-sprout-600 text-white rounded-tr-none'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-cosmos-500">
                      {message.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {/* AI消息的语音播放按钮 */}
                    {message.role === 'assistant' && speechEnabled && (
                      <button
                        onClick={() => handlePlayMessage(message.id, message.content)}
                        className={`p-1 rounded transition-colors ${
                          playingMessageId === message.id
                            ? 'text-red-400 hover:text-red-300'
                            : 'text-cosmos-500 hover:text-sprout-400'
                        }`}
                        title={playingMessageId === message.id ? '停止播放' : '播放语音'}
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* 正在输入指示器 */}
            {isTyping && (
              <div className="flex gap-3 animate-fade-in-up">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-cosmos-800 px-4 py-3 rounded-2xl rounded-tl-none">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-cosmos-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <span className="w-2 h-2 bg-cosmos-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span className="w-2 h-2 bg-cosmos-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 建议话题 */}
          {messages.length <= 1 && (
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2 text-cosmos-400 text-sm mb-3">
                <Lightbulb className="w-4 h-4" />
                <span>试试这些话题：</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestedTopics.map((topic, index) => (
                  <button
                    key={index}
                    onClick={() => handleTopicClick(topic.text)}
                    className="px-3 py-2 bg-cosmos-800/50 hover:bg-cosmos-700/50 border border-cosmos-600/50 hover:border-purple-400/50 rounded-full text-sm text-cosmos-300 hover:text-white transition-all duration-300"
                  >
                    {topic.icon} {topic.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 输入区域 */}
          <div className="p-4 border-t border-cosmos-700">
            <div className="flex gap-3">
              <button
                onClick={handleClearChat}
                className="p-3 rounded-xl bg-cosmos-800/50 hover:bg-cosmos-700/50 text-cosmos-400 hover:text-white transition-all"
                title="清空对话"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入消息... Type a message..."
                  className="w-full px-4 py-3 bg-cosmos-800/50 border border-cosmos-600/50 rounded-xl text-white placeholder-cosmos-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                />
              </div>
              <Button
                variant="star"
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                className="px-4"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>

        {/* 提示 */}
        <div className="text-center mt-4 text-cosmos-500 text-sm flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>AI导师会用中英双语帮助你学习</span>
        </div>
      </div>
    </div>
  )
}
