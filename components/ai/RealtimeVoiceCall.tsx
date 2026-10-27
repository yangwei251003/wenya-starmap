'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Mic, MicOff, Phone, PhoneOff, Radio, Sparkles, UploadCloud } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { speechService } from '@/lib/speech-service'

type CallState = 'idle' | 'connecting' | 'live' | 'ended' | 'error'
type VoiceMode = 'idle' | 'openai' | 'server-stt' | 'setup-required'
type TurnState = 'idle' | 'requesting-mic' | 'recording' | 'transcribing' | 'thinking' | 'speaking'

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

function pickRecordingMimeType() {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') return ''

  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/mpeg',
  ]

  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || ''
}

export function RealtimeVoiceCall() {
  const [callState, setCallState] = useState<CallState>('idle')
  const [voiceMode, setVoiceMode] = useState<VoiceMode>('idle')
  const [turnState, setTurnState] = useState<TurnState>('idle')
  const [muted, setMuted] = useState(false)
  const [error, setError] = useState('')
  const [messages, setMessages] = useState<VoiceMessage[]>([])
  const [energy, setEnergy] = useState(0.16)
  const [recordingSeconds, setRecordingSeconds] = useState(0)

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  const pulseTimerRef = useRef<number | null>(null)
  const recordingTimerRef = useRef<number | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const conversationRef = useRef<Array<{ role: 'system' | 'user' | 'assistant'; content: string }>>([])

  useEffect(() => {
    if (callState !== 'live') {
      setEnergy(callState === 'connecting' ? 0.38 : 0.16)
      return
    }

    if (turnState === 'recording' || turnState === 'speaking') return

    pulseTimerRef.current = window.setInterval(() => {
      setEnergy(0.18 + Math.random() * 0.18)
    }, 360)

    return () => {
      if (pulseTimerRef.current) {
        window.clearInterval(pulseTimerRef.current)
        pulseTimerRef.current = null
      }
    }
  }, [callState, turnState])

  const appendMessage = (message: VoiceMessage) => {
    setMessages((current) => [message, ...current].slice(0, 8))
  }

  const cleanupTimers = () => {
    if (pulseTimerRef.current) {
      window.clearInterval(pulseTimerRef.current)
      pulseTimerRef.current = null
    }
    if (recordingTimerRef.current) {
      window.clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }
  }

  const cleanup = () => {
    cleanupTimers()
    speechService.stop()

    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      try {
        recorderRef.current.stop()
      } catch {
        // noop
      }
    }

    recorderRef.current = null
    chunksRef.current = []
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

  const ensureMicrophone = async () => {
    if (streamRef.current) return streamRef.current
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('当前浏览器不支持麦克风录音')
    }

    const request = navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    })

    const timeout = new Promise<never>((_, reject) => {
      window.setTimeout(() => {
        reject(new Error('等待麦克风授权超时，请允许浏览器使用麦克风后重试'))
      }, 15000)
    })

    const stream = await Promise.race([request, timeout])
    streamRef.current = stream
    return stream
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    const fileExtension = audioBlob.type.includes('mp4') ? 'm4a' : 'webm'
    const formData = new FormData()
    formData.append('audio', new File([audioBlob], `voice-turn.${fileExtension}`, { type: audioBlob.type || 'audio/webm' }))
    formData.append('language', 'en')

    const response = await fetch('/api/ai/voice/transcribe', {
      method: 'POST',
      body: formData,
    })
    const data = await response.json().catch(() => null)

    if (!response.ok || !data?.success) {
      throw new Error(data?.error?.message || '语音识别失败')
    }

    const text = String(data?.data?.text || '').trim()
    if (!text) {
      throw new Error('没有识别到有效语音，请再说一次')
    }

    return text
  }

  const askVoiceTutor = async (transcript: string) => {
    conversationRef.current.push({ role: 'user', content: transcript })

    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: conversationRef.current.slice(-8),
        level: 'intermediate',
        context: 'speaking',
      }),
    })
    const data = await response.json().catch(() => null)
    const reply = String(data?.data?.reply || '').trim()

    if (!response.ok || !data?.success || !reply) {
      throw new Error(data?.error?.message || 'AI 回复失败')
    }

    conversationRef.current.push({ role: 'assistant', content: reply })
    return reply
  }

  const handleServerTurn = async (audioBlob: Blob) => {
    try {
      setTurnState('transcribing')
      appendMessage({
        id: `${Date.now()}-system-upload`,
        role: 'system',
        text: '正在识别你的发言...',
      })

      const transcript = await transcribeAudio(audioBlob)
      appendMessage({
        id: `${Date.now()}-user`,
        role: 'user',
        text: transcript,
      })

      setTurnState('thinking')
      const reply = await askVoiceTutor(transcript)
      appendMessage({
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        text: reply,
      })

      if (!muted && speechService.isSpeechSupported()) {
        setTurnState('speaking')
        const spokenText = extractEnglishText(reply) || reply
        await speechService.speak(spokenText, {
          rate: 0.82,
          pitch: 1,
          onEnergy: setEnergy,
        })
      }

      setTurnState('idle')
      setEnergy(0.2)
    } catch (turnError) {
      setTurnState('idle')
      setError(turnError instanceof Error ? turnError.message : '本轮语音处理失败')
    }
  }

  const startServerRecording = async () => {
    setError('')

    if (voiceMode !== 'server-stt') {
      setError('当前语音模式尚未就绪')
      return
    }

    try {
      const stream = await ensureMicrophone()
      const mimeType = pickRecordingMimeType()
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)

      chunksRef.current = []
      recorderRef.current = recorder
      setRecordingSeconds(0)
      setTurnState('recording')
      setEnergy(0.58)

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        cleanupTimers()
        const audioBlob = new Blob(chunksRef.current, {
          type: recorder.mimeType || mimeType || 'audio/webm',
        })
        chunksRef.current = []
        recorderRef.current = null

        if (audioBlob.size < 1200) {
          setTurnState('idle')
          setError('录音太短，请至少说 1 秒')
          return
        }

        void handleServerTurn(audioBlob)
      }

      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((seconds) => seconds + 1)
        setEnergy(0.5 + Math.random() * 0.36)
      }, 1000)

      recorder.start()
    } catch (recordError) {
      setTurnState('idle')
      setError(recordError instanceof Error ? recordError.message : '无法启动麦克风录音')
    }
  }

  const stopServerRecording = () => {
    if (!recorderRef.current || recorderRef.current.state === 'inactive') return
    recorderRef.current.stop()
  }

  const startServerVoiceCall = async (sessionPayload: any) => {
    if (sessionPayload?.data?.provider === 'setup-required') {
      setVoiceMode('setup-required')
      setCallState('error')
      setError('需要配置 OPENAI_API_KEY 或 GROQ_API_KEY 才能启用语音识别。')
      setMessages([
        {
          id: 'setup-required',
          role: 'system',
          text: '当前没有可用的服务端语音识别密钥。请配置 OPENAI_API_KEY 或 GROQ_API_KEY 后重新部署。',
        },
      ])
      return
    }

    setVoiceMode('server-stt')
    setTurnState('requesting-mic')
    setMessages([
      {
        id: 'server-stt-live',
        role: 'system',
        text: sessionPayload?.data?.message || '已启用服务端语音识别模式。点击“开始说话”，说完后点“结束发言”。',
      },
    ])
    await ensureMicrophone()
    conversationRef.current = [
      {
        role: 'system',
        content: 'You are Xingyu, a warm English speaking tutor. Keep replies short, conversational, and useful for speaking practice.',
      },
    ]
    setCallState('live')
    setTurnState('idle')

    if (speechService.isSpeechSupported()) {
      setTurnState('speaking')
      await speechService.speak('Hello, I am Xingyu. Tap start speaking, then tell me one sentence in English.', {
        rate: 0.86,
        pitch: 1,
        onEnergy: setEnergy,
      }).catch(() => undefined)
      setTurnState('idle')
    }
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

    const stream = await ensureMicrophone()
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
    setCallState('live')
    setMessages([
      {
        id: 'openai-live',
        role: 'system',
        text: 'OpenAI 实时语音通话已接通，可以直接开口练英语。',
      },
    ])
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
    setTurnState('idle')

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

      if (!sessionResponse.ok || !sessionPayload.success) {
        throw new Error(sessionPayload?.error?.message || '语音服务未配置')
      }

      if (sessionPayload?.data?.provider === 'server-stt' || sessionPayload?.data?.provider === 'setup-required') {
        await startServerVoiceCall(sessionPayload)
        return
      }

      await startOpenAICall(sessionPayload)
    } catch (startError) {
      cleanup()
      setError(startError instanceof Error ? startError.message : '语音通话启动失败')
      setCallState('error')
      setVoiceMode('idle')
      setTurnState('idle')
    }
  }

  const endCall = () => {
    cleanup()
    setMuted(false)
    setVoiceMode('idle')
    setTurnState('idle')
    setRecordingSeconds(0)
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

    if (voiceMode === 'openai') {
      streamRef.current?.getAudioTracks().forEach((track) => {
        track.enabled = !nextMuted
      })
    }

    if (nextMuted) {
      speechService.stop()
      setEnergy(0)
    }
  }

  const isLive = callState === 'live'
  const isConnecting = callState === 'connecting'
  const canRecord = isLive && voiceMode === 'server-stt' && (turnState === 'idle' || turnState === 'recording')
  const modeLabel =
    voiceMode === 'server-stt'
      ? '服务端语音识别'
      : voiceMode === 'openai'
        ? 'OpenAI 实时通话'
        : voiceMode === 'setup-required'
          ? '待配置语音服务'
          : 'AI Voice Call'
  const turnLabel: Record<TurnState, string> = {
    idle: '等待发言',
    'requesting-mic': '请求麦克风权限',
    recording: `录音中 ${recordingSeconds}s`,
    transcribing: '识别中',
    thinking: 'AI 思考中',
    speaking: 'AI 朗读中',
  }

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
            <div className="mt-5 text-xs uppercase tracking-[0.3em] text-cosmos-400">{modeLabel}</div>
            <div className="mt-2 text-xl font-semibold text-white">{turnLabel[turnState]}</div>
            <div className="mt-2 max-w-xs text-sm leading-6 text-cosmos-300">
              稳定版语音链路：录音上传、服务端识别、AI 回答、浏览器朗读。
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
                不再依赖浏览器语音识别网络服务；可使用 OPENAI_API_KEY 或 GROQ_API_KEY。
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
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

          {canRecord && (
            <div className="mt-4">
              {turnState === 'recording' ? (
                <Button variant="star" className="w-full gap-2" onClick={stopServerRecording}>
                  <UploadCloud className="h-4 w-4" />
                  结束发言并发送
                </Button>
              ) : (
                <Button variant="sprout" className="w-full gap-2" onClick={startServerRecording}>
                  <Mic className="h-4 w-4" />
                  开始说话
                </Button>
              )}
            </div>
          )}

          {turnState !== 'idle' && turnState !== 'recording' && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-[#00F5A0]/18 bg-[#00F5A0]/8 p-3 text-sm text-[#D8FFF0]">
              <Loader2 className="h-4 w-4 animate-spin" />
              {turnLabel[turnState]}
            </div>
          )}

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
                点击“开始通话”。配置 OPENAI_API_KEY 或 GROQ_API_KEY 后，你可以点击“开始说话”，说完再发送给星语。
              </div>
            )}
          </div>
        </div>
      </div>
      <audio ref={audioRef} className="hidden" />
    </Card>
  )
}
