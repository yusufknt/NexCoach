// ============================================
// Cloudflare Worker Env Bindings
// ============================================

export type Env = {
  // D1 Database
  DB: D1Database

  // R2 Storage Buckets
  R2_PROGRAMS: R2Bucket
  R2_AVATARS: R2Bucket
  R2_PROGRESS_PHOTOS: R2Bucket
  R2_MONTHLY_REPORTS: R2Bucket

  // Edge abuse protection
  AUTH_RATE_LIMITER: RateLimit

  // Environment Variables
  ENVIRONMENT: string
  CORS_ORIGIN: string

  // Secrets (wrangler secret put ile eklenir)
  SUPABASE_URL?: string
  SUPABASE_SERVICE_KEY?: string
  API_SECRET: string
  URL_SIGNING_SECRET: string
  JWT_SECRET?: string
}

// ============================================
// R2 Bucket Mapping
// ============================================

export const R2_BUCKET_MAP = {
  programs: 'R2_PROGRAMS',
  avatars: 'R2_AVATARS',
  'progress-photos': 'R2_PROGRESS_PHOTOS',
  'monthly-reports': 'R2_MONTHLY_REPORTS',
} as const

export type BucketName = keyof typeof R2_BUCKET_MAP

// ============================================
// API Response Types
// ============================================

export type ApiResult<T> = {
  success: true
  data: T
} | {
  success: false
  error: string
}
