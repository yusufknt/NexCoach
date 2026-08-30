import { d1 } from '@/lib/cloudflare/d1'
import { getAuthenticatedCoachId } from '@/lib/coach/auth'
import { getTodayTomorrowRange } from '@/lib/coach/format'
import { unstable_cache } from 'next/cache'
import type {
  ActivityItem,
  DashboardStats,
  MonthlyRevenue,
  MonthlyStudentGrowth,
  TopActiveStudent,
  UpcomingAppointment,
} from '@/lib/coach/types'

type StudentActivityRow = {
  id: string
  created_at: string
  student_name: string | null
}

type MessageActivityRow = {
  id: string
  content: string
  created_at: string
  sender_id: string
  receiver_id: string
  sender_name: string | null
}

type ProgressActivityRow = {
  id: string
  created_at: string
  student_name: string | null
}

type CalendarRow = {
  id: string
  title: string
  start_time: string
  end_time: string
  event_type: 'available' | 'session' | 'blocked'
  student_name: string | null
}

interface PaymentRow {
  amount: number | null
  created_at: string
}

export async function getDashboardData(): Promise<{
  stats: DashboardStats
  upcomingAppointments: UpcomingAppointment[]
  activities: ActivityItem[]
  revenue: MonthlyRevenue[]
  growth: MonthlyStudentGrowth[]
  topStudents: TopActiveStudent[]
} | null> {
  const coachId = await getAuthenticatedCoachId()
  if (!coachId) {
    return null
  }

  const getCachedDashboardData = unstable_cache(
    async (coachId: string) => {
      const { start, end } = getTodayTomorrowRange()

      const [
        activeCountRow,
        unreadCountRow,
        appointments,
        students,
        messages,
        progressEntries,
      ] = await Promise.all([
        d1.first<{ count: number }>(
          "SELECT COUNT(*) as count FROM coach_students WHERE coach_id = ? AND status = 'active'",
          [coachId]
        ),
        d1.first<{ count: number }>(
          'SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = 0',
          [coachId]
        ),
        d1.query<CalendarRow>(
          `SELECT c.id, c.title, c.start_time, c.end_time, c.event_type, pr.full_name as student_name
           FROM calendar_events c
           LEFT JOIN profiles pr ON pr.id = c.student_id
           WHERE c.coach_id = ? AND c.event_type = 'session' AND c.start_time >= ? AND c.start_time < ?
           ORDER BY c.start_time ASC`,
          [coachId, start, end]
        ),
        d1.query<StudentActivityRow>(
          `SELECT cs.id, cs.created_at, pr.full_name as student_name
           FROM coach_students cs
           LEFT JOIN profiles pr ON pr.id = cs.student_id
           WHERE cs.coach_id = ?
           ORDER BY cs.created_at DESC
           LIMIT 10`,
          [coachId]
        ),
        d1.query<MessageActivityRow>(
          `SELECT m.id, m.content, m.created_at, m.sender_id, m.receiver_id, pr.full_name as sender_name
           FROM messages m
           LEFT JOIN profiles pr ON pr.id = m.sender_id
           WHERE m.sender_id = ? OR m.receiver_id = ?
           ORDER BY m.created_at DESC
           LIMIT 10`,
          [coachId, coachId]
        ),
        d1.query<ProgressActivityRow>(
          `SELECT pe.id, pe.created_at, pr.full_name as student_name
           FROM progress_entries pe
           LEFT JOIN profiles pr ON pr.id = pe.student_id
           WHERE pe.coach_id = ?
           ORDER BY pe.created_at DESC
           LIMIT 10`,
          [coachId]
        ),
      ])

      const upcomingAppointments: UpcomingAppointment[] = (appointments ?? []).map((event) => ({
        id: event.id,
        title: event.title,
        studentName: event.student_name ?? null,
        startTime: event.start_time,
        endTime: event.end_time,
        eventType: event.event_type,
      }))

      const activities = buildActivityFeed(
        students ?? [],
        messages ?? [],
        progressEntries ?? [],
        coachId
      )

      const revenue = await getMonthlyRevenue(coachId)
      const growth = await getMonthlyStudentGrowth(coachId)
      const topStudents = await getTopActiveStudents(coachId)

      return {
        stats: {
          activeStudentCount: activeCountRow?.count ?? 0,
          unreadMessageCount: unreadCountRow?.count ?? 0,
        },
        upcomingAppointments,
        activities,
        revenue,
        growth,
        topStudents,
      }
    },
    ['dashboard'],
    { revalidate: 60, tags: ['dashboard'] }
  )

  return getCachedDashboardData(coachId)
}

