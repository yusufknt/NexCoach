import { d1 } from '@/lib/cloudflare/d1'
import type { CalendarSummary, StudentOption } from './types'

interface CalendarEventRow {
  id: string
  title: string
  start_time: string
  end_time: string
  event_type: string
  description: string | null
  meeting_url: string | null
  student_id: string | null
  student_name: string | null
}

interface TodayEventRow {
  id: string
  title: string
  start_time: string
  end_time: string
  event_type: 'available' | 'session' | 'blocked'
  student_name: string | null
}

export async function getCalendarEvents(coachId: string) {
  const data = await d1.query<CalendarEventRow>(
    `SELECT 
      c.id, c.title, c.start_time, c.end_time, c.event_type, c.description, c.meeting_url, c.student_id,
      pr.full_name as student_name
     FROM calendar_events c
     LEFT JOIN profiles pr ON pr.id = c.student_id
     WHERE c.coach_id = ?
     ORDER BY c.start_time ASC`,
    [coachId]
  )

  return (data ?? []).map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start_time,
    end: e.end_time,
    eventType: e.event_type as 'available' | 'session' | 'blocked',
    description: e.description ?? '',
    meetingUrl: e.meeting_url ?? '',
    studentId: e.student_id,
    studentName: e.student_name ?? null,
  }))
}

export async function getCalendarSummary(coachId: string): Promise<CalendarSummary> {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()

  // Week range (Monday to Sunday)
  const dayOfWeek = now.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)

  const [todayEventsData, weekCountRow] = await Promise.all([
    d1.query<TodayEventRow>(
      `SELECT c.id, c.title, c.start_time, c.end_time, c.event_type, pr.full_name as student_name
       FROM calendar_events c
       LEFT JOIN profiles pr ON pr.id = c.student_id
       WHERE c.coach_id = ? AND c.start_time >= ? AND c.start_time < ?
       ORDER BY c.start_time ASC`,
      [coachId, todayStart, todayEnd]
    ),
    d1.first<{ count: number }>(
      `SELECT COUNT(*) as count
       FROM calendar_events
       WHERE coach_id = ? AND event_type = 'session' AND start_time >= ? AND start_time < ?`,
      [coachId, weekStart.toISOString(), weekEnd.toISOString()]
    ),
  ])

  const todayEvents = (todayEventsData ?? []).map((e) => ({
    id: e.id,
    title: e.title,
    startTime: e.start_time,
    endTime: e.end_time,
    eventType: e.event_type,
    studentName: e.student_name ?? null,
  }))

  return {
    todayEvents,
    weekSessionCount: weekCountRow?.count ?? 0,
  }
}

export async function getStudentOptions(coachId: string): Promise<StudentOption[]> {
  const rows = await d1.query<{ student_id: string; full_name: string | null }>(
    `SELECT cs.student_id, pr.full_name
     FROM coach_students cs
     LEFT JOIN profiles pr ON pr.id = cs.student_id
     WHERE cs.coach_id = ? AND cs.status = 'active'`,
    [coachId]
  )

  return (rows ?? []).map((row) => ({
    id: row.student_id,
    fullName: row.full_name ?? 'İsimsiz',
  }))
}
