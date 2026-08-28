import { d1 } from '@/lib/cloudflare/d1'
import { unstable_cache } from 'next/cache'
import type { CoachInfo, StudentMessage } from './types'

export async function getStudentCoachInfo(studentId: string): Promise<CoachInfo | null> {
  const coach = await d1.first<{
    id: string
    full_name: string | null
    avatar_url: string | null
    bio: string | null
  }>(
    `SELECT pr.id, pr.full_name, pr.avatar_url, pr.bio
     FROM coach_students cs
     JOIN profiles pr ON pr.id = cs.coach_id
     WHERE cs.student_id = ? AND cs.status = 'active'
     LIMIT 1`,
    [studentId]
  )

  if (!coach) return null

  return {
    id: coach.id,
    fullName: coach.full_name ?? 'Koç',
    avatarUrl: coach.avatar_url ?? null,
    bio: coach.bio ?? null,
  }
}

export async function getInitialMessages(studentId: string, coachId: string): Promise<StudentMessage[]> {
  const getCached = unstable_cache(
    async (studentId: string, coachId: string) => {
      const data = await d1.query<StudentMessage>(
        `SELECT * FROM messages
         WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
         ORDER BY created_at ASC`,
        [studentId, coachId, coachId, studentId]
      )

      return data ?? []
    },
    ['student-messages'],
    { revalidate: 30, tags: ['student-messages'] }
  )

  return getCached(studentId, coachId)
}
