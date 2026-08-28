import { d1 } from '@/lib/cloudflare/d1'
import type { ChatSummary } from './types'

type StudentProfileRow = {
  id: string
  full_name: string | null
  avatar_url: string | null
}

export async function getChatSummaries(coachId: string): Promise<ChatSummary[]> {
  const students = await d1.query<StudentProfileRow>(
    `SELECT pr.id, pr.full_name, pr.avatar_url
     FROM coach_students cs
     JOIN profiles pr ON pr.id = cs.student_id
     WHERE cs.coach_id = ?`,
    [coachId]
  )

  const summaries: ChatSummary[] = []

  for (const student of students ?? []) {
    const [lastMsg, unreadCountRow] = await Promise.all([
      d1.first<{
        id: string
        content: string
        created_at: string
        is_read: number | boolean
        sender_id: string
      }>(
        `SELECT id, content, created_at, is_read, sender_id
         FROM messages
         WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
         ORDER BY created_at DESC
         LIMIT 1`,
        [coachId, student.id, student.id, coachId]
      ),
      d1.first<{ count: number }>(
        `SELECT COUNT(*) as count
         FROM messages
         WHERE sender_id = ? AND receiver_id = ? AND is_read = 0`,
        [student.id, coachId]
      ),
    ])

    summaries.push({
      studentId: student.id,
      fullName: student.full_name ?? 'İsimsiz',
      avatarUrl: student.avatar_url ?? null,
      lastMessage: lastMsg
        ? {
            content: lastMsg.content,
            createdAt: lastMsg.created_at,
            isRead: Boolean(lastMsg.is_read),
            senderId: lastMsg.sender_id,
          }
        : null,
      unreadCount: unreadCountRow?.count ?? 0,
    })
  }

  return summaries.sort((a, b) => {
    if (!a.lastMessage) return 1
    if (!b.lastMessage) return -1
    return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
  })
}
