'use server'

import { d1 } from '@/lib/cloudflare/d1'
import { hashInvitationToken } from '@/lib/admin/invitations'

export type CoachRegisterState = {
  success: boolean
  message: string
}

export async function registerCoachWithInvitation(
  _previousState: CoachRegisterState,
  formData: FormData
): Promise<CoachRegisterState> {
  const token = String(formData.get('token') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const passwordConfirm = String(formData.get('passwordConfirm') ?? '')
  const acceptedTerms = formData.get('acceptTerms') === 'on'

  if (!token) return { success: false, message: 'Davet bağlantısı geçersiz.' }
  if (password.length < 8) return { success: false, message: 'Şifre en az 8 karakter olmalı.' }
  if (password !== passwordConfirm) return { success: false, message: 'Şifreler eşleşmiyor.' }
  if (!acceptedTerms) return { success: false, message: 'Kullanıcı sözleşmesini kabul etmelisiniz.' }

  const tokenHash = await hashInvitationToken(token)
  const invitation = await d1.first<{
    id: string
    email: string
    full_name: string
    access_starts_at: string
    access_ends_at: string
    payment_note: string | null
  }>(
    `SELECT id, email, full_name, access_starts_at, access_ends_at, payment_note
     FROM coach_invitations
     WHERE token_hash = ? AND status = 'pending' AND datetime(expires_at) > datetime('now')
     LIMIT 1`,
    [tokenHash]
  )
  if (!invitation) {
    return { success: false, message: 'Davet bağlantısı geçersiz, kullanılmış veya süresi dolmuş.' }
  }

  const workerUrl = process.env.CLOUDFLARE_WORKER_URL
    || process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL
    || 'https://nexcoach-api.yusufk6509.workers.dev'
  const authResponse = await fetch(`${workerUrl}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: invitation.email,
      password,
      name: invitation.full_name,
    }),
  })

  if (!authResponse.ok) {
    const error = await authResponse.json().catch(() => ({})) as { message?: string }
    return { success: false, message: error.message || 'Koç hesabı oluşturulamadı.' }
  }

  const authData = await authResponse.json() as { user?: { id?: string }; id?: string }
  const coachId = authData.user?.id || authData.id
  if (!coachId) return { success: false, message: 'Hesap kimliği alınamadı.' }

  const now = new Date().toISOString()
  try {
    await d1.batch([
      {
        query: "INSERT INTO profiles (id, full_name, role, created_at) VALUES (?, ?, 'coach', ?)",
        params: [coachId, invitation.full_name, now],
      },
      {
        query: `INSERT INTO coach_access
          (coach_id, status, starts_at, ends_at, payment_note, activated_by_admin_id, created_at, updated_at)
          SELECT ?, 'active', ?, ?, ?, invited_by_admin_id, ?, ?
          FROM coach_invitations WHERE id = ? AND status = 'pending'`,
        params: [
          coachId,
          invitation.access_starts_at,
          invitation.access_ends_at,
          invitation.payment_note,
          now,
          now,
          invitation.id,
        ],
      },
      {
        query: `UPDATE coach_invitations
          SET status = 'accepted', accepted_by_coach_id = ?, accepted_at = ?
          WHERE id = ? AND status = 'pending'`,
        params: [coachId, now, invitation.id],
      },
    ])
  } catch (error) {
    console.error('Failed to finish coach invitation registration:', error)
    return {
      success: false,
      message: 'Hesap açıldı ancak panel bağlantısı tamamlanamadı. Yöneticiyle iletişime geçin.',
    }
  }

  return { success: true, message: 'Koç hesabınız oluşturuldu. Giriş yapabilirsiniz.' }
}
