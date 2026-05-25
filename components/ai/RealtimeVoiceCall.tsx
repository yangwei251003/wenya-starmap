'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Mic, MicOff, Phone, PhoneOff, Radio, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { speechService } from '@/lib/speech-service'

type CallState = 'idle' | 'connecting' | 'live' | 'ended' | 'error'
type VoiceMode = 'idle' | 'openai' | 'browser'

type VoiceMessage = {
  id: string
  role: 'user' | 'assistant' | 'system'
  text: string
}

function getUserId() {
  if (typeof window === 'undefined') return ''

  try {
    const raw = window.localStorage.getItem('wenya_user')
    if (!raw) return ''
    return JSON.parse(raw)?.id || ''
  } catch {
    return ''
  }
}

function getClientSecret(payload: any): string {
  return (
    payload?.client_secret?.value ||
    payload?.data?.client_secret?.value ||
    payload?.value ||
    payload?.data?.value ||
    ''
  )
}

function getRealtimeModel(payload: any): string {
  return payload?.data?.model || payload?.model || 'gpt-realtime'
}

function extractEnglishText(text: string): string {
  const englishOnly = text.replace(/[\u4e00-\u9fff\u3400-\u4dbf]/g, '')
  return englishOnly.replace(/\s+/g, ' ').trim()
}

