import { d1 } from '@/lib/cloudflare/d1'
import type { StudentCalendarEvent } from './types'

interface CalendarEventRow {
  id: string
  title: string
  start_time: string
  end_time: string
  event_type: 'available' | 'session' | 'blocked'
  description: string | null
  meeting_url: string | null
  student_id: string | null
}

export async function getStudentCalendarEvents(studentId: string): Promise<StudentCalendarEvent[]> {
  // Get coach
  const rel = await d1.first<{ coach_id: string }>(
    "SELECT coach_id FROM coach_students WHERE student_id = ? AND status = 'active' LIMIT 1",
    [studentId]
  )

  if (!rel) return []

  // Get available slots + sessions for this student
  const data = await d1.query<CalendarEventRow>(
    `SELECT * FROM calendar_events 
     WHERE coach_id = ? AND (event_type = 'available' OR (event_type = 'session' AND student_id = ?))
     ORDER BY start_time ASC`,
    [rel.coach_id, studentId]
  )

  return (data ?? []).map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start_time,
    end: e.end_time,
    eventType: e.event_type,
    description: e.description ?? '',
    meetingUrl: e.meeting_url ?? '',
    studentName: null,
  }))
}
