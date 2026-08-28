import { d1 } from '@/lib/cloudflare/d1'
import { getAuthenticatedCoachId } from '@/lib/coach/auth'
import { unstable_cache } from 'next/cache'

export type InvitationWithPackage = {
  id: string
  token: string
  email: string | null
  status: 'pending' | 'accepted' | 'expired'
  expiresAt: string
  createdAt: string
  packageName: string | null
  packagePrice: number | null
}

export async function getCoachInvitations(): Promise<InvitationWithPackage[] | null> {
  const coachId = await getAuthenticatedCoachId()
  if (!coachId) return null

  const getCachedCoachInvitations = unstable_cache(
    async (coachId: string) => {
      const data = await d1.query<{
        id: string
        token: string
        email: string | null
        status: 'pending' | 'accepted' | 'expired'
        expires_at: string
        created_at: string
        package_name: string | null
        package_price: number | null
      }>(
        `SELECT 
          i.id, i.token, i.email, i.status, i.expires_at, i.created_at,
          p.name AS package_name, p.price AS package_price
         FROM invitations i
         LEFT JOIN packages p ON p.id = i.package_id
         WHERE i.coach_id = ?
         ORDER BY i.created_at DESC`,
        [coachId]
      )

      return (data ?? []).map((inv) => ({
        id: inv.id,
        token: inv.token,
        email: inv.email,
        status: inv.status,
        expiresAt: inv.expires_at,
        createdAt: inv.created_at,
        packageName: inv.package_name ?? null,
        packagePrice: inv.package_price != null ? Number(inv.package_price) : null,
      }))
    },
    ['invitations'],
    { revalidate: 60, tags: ['invitations'] }
  )

  return getCachedCoachInvitations(coachId)
}

export async function getCoachPackages(): Promise<{ id: string; name: string; price: number }[]> {
  const coachId = await getAuthenticatedCoachId()
  if (!coachId) return []

  const getCachedCoachPackages = unstable_cache(
    async (coachId: string) => {
      const data = await d1.query<{ id: string; name: string; price: number }>(
        `SELECT id, name, price 
         FROM packages 
         WHERE coach_id = ? AND is_active = 1 
         ORDER BY price ASC`,
        [coachId]
      )

      return (data ?? []).map((pkg) => ({
        ...pkg,
        price: Number(pkg.price),
      }))
    },
    ['packages'],
    { revalidate: 3600, tags: ['packages'] }
  )

  return getCachedCoachPackages(coachId)
}

export async function validateInvitation(token: string): Promise<{
  valid: boolean
  invitation?: {
    id: string
    coachId: string
    coachName: string
    packageName: string | null
    packagePrice: number | null
    packageDuration: number | null
  }
}> {
  const invitation = await d1.first<{
    id: string
    coach_id: string
    expires_at: string
    status: string
    package_name: string | null
    package_price: number | null
    package_duration: number | null
    coach_name: string | null
  }>(
    `SELECT 
      i.id, i.coach_id, i.expires_at, i.status,
      p.name AS package_name, p.price AS package_price, p.duration_days AS package_duration,
      pr.full_name AS coach_name
     FROM invitations i
     LEFT JOIN packages p ON p.id = i.package_id
     LEFT JOIN profiles pr ON pr.id = i.coach_id
     WHERE i.token = ? AND i.status = 'pending'
     LIMIT 1`,
    [token]
  )

  if (!invitation) {
    return { valid: false }
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return { valid: false }
  }

  return {
    valid: true,
    invitation: {
      id: invitation.id,
      coachId: invitation.coach_id,
      coachName: invitation.coach_name ?? 'Koç',
      packageName: invitation.package_name ?? null,
      packagePrice: invitation.package_price != null ? Number(invitation.package_price) : null,
      packageDuration: invitation.package_duration ?? null,
    },
  }
}
