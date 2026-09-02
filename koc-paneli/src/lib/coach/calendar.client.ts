'use server'

import { d1 } from '@/lib/cloudflare/d1'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getAuthenticatedCoachId } from '@/lib/coach/auth'
import type { CalendarEventFormData } from './types'

const eventFieldsSchema = z.object({
  title: z.string().trim().min(1).max(160),
  event_type: z.enum(['available', 'session', 'blocked']),
  start_time: z.string().min(1).max(50),
  end_time: z.string().min(1).max(50),
  student_id: z.string().nullable().optional(),
  student_ids: z.array(z.string()).optional(),
  description: z.string().trim().max(2000),
  meeting_url: z.string().max(2000).optional(),
}).strict()

const eventSchema = eventFieldsSchema.refine(
  (data) => !Number.isNaN(Date.parse(data.start_time))
    && !Number.isNaN(Date.parse(data.end_time))
    && Date.parse(data.end_time) > Date.parse(data.start_time),
  { message: 'Invalid event time range' }
)

async function ownsStudent(coachId: string, studentId: string | null): Promise<boolean> {
  if (!studentId) return true
  const relation = await d1.first<{ id: string }>(
    'SELECT id FROM coach_students WHERE coach_id = ? AND student_id = ? LIMIT 1',
    [coachId, studentId]
  )
  return Boolean(relation)
}

export async function createCalendarEvent(coachId: string, data: CalendarEventFormData) {
  try {
    const authenticatedCoachId = await getAuthenticatedCoachId()
    const parsed = eventSchema.safeParse(data)
    
    if (authenticatedCoachId !== coachId || !parsed.success) return null
    
    const parsedData = parsed.data
    const studentIdsToProcess = (parsedData.student_ids && parsedData.student_ids.length > 0) 
      ? parsedData.student_ids 
      : [parsedData.student_id || null]

    for (const sId of studentIdsToProcess) {
      if (!await ownsStudent(coachId, sId)) return null
    }

    const createdEvents = []

    for (const sId of studentIdsToProcess) {
      const id = crypto.randomUUID()
      await d1.run(
        `INSERT INTO calendar_events (id, coach_id, title, event_type, start_time, end_time, student_id, description, meeting_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          coachId,
          parsedData.title,
          parsedData.event_type,
          parsedData.start_time,
          parsedData.end_time,
          sId,
          parsedData.description || null,
          parsedData.meeting_url || null,
        ]
      )

      const created = await d1.first<{ id: string; start_time: string; end_time: string; student_id: string | null }>(
        'SELECT * FROM calendar_events WHERE id = ?',
        [id]
      )
      if (created) createdEvents.push(created)
    }

    revalidatePath('/coach/takvim')
    revalidatePath('/coach/dashboard')

    return createdEvents
  } catch (error) {
    console.error('Error creating event:', error)
    return null
  }
}

export async function updateCalendarEvent(eventId: string, data: Partial<CalendarEventFormData>) {
  try {
    const coachId = await getAuthenticatedCoachId()
    const parsed = eventFieldsSchema.partial().refine(
      (value) => (value.start_time === undefined || !Number.isNaN(Date.parse(value.start_time)))
        && (value.end_time === undefined || !Number.isNaN(Date.parse(value.end_time)))
        && (value.start_time === undefined || value.end_time === undefined
          || Date.parse(value.end_time) > Date.parse(value.start_time)),
      { message: 'Invalid event time range' }
    ).safeParse(data)
    if (!coachId || !z.string().uuid().safeParse(eventId).success || !parsed.success) return false
    if (parsed.data.student_id !== undefined && !await ownsStudent(coachId, parsed.data.student_id)) return false
    data = parsed.data
    const updates: string[] = []
    const params: unknown[] = []

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

    params.push(eventId, coachId)
    await d1.run(
      `UPDATE calendar_events SET ${updates.join(', ')} WHERE id = ? AND coach_id = ?`,
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
    const coachId = await getAuthenticatedCoachId()
    if (!coachId || !z.string().uuid().safeParse(eventId).success) return false
    await d1.run('DELETE FROM calendar_events WHERE id = ? AND coach_id = ?', [eventId, coachId])
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
    const coachId = await getAuthenticatedCoachId()
    const parsed = z.object({
      eventId: z.string().uuid(),
      newStart: z.string().min(1).max(50),
      newEnd: z.string().min(1).max(50),
    }).safeParse({ eventId, newStart, newEnd })
    if (!coachId || !parsed.success) return false
    if (Number.isNaN(Date.parse(newStart)) || Date.parse(newEnd) <= Date.parse(newStart)) return false
    await d1.run(
      'UPDATE calendar_events SET start_time = ?, end_time = ? WHERE id = ? AND coach_id = ?',
      [newStart, newEnd, eventId, coachId]
    )
    revalidatePath('/coach/takvim')
    revalidatePath('/coach/dashboard')
    return true
  } catch (error) {
    console.error('Error moving event:', error)
    return false
  }
}
