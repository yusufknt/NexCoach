import { d1 } from '@/lib/cloudflare/d1'
import { headers } from 'next/headers'

export async function getAuthenticatedCoachId(): Promise<string | null> {
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
    const profile = await d1.first<{ role: string; access_status: string | null; starts_at: string | null; ends_at: string | null }>(
      `SELECT p.role, ca.status AS access_status, ca.starts_at, ca.ends_at
       FROM profiles p
       LEFT JOIN coach_access ca ON ca.coach_id = p.id
       WHERE p.id = ?`,
      [user.id]
    )

    const accessIsActive = profile?.access_status === 'active'
      && (!profile.starts_at || new Date(profile.starts_at) <= new Date())
      && (!profile.ends_at || new Date(profile.ends_at) > new Date())

    if (profile?.role !== 'coach' || !accessIsActive) {
      return null
    }
    return user.id
  } catch {
    return null
  }
}
