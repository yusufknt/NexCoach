'use server'

import { d1 } from '@/lib/cloudflare/d1'
import type { Message } from './types'

export async function getMessages(coachId: string, studentId: string): Promise<Message[]> {
  try {
    const data = await d1.query<Message>(
      `SELECT * FROM messages
       WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
       ORDER BY created_at ASC`,
      [coachId, studentId, studentId, coachId]
    )
    return data ?? []
  } catch (error) {
    console.error('Error fetching messages:', error)
    return []
  }
}

export async function sendMessage(senderId: string, receiverId: string, content: string): Promise<Message | null> {
  try {
    const id = crypto.randomUUID()
    await d1.run(
      `INSERT INTO messages (id, sender_id, receiver_id, content, is_read)
       VALUES (?, ?, ?, ?, 0)`,
      [id, senderId, receiverId, content]
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
    await d1.run(
      'UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ? AND is_read = 0',
      [studentId, coachId]
    )
  } catch (error) {
    console.error('Error marking messages as read:', error)
  }
}
