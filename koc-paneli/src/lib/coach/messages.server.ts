import { d1 } from '@/lib/cloudflare/d1'
import type { ChatSummary } from './types'

type ChatSummaryRow = {
  studentId: string
  fullName: string | null
  avatarUrl: string | null
  lastMessageContent: string | null
  lastMessageCreatedAt: string | null
  lastMessageIsRead: number | null
  lastMessageSenderId: string | null
  unreadCount: number
}

export async function getChatSummaries(coachId: string): Promise<ChatSummary[]> {
  const query = `
    WITH RankedMessages AS (
      SELECT 
        m.id, m.content, m.created_at, m.is_read, m.sender_id,
        CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END as student_id,
        ROW_NUMBER() OVER (
          PARTITION BY CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END 
          ORDER BY m.created_at DESC
        ) as rn
      FROM messages m
      WHERE m.sender_id = ? OR m.receiver_id = ?
    ),
    UnreadCounts AS (
      SELECT sender_id as student_id, COUNT(*) as unread_count
      FROM messages
      WHERE receiver_id = ? AND is_read = 0
      GROUP BY sender_id
    )
    SELECT 
      pr.id as studentId,
      pr.full_name as fullName,
      pr.avatar_url as avatarUrl,
      rm.content as lastMessageContent,
      rm.created_at as lastMessageCreatedAt,
      rm.is_read as lastMessageIsRead,
      rm.sender_id as lastMessageSenderId,
      COALESCE(uc.unread_count, 0) as unreadCount
    FROM coach_students cs
    JOIN profiles pr ON pr.id = cs.student_id
    LEFT JOIN RankedMessages rm ON rm.student_id = pr.id AND rm.rn = 1
    LEFT JOIN UnreadCounts uc ON uc.student_id = pr.id
    WHERE cs.coach_id = ?
    ORDER BY rm.created_at DESC
  `

  const rows = await d1.query<ChatSummaryRow>(query, [
    coachId, coachId, coachId, coachId, coachId, coachId
  ])

  return (rows ?? []).map(row => ({
    studentId: row.studentId,
    fullName: row.fullName ?? 'İsimsiz',
    avatarUrl: row.avatarUrl,
    lastMessage: row.lastMessageContent ? {
      content: row.lastMessageContent,
      createdAt: row.lastMessageCreatedAt!,
      isRead: Boolean(row.lastMessageIsRead),
      senderId: row.lastMessageSenderId!,
    } : null,
    unreadCount: row.unreadCount,
  }))
}

