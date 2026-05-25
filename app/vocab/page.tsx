'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BookOpen,
  Check,
  Flame,
  Globe,
  Headphones,
  Keyboard,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Target,
  Volume2,
  X,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { CompletionCelebration } from '@/components/ui/CompletionCelebration'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SpeechPlayer } from '@/lib/speech-service'
import { getVocabularyBank } from '@/lib/vocab-word-bank'
import type { Word } from '@/types'

type StudyMode = 'recognition' | 'meaning_choice' | 'listening' | 'spelling' | 'cloze'
type QueueReason = 'due_review' | 'weak_word' | 'new_word' | 'long_term_reinforce'
type CardState = 'new' | 'learning' | 'review' | 'relearning'

type WordResource = {
  word?: string
  phonetic?: string
  audioUrl?: string
  partOfSpeech?: string
  definition?: string
  example?: string
  synonyms?: string[]
  antonyms?: string[]
  relatedWords?: string[]
  confusingWords?: string[]
  source?: string
}

type StudyQueueItem = {
  id: string
  word_id: string
  word: Word
  resource?: WordResource | null
  mode: StudyMode
  reason: QueueReason
  state: CardState
  type: 'new' | 'review'
  next_review: string
  stability: number
  difficulty: number
  reps: number
  lapses: number
  retrievability?: number
}

type QueueStats = {
  total: number
  review: number
  new: number
  due: number
  weak: number
  mastered: number
  bankTotal: number
  dailyNewLimit: number
  dailyReviewLimit: number
  newWordsStudiedToday: number
  remainingNewWords: number
}

type LocalRecord = {
  wordId: string
  state: CardState
  reps: number
  lapses: number
  correct: number
  wrong: number
  stability: number
  difficulty: number
  nextReview: string
  lastReview?: string
}

const DAILY_TARGET = 20
const LOCAL_PROGRESS_KEY = 'wenya_vocab_fsrs_fallback'

const modeCopy: Record<StudyMode, { title: string; icon: LucideIcon }> = {
  recognition: { title: '快速认词', icon: BookOpen },
  meaning_choice: { title: '看义回忆', icon: Target },
  listening: { title: '听音辨词', icon: Headphones },
  spelling: { title: '拼写回忆', icon: Keyboard },
  cloze: { title: '例句填空', icon: Sparkles },
}

const reasonCopy: Record<QueueReason, string> = {
  due_review: '到期复习',
  weak_word: '薄弱强化',
  new_word: '新词补位',
  long_term_reinforce: '长期巩固',
}

function getGuestUserId() {
  if (typeof window === 'undefined') return 'guest'
  const existing = window.localStorage.getItem('wenya_vocab_guest_id')
  if (existing) return existing
  const guest = `guest_${Math.random().toString(36).slice(2, 10)}`
  window.localStorage.setItem('wenya_vocab_guest_id', guest)
  return guest
}

function getStoredUserId() {
  if (typeof window === 'undefined') return 'guest'
  const storedUser = window.localStorage.getItem('wenya_user')
  if (!storedUser) return getGuestUserId()

  try {
    const user = JSON.parse(storedUser)
    return user?.id || getGuestUserId()
  } catch {
    return getGuestUserId()
  }
}

function loadLocalRecords(userId: string): Record<string, LocalRecord> {
  if (typeof window === 'undefined') return {}
  const raw = window.localStorage.getItem(`${LOCAL_PROGRESS_KEY}_${userId}`)
  if (!raw) return {}

  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function saveLocalRecords(userId: string, records: Record<string, LocalRecord>) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(`${LOCAL_PROGRESS_KEY}_${userId}`, JSON.stringify(records))
}

function chooseLocalMode(record?: LocalRecord): StudyMode {
  if (!record || record.reps === 0) return 'recognition'
  if (record.lapses >= 2) return 'spelling'
  if (record.reps >= 4) return 'cloze'
  if (record.reps >= 2) return 'listening'
  return 'meaning_choice'
}

