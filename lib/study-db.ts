import { Rating, State, type Card } from '@/utils/fsrs'
import { getVocabularyBank, getVocabularyWordById } from './vocab-word-bank'
import { fsrs } from '@/utils/fsrs'
import { supabaseAdmin } from './supabase'

export type StudyLogRow = {
  id: string
  user_id: string
  word_id: string
  last_review: string | null
  next_review: string
  stability: number
  difficulty: number
  state: 'new' | 'learning' | 'review' | 'relearning'
  step: number
  reps: number
  lapses: number
  elapsed_days: number
  scheduled_days: number
  created_at: string
  updated_at: string
}

export type ReviewLogRow = {
  id?: string
  user_id: string
  word_id: string
  study_log_id?: string
  rating: number
  elapsed_days: number
  scheduled_days: number
  review_time: string
  previous_state: 'new' | 'learning' | 'review' | 'relearning'
  created_at?: string
}

export type StudyMode = 'recognition' | 'meaning_choice' | 'listening' | 'spelling' | 'cloze'
export type QueueReason = 'due_review' | 'weak_word' | 'new_word' | 'long_term_reinforce'

export type StudyQueueItem = ReturnType<typeof toStudyCard> & {
  word: NonNullable<ReturnType<typeof getVocabularyWordById>>
  mode: StudyMode
  reason: QueueReason
  retrievability: number
}

const DEFAULT_DAILY_NEW_LIMIT = 20
const DEFAULT_DAILY_REVIEW_LIMIT = 80
const MAX_PREFETCH_NEW = 120

function startOfToday() {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return now
}

function stateToFsrsState(state: StudyLogRow['state']) {
  if (state === 'new') return State.New
  if (state === 'learning') return State.Learning
  if (state === 'review') return State.Review
  return State.Relearning
}

function toStateName(state: State): StudyLogRow['state'] {
  if (state === State.New) return 'new'
  if (state === State.Learning) return 'learning'
  if (state === State.Review) return 'review'
  return 'relearning'
}

function createNewStudyRow(userId: string, wordId: string, now = new Date()): StudyLogRow {
  return {
    id: crypto.randomUUID(),
    user_id: userId,
    word_id: wordId,
    last_review: null,
    next_review: now.toISOString(),
    stability: 0,
    difficulty: 4,
    state: 'new',
    step: 0,
    reps: 0,
    lapses: 0,
    elapsed_days: 0,
    scheduled_days: 0,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  }
}

function buildCard(row: StudyLogRow): Card {
  return {
    id: row.word_id,
    due: new Date(row.next_review),
    stability: row.stability,
    difficulty: row.difficulty,
    elapsed_days: row.elapsed_days,
    scheduled_days: row.scheduled_days,
    reps: row.reps,
    lapses: row.lapses,
    state: stateToFsrsState(row.state),
    last_review: row.last_review ? new Date(row.last_review) : undefined,
  }
}

function getRetrievability(row: StudyLogRow, now = new Date()) {
  if (row.state === 'new') return 0
  return fsrs.getMemoryStrength(buildCard(row), now) / 100
}

function chooseStudyMode(row: StudyLogRow, reason: QueueReason): StudyMode {
  if (row.lapses >= 2 || reason === 'weak_word') return 'spelling'
  if (row.state === 'learning' || row.state === 'relearning') return 'meaning_choice'
  if (row.reps >= 4 && row.stability >= 7) return 'cloze'
  if (row.reps >= 2) return 'listening'
  return 'recognition'
}

function getQueueReason(row: StudyLogRow, now = new Date()): QueueReason {
  const due = new Date(row.next_review).getTime() <= now.getTime()
  if (row.state === 'new') return 'new_word'
  if (row.lapses > 0 || row.difficulty >= 7 || row.state === 'relearning') return 'weak_word'
  if (due) return 'due_review'
  return 'long_term_reinforce'
}

