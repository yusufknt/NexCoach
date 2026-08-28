import { d1 } from '@/lib/cloudflare/d1'
import { unstable_cache } from 'next/cache'
import type { StudentDashboardData, SidebarBadges } from './types'

export async function getStudentDashboard(studentId: string): Promise<StudentDashboardData | null> {
  const check = await d1.first<{ id: string }>(
    "SELECT id FROM coach_students WHERE student_id = ? AND status = 'active' LIMIT 1",
    [studentId]
  )

  if (!check) return null

  return getCachedStudentDashboard(studentId)
}

async function getCachedStudentDashboard(studentId: string): Promise<StudentDashboardData> {
  const getCached = unstable_cache(
    async (studentId: string) => {
      const row = await d1.first<{
        coach_id: string
        start_date: string
        end_date: string | null
        status: string
        coach_name: string | null
        coach_avatar: string | null
        coach_bio: string | null
        package_name: string | null
        duration_days: number | null
      }>(
        `SELECT 
          cs.coach_id, cs.start_date, cs.end_date, cs.status,
          pr.full_name AS coach_name, pr.avatar_url AS coach_avatar, pr.bio AS coach_bio,
          p.name AS package_name, p.duration_days
         FROM coach_students cs
         LEFT JOIN profiles pr ON pr.id = cs.coach_id
         LEFT JOIN packages p ON p.id = cs.package_id
         WHERE cs.student_id = ? AND cs.status = 'active'
         ORDER BY cs.created_at DESC
         LIMIT 1`,
        [studentId]
      )

      if (!row) return null

      // Days remaining
      let daysRemaining: number | null = null
      let totalDays: number | null = null
      if (row.end_date) {
        const end = new Date(row.end_date)
        const now = new Date()
        daysRemaining = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000))
        const start = new Date(row.start_date)
        totalDays = Math.ceil((end.getTime() - start.getTime()) / 86400000)
      }

      // Streak (consecutive days with progress entries)
      const entries = await d1.query<{ date: string }>(
        'SELECT date FROM progress_entries WHERE student_id = ? ORDER BY date DESC LIMIT 60',
        [studentId]
      )

      let streak = 0
      if (entries && entries.length > 0) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        let checkDate = new Date(today)

        for (const entry of entries) {
          const entryDate = new Date(entry.date)
          entryDate.setHours(0, 0, 0, 0)
          if (entryDate.getTime() === checkDate.getTime()) {
            streak++
            checkDate.setDate(checkDate.getDate() - 1)
          } else if (entryDate.getTime() < checkDate.getTime()) {
            if (streak === 0 && entryDate.getTime() === checkDate.getTime() - 86400000) {
              checkDate = entryDate
              streak++
              checkDate.setDate(checkDate.getDate() - 1)
            } else {
              break
            }
          }
        }
      }

      // Upcoming session
      const now = new Date().toISOString()
      const upcomingSession = await d1.first<{
        id: string
        title: string
        start_time: string
        end_time: string
        meeting_url: string | null
      }>(
        `SELECT id, title, start_time, end_time, meeting_url 
         FROM calendar_events 
         WHERE student_id = ? AND event_type = 'session' AND start_time >= ? 
         ORDER BY start_time ASC 
         LIMIT 1`,
        [studentId, now]
      )

      // Latest program
      const latestProgram = await d1.first<{
        id: string
        title: string
        created_at: string
        file_url: string
      }>(
        `SELECT id, title, created_at, file_url 
         FROM programs 
         WHERE student_id = ? 
         ORDER BY created_at DESC 
         LIMIT 1`,
        [studentId]
      )

      // Unread messages
      const unreadRow = await d1.first<{ count: number }>(
        'SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = 0',
        [studentId]
      )

      return {
        coachName: row.coach_name ?? 'Koç',
        coachAvatarUrl: row.coach_avatar ?? null,
        coachBio: row.coach_bio ?? null,
        coachId: row.coach_id,
        packageName: row.package_name ?? null,
        daysRemaining,
        totalDays,
        streak,
        upcomingSession: upcomingSession
          ? {
              id: upcomingSession.id,
              title: upcomingSession.title,
              startTime: upcomingSession.start_time,
              endTime: upcomingSession.end_time,
              meetingUrl: upcomingSession.meeting_url,
            }
          : null,
        latestProgram: latestProgram
          ? {
              id: latestProgram.id,
              title: latestProgram.title,
              createdAt: latestProgram.created_at,
              fileUrl: latestProgram.file_url,
            }
          : null,
        unreadMessageCount: unreadRow?.count ?? 0,
      }
    },
    ['student-dashboard'],
    { revalidate: 60, tags: ['student-dashboard'] }
  )

  const result = await getCached(studentId)
  if (!result) {
    throw new Error('Student dashboard data not found')
  }
  return result
}

export async function getSidebarBadges(studentId: string): Promise<SidebarBadges> {
  const getCached = unstable_cache(
    async (studentId: string) => {
      const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString()

      const [unreadRow, newProgramRow, coachRow] = await Promise.all([
        d1.first<{ count: number }>(
          'SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = 0',
          [studentId]
        ),
        d1.first<{ id: string }>(
          'SELECT id FROM programs WHERE student_id = ? AND created_at >= ? LIMIT 1',
          [studentId, threeDaysAgo]
        ),
        d1.first<{ full_name: string | null; avatar_url: string | null }>(
          `SELECT pr.full_name, pr.avatar_url 
           FROM coach_students cs
           JOIN profiles pr ON pr.id = cs.coach_id
           WHERE cs.student_id = ? AND cs.status = 'active'
           LIMIT 1`,
          [studentId]
        ),
      ])

      return {
        unreadMessages: unreadRow?.count ?? 0,
        hasNewProgram: Boolean(newProgramRow),
        coachName: coachRow?.full_name ?? 'Koç',
        coachAvatarUrl: coachRow?.avatar_url ?? null,
      }
    },
    ['student-sidebar'],
    { revalidate: 60, tags: ['student-sidebar'] }
  )

  return getCached(studentId)
}
