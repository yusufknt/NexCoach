import { d1 } from '@/lib/cloudflare/d1'
import { getAuthenticatedCoachId } from '@/lib/coach/auth'
import { unstable_cache } from 'next/cache'
import type { CoachStudentListItem, CoachStudentDetail } from '@/lib/coach/types'

type CoachStudentDbRow = {
  id: string
  student_id: string
  start_date: string
  end_date: string | null
  status: CoachStudentListItem['status']
  created_at: string
  payment_status?: CoachStudentDetail['paymentStatus']
  package_name: string | null
  full_name: string | null
  avatar_url: string | null
}

type MessageActivityRow = {
  sender_id: string
  receiver_id: string
  created_at: string
}

type ProgressActivityRow = {
  student_id: string
  created_at: string
}

export async function getCoachStudents(): Promise<CoachStudentListItem[] | null> {
  const coachId = await getAuthenticatedCoachId()
  if (!coachId) {
    return null
  }

  const getCachedCoachStudents = unstable_cache(
    async (coachId: string) => {
      const [students, messages, progressEntries] = await Promise.all([
        d1.query<CoachStudentDbRow>(
          `SELECT 
            cs.id,
            cs.student_id,
            cs.start_date,
            cs.end_date,
            cs.status,
            cs.created_at,
            p.name AS package_name,
            pr.full_name,
            pr.avatar_url
          FROM coach_students cs
          LEFT JOIN packages p ON p.id = cs.package_id
          LEFT JOIN profiles pr ON pr.id = cs.student_id
          WHERE cs.coach_id = ?
          ORDER BY cs.created_at DESC`,
          [coachId]
        ),
        d1.query<MessageActivityRow>(
          `SELECT sender_id, receiver_id, created_at 
           FROM messages 
           WHERE sender_id = ? OR receiver_id = ? 
           ORDER BY created_at DESC`,
          [coachId, coachId]
        ),
        d1.query<ProgressActivityRow>(
          `SELECT student_id, created_at 
           FROM progress_entries 
           WHERE coach_id = ? 
           ORDER BY created_at DESC`,
          [coachId]
        ),
      ])

      const lastActivityByStudent = buildLastActivityMap(
        coachId,
        messages ?? [],
        progressEntries ?? [],
        students ?? []
      )

      return students.map((row) => ({
        id: row.id,
        studentId: row.student_id,
        fullName: row.full_name ?? 'İsimsiz',
        avatarUrl: row.avatar_url ?? null,
        packageName: row.package_name ?? null,
        startDate: row.start_date,
        endDate: row.end_date,
        status: row.status,
        lastActivityAt: lastActivityByStudent.get(row.student_id) ?? row.created_at,
      }))
    },
    ['students'],
    { revalidate: 60, tags: ['students'] }
  )

  return getCachedCoachStudents(coachId)
}

export async function getCoachStudentDetail(
  coachStudentId: string
): Promise<CoachStudentDetail | null> {
  const coachId = await getAuthenticatedCoachId()
  if (!coachId) {
    return null
  }

  const row = await d1.first<{
    id: string
    student_id: string
    start_date: string
    end_date: string | null
    status: CoachStudentListItem['status']
    payment_status: CoachStudentDetail['paymentStatus'] | null
    package_name: string | null
    full_name: string | null
    avatar_url: string | null
    email: string | null
  }>(
    `SELECT 
      cs.id,
      cs.student_id,
      cs.start_date,
      cs.end_date,
      cs.status,
      cs.payment_status,
      p.name AS package_name,
      pr.full_name,
      pr.avatar_url,
      (SELECT email FROM invitations WHERE coach_id = cs.coach_id AND (status = 'accepted' OR status = 'pending') LIMIT 1) AS email
    FROM coach_students cs
    LEFT JOIN packages p ON p.id = cs.package_id
    LEFT JOIN profiles pr ON pr.id = cs.student_id
    WHERE cs.id = ? AND cs.coach_id = ?
    LIMIT 1`,
    [coachStudentId, coachId]
  )

  if (!row) {
    return null
  }

  return {
    coachStudentId: row.id,
    studentId: row.student_id,
    fullName: row.full_name ?? 'İsimsiz',
    email: row.email ?? null,
    avatarUrl: row.avatar_url ?? null,
    packageName: row.package_name ?? null,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    paymentStatus: row.payment_status ?? 'pending',
  }
}

function buildLastActivityMap(
  coachId: string,
  messages: MessageActivityRow[],
  progressEntries: ProgressActivityRow[],
  students: CoachStudentDbRow[]
): Map<string, string> {
  const map = new Map<string, string>()

  for (const student of students) {
    map.set(student.student_id, student.created_at)
  }

  for (const message of messages) {
    const studentId =
      message.sender_id === coachId ? message.receiver_id : message.sender_id
    updateLatest(map, studentId, message.created_at)
  }

  for (const entry of progressEntries) {
    updateLatest(map, entry.student_id, entry.created_at)
  }

  return map
}

function updateLatest(
  map: Map<string, string>,
  studentId: string,
  timestamp: string
): void {
  const current = map.get(studentId)
  if (!current || new Date(timestamp) > new Date(current)) {
    map.set(studentId, timestamp)
  }
}
