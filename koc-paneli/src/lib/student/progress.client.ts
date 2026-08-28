'use server'

import { d1 } from '@/lib/cloudflare/d1'
import { revalidatePath } from 'next/cache'

export async function addProgressEntry(studentId: string, coachId: string, data: { date: string; weight: number | null; note: string }) {
  try {
    const id = crypto.randomUUID()
    await d1.run(
      `INSERT INTO progress_entries (id, student_id, coach_id, date, weight, note, custom_metrics)
       VALUES (?, ?, ?, ?, ?, ?, '{}')`,
      [id, studentId, coachId, data.date, data.weight, data.note || null]
    )

    revalidatePath('/student/ilerleme')
    revalidatePath('/student/dashboard')

    const result = await d1.first(
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
    await d1.run('DELETE FROM progress_entries WHERE id = ?', [entryId])
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