export function RealtimeVoiceCall() {
  const [callState, setCallState] = useState<CallState>('idle')
  const [voiceMode, setVoiceMode] = useState<VoiceMode>('idle')
  const [muted, setMuted] = useState(false)
  const [error, setError] = useState('')
  const [messages, setMessages] = useState<VoiceMessage[]>([])
  const [energy, setEnergy] = useState(0.16)

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  const pulseTimerRef = useRef<number | null>(null)
  const recognitionRef = useRef<any>(null)
  const recognitionRestartTimerRef = useRef<number | null>(null)
  const browserSessionActiveRef = useRef(false)
  const browserMutedRef = useRef(false)
  const browserProcessingRef = useRef(false)
  const browserConversationRef = useRef<Array<{ role: 'system' | 'user' | 'assistant'; content: string }>>([])

  useEffect(() => {
    if (callState !== 'live') {
      setEnergy(callState === 'connecting' ? 0.38 : 0.16)
      return
    }

    pulseTimerRef.current = window.setInterval(() => {
      setEnergy(0.32 + Math.random() * 0.42)
    }, 280)

    return () => {
      if (pulseTimerRef.current) {
        window.clearInterval(pulseTimerRef.current)
        pulseTimerRef.current = null
      }
    }
  }, [callState])

  const appendMessage = (message: VoiceMessage) => {
    setMessages((current) => [message, ...current].slice(0, 6))
  }

  const stopBrowserRecognition = () => {
    if (recognitionRestartTimerRef.current) {
      window.clearTimeout(recognitionRestartTimerRef.current)
      recognitionRestartTimerRef.current = null
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null
        recognitionRef.current.onerror = null
        recognitionRef.current.onend = null
        recognitionRef.current.stop()
      } catch {
        // noop
      }
      recognitionRef.current = null
    }
  }

  const cleanup = () => {
    if (pulseTimerRef.current) {
      window.clearInterval(pulseTimerRef.current)
      pulseTimerRef.current = null
    }

    stopBrowserRecognition()
    speechService.stop()

    dataChannelRef.current?.close()
    dataChannelRef.current = null
    pcRef.current?.close()
    pcRef.current = null
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null

    if (audioRef.current) {
      audioRef.current.srcObject = null
    }
  }

  useEffect(() => cleanup, [])

  const startBrowserRecognitionLoop = () => {
    if (browserMutedRef.current || browserProcessingRef.current || !browserSessionActiveRef.current) {
      return
    }

    const SpeechRecognitionCtor = (window as Window & {
      SpeechRecognition?: any
      webkitSpeechRecognition?: any
    }).SpeechRecognition || (window as Window & {
      SpeechRecognition?: any
      webkitSpeechRecognition?: any
    }).webkitSpeechRecognition

    if (!SpeechRecognitionCtor) {
      throw new Error('当前浏览器不支持语音识别，可使用文本对话。')
    }

    const recognition = new SpeechRecognitionCtor()
    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.continuous = false

    recognition.onresult = (event: any) => {
      const result = event.results?.[event.results.length - 1]
      if (!result?.isFinal) return

      const transcript = String(result[0]?.transcript || '').trim()
      if (!transcript || browserProcessingRef.current) return

      browserProcessingRef.current = true
      stopBrowserRecognition()
      appendMessage({
        id: `${Date.now()}-user`,
        role: 'user',
        text: transcript,
      })
      browserConversationRef.current.push({ role: 'user', content: transcript })

      void (async () => {
        try {
          const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: browserConversationRef.current.slice(-8),
              level: 'intermediate',
              context: 'speaking',
            }),
          })
          const data = await response.json().catch(() => null)
          const reply = data?.data?.reply || 'Let us try that again together.'

          appendMessage({
            id: `${Date.now()}-assistant`,
            role: 'assistant',
            text: reply,
          })
          browserConversationRef.current.push({ role: 'assistant', content: reply })

          if (!browserMutedRef.current) {
            const spokenText = extractEnglishText(reply) || reply
            await speechService.speak(spokenText, {
              rate: 0.82,
              pitch: 1,
              onEnergy: setEnergy,
            })
          }
        } catch (voiceError) {
          setError(voiceError instanceof Error ? voiceError.message : '浏览器语音回复失败')
        } finally {
          browserProcessingRef.current = false
          if (browserSessionActiveRef.current && !browserMutedRef.current) {
            recognitionRestartTimerRef.current = window.setTimeout(() => {
              try {
                startBrowserRecognitionLoop()
              } catch (loopError) {
                setError(loopError instanceof Error ? loopError.message : '无法重新启动语音识别')
              }
            }, 240)
          }
        }
      })()
    }

    recognition.onerror = (event: any) => {
      if (event?.error === 'not-allowed' || event?.error === 'service-not-allowed') {
        setError('浏览器拒绝了麦克风或语音识别权限，请允许后重试。')
      } else {
        setError(event?.error ? `语音识别错误：${event.error}` : '语音识别出现异常')
      }
      browserProcessingRef.current = false
      browserSessionActiveRef.current = false
      setCallState('error')
      stopBrowserRecognition()
    }

    recognition.onend = () => {
      recognitionRef.current = null
      if (browserSessionActiveRef.current && !browserMutedRef.current && !browserProcessingRef.current) {
        recognitionRestartTimerRef.current = window.setTimeout(() => {
          try {
            startBrowserRecognitionLoop()
          } catch (loopError) {
            setError(loopError instanceof Error ? loopError.message : '无法重新启动语音识别')
          }
        }, 220)
      }
    }

    recognitionRef.current = recognition
    setEnergy(0.32)
    recognition.start()
  }

  const startBrowserVoiceCall = async (sessionMessage?: string) => {
    if (typeof window === 'undefined') return
    if (!('MediaRecorder' in window)) {
      throw new Error('当前浏览器不支持浏览器语音模式')
    }

    browserSessionActiveRef.current = true
    browserMutedRef.current = false
    browserProcessingRef.current = false
    browserConversationRef.current = [
      {
        role: 'system',
        content: 'You are Xingyu, a warm English speaking tutor. Keep replies concise and conversational.',
      },
    ]

    setVoiceMode('browser')
    setCallState('live')
    setMessages([
      {
        id: 'system-live',
        role: 'system',
        text: sessionMessage || '已切换到浏览器语音模式，无需 OPENAI_API_KEY。',
      },
    ])

    if (speechService.isSpeechSupported()) {
      try {
        await speechService.speak('Hello, I am Xingyu. Let us practice English together.', {
          rate: 0.88,
          pitch: 1,
          onEnergy: setEnergy,
        })
      } catch {
        // 浏览器合成失败时继续启动识别
      }
    }

    startBrowserRecognitionLoop()
  }

  const startOpenAICall = async (sessionPayload: any) => {
    const clientSecret = getClientSecret(sessionPayload)
    const model = getRealtimeModel(sessionPayload)

    if (!clientSecret) {
      throw new Error('没有收到语音通话临时凭证')
    }

    const pc = new RTCPeerConnection()
    pcRef.current = pc

    const audio = audioRef.current || document.createElement('audio')
    audio.autoplay = true
    audioRef.current = audio

    pc.ontrack = (event) => {
      audio.srcObject = event.streams[0]
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    streamRef.current = stream
    stream.getAudioTracks().forEach((track) => pc.addTrack(track, stream))

    const dataChannel = pc.createDataChannel('oai-events')
    dataChannelRef.current = dataChannel
    dataChannel.onmessage = handleRealtimeEvent
    dataChannel.onopen = () => {
      dataChannel.send(JSON.stringify({
        type: 'response.create',
        response: {
          instructions: 'Start with a warm short greeting, then ask one simple English question.',
        },
      }))
    }

    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)

    const answerResponse = await fetch(`https://api.openai.com/v1/realtime/calls?model=${encodeURIComponent(model)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${clientSecret}`,
        'Content-Type': 'application/sdp',
      },
      body: offer.sdp || '',
    })

    if (!answerResponse.ok) {
      throw new Error('无法连接实时语音通话')
    }

    const answerSdp = await answerResponse.text()
    await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp })

    setVoiceMode('openai')
    setMessages([
      {
        id: 'system-live',
        role: 'system',
        text: '语音通话已接通，可以直接开口练英语。',
      },
    ])
    setCallState('live')
  }

  const handleRealtimeEvent = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data)
      const type = data?.type || ''

      if (type === 'conversation.item.input_audio_transcription.completed') {
        appendMessage({
          id: `${Date.now()}-user`,
          role: 'user',
          text: data.transcript || '已收到你的语音',
        })
      }

      if (
        type === 'response.audio_transcript.done' ||
        type === 'response.output_text.done' ||
        type === 'response.text.done'
      ) {
        appendMessage({
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          text: data.transcript || data.text || 'AI 正在继续回应',
        })
      }

      if (type === 'error') {
        setError(data?.error?.message || '语音通话出现异常')
        setCallState('error')
      }
    } catch {
      // Ignore non-JSON control frames.
    }
  }

  const startCall = async () => {
    setError('')
    setCallState('connecting')
    browserSessionActiveRef.current = false
    browserProcessingRef.current = false

    try {
      const sessionResponse = await fetch('/api/ai/realtime/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: 'intermediate',
          topic: 'daily English speaking practice',
          userId: getUserId(),
        }),
      })
      const sessionPayload = await sessionResponse.json()

      if (sessionPayload?.success && sessionPayload?.data?.provider === 'browser') {
        await startBrowserVoiceCall(sessionPayload?.data?.message)
        return
      }

      if (!sessionResponse.ok || !sessionPayload.success) {
        throw new Error(sessionPayload?.error?.message || '语音服务未配置')
      }

      await startOpenAICall(sessionPayload)
    } catch (startError) {
      cleanup()
      setError(startError instanceof Error ? startError.message : '语音通话启动失败')
      setCallState('error')
      setVoiceMode('idle')
    }
  }

  const endCall = () => {
    browserSessionActiveRef.current = false
    browserMutedRef.current = false
    browserProcessingRef.current = false
    cleanup()
    setMuted(false)
    setVoiceMode('idle')
    setCallState('ended')
    appendMessage({
      id: `${Date.now()}-ended`,
      role: 'system',
      text: '本次语音练习已结束。',
    })
  }

  const toggleMute = () => {
    const nextMuted = !muted
    setMuted(nextMuted)

    if (voiceMode === 'browser') {
      browserMutedRef.current = nextMuted
      if (nextMuted) {
        stopBrowserRecognition()
        setEnergy(0)
      } else if (browserSessionActiveRef.current && callState === 'live' && !browserProcessingRef.current) {
        try {
          startBrowserRecognitionLoop()
        } catch (muteError) {
          setError(muteError instanceof Error ? muteError.message : '无法恢复语音识别')
        }
      }
      return
    }

    streamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted
    })
  }

  const isLive = callState === 'live'
  const isConnecting = callState === 'connecting'
  const modeLabel =
    voiceMode === 'browser'
      ? '浏览器语音模式'
      : voiceMode === 'openai'
        ? 'OpenAI 实时通话'
        : '实时语音陪练'

  return (
    <Card className="mb-4 overflow-hidden border-[#00F5A0]/18 bg-[linear-gradient(135deg,rgba(4,14,22,0.94),rgba(14,18,34,0.82))] p-0">
      <div className="relative grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative min-h-[260px] overflow-hidden border-b border-white/8 bg-black/20 p-6 lg:border-b-0 lg:border-r">
          <div className="absolute inset-0 starfield opacity-40" />
          <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#00F5A0]/20" />
          <motion.div
            className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00F5A0]/12 blur-xl"
            animate={{ scale: 1 + energy * 0.7, opacity: 0.35 + energy * 0.35 }}
            transition={{ duration: 0.28 }}
          />
          <div className="relative z-10 flex min-h-[220px] flex-col items-center justify-center text-center">
            <motion.div
              className="flex h-28 w-28 items-center justify-center rounded-full border border-[#00F5A0]/28 bg-[#06151E]/80 shadow-[0_0_60px_rgba(0,245,160,0.18)]"
              animate={{ scale: isLive ? [1, 1.04, 1] : 1 }}
              transition={{ duration: 1.2, repeat: isLive ? Infinity : 0 }}
            >
              <Radio className={`h-11 w-11 ${isLive ? 'text-[#00F5A0]' : 'text-cosmos-300'}`} />
            </motion.div>
            <div className="mt-5 text-xs uppercase tracking-[0.3em] text-cosmos-400">AI Voice Call</div>
            <div className="mt-2 text-xl font-semibold text-white">{modeLabel}</div>
            <div className="mt-2 max-w-xs text-sm leading-6 text-cosmos-300">
              像打电话一样练英语。若未配置 OpenAI，系统会自动切换到浏览器原生语音模式。
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-[#B9FFE4]">
                <Sparkles className="h-4 w-4" />
                口语星窗
              </div>
              <p className="mt-1 text-sm text-cosmos-400">
                浏览器会请求麦克风权限；OpenAI 不可用时自动改用本地语音识别 + OpenRouter 回复。
              </p>
            </div>
            <div className="flex gap-2">
              {isLive && (
                <Button variant="cosmos" size="sm" onClick={toggleMute}>
                  {muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  {muted ? '取消静音' : '静音'}
                </Button>
              )}
              {isLive || isConnecting ? (
                <Button variant="star" size="sm" onClick={endCall}>
                  <PhoneOff className="h-4 w-4" />
                  挂断
                </Button>
              ) : (
                <Button variant="sprout" size="sm" onClick={startCall} isLoading={isConnecting}>
                  <Phone className="h-4 w-4" />
                  开始通话
                </Button>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-100">
              {error}
            </div>
          )}

          <div className="mt-4 space-y-2">
            {messages.length > 0 ? (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-2xl border p-3 text-sm ${
                    message.role === 'assistant'
                      ? 'border-[#00F5A0]/18 bg-[#00F5A0]/8 text-[#D8FFF0]'
                      : message.role === 'user'
                        ? 'border-star-300/20 bg-star-300/10 text-star-50'
                        : 'border-white/8 bg-white/5 text-cosmos-300'
                  }`}
                >
                  {message.text}
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4 text-sm leading-6 text-cosmos-300">
                点击“开始通话”后，星语会先用英文向你问候。你可以直接说 “I want to practice interview English.”
              </div>
            )}
          </div>
        </div>
      </div>
      <audio ref={audioRef} className="hidden" />
    </Card>
  )
}
