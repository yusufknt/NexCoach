import { headers } from 'next/headers'
import { d1 } from '@/lib/cloudflare/d1'

export async function getAuthenticatedAdminId(): Promise<string | null> {
  try {
    const workerUrl = process.env.CLOUDFLARE_WORKER_URL
      || process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL
      || 'https://nexcoach-api.yusufk6509.workers.dev'
    const requestHeaders = await headers()
    let cookie = requestHeaders.get('cookie') || ''

    if (cookie && !cookie.includes('__Secure-better-auth.session_token=')) {
      const match = cookie.match(/(?:^|;\s*)better-auth\.session_token=([^;]+)/)
      if (match) cookie = `${cookie}; __Secure-better-auth.session_token=${match[1]}`
    }

    const response = await fetch(`${workerUrl}/api/auth/get-session`, {
      headers: { cookie },
      cache: 'no-store',
    })
    if (!response.ok) return null

    const session = await response.json() as { user?: { id?: string } }
    if (!session.user?.id) return null

    const admin = await d1.first<{ user_id: string }>(
      'SELECT user_id FROM admins WHERE user_id = ? LIMIT 1',
      [session.user.id]
    )
    return admin?.user_id ?? null
  } catch {
    return null
  }
}
