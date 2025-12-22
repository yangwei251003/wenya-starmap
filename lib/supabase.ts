import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 数据库类型定义
export interface StudyLog {
  id: string
  user_id: string
  word_id: string
  last_review?: string
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

export interface ReviewLog {
  id: string
  user_id: string
  word_id: string
  study_log_id: string
  rating: number
  elapsed_days: number
  scheduled_days: number
  review_time: string
  previous_state: 'new' | 'learning' | 'review' | 'relearning'
  created_at: string
}

export interface UserStudySettings {
  id: string
  user_id: string
  daily_new_limit: number
  daily_review_limit: number
  request_retention: number
  maximum_interval: number
  learning_steps: number[]
  relearning_steps: number[]
  created_at: string
  updated_at: string
}