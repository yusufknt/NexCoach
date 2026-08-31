'use server'

import { d1 } from '@/lib/cloudflare/d1'
import { getAuthenticatedCoachId } from '@/lib/coach/auth'
import type { Message } from './types'

async function canMessageStudent(coachId: string, studentId: string): Promise<boolean> {
  const relation = await d1.first<{ id: string }>(
    'SELECT id FROM coach_students WHERE coach_id = ? AND student_id = ? LIMIT 1',
    [coachId, studentId]
  )
  return Boolean(relation)
}

export async function getMessages(
  coachId: string, 
  studentId: string,
  limit: number = 50,
  offset: number = 0
): Promise<Message[]> {
  try {
    const authenticatedCoachId = await getAuthenticatedCoachId()
    if (authenticatedCoachId !== coachId || !await canMessageStudent(coachId, studentId)) return []
    const data = await d1.query<Message>(
      `SELECT * FROM (
         SELECT * FROM messages
         WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?
       )
       ORDER BY created_at ASC`,
      [coachId, studentId, studentId, coachId, limit, offset]
    )
    return data ?? []
  } catch (error) {
    console.error('Error fetching messages:', error)
    return []
  }
}

export async function sendMessage(senderId: string, receiverId: string, content: string): Promise<Message | null> {
  try {
    const authenticatedCoachId = await getAuthenticatedCoachId()
    const safeContent = content.trim()
    if (authenticatedCoachId !== senderId || !safeContent || safeContent.length > 4000) return null
    if (!await canMessageStudent(senderId, receiverId)) return null
    const id = crypto.randomUUID()
    await d1.run(
      `INSERT INTO messages (id, sender_id, receiver_id, content, is_read)
       VALUES (?, ?, ?, ?, 0)`,
      [id, senderId, receiverId, safeContent]
    )

    const msg = await d1.first<Message>(
      'SELECT * FROM messages WHERE id = ?',
      [id]
    )
    return msg
  } catch (error) {
    console.error('Error sending message:', error)
    return null
  }
}

export async function markAsRead(coachId: string, studentId: string): Promise<void> {
  try {
    const authenticatedCoachId = await getAuthenticatedCoachId()
    if (authenticatedCoachId !== coachId || !await canMessageStudent(coachId, studentId)) return
    await d1.run(
      'UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ? AND is_read = 0',
      [studentId, coachId]
    )
  } catch (error) {
    console.error('Error marking messages as read:', error)
  }
}