function buildActivityFeed(
  students: StudentActivityRow[],
  messages: MessageActivityRow[],
  progressEntries: ProgressActivityRow[],
  coachId: string
): ActivityItem[] {
  const items: ActivityItem[] = []

  for (const row of students) {
    const name = row.student_name ?? 'Öğrenci'
    items.push({
      id: `student-${row.id}`,
      type: 'new_student',
      title: 'Yeni öğrenci',
      description: `${name} koçluğa katıldı`,
      createdAt: row.created_at,
    })
  }

  for (const row of messages) {
    const isIncoming = row.receiver_id === coachId
    const name = row.sender_name ?? 'Öğrenci'
    items.push({
      id: `message-${row.id}`,
      type: 'message',
      title: isIncoming ? 'Yeni mesaj' : 'Gönderilen mesaj',
      description: isIncoming
        ? `${name}: ${truncate(row.content, 60)}`
        : truncate(row.content, 60),
      createdAt: row.created_at,
    })
  }

  for (const row of progressEntries) {
    const name = row.student_name ?? 'Öğrenci'
    items.push({
      id: `progress-${row.id}`,
      type: 'progress',
      title: 'İlerleme kaydı',
      description: `${name} yeni bir kayıt ekledi`,
      createdAt: row.created_at,
    })
  }

  return items
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5)
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}…`
}

const MONTH_NAMES = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']

async function getMonthlyRevenue(coachId: string): Promise<MonthlyRevenue[]> {
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11)
  twelveMonthsAgo.setDate(1)

  const payments = await d1.query<PaymentRow>(
    "SELECT amount, created_at FROM payments WHERE coach_id = ? AND status = 'success' AND created_at >= ?",
    [coachId, twelveMonthsAgo.toISOString()]
  )

  const result: MonthlyRevenue[] = []
  const now = new Date()

  for (let i = 11; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

    const total = (payments ?? [])
      .filter((p) => {
        const date = new Date(p.created_at)
        return date >= month && date < nextMonth
      })
      .reduce((sum, p) => sum + (p.amount ?? 0), 0)

    result.push({
      period: `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`,
      month: MONTH_NAMES[month.getMonth()],
      revenue: total,
    })
  }

  return result
}

async function getMonthlyStudentGrowth(coachId: string): Promise<MonthlyStudentGrowth[]> {
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11)
  twelveMonthsAgo.setDate(1)

  const students = await d1.query<{ id: string; created_at: string }>(
    'SELECT id, created_at FROM coach_students WHERE coach_id = ? AND created_at >= ?',
    [coachId, twelveMonthsAgo.toISOString()]
  )

  const result: MonthlyStudentGrowth[] = []
  const now = new Date()

  for (let i = 11; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

    const count = (students ?? []).filter((s) => {
      const date = new Date(s.created_at)
      return date >= month && date < nextMonth
    }).length

    result.push({
      period: `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`,
      month: MONTH_NAMES[month.getMonth()],
      count,
    })
  }

  return result
}

async function getTopActiveStudents(coachId: string): Promise<TopActiveStudent[]> {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const rows = await d1.query<{
    student_id: string
    full_name: string | null
    avatar_url: string | null
    progress_count: number
  }>(
    `SELECT pe.student_id, pr.full_name, pr.avatar_url, COUNT(pe.id) as progress_count
     FROM progress_entries pe
     LEFT JOIN profiles pr ON pr.id = pe.student_id
     WHERE pe.coach_id = ? AND pe.created_at >= ?
     GROUP BY pe.student_id, pr.full_name, pr.avatar_url
     ORDER BY progress_count DESC
     LIMIT 3`,
    [coachId, sevenDaysAgo.toISOString()]
  )

  return (rows ?? []).map((row) => ({
    studentId: row.student_id,
    fullName: row.full_name ?? 'Öğrenci',
    avatarUrl: row.avatar_url ?? null,
    progressCount: Number(row.progress_count),
  }))
}
