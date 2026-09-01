'use server'

import { headers } from 'next/headers'
import { d1 } from '@/lib/cloudflare/d1'
import { resolveUserRole } from '@/lib/auth'
import type { UserRole } from '@/types'

export async function getCurrentUserRole(): Promise<UserRole | null> {
  const rawWorkerUrl = process.env.CLOUDFLARE_WORKER_URL
    || process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL
    || 'https://nexcoach-api.yusufk6509.workers.dev'
  const workerUrl = rawWorkerUrl.replace(/\/+$/, '')
  const requestHeaders = await headers()
  const response = await fetch(`${workerUrl}/api/auth/get-session`, {
    headers: { cookie: requestHeaders.get('cookie') || '' },
    cache: 'no-store',
  })
  if (!response.ok) return null

  const session = await response.json() as { user?: { id?: string } }
  if (!session.user?.id) return null
  const role = await d1.first<{ role: string | null }>(
    `SELECT CASE
       WHEN EXISTS (SELECT 1 FROM admins WHERE user_id = ?) THEN 'admin'
       ELSE (SELECT role FROM profiles WHERE id = ? LIMIT 1)
     END AS role`,
    [session.user.id, session.user.id]
  )
  return resolveUserRole(role?.role, null)
}
