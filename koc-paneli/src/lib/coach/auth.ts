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
    const profile = await d1.first<{ role: string }>(
      'SELECT role FROM profiles WHERE id = ?',
      [user.id]
    )

    if (profile?.role !== 'coach') {
      return null
    }
    return user.id
  } catch (e) {
    return null
  }
}
