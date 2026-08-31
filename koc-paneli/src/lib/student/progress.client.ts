'use server'

import { d1 } from '@/lib/cloudflare/d1'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getAuthenticatedStudentId } from '@/lib/student/auth'

const progressEntrySchema = z.object({
  date: z.string().date(),
  weight: z.number().min(20).max(500).nullable(),
  note: z.string().trim().max(2000),
}).strict()

export async function addProgressEntry(studentId: string, coachId: string, data: { date: string; weight: number | null; note: string }) {
  try {
    const authenticatedStudentId = await getAuthenticatedStudentId()
    const parsed = progressEntrySchema.safeParse(data)
    if (authenticatedStudentId !== studentId || !parsed.success) return null
    const relation = await d1.first<{ id: string }>(
      'SELECT id FROM coach_students WHERE student_id = ? AND coach_id = ? AND status = ? LIMIT 1',
      [studentId, coachId, 'active']
    )
    if (!relation) return null
    const id = crypto.randomUUID()
    await d1.run(
      `INSERT INTO progress_entries (id, student_id, coach_id, date, weight, note, custom_metrics)
       VALUES (?, ?, ?, ?, ?, ?, '{}')`,
      [id, studentId, coachId, parsed.data.date, parsed.data.weight, parsed.data.note || null]
    )

    revalidatePath('/student/ilerleme')
    revalidatePath('/student/dashboard')

    const result = await d1.first<{
      id: string
      date: string
      weight: number | null
      note: string | null
      created_at: string
    }>(
      'SELECT * FROM progress_entries WHERE id = ?',
      [id]
    )
    return result
  } catch (error) {
    console.error('Error adding progress entry:', error)
    return null
  }
}

export async function deleteProgressEntry(entryId: string) {
  try {
    const studentId = await getAuthenticatedStudentId()
    if (!studentId || !z.string().uuid().safeParse(entryId).success) return false
    await d1.run('DELETE FROM progress_entries WHERE id = ? AND student_id = ?', [entryId, studentId])
    revalidatePath('/student/ilerleme')
    revalidatePath('/student/dashboard')
    return true
  } catch (error) {
    console.error('Error deleting progress entry:', error)
    return false
  }
}

export async function quickWeightEntry(studentId: string, coachId: string, weight: number) {
  const today = new Date().toISOString().slice(0, 10)
  return addProgressEntry(studentId, coachId, { date: today, weight, note: '' })
}
