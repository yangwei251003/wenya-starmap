import { createClient } from '@supabase/supabase-js'
import { env } from './env'

const supabaseUrl = env.supabaseUrl || 'https://your-project.supabase.co'
const supabaseAnonKey = env.supabaseAnonKey || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const supabaseAdmin = env.supabaseServiceRoleKey
  ? createClient(supabaseUrl, env.supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

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

export interface UserProfile {
  id: string
  username: string
  email: string
  phone?: string | null
  level: 'beginner' | 'intermediate' | 'advanced'
  avatar_url?: string | null
  bio?: string | null
  star_coins: number
  learning_progress: number
  language_star_map: Record<string, any>
  created_at: string
  updated_at: string
}
