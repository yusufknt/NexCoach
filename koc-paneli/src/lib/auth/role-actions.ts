'use server'

import { headers } from 'next/headers'
import { d1 } from '@/lib/cloudflare/d1'
import { resolveUserRole } from '@/lib/auth'
import type { UserRole } from '@/types'

export async function getCurrentUserRole(): Promise<UserRole | null> {
  const workerUrl = process.env.CLOUDFLARE_WORKER_URL
    || process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL
    || 'https://nexcoach-api.yusufk6509.workers.dev'
  const requestHeaders = await headers()
  const response = await fetch(`${workerUrl}/api/auth/get-session`, {
    headers: { cookie: requestHeaders.get('cookie') || '' },
    cache: 'no-store',
  })
  if (!response.ok) return null

  const session = await response.json() as { user?: { id?: string } }
  if (!session.user?.id) return null
  const profile = await d1.first<{ role: string }>(
    'SELECT role FROM profiles WHERE id = ? LIMIT 1',
    [session.user.id]
  )
  return resolveUserRole(profile?.role, null)
}
