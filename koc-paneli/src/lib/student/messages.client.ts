'use server'

import { d1 } from '@/lib/cloudflare/d1'
import { getAuthenticatedStudentId } from '@/lib/student/auth'
import type { StudentMessage } from './types'

async function canMessageCoach(studentId: string, coachId: string): Promise<boolean> {
  const relation = await d1.first<{ id: string }>(
    'SELECT id FROM coach_students WHERE student_id = ? AND coach_id = ? LIMIT 1',
    [studentId, coachId]
  )
  return Boolean(relation)
}

export async function getMessages(
  studentId: string, 
  coachId: string,
  limit: number = 50,
  offset: number = 0
): Promise<StudentMessage[]> {
  try {
    const authenticatedStudentId = await getAuthenticatedStudentId()
    if (authenticatedStudentId !== studentId || !await canMessageCoach(studentId, coachId)) return []
    const data = await d1.query<StudentMessage>(
      `SELECT * FROM (
         SELECT * FROM messages
         WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?
       )
       ORDER BY created_at ASC`,
      [studentId, coachId, coachId, studentId, limit, offset]
    )
    return data ?? []
  } catch (error) {
    console.error('Error fetching messages:', error)
    return []
  }
}

export async function sendMessage(senderId: string, receiverId: string, content: string): Promise<StudentMessage | null> {
  try {
    const authenticatedStudentId = await getAuthenticatedStudentId()
    const safeContent = content.trim()
    if (authenticatedStudentId !== senderId || !safeContent || safeContent.length > 4000) return null
    if (!await canMessageCoach(senderId, receiverId)) return null
    const id = crypto.randomUUID()
    await d1.run(
      `INSERT INTO messages (id, sender_id, receiver_id, content, is_read)
       VALUES (?, ?, ?, ?, 0)`,
      [id, senderId, receiverId, safeContent]
    )

    const msg = await d1.first<StudentMessage>(
      'SELECT * FROM messages WHERE id = ?',
      [id]
    )
    return msg
  } catch (error) {
    console.error('Error sending message:', error)
    return null
  }
}

export async function markAsRead(studentId: string, coachId: string): Promise<void> {
  try {
    const authenticatedStudentId = await getAuthenticatedStudentId()
    if (authenticatedStudentId !== studentId || !await canMessageCoach(studentId, coachId)) return
    await d1.run(
      'UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ? AND is_read = 0',
      [coachId, studentId]
    )
  } catch (error) {
    console.error('Error marking messages as read:', error)
  }
}
