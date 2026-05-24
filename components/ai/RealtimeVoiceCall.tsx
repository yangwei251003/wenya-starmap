'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Mic, MicOff, Phone, PhoneOff, Radio, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

type CallState = 'idle' | 'connecting' | 'live' | 'ended' | 'error'

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

export function RealtimeVoiceCall() {
  const [callState, setCallState] = useState<CallState>('idle')
  const [muted, setMuted] = useState(false)
  const [error, setError] = useState('')
  const [messages, setMessages] = useState<VoiceMessage[]>([])
  const [energy, setEnergy] = useState(0.16)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  const pulseTimerRef = useRef<number | null>(null)

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

  const cleanup = () => {
    if (pulseTimerRef.current) {
      window.clearInterval(pulseTimerRef.current)
      pulseTimerRef.current = null
    }

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

  const appendMessage = (message: VoiceMessage) => {
    setMessages((current) => [message, ...current].slice(0, 5))
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

      setMessages([
        {
          id: 'system-live',
          role: 'system',
          text: '语音通话已接通，可以直接开口练英语。',
        },
      ])
      setCallState('live')
    } catch (startError) {
      cleanup()
      setError(startError instanceof Error ? startError.message : '语音通话启动失败')
      setCallState('error')
    }
  }

  const endCall = () => {
    cleanup()
    setMuted(false)
    setCallState('ended')
    appendMessage({
      id: `${Date.now()}-ended`,
      role: 'system',
      text: '本次语音练习已结束。',
    })
  }

  const toggleMute = () => {
    const nextMuted = !muted
    streamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted
    })
    setMuted(nextMuted)
  }

  const isLive = callState === 'live'
  const isConnecting = callState === 'connecting'

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
            <div className="mt-2 text-xl font-semibold text-white">
              {isLive ? '星语正在聆听' : isConnecting ? '正在接入星语' : '实时语音陪练'}
            </div>
            <div className="mt-2 max-w-xs text-sm leading-6 text-cosmos-300">
              像打电话一样练英语，AI 会实时听你说、纠正表达并继续追问。
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
                浏览器会请求麦克风权限；主密钥只保存在服务端。
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