function buildLocalQueue(userId: string) {
  const records = loadLocalRecords(userId)
  const now = Date.now()
  const bank = getVocabularyBank()

  const items = bank.map((word) => {
    const record = records[word.id]
    const isNew = !record
    const reason: QueueReason = isNew
      ? 'new_word'
      : record.lapses > 0 || record.difficulty >= 7
        ? 'weak_word'
        : new Date(record.nextReview).getTime() <= now
          ? 'due_review'
          : 'long_term_reinforce'

    return {
      id: `local_${word.id}`,
      word_id: word.id,
      word,
      resource: null,
      mode: chooseLocalMode(record),
      reason,
      state: record?.state || 'new',
      type: isNew ? 'new' : 'review',
      next_review: record?.nextReview || new Date().toISOString(),
      stability: record?.stability || 0,
      difficulty: record?.difficulty || 4,
      reps: record?.reps || 0,
      lapses: record?.lapses || 0,
      retrievability: record ? Math.min(1, Math.max(0, record.stability / Math.max(1, record.difficulty * 8))) : 0,
    } satisfies StudyQueueItem
  })

  const priority: Record<QueueReason, number> = {
    due_review: 0,
    weak_word: 1,
    new_word: 2,
    long_term_reinforce: 3,
  }

  const queue = items
    .sort((a, b) => priority[a.reason] - priority[b.reason] || new Date(a.next_review).getTime() - new Date(b.next_review).getTime())
    .slice(0, DAILY_TARGET)

  return {
    queue,
    stats: {
      total: queue.length,
      review: queue.filter((item) => item.type === 'review').length,
      new: queue.filter((item) => item.type === 'new').length,
      due: items.filter((item) => item.reason === 'due_review').length,
      weak: items.filter((item) => item.reason === 'weak_word').length,
      mastered: items.filter((item) => item.stability >= 30 && item.lapses === 0).length,
      bankTotal: bank.length,
      dailyNewLimit: DAILY_TARGET,
      dailyReviewLimit: 80,
      newWordsStudiedToday: 0,
      remainingNewWords: DAILY_TARGET,
    },
    recommendation: '当前使用本地兜底学习队列；登录并连接云端后会同步为 FSRS 长期记忆计划。',
  }
}

function updateLocalRecord(userId: string, item: StudyQueueItem, rating: number) {
  const records = loadLocalRecords(userId)
  const current = records[item.word_id] || {
    wordId: item.word_id,
    state: 'new',
    reps: 0,
    lapses: 0,
    correct: 0,
    wrong: 0,
    stability: 0,
    difficulty: 4,
    nextReview: new Date().toISOString(),
  }

  const isWrong = rating === 1
  const isHard = rating === 2
  const intervalMinutes = isWrong ? 10 : isHard ? 60 * 24 : rating === 4 ? 60 * 24 * Math.max(3, current.stability + 2) : 60 * 24 * Math.max(1, current.stability + 1)

  records[item.word_id] = {
    ...current,
    state: isWrong ? 'relearning' : 'review',
    reps: current.reps + 1,
    lapses: current.lapses + (isWrong ? 1 : 0),
    correct: current.correct + (rating >= 3 ? 1 : 0),
    wrong: current.wrong + (rating < 3 ? 1 : 0),
    stability: Math.max(0.5, current.stability + (rating === 4 ? 3 : rating === 3 ? 1.5 : rating === 2 ? 0.4 : -0.5)),
    difficulty: Math.min(10, Math.max(1, current.difficulty + (rating < 3 ? 0.8 : -0.25))),
    nextReview: new Date(Date.now() + intervalMinutes * 60 * 1000).toISOString(),
    lastReview: new Date().toISOString(),
  }

  saveLocalRecords(userId, records)
}

function mergeResource(item: StudyQueueItem, resource: WordResource | null): StudyQueueItem {
  if (!resource) return item

  return {
    ...item,
    resource,
    word: {
      ...item.word,
      word: resource.word || item.word.word,
      phonetic: resource.phonetic || item.word.phonetic,
      audioUrl: resource.audioUrl || item.word.audioUrl,
      meaning: resource.definition || item.word.meaning,
      example: resource.example || item.word.example,
      confusingWords: resource.confusingWords?.length ? resource.confusingWords : item.word.confusingWords,
    },
  }
}

