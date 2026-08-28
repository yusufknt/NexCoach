'use server'

import { d1 } from '@/lib/cloudflare/d1'
import { revalidatePath } from 'next/cache'
import type { CalendarEventFormData } from './types'

export async function createCalendarEvent(coachId: string, data: CalendarEventFormData) {
  try {
    const id = crypto.randomUUID()
    await d1.run(
      `INSERT INTO calendar_events (id, coach_id, title, event_type, start_time, end_time, student_id, description, meeting_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        coachId,
        data.title,
        data.event_type,
        data.start_time,
        data.end_time,
        data.student_id || null,
        data.description || null,
        data.meeting_url || null,
      ]
    )

    revalidatePath('/coach/takvim')
    revalidatePath('/coach/dashboard')

    const created = await d1.first(
      'SELECT * FROM calendar_events WHERE id = ?',
      [id]
    )
    return created
  } catch (error) {
    console.error('Error creating event:', error)
    return null
  }
}

export async function updateCalendarEvent(eventId: string, data: Partial<CalendarEventFormData>) {
  try {
    const updates: string[] = []
    const params: any[] = []

    if (data.title !== undefined) {
      updates.push('title = ?')
      params.push(data.title)
    }
    if (data.event_type !== undefined) {
      updates.push('event_type = ?')
      params.push(data.event_type)
    }
    if (data.start_time !== undefined) {
      updates.push('start_time = ?')
      params.push(data.start_time)
    }
    if (data.end_time !== undefined) {
      updates.push('end_time = ?')
      params.push(data.end_time)
    }
    if (data.student_id !== undefined) {
      updates.push('student_id = ?')
      params.push(data.student_id || null)
    }
    if (data.description !== undefined) {
      updates.push('description = ?')
      params.push(data.description || null)
    }
    if (data.meeting_url !== undefined) {
      updates.push('meeting_url = ?')
      params.push(data.meeting_url || null)
    }

    if (updates.length === 0) return true

    params.push(eventId)
    await d1.run(
      `UPDATE calendar_events SET ${updates.join(', ')} WHERE id = ?`,
      params
    )

    revalidatePath('/coach/takvim')
    revalidatePath('/coach/dashboard')
    return true
  } catch (error) {
    console.error('Error updating event:', error)
    return false
  }
}

export async function deleteCalendarEvent(eventId: string) {
  try {
    await d1.run('DELETE FROM calendar_events WHERE id = ?', [eventId])
    revalidatePath('/coach/takvim')
    revalidatePath('/coach/dashboard')
    return true
  } catch (error) {
    console.error('Error deleting event:', error)
    return false
  }
}

export async function moveCalendarEvent(eventId: string, newStart: string, newEnd: string) {
  try {
    await d1.run(
      'UPDATE calendar_events SET start_time = ?, end_time = ? WHERE id = ?',
      [newStart, newEnd, eventId]
    )
    revalidatePath('/coach/takvim')
    revalidatePath('/coach/dashboard')
    return true
  } catch (error) {
    console.error('Error moving event:', error)
    return false
  }
}