export function toStudyCard(row: StudyLogRow) {
  const now = new Date()
  const reason = getQueueReason(row, now)
  const dueAt = new Date(row.next_review).getTime()
  const isDue = dueAt <= now.getTime()
  const priority =
    reason === 'due_review'
      ? 0
      : reason === 'weak_word'
        ? 1
        : reason === 'new_word'
          ? 2
          : 3

  return {
    id: `card_${row.word_id}`,
    user_id: row.user_id,
    word_id: row.word_id,
    next_review: row.next_review,
    stability: row.stability,
    difficulty: row.difficulty,
    state: row.state,
    priority,
    type: row.state === 'new' ? 'new' as const : 'review' as const,
    reps: row.reps,
    lapses: row.lapses,
    elapsed_days: row.elapsed_days,
    scheduled_days: row.scheduled_days,
    step: row.step,
    is_due: isDue,
    overdue_hours: isDue ? Math.max(0, (now.getTime() - dueAt) / 36e5) : 0,
  }
}

async function getSettings(userId: string) {
  if (!supabaseAdmin) {
    return {
      daily_new_limit: DEFAULT_DAILY_NEW_LIMIT,
      daily_review_limit: DEFAULT_DAILY_REVIEW_LIMIT,
    }
  }

  const { data } = await supabaseAdmin
    .from('user_study_settings')
    .select('daily_new_limit,daily_review_limit')
    .eq('user_id', userId)
    .maybeSingle()

  return {
    daily_new_limit: data?.daily_new_limit ?? DEFAULT_DAILY_NEW_LIMIT,
    daily_review_limit: data?.daily_review_limit ?? DEFAULT_DAILY_REVIEW_LIMIT,
  }
}

async function getNewWordsStudiedToday(userId: string) {
  if (!supabaseAdmin) return 0

  const { count } = await supabaseAdmin
    .from('review_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('previous_state', 'new')
    .gte('review_time', startOfToday().toISOString())

  return count ?? 0
}

export async function getStudyLogs(userId: string): Promise<StudyLogRow[]> {
  if (!supabaseAdmin) return []

  const { data } = await supabaseAdmin
    .from('study_logs')
    .select('*')
    .eq('user_id', userId)
    .order('next_review', { ascending: true })
    .order('updated_at', { ascending: false })

  return (data || []) as StudyLogRow[]
}

async function ensureNewWordRows(userId: string, rows: StudyLogRow[], targetNewCount: number) {
  if (!supabaseAdmin || targetNewCount <= 0) return rows

  const knownIds = new Set(rows.map((row) => row.word_id))
  const words = getVocabularyBank()
  const candidates = words.filter((word) => !knownIds.has(word.id)).slice(0, Math.min(MAX_PREFETCH_NEW, targetNewCount))

  if (!candidates.length) return rows

  const now = new Date()
  const newRows = candidates.map((word) => createNewStudyRow(userId, word.id, now))

  await supabaseAdmin.from('study_logs').upsert(newRows, { onConflict: 'user_id,word_id' })

  return [...rows, ...newRows]
}

export async function getStudyQueue(userId: string, limit = 20) {
  const settings = await getSettings(userId)
  const studiedNewToday = await getNewWordsStudiedToday(userId)
  const remainingNewWords = Math.max(0, settings.daily_new_limit - studiedNewToday)
  const now = new Date()

  let rows = await getStudyLogs(userId)
  const existingNew = rows.filter((row) => row.state === 'new').length
  rows = await ensureNewWordRows(userId, rows, Math.max(limit, remainingNewWords + limit) - existingNew)

  const vocabulary = new Map(getVocabularyBank().map((word) => [word.id, word]))

  const allItems = rows
    .map((row) => {
      const word = vocabulary.get(row.word_id)
      if (!word) return null
      const base = toStudyCard(row)
      const reason = getQueueReason(row, now)
      return {
        ...base,
        word,
        mode: chooseStudyMode(row, reason),
        reason,
        retrievability: getRetrievability(row, now),
      } satisfies StudyQueueItem
    })
    .filter((item): item is StudyQueueItem => Boolean(item))

  const dueReviews = allItems.filter((item) => item.reason === 'due_review')
  const weak = allItems.filter((item) => item.reason === 'weak_word')
  const fresh = allItems.filter((item) => item.reason === 'new_word').slice(0, remainingNewWords)
  const reinforce = allItems.filter((item) => item.reason === 'long_term_reinforce')

  const sortQueue = (items: StudyQueueItem[]) =>
    [...items].sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority
      if (a.reason === 'weak_word' && b.reason === 'weak_word') {
        return b.lapses - a.lapses || b.difficulty - a.difficulty || a.retrievability - b.retrievability
      }
      return new Date(a.next_review).getTime() - new Date(b.next_review).getTime()
    })

  const queue = [...sortQueue(dueReviews), ...sortQueue(weak), ...sortQueue(fresh), ...sortQueue(reinforce)].slice(0, limit)
  const mastered = allItems.filter((item) => item.state === 'review' && item.stability >= 30 && item.lapses === 0).length

  return {
    queue,
    stats: {
      total: queue.length,
      review: queue.filter((card) => card.type === 'review').length,
      new: queue.filter((card) => card.type === 'new').length,
      due: dueReviews.length,
      weak: weak.length,
      mastered,
      bankTotal: getVocabularyBank().length,
      dailyNewLimit: settings.daily_new_limit,
      dailyReviewLimit: settings.daily_review_limit,
      newWordsStudiedToday: studiedNewToday,
      remainingNewWords,
    },
    recommendation: buildRecommendation(dueReviews.length, weak.length, remainingNewWords, queue.length),
    rows,
    now,
  }
}

