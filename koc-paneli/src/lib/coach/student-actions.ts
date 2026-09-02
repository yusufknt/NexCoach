'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { d1 } from '@/lib/cloudflare/d1'
import { getAuthenticatedCoachId } from '@/lib/coach/auth'

type ActionResult = { success: true } | { success: false; error: string }

export async function extendMembershipAction(
  coachStudentId: string,
  additionalMonths?: number,
  explicitDate?: string
): Promise<ActionResult> {
  const coachId = await getAuthenticatedCoachId()
  if (!coachId) {
    return { success: false, error: 'Oturum bulunamadı.' }
  }

  try {
    const student = await d1.first<{ end_date: string | null }>(
      'SELECT end_date FROM coach_students WHERE id = ? AND coach_id = ?',
      [coachStudentId, coachId]
    )

    if (!student) {
      return { success: false, error: 'Öğrenci bulunamadı.' }
    }

    let newEndDate: Date
    
    if (explicitDate) {
      newEndDate = new Date(explicitDate)
    } else if (additionalMonths) {
      const currentEndDate = student.end_date ? new Date(student.end_date) : null
      const now = new Date()
      
      const baseDate = currentEndDate && currentEndDate > now ? currentEndDate : now
      newEndDate = new Date(baseDate)
      newEndDate.setMonth(newEndDate.getMonth() + additionalMonths)
    } else {
      return { success: false, error: 'Tarih veya süre belirtmelisiniz.' }
    }

    await d1.run(
      'UPDATE coach_students SET end_date = ? WHERE id = ? AND coach_id = ?',
      [newEndDate.toISOString(), coachStudentId, coachId]
    )

    revalidateTag('students', 'max')
    revalidatePath(`/coach/ogrenciler/[id]`)
    
    return { success: true }
  } catch (error) {
    console.error('Error extending membership:', error)
    return { success: false, error: 'Üyelik güncellenirken bir hata oluştu.' }
  }
}
