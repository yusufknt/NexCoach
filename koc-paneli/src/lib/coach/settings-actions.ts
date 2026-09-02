'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getAuthenticatedCoachId } from '@/lib/coach/auth'
import { cfStorage } from '@/lib/cloudflare/storage'
import { d1 } from '@/lib/cloudflare/d1'
import type { NotificationPreferences } from './types'

const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  bio: z.string().trim().max(1000),
}).strict()

const notificationPreferencesSchema = z.object({
  emailOnMessage: z.boolean(),
  emailOnNewStudent: z.boolean(),
  emailReminderBefore24h: z.boolean(),
}).strict()

const MAX_AVATAR_SIZE = 5 * 1024 * 1024
const ALLOWED_AVATAR_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export async function updateProfile(input: unknown): Promise<boolean> {
  const coachId = await getAuthenticatedCoachId()
  const parsed = profileSchema.safeParse(input)
  if (!coachId || !parsed.success) return false

  await d1.run(
    'UPDATE profiles SET full_name = ?, bio = ?, updated_at = ? WHERE id = ?',
    [parsed.data.fullName, parsed.data.bio || null, new Date().toISOString(), coachId]
  )
  revalidatePath('/coach/ayarlar')
  return true
}

export async function uploadAvatar(formData: FormData): Promise<string | null> {
  const coachId = await getAuthenticatedCoachId()
  const file = formData.get('avatar')
  if (!coachId || !(file instanceof File) || file.size === 0) return null
  if (file.size > MAX_AVATAR_SIZE || !ALLOWED_AVATAR_TYPES.has(file.type)) return null

  const extensionByType: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  }
  const filePath = `${coachId}/avatar.${extensionByType[file.type]}`
  const { error } = await cfStorage.upload('avatars', filePath, await file.arrayBuffer(), file.type)
  if (error) return null

  const publicUrl = cfStorage.getPublicUrl('avatars', filePath).data.publicUrl
  const urlWithCacheBuster = `${publicUrl}?v=${Date.now()}`
  await d1.run(
    'UPDATE profiles SET avatar_url = ?, updated_at = ? WHERE id = ?',
    [urlWithCacheBuster, new Date().toISOString(), coachId]
  )
  revalidatePath('/coach/ayarlar')
  return urlWithCacheBuster
}

export async function updateNotificationPreferences(input: unknown): Promise<boolean> {
  const coachId = await getAuthenticatedCoachId()
  const parsed = notificationPreferencesSchema.safeParse(input)
  if (!coachId || !parsed.success) return false

  const preferences: NotificationPreferences = parsed.data
  await d1.run(
    'UPDATE profiles SET notification_preferences = ?, updated_at = ? WHERE id = ?',
    [JSON.stringify(preferences), new Date().toISOString(), coachId]
  )
  revalidatePath('/coach/ayarlar')
  return true
}
