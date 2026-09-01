'use server'

import { revalidatePath } from 'next/cache'
import { d1 } from '@/lib/cloudflare/d1'
import { getAuthenticatedAdminId } from '@/lib/admin/auth'
import { createInvitationToken, getAppUrl, hashInvitationToken } from '@/lib/admin/invitations'
import { sendCoachInvitationEmail } from '@/lib/email/send'

export type AdminActionResult = {
  success: boolean
  message: string
  inviteUrl?: string
}

function parseDate(value: FormDataEntryValue | null): Date | null {
  if (typeof value !== 'string' || !value) return null
  const date = new Date(`${value}T12:00:00.000Z`)
  return Number.isNaN(date.getTime()) ? null : date
}

export async function createCoachInvitation(
  _previousState: AdminActionResult,
  formData: FormData
): Promise<AdminActionResult> {
  const adminId = await getAuthenticatedAdminId()
  if (!adminId) return { success: false, message: 'Bu işlem için admin yetkisi gerekli.' }

  const fullName = String(formData.get('fullName') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const startsAt = parseDate(formData.get('startsAt'))
  const endsAt = parseDate(formData.get('endsAt'))
  const paymentNote = String(formData.get('paymentNote') ?? '').trim()

  if (fullName.length < 2 || !/^\S+@\S+\.\S+$/.test(email)) {
    return { success: false, message: 'Geçerli bir ad soyad ve e-posta girin.' }
  }
  if (!startsAt || !endsAt || endsAt <= startsAt) {
    return { success: false, message: 'Erişim bitiş tarihi başlangıçtan sonra olmalı.' }
  }

  const existingUser = await d1.first<{ id: string }>(
    'SELECT id FROM "user" WHERE lower(email) = ? LIMIT 1',
    [email]
  )
  if (existingUser) return { success: false, message: 'Bu e-postayla kayıtlı bir hesap zaten var.' }

  const pendingInvitation = await d1.first<{ id: string }>(
    `SELECT id FROM coach_invitations
     WHERE lower(email) = ? AND status = 'pending' AND datetime(expires_at) > datetime('now')
     LIMIT 1`,
    [email]
  )
  if (pendingInvitation) {
    return { success: false, message: 'Bu e-posta için hâlâ geçerli bir davet bulunuyor.' }
  }

  const token = createInvitationToken()
  const tokenHash = await hashInvitationToken(token)
  const invitationId = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000)
  const now = new Date().toISOString()

  await d1.batch([
    {
      query: `INSERT INTO coach_invitations
        (id, email, full_name, token_hash, status, access_starts_at, access_ends_at, payment_note, invited_by_admin_id, expires_at, created_at)
        VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?)`,
      params: [
        invitationId,
        email,
        fullName,
        tokenHash,
        startsAt.toISOString(),
        endsAt.toISOString(),
        paymentNote || null,
        adminId,
        expiresAt.toISOString(),
        now,
      ],
    },
    {
      query: `INSERT INTO admin_audit_logs
        (id, admin_user_id, action, target_type, target_id, metadata, created_at)
        VALUES (?, ?, 'coach.invite.created', 'coach_invitation', ?, ?, ?)`,
      params: [crypto.randomUUID(), adminId, invitationId, JSON.stringify({ email, paymentNote }), now],
    },
  ])

  const inviteUrl = `${getAppUrl()}/koc-kayit?token=${encodeURIComponent(token)}`
  const sent = await sendCoachInvitationEmail({
    email,
    coachName: fullName,
    inviteUrl,
    accessEndsAt: new Intl.DateTimeFormat('tr-TR', { dateStyle: 'long' }).format(endsAt),
  })

  revalidatePath('/admin/dashboard')
  revalidatePath('/admin/koclar')

  return {
    success: true,
    message: sent
      ? 'Koç daveti e-postayla gönderildi.'
      : 'Davet oluşturuldu. E-posta servisi kapalı olduğu için bağlantıyı elle paylaşın.',
    inviteUrl,
  }
}

export async function cancelCoachInvitation(formData: FormData): Promise<void> {
  const adminId = await getAuthenticatedAdminId()
  if (!adminId) return

  const invitationId = String(formData.get('invitationId') ?? '')
  if (!invitationId) return
  const now = new Date().toISOString()

  await d1.batch([
    {
      query: "UPDATE coach_invitations SET status = 'cancelled' WHERE id = ? AND status = 'pending'",
      params: [invitationId],
    },
    {
      query: `INSERT INTO admin_audit_logs
        (id, admin_user_id, action, target_type, target_id, created_at)
        VALUES (?, ?, 'coach.invite.cancelled', 'coach_invitation', ?, ?)`,
      params: [crypto.randomUUID(), adminId, invitationId, now],
    },
  ])
  revalidatePath('/admin/dashboard')
  revalidatePath('/admin/koclar')
}

export async function updateCoachAccess(formData: FormData): Promise<void> {
  const adminId = await getAuthenticatedAdminId()
  if (!adminId) return

  const coachId = String(formData.get('coachId') ?? '')
  const status = String(formData.get('status') ?? '')
  const endsAt = parseDate(formData.get('endsAt'))
  const paymentNote = String(formData.get('paymentNote') ?? '').trim()
  const allowedStatuses = new Set(['active', 'expired', 'suspended'])
  if (!coachId || !allowedStatuses.has(status)) return

  const coach = await d1.first<{ id: string }>(
    "SELECT id FROM profiles WHERE id = ? AND role = 'coach' LIMIT 1",
    [coachId]
  )
  if (!coach) return

  const now = new Date().toISOString()
  const statements: Array<{ query: string; params: unknown[] }> = [
    {
      query: `INSERT INTO coach_access
        (coach_id, status, starts_at, ends_at, payment_note, activated_by_admin_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(coach_id) DO UPDATE SET
          status = excluded.status,
          ends_at = excluded.ends_at,
          payment_note = excluded.payment_note,
          activated_by_admin_id = excluded.activated_by_admin_id,
          updated_at = excluded.updated_at`,
      params: [coachId, status, now, endsAt?.toISOString() ?? null, paymentNote || null, adminId, now, now],
    },
    {
      query: `INSERT INTO admin_audit_logs
        (id, admin_user_id, action, target_type, target_id, metadata, created_at)
        VALUES (?, ?, 'coach.access.updated', 'coach', ?, ?, ?)`,
      params: [crypto.randomUUID(), adminId, coachId, JSON.stringify({ status, endsAt: endsAt?.toISOString() ?? null }), now],
    },
  ]

  if (status !== 'active') {
    statements.push({ query: 'DELETE FROM session WHERE userId = ?', params: [coachId] })
  }

  await d1.batch(statements)
  revalidatePath('/admin/dashboard')
  revalidatePath('/admin/koclar')
  revalidatePath(`/admin/koclar/${coachId}`)
}
