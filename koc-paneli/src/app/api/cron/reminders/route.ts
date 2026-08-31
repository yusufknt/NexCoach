import { NextRequest, NextResponse } from 'next/server'
import { d1 } from '@/lib/cloudflare/d1'
import { sendReminderNotification } from '@/lib/email/send'
import { formatDateTime } from '@/lib/utils/format'

const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000)

  const events = await d1.query<{
    id: string
    title: string
    start_time: string
    end_time: string
    meeting_url: string | null
    coach_id: string
    student_id: string | null
    student_name: string | null
  }>(
    `SELECT 
      c.id, c.title, c.start_time, c.end_time, c.meeting_url, c.coach_id, c.student_id,
      pr.full_name as student_name
     FROM calendar_events c
     LEFT JOIN profiles pr ON pr.id = c.student_id
     WHERE c.event_type = 'session' AND c.start_time >= ? AND c.start_time < ?`,
    [in24h.toISOString(), in25h.toISOString()]
  )

  if (!events || events.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No upcoming sessions in window' })
  }

  
  let sent = 0

  for (const event of events) {
    const coachProfile = await d1.first<{ full_name: string | null }>(
      'SELECT full_name FROM profiles WHERE id = ?',
      [event.coach_id]
    )

    const coachUser = await d1.first<{email:string}>('SELECT email FROM user WHERE id = ?', [event.coach_id])

    const coachName = coachProfile?.full_name ?? 'Koç'
    const coachEmail = coachUser?.email
    const studentName = event.student_name ?? 'Öğrenci'

    if (!coachEmail) continue

    await sendReminderNotification({
      coachId: event.coach_id,
      coachEmail,
      coachName,
      studentName,
      appointmentTitle: event.title,
      appointmentTime: formatDateTime(event.start_time),
      meetingUrl: event.meeting_url,
    })

    sent++
  }

  return NextResponse.json({ sent, total: events.length })
}
