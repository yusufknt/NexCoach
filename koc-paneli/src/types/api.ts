// ============================================
// API TYPES - Request/Response tipleri
// ============================================

// --- Generic API Response ---
export type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
}

// --- Pagination ---
export type PaginationParams = {
  page?: number
  limit?: number
}

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// --- Coach API Types ---
export type DashboardStatsResponse = {
  activeStudentCount: number
  unreadMessageCount: number
}

export type StudentListResponse = {
  id: string
  studentId: string
  fullName: string
  avatarUrl: string | null
  packageName: string | null
  startDate: string
  endDate: string | null
  status: string
  lastActivityAt: string | null
}

// --- Student API Types ---
export type StudentDashboardResponse = {
  coachName: string
  coachAvatarUrl: string | null
  coachBio: string | null
  coachId: string
  packageName: string | null
  daysRemaining: number | null
  totalDays: number | null
  streak: number
  upcomingSession: {
    id: string
    title: string
    startTime: string
    endTime: string
    meetingUrl: string | null
  } | null
  latestProgram: {
    id: string
    title: string
    createdAt: string
    fileUrl: string
  } | null
  unreadMessageCount: number
}

// --- Auth Types ---
export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = {
  email: string
  password: string
  fullName: string
  role: 'coach' | 'student'
}

export type AuthResponse = {
  user: {
    id: string
    email: string
    fullName: string
    role: 'coach' | 'student'
  }
  token: string
}
