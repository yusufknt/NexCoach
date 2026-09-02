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

  const email = String(formData.get('email') ?? '').trim() || null

  const token = crypto.randomUUID()
  const id = crypto.randomUUID()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  try {
    await d1.run(
      `INSERT INTO invitations (id, coach_id, package_id, token, email, status, expires_at)
       VALUES (?, ?, NULL, ?, ?, 'pending', ?)`,
      [id, coachId, token, email, expiresAt.toISOString()]
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
