// ============================================
// COACH TYPES - Koç paneline özel UI tipleri
// ============================================

import type { CoachStudentStatus, PaymentStatus } from '@/types'

// --- Dashboard Types ---
export type DashboardStats = {
  activeStudentCount: number
  unreadMessageCount: number
}

export type UpcomingAppointment = {
  id: string
  title: string
  studentName: string | null
  startTime: string
  endTime: string
  eventType: 'available' | 'session' | 'blocked'
}

export type ActivityType = 'new_student' | 'message' | 'progress'

export type ActivityItem = {
  id: string
  type: ActivityType
  title: string
  description: string
  createdAt: string
}

// --- Student List Types ---
export type CoachStudentListItem = {
  id: string
  studentId: string
  fullName: string
  avatarUrl: string | null
  packageName: string | null
  startDate: string
  endDate: string | null
  status: CoachStudentStatus
  lastActivityAt: string | null
}

export type CoachStudentDetail = {
  coachStudentId: string
  studentId: string
  fullName: string
  email: string | null
  avatarUrl: string | null
  packageName: string | null
  startDate: string
  endDate: string | null
  status: CoachStudentStatus
  paymentStatus: PaymentStatus
}

// --- Message Types ---
export type Message = {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  created_at: string
}

export type ChatSummary = {
  studentId: string
  fullName: string
  avatarUrl: string | null
  lastMessage: {
    content: string
    createdAt: string
    isRead: boolean
    senderId: string
  } | null
  unreadCount: number
}

// --- Calendar Types ---
export type CalendarEventFormData = {
  title: string
  event_type: 'available' | 'session' | 'blocked'
  start_time: string
  end_time: string
  student_id?: string | null
  student_ids?: string[]
  description: string
  meeting_url: string
}

export type CalendarSummary = {
  todayEvents: {
    id: string
    title: string
    startTime: string
    endTime: string
    eventType: 'available' | 'session' | 'blocked'
    studentName: string | null
  }[]
  weekSessionCount: number
}

// --- Settings Types ---
export type CoachProfile = {
  id: string
  fullName: string
  bio: string | null
  avatarUrl: string | null
  email: string | null
}

export type NotificationPreferences = {
  emailOnMessage: boolean
  emailOnNewStudent: boolean
  emailReminderBefore24h: boolean
}

export type StudentOption = {
  id: string
  fullName: string
}

// --- Dashboard Extended Types ---
export type MonthlyRevenue = {
  period: string
  month: string
  revenue: number
}

export type MonthlyStudentGrowth = {
  period: string
  month: string
  count: number
}

export type TopActiveStudent = {
  studentId: string
  fullName: string
  avatarUrl: string | null
  progressCount: number
}
