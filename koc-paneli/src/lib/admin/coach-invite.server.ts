import { d1 } from '@/lib/cloudflare/d1'
import { hashInvitationToken } from '@/lib/admin/invitations'

export type ValidCoachInvitation = {
  id: string
  fullName: string
  email: string
  accessStartsAt: string
  accessEndsAt: string
}

export async function validateCoachInvitation(token: string): Promise<ValidCoachInvitation | null> {
  if (!token) return null
  const tokenHash = await hashInvitationToken(token)
  const invitation = await d1.first<{
    id: string
    full_name: string
    email: string
    access_starts_at: string
    access_ends_at: string
  }>(
    `SELECT id, full_name, email, access_starts_at, access_ends_at
     FROM coach_invitations
     WHERE token_hash = ?
       AND status = 'pending'
       AND datetime(expires_at) > datetime('now')
     LIMIT 1`,
    [tokenHash]
  )

  return invitation ? {
    id: invitation.id,
    fullName: invitation.full_name,
    email: invitation.email,
    accessStartsAt: invitation.access_starts_at,
    accessEndsAt: invitation.access_ends_at,
  } : null
}
