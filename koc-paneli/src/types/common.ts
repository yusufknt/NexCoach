// ============================================
// COMMON TYPES - Ortak kullanılan tipler
// ============================================

// --- User Roles ---
export type UserRole = 'admin' | 'coach' | 'student'

// --- Gender ---
export type Gender = 'male' | 'female'

// --- Training Experience ---
export type TrainingExperience = 'beginner' | '1-3years' | '3plus'

// --- Fitness Goals ---
export type FitnessGoal = 'muscle_gain' | 'fat_loss' | 'recomposition' | 'strength'

// --- Status Types ---
export type CoachStudentStatus = 'active' | 'paused' | 'completed'
export type PaymentStatus = 'paid' | 'pending' | 'failed'
export type CalendarEventType = 'available' | 'session' | 'blocked'
export type InvitationStatus = 'pending' | 'accepted' | 'expired'

// --- Invitation ---
export type Invitation = {
  id: string
  coach_id: string
  package_id: string | null
  token: string
  email: string | null
  status: InvitationStatus
  expires_at: string
  created_at: string
}

// --- Payment ---
export type Payment = {
  id: string
  student_id: string
  coach_id: string
  package_id: string | null
  amount: number | null
  currency: string | null
  payment_provider: string | null
  provider_payment_id: string | null
  status: 'success' | 'failed' | 'pending' | 'refunded'
  created_at: string
}
