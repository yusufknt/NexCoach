// ============================================
// DATABASE TYPES - Veritabanı entity'leri
// ============================================

import type { UserRole, Gender, TrainingExperience, FitnessGoal, CoachStudentStatus, PaymentStatus } from './common'

// --- User Profile ---
export type Profile = {
  id: string
  full_name: string
  role: UserRole
  avatar_url: string | null
  bio: string | null
  created_at: string
}

export type CoachAccessStatus = 'pending' | 'active' | 'expired' | 'suspended'

export type CoachAccess = {
  coach_id: string
  status: CoachAccessStatus
  starts_at: string | null
  ends_at: string | null
  payment_note: string | null
  activated_by_admin_id: string | null
  created_at: string
  updated_at: string
}

export type CoachInvitationStatus = 'pending' | 'accepted' | 'expired' | 'cancelled'

export type CoachInvitation = {
  id: string
  email: string
  full_name: string
  token_hash: string
  status: CoachInvitationStatus
  access_starts_at: string
  access_ends_at: string
  payment_note: string | null
  invited_by_admin_id: string
  accepted_by_coach_id: string | null
  accepted_at: string | null
  expires_at: string
  created_at: string
}

// --- Packages ---
export type Package = {
  id: string
  coach_id: string
  name: string
  description: string | null
  price: number
  duration_days: number
  features: string[]
  is_active: boolean
  created_at: string
}

// --- Coach-Student Relationship ---
export type CoachStudent = {
  id: string
  coach_id: string
  student_id: string
  package_id: string | null
  start_date: string
  end_date: string | null
  status: CoachStudentStatus
  payment_status: PaymentStatus
  created_at: string
}

// --- Progress Entries ---
export type ProgressEntry = {
  id: string
  student_id: string
  coach_id: string
  date: string
  weight: number | null
  note: string | null
  custom_metrics: Record<string, unknown>
  before_photo_url?: string | null
  after_photo_url?: string | null
  created_at: string
}

// --- Programs (PDF) ---
export type Program = {
  id: string
  coach_id: string
  student_id: string
  title: string
  description: string | null
  file_url: string
  file_name: string
  created_at: string
}

// --- Messages ---
export type Message = {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  created_at: string
}

// --- Calendar Events ---
export type CalendarEvent = {
  id: string
  coach_id: string
  student_id: string | null
  title: string
  description: string | null
  start_time: string
  end_time: string
  event_type: 'available' | 'session' | 'blocked'
  meeting_url: string | null
  created_at: string
}

// --- Student Profile (Onboarding) ---
export type StudentProfile = {
  id: string
  student_id: string
  height_cm: number | null
  birth_date: string | null
  gender: Gender | null
  experience: TrainingExperience | null
  goal: FitnessGoal | null
  initial_weight: number | null
  chest_cm: number | null
  waist_cm: number | null
  hip_cm: number | null
  neck_cm: number | null
  right_upper_arm_cm: number | null
  left_upper_arm_cm: number | null
  right_thigh_cm: number | null
  left_thigh_cm: number | null
  right_calf_cm: number | null
  left_calf_cm: number | null
  body_fat_percentage: number | null
  photo_front_path: string | null
  photo_side_path: string | null
  photo_back_path: string | null
  injuries: string | null
  supplements: string | null
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}
