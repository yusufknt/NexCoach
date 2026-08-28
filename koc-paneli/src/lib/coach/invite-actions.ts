'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { d1 } from '@/lib/cloudflare/d1'
import { getAuthenticatedCoachId } from '@/lib/coach/auth'

type ActionResult = { success: true; token?: string } | { success: false; error: string }

export async function createInvitation(formData: FormData): Promise<ActionResult> {
  const coachId = await getAuthenticatedCoachId()
  if (!coachId) {
    return { success: false, error: 'Oturum bulunamadı.' }
  }

  const packageId = String(formData.get('packageId') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim() || null

  if (!packageId) {
    return { success: false, error: 'Paket seçimi gerekli.' }
  }

  const pkg = await d1.first<{ id: string }>(
    'SELECT id FROM packages WHERE id = ? AND coach_id = ?',
    [packageId, coachId]
  )

  if (!pkg) {
    return { success: false, error: 'Paket bulunamadı.' }
  }

  const token = crypto.randomUUID()
  const id = crypto.randomUUID()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  try {
    await d1.run(
      `INSERT INTO invitations (id, coach_id, package_id, token, email, status, expires_at)
       VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
      [id, coachId, packageId, token, email, expiresAt.toISOString()]
    )

    revalidateTag('invitations', 'max')
    revalidatePath('/coach/ogrenciler')
    return { success: true, token }
  } catch (error) {
    console.error('Error creating invitation:', error)
    return { success: false, error: 'Davet oluşturulurken bir hata oluştu.' }
  }
}

export async function deleteInvitation(invitationId: string): Promise<ActionResult> {
  const coachId = await getAuthenticatedCoachId()
  if (!coachId) {
    return { success: false, error: 'Oturum bulunamadı.' }
  }

  try {
    await d1.run(
      'DELETE FROM invitations WHERE id = ? AND coach_id = ?',
      [invitationId, coachId]
    )

    revalidateTag('invitations', 'max')
    revalidatePath('/coach/ogrenciler')
    return { success: true }
  } catch (error) {
    console.error('Error deleting invitation:', error)
    return { success: false, error: 'Davet silinirken bir hata oluştu.' }
  }
}
