import { Rating, State, type Card } from '@/utils/fsrs'
import { getAllWords } from './words-data'
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

const QUEUE_SEED_COUNT = 30

export function toStudyCard(row: StudyLogRow) {
  return {
    id: `card_${row.word_id}`,
    user_id: row.user_id,
    word_id: row.word_id,
    next_review: row.next_review,
    stability: row.stability,
    difficulty: row.difficulty,
    state: row.state,
    priority: row.state === 'new' ? 2 : 1,
    type: row.state === 'new' ? 'new' : 'review',
    reps: row.reps,
    lapses: row.lapses,
    elapsed_days: row.elapsed_days,
    scheduled_days: row.scheduled_days,
    step: row.step,
  }
}

export async function ensureStudySeeds(userId: string): Promise<StudyLogRow[]> {
  if (!supabaseAdmin) return []

  const { data: existing } = await supabaseAdmin
    .from('study_logs')
    .select('*')
    .eq('user_id', userId)
    .limit(1)

  if (existing && existing.length > 0) {
    const { data } = await supabaseAdmin
      .from('study_logs')
      .select('*')
      .eq('user_id', userId)
      .order('next_review', { ascending: true })
      .order('updated_at', { ascending: false })

    return (data || []) as StudyLogRow[]
  }

  const words = getAllWords().slice(0, QUEUE_SEED_COUNT)
  const now = new Date()

  const seedRows = words.map((word, index) => {
    const isReview = index >= 10
    const nextReview = new Date(now)
    if (isReview) {
      nextReview.setDate(nextReview.getDate() - (index - 9))
    }

    return {
      user_id: userId,
      word_id: word.id,
      last_review: isReview ? new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString() : null,
      next_review: nextReview.toISOString(),
      stability: isReview ? 3 + Math.random() * 5 : 1,
      difficulty: isReview ? 3 + Math.random() * 2 : 4,
      state: (isReview ? 'review' : 'new') as StudyLogRow['state'],
      step: 0,
      reps: isReview ? 1 + Math.floor(Math.random() * 3) : 0,
      lapses: 0,
      elapsed_days: isReview ? 1 : 0,
      scheduled_days: isReview ? 2 + Math.floor(Math.random() * 5) : 0,
    }
  })

  await supabaseAdmin
    .from('study_logs')
    .upsert(seedRows, { onConflict: 'user_id,word_id' })

  const { data } = await supabaseAdmin
    .from('study_logs')
    .select('*')
    .eq('user_id', userId)
    .order('next_review', { ascending: true })
    .order('updated_at', { ascending: false })

  return (data || []) as StudyLogRow[]
}

export async function getStudyLogs(userId: string): Promise<StudyLogRow[]> {
  if (!supabaseAdmin) return []
  return ensureStudySeeds(userId)
}

export async function getStudyQueue(userId: string) {
  const rows = await getStudyLogs(userId)
  const now = new Date()

  const queue = rows
    .map(toStudyCard)
    .sort((a, b) => {
      const aDue = new Date(a.next_review).getTime()
      const bDue = new Date(b.next_review).getTime()
      if (a.priority !== b.priority) return a.priority - b.priority
      return aDue - bDue
    })

  const review = queue.filter(card => card.type === 'review')
  const newCards = queue.filter(card => card.type === 'new')

  return {
    queue,
    stats: {
      total: queue.length,
      review: review.length,
      new: newCards.length,
      dailyNewLimit: 20,
      dailyReviewLimit: 50,
      newWordsStudiedToday: 0,
      remainingNewWords: Math.max(0, 20 - newCards.length),
    },
    rows,
    now,
  }
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

  const now = new Date()
  const card = fsrs.createEmptyCard(now)
  card.id = wordId
  const scheduling = fsrs.repeat(card, now)
  const newCard = scheduling.good.card

  const row: StudyLogRow = {
    id: crypto.randomUUID(),
    user_id: userId,
    word_id: wordId,
    last_review: null,
    next_review: newCard.due.toISOString(),
    stability: newCard.stability,
    difficulty: newCard.difficulty,
    state: 'new',
    step: 0,
    reps: 0,
    lapses: 0,
    elapsed_days: 0,
    scheduled_days: newCard.scheduled_days,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  }

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

  const previousCard: Card = {
    id: wordId,
    due: new Date(existing.next_review),
    stability: existing.stability,
    difficulty: existing.difficulty,
    elapsed_days: existing.elapsed_days,
    scheduled_days: existing.scheduled_days,
    reps: existing.reps,
    lapses: existing.lapses,
    state:
      existing.state === 'new'
        ? State.New
        : existing.state === 'learning'
          ? State.Learning
          : existing.state === 'review'
            ? State.Review
            : State.Relearning,
    last_review: existing.last_review ? new Date(existing.last_review) : undefined,
  }

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
    state:
      nextCard.state === State.New
        ? 'new'
        : nextCard.state === State.Learning
          ? 'learning'
          : nextCard.state === State.Review
            ? 'review'
            : 'relearning',
    step: nextCard.state === State.Learning ? 1 : 0,
    reps: nextCard.reps,
    lapses: nextCard.lapses,
    elapsed_days: nextCard.elapsed_days,
    scheduled_days: nextCard.scheduled_days,
    updated_at: reviewTime.toISOString(),
  }

  await supabaseAdmin
    .from('study_logs')
    .upsert(updatedRow, { onConflict: 'user_id,word_id' })

  const reviewLog: ReviewLogRow = {
    user_id: userId,
    word_id: wordId,
    study_log_id: existing.id,
    rating,
    elapsed_days:
      rating === Rating.Again
        ? scheduling.again.review_log.elapsed_days
        : rating === Rating.Hard
          ? scheduling.hard.review_log.elapsed_days
          : rating === Rating.Easy
            ? scheduling.easy.review_log.elapsed_days
            : scheduling.good.review_log.elapsed_days,
    scheduled_days:
      rating === Rating.Again
        ? scheduling.again.review_log.scheduled_days
        : rating === Rating.Hard
          ? scheduling.hard.review_log.scheduled_days
          : rating === Rating.Easy
            ? scheduling.easy.review_log.scheduled_days
            : scheduling.good.review_log.scheduled_days,
    review_time: reviewTime.toISOString(),
    previous_state: existing.state,
  }

  await supabaseAdmin.from('review_logs').insert(reviewLog)

  return {
    studyLog: updatedRow,
    memoryStrength: fsrs.getMemoryStrength(nextCard, reviewTime),
  }
}
