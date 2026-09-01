import { d1 } from '@/lib/cloudflare/d1'
import { headers } from 'next/headers'

export async function getAuthenticatedStudentId(): Promise<string | null> {
  try {
    const WORKER_URL = process.env.CLOUDFLARE_WORKER_URL || process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL || 'https://nexcoach-api.yusufk6509.workers.dev'
    const headersList = await headers()
    let cookie = headersList.get('cookie') || ''
    if (cookie && !cookie.includes('__Secure-better-auth.session_token=')) {
      const match = cookie.match(/(?:^|;\s*)better-auth\.session_token=([^;]+)/)
      if (match) {
        cookie = `${cookie}; __Secure-better-auth.session_token=${match[1]}`
      }
    }
    
    const res = await fetch(`${WORKER_URL}/api/auth/get-session`, {
      headers: { cookie },
      cache: 'no-store'
    })
    
    if (!res.ok) return null
    const data = await res.json()
    if (!data?.user) return null
    
    const user = data.user
    const profile = await d1.first<{ role: string; has_access: number }>(
      `SELECT p.role,
        EXISTS (
          SELECT 1 FROM coach_students cs
          JOIN coach_access ca ON ca.coach_id = cs.coach_id
          WHERE cs.student_id = p.id
            AND cs.status = 'active'
            AND (cs.end_date IS NULL OR date(cs.end_date) >= date('now'))
            AND ca.status = 'active'
            AND (ca.starts_at IS NULL OR datetime(ca.starts_at) <= datetime('now'))
            AND (ca.ends_at IS NULL OR datetime(ca.ends_at) > datetime('now'))
        ) AS has_access
       FROM profiles p WHERE p.id = ?`,
      [user.id]
    )

    if (profile?.role !== 'student' || !profile.has_access) {
      return null
    }
    return user.id
  } catch {
    return null
  }
}