function buildRecommendation(due: number, weak: number, remainingNew: number, queueLength: number) {
  if (weak >= 5) return '今天先稳住薄弱词，建议用拼写和例句填空强化。'
  if (due >= 10) return '复习债较多，先完成到期复习，再补少量新词。'
  if (remainingNew > 0 && queueLength > 0) return '复习压力可控，可以学习一组新词并穿插听音辨词。'
  return '今天主要做长期巩固，保持节奏就很好。'
}

export async function ensureStudyLog(userId: string, wordId: string): Promise<StudyLogRow | null> {
  if (!supabaseAdmin) return null

  const { data } = await supabaseAdmin
    .from('study_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('word_id', wordId)
    .maybeSingle()

  if (data) {
    return data as StudyLogRow
  }

  const row = createNewStudyRow(userId, wordId)

  await supabaseAdmin
    .from('study_logs')
    .upsert(row, { onConflict: 'user_id,word_id' })

  return row
}

export async function recordReview(
  userId: string,
  wordId: string,
  rating: Rating,
  reviewTime: Date = new Date()
) {
  if (!supabaseAdmin) {
    return null
  }

  const existing = await ensureStudyLog(userId, wordId)
  if (!existing) {
    return null
  }

  const previousCard = buildCard(existing)
  const scheduling = fsrs.repeat(previousCard, reviewTime)
  const nextCard =
    rating === Rating.Again
      ? scheduling.again.card
      : rating === Rating.Hard
        ? scheduling.hard.card
        : rating === Rating.Easy
          ? scheduling.easy.card
          : scheduling.good.card

  const updatedRow: StudyLogRow = {
    ...existing,
    last_review: reviewTime.toISOString(),
    next_review: nextCard.due.toISOString(),
    stability: nextCard.stability,
    difficulty: nextCard.difficulty,
    state: toStateName(nextCard.state),
    step: nextCard.state === State.Learning || nextCard.state === State.Relearning ? 1 : 0,
    reps: nextCard.reps,
    lapses: nextCard.lapses,
    elapsed_days: nextCard.elapsed_days,
    scheduled_days: nextCard.scheduled_days,
    updated_at: reviewTime.toISOString(),
  }

  await supabaseAdmin
    .from('study_logs')
    .upsert(updatedRow, { onConflict: 'user_id,word_id' })

  const selectedLog =
    rating === Rating.Again
      ? scheduling.again.review_log
      : rating === Rating.Hard
        ? scheduling.hard.review_log
        : rating === Rating.Easy
          ? scheduling.easy.review_log
          : scheduling.good.review_log

  const reviewLog: ReviewLogRow = {
    user_id: userId,
    word_id: wordId,
    study_log_id: existing.id,
    rating,
    elapsed_days: selectedLog.elapsed_days,
    scheduled_days: selectedLog.scheduled_days,
    review_time: reviewTime.toISOString(),
    previous_state: existing.state,
  }

  await supabaseAdmin.from('review_logs').insert(reviewLog)

  return {
    studyLog: updatedRow,
    memoryStrength: fsrs.getMemoryStrength(nextCard, reviewTime),
  }
}
