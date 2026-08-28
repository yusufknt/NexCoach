'use server'

import { d1 } from '@/lib/cloudflare/d1'
import type { StudentMessage } from './types'

export async function getMessages(studentId: string, coachId: string): Promise<StudentMessage[]> {
  try {
    const data = await d1.query<StudentMessage>(
      `SELECT * FROM messages
       WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
       ORDER BY created_at ASC`,
      [studentId, coachId, coachId, studentId]
    )
    return data ?? []
  } catch (error) {
    console.error('Error fetching messages:', error)
    return []
  }
}

export async function sendMessage(senderId: string, receiverId: string, content: string): Promise<StudentMessage | null> {
  try {
    const id = crypto.randomUUID()
    await d1.run(
      `INSERT INTO messages (id, sender_id, receiver_id, content, is_read)
       VALUES (?, ?, ?, ?, 0)`,
      [id, senderId, receiverId, content]
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
    await d1.run(
      'UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ? AND is_read = 0',
      [coachId, studentId]
    )
  } catch (error) {
    console.error('Error marking messages as read:', error)
  }
}