export default function VocabPage() {
  const router = useRouter()
  const [userId, setUserId] = useState('')
  const [queue, setQueue] = useState<StudyQueueItem[]>([])
  const [stats, setStats] = useState<QueueStats | null>(null)
  const [recommendation, setRecommendation] = useState('')
  const [source, setSource] = useState<'cloud' | 'local'>('cloud')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [typedAnswer, setTypedAnswer] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isComplete, setIsComplete] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [session, setSession] = useState({ new: 0, review: 0, again: 0, hard: 0, good: 0, easy: 0 })
  const [startedAt] = useState(Date.now())
  const cardStartedAt = useRef(Date.now())
  const [speechPlayer] = useState(() => new SpeechPlayer((playing) => setIsPlaying(playing)))

  const current = queue[currentIndex]
  const progress = queue.length ? Math.round((currentIndex / queue.length) * 100) : 0

  const hydrateResources = async (items: StudyQueueItem[]) => {
    const hydrated = await Promise.all(
      items.map(async (item) => {
        try {
          const response = await fetch(`/api/resources/word?word=${encodeURIComponent(item.word.word)}`)
          if (!response.ok) return item
          const payload = await response.json()
          return mergeResource(item, payload.data || null)
        } catch {
          return item
        }
      })
    )

    return hydrated
  }

  const loadQueue = async (forceLocal = false) => {
    if (!userId) return
    setIsLoading(true)
    setIsComplete(false)
    setShowCelebration(false)
    setCurrentIndex(0)
    setShowAnswer(false)
    setTypedAnswer('')

    try {
      if (forceLocal) throw new Error('force local queue')

      const response = await fetch(`/api/study/next?userId=${encodeURIComponent(userId)}&limit=${DAILY_TARGET}`, { cache: 'no-store' })
      const payload = await response.json()
      const items = payload?.data?.queue || []

      if (!response.ok || !Array.isArray(items) || items.length === 0) {
        throw new Error('cloud queue unavailable')
      }

      setSource('cloud')
      setStats(payload.data.stats)
      setRecommendation(payload.data.recommendation || '')
      setQueue(items)
      void hydrateResources(items).then(setQueue)
    } catch {
      const local = buildLocalQueue(userId)
      setSource('local')
      setStats(local.stats)
      setRecommendation(local.recommendation)
      setQueue(local.queue)
      void hydrateResources(local.queue).then(setQueue)
    } finally {
      cardStartedAt.current = Date.now()
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setUserId(getStoredUserId())
  }, [])

  useEffect(() => {
    if (!userId) return
    void loadQueue(false)
  }, [userId])

  useEffect(() => {
    if (!current) return
    cardStartedAt.current = Date.now()
    setShowAnswer(false)
    setTypedAnswer('')
    void speechPlayer.playWord(current.word.word, current.word.phonetic)
  }, [currentIndex, current?.word_id])

  const finishOrNext = () => {
    speechPlayer.stop()
    if (currentIndex >= queue.length - 1) {
      setIsComplete(true)
      setShowCelebration(true)
      return
    }
    setCurrentIndex((index) => index + 1)
  }

  const submitRating = async (rating: 1 | 2 | 3 | 4) => {
    if (!current || !userId) return

    const responseTimeMs = Date.now() - cardStartedAt.current
    const adaptedRating = rating === 3 && responseTimeMs > 9000 ? 2 : rating

    setSession((prev) => ({
      ...prev,
      new: prev.new + (current.type === 'new' ? 1 : 0),
      review: prev.review + (current.type === 'review' ? 1 : 0),
      again: prev.again + (adaptedRating === 1 ? 1 : 0),
      hard: prev.hard + (adaptedRating === 2 ? 1 : 0),
      good: prev.good + (adaptedRating === 3 ? 1 : 0),
      easy: prev.easy + (adaptedRating === 4 ? 1 : 0),
    }))

    if (source === 'cloud') {
      try {
        await fetch('/api/study/review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            wordId: current.word_id,
            rating: adaptedRating,
            reviewTime: new Date().toISOString(),
            responseTimeMs,
            mode: current.mode,
            wasRevealed: showAnswer,
            answerText: typedAnswer,
          }),
        })
      } catch {
        updateLocalRecord(userId, current, adaptedRating)
      }
    } else {
      updateLocalRecord(userId, current, adaptedRating)
    }

    finishOrNext()
  }

  const getTimeSpent = () => Math.floor((Date.now() - startedAt) / 1000)

  const summary = useMemo(() => {
    const done = session.again + session.hard + session.good + session.easy
    const correct = session.good + session.easy
    return {
      done,
      correct,
      accuracy: done ? Math.round((correct / done) * 100) : 0,
      next: session.again + session.hard > 0 ? '下一组建议先复盘薄弱词，再补新词。' : '下一组可以继续补充新词，保持当前节奏。',
    }
  }, [session])

  const statCards: Array<[string, string | number, LucideIcon]> = [
    ['今日目标', stats?.total ?? queue.length, Target],
    ['到期复习', stats?.due ?? 0, RotateCcw],
    ['薄弱词', stats?.weak ?? 0, Flame],
    ['新词余量', stats?.remainingNewWords ?? 0, Zap],
    ['已掌握', stats?.mastered ?? 0, Check],
  ]

  const renderPrompt = () => {
    if (!current) return null
    const Icon = modeCopy[current.mode].icon
    const word = current.word
    const cloze = word.example?.replace(new RegExp(word.word, 'i'), '_____') || `_____ is today's target word.`

    return (
      <Card className="relative overflow-hidden border-white/8 bg-white/5 p-6 md:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#00F5A0]/20 bg-[#00F5A0]/10">
              <Icon className="h-5 w-5 text-[#00F5A0]" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">{modeCopy[current.mode].title}</div>
              <div className="text-xs text-cosmos-400">{reasonCopy[current.reason]} · {current.state}</div>
            </div>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-cosmos-300">
            记忆强度 {Math.round((current.retrievability || 0) * 100)}%
          </div>
        </div>

        <div className="text-center">
          {current.mode === 'listening' ? (
            <button
              onClick={() => void speechPlayer.playWord(word.word, word.phonetic)}
              className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#00F5A0] text-[#07111d]"
              aria-label={isPlaying ? '暂停单词朗读' : '播放听音练习'}
            >
              {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
            </button>
          ) : current.mode === 'cloze' ? (
            <p className="mx-auto mb-5 max-w-2xl text-2xl leading-relaxed text-white">{cloze}</p>
          ) : (
            <h2 className="mb-3 text-4xl font-semibold text-white md:text-5xl">{word.word}</h2>
          )}

          <div className="mb-5 flex items-center justify-center gap-2 text-cosmos-300">
            <span>{word.phonetic || '音标待补全'}</span>
            <button onClick={() => void speechPlayer.playWord(word.word, word.phonetic)} className="rounded-lg p-1 hover:text-[#00F5A0]" title="播放单词" aria-label={`播放 ${word.word} 发音`}>
              <Volume2 className="h-5 w-5" />
            </button>
          </div>

          {(current.mode === 'spelling' || current.mode === 'listening') && (
            <input
              value={typedAnswer}
              onChange={(event) => setTypedAnswer(event.target.value)}
              placeholder="输入你回忆出的单词"
              className="mb-5 w-full max-w-md rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-center text-lg text-white outline-none focus:border-[#00F5A0]/60"
            />
          )}

          {!showAnswer ? (
            <Button variant="outline" onClick={() => setShowAnswer(true)} className="gap-2">
              <BookOpen className="h-4 w-4" />
              查看答案
            </Button>
          ) : (
            <div className="mx-auto max-w-2xl space-y-4 text-left">
              <div className="rounded-lg border border-[#00F5A0]/20 bg-[#00F5A0]/8 p-4">
                <div className="text-xs text-cosmos-400">释义</div>
                <div className="mt-1 text-xl font-semibold text-[#B8FFE7]">{word.meaning}</div>
              </div>
              <div className="rounded-lg border border-white/8 bg-black/20 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="text-xs text-cosmos-400">例句</div>
                  <button onClick={() => void speechPlayer.playSentence(word.example)} className="text-cosmos-300 hover:text-[#00F5A0]" title="播放例句" aria-label="播放例句">
                    <Volume2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-cosmos-100">{word.example}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {[...(word.confusingWords || []), ...(current.resource?.relatedWords || [])].slice(0, 8).map((tag) => (
                  <span key={tag} className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-xs text-cosmos-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    )
  }

  if (isLoading || !current) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white">
        <PageHeader title="智能背单词" subtitle="正在编排复习、新词与薄弱词" titleColor="sprout" backUrl="/dashboard" />
        <div className="mx-auto max-w-2xl px-4 py-16">
          <Card className="p-8 text-center">
            <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border border-[#00F5A0]/35 border-t-transparent" />
            <p className="text-cosmos-300">正在连接 FSRS 记忆队列和外部词典...</p>
          </Card>
        </div>
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white">
        <PageHeader title="智能背单词" subtitle="本轮学习已完成" titleColor="sprout" backUrl="/dashboard" />
        <div className="mx-auto max-w-4xl px-4 pb-8">
          <Card className="p-8 text-center">
            <Sparkles className="mx-auto mb-4 h-16 w-16 text-star-300" />
            <h2 className="text-2xl font-semibold text-white">这一组已经沉淀进记忆曲线</h2>
            <p className="mt-2 text-cosmos-300">{summary.next}</p>
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                ['完成', summary.done],
                ['正确率', `${summary.accuracy}%`],
                ['新词', session.new],
                ['复习', session.review],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-white/8 bg-white/5 p-4">
                  <div className="text-2xl font-semibold text-[#00F5A0]">{value}</div>
                  <div className="mt-1 text-xs text-cosmos-400">{label}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button variant="cosmos" onClick={() => router.push('/dashboard')} className="flex-1">返回星图</Button>
              <Button variant="sprout" onClick={() => void loadQueue(source === 'local')} className="flex-1 gap-2">
                <RefreshCw className="h-4 w-4" />
                继续下一组
              </Button>
            </div>
          </Card>
        </div>
        <CompletionCelebration
          isVisible={showCelebration}
          onClose={() => setShowCelebration(false)}
          onContinue={() => {
            setShowCelebration(false)
            void loadQueue(source === 'local')
          }}
          onGoHome={() => router.push('/dashboard')}
          title="学习完成"
          subtitle="复习计划已更新"
          correctCount={summary.correct}
          totalCount={summary.done}
          timeSpent={getTimeSpent()}
          xpEarned={summary.correct * 10}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <PageHeader title="智能背单词" subtitle="像成熟背词软件一样：复习优先，新词补位，错词返场" titleColor="sprout" backUrl="/dashboard" />

      <div className="mx-auto max-w-5xl px-4 pb-8">
        <Card className="mb-4 border-white/8 bg-white/5 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-[#00F5A0]" />
              <div>
                <p className="text-sm font-medium text-white">{source === 'cloud' ? '云端 FSRS 已连接' : '本地兜底模式'}</p>
                <p className="text-xs text-cosmos-400">DictionaryAPI.dev + Datamuse 补全释义、发音、例句和相关词</p>
              </div>
            </div>
            <Button variant="cosmos" size="sm" onClick={() => void loadQueue(false)} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              重新编排
            </Button>
          </div>
        </Card>

        <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-5">
          {statCards.map(([label, value, Icon]) => (
            <div key={String(label)} className="rounded-lg border border-white/8 bg-white/5 p-4">
              <Icon className="mb-2 h-4 w-4 text-[#00F5A0]" />
              <div className="text-xs text-cosmos-400">{label}</div>
              <div className="mt-1 text-2xl font-semibold text-white">{value}</div>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm text-cosmos-400">
            <span>{recommendation}</span>
            <span>{currentIndex + 1} / {queue.length}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/6">
            <div className="h-full rounded-full bg-gradient-to-r from-[#00F5A0] to-star-300 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {renderPrompt()}

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Button variant="outline" onClick={() => void submitRating(1)} className="gap-2 border-red-400/40 text-red-200">
            <X className="h-4 w-4" />
            忘记
          </Button>
          <Button variant="cosmos" onClick={() => void submitRating(2)} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            模糊
          </Button>
          <Button variant="sprout" onClick={() => void submitRating(3)} className="gap-2">
            <Check className="h-4 w-4" />
            认识
          </Button>
          <Button variant="star" onClick={() => void submitRating(4)} className="gap-2">
            <Zap className="h-4 w-4" />
            太简单
          </Button>
        </div>
      </div>
    </div>
  )
}
