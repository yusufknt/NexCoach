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

  try {
    await d1.run(
      'UPDATE profiles SET full_name = ?, bio = ?, updated_at = ? WHERE id = ?',
      [parsed.data.fullName, parsed.data.bio || null, new Date().toISOString(), coachId]
    )
    revalidatePath('/coach/ayarlar')
    return true
  } catch (error) {
    console.error('Error in updateProfile:', error)
    return false
  }
}

export async function uploadAvatar(formData: FormData): Promise<{ url?: string; error?: string }> {
  const coachId = await getAuthenticatedCoachId()
  const file = formData.get('avatar')
  if (!coachId) return { error: 'Oturum bulunamadı' }
  if (!(file instanceof File) || file.size === 0) return { error: 'Geçersiz veya boş dosya' }
  if (file.size > MAX_AVATAR_SIZE) return { error: `Dosya boyutu çok büyük (Maks 5MB). Yüklenen: ${(file.size / 1024 / 1024).toFixed(1)}MB` }
  if (!ALLOWED_AVATAR_TYPES.has(file.type)) return { error: `Geçersiz dosya formatı (${file.type}). Sadece JPEG, PNG ve WebP kabul edilir.` }

  try {
    const extensionByType: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    }
    const filePath = `${coachId}/avatar.${extensionByType[file.type]}`
    const { error: uploadError } = await cfStorage.upload('avatars', filePath, await file.arrayBuffer(), file.type)
    if (uploadError) {
      console.error('R2 Upload error:', uploadError)
      return { error: 'Dosya sunucuya yüklenirken bir hata oluştu.' }
    }

    const publicUrl = cfStorage.getPublicUrl('avatars', filePath).data.publicUrl
    const urlWithCacheBuster = `${publicUrl}?v=${Date.now()}`
    await d1.run(
      'UPDATE profiles SET avatar_url = ?, updated_at = ? WHERE id = ?',
      [urlWithCacheBuster, new Date().toISOString(), coachId]
    )
    revalidatePath('/coach/ayarlar')
    return { url: urlWithCacheBuster }
  } catch (error) {
    console.error('Error in uploadAvatar:', error)
    return { error: 'Veritabanı güncellenirken bir hata oluştu.' }
  }
}

export async function updateNotificationPreferences(input: unknown): Promise<boolean> {
  const coachId = await getAuthenticatedCoachId()
  const parsed = notificationPreferencesSchema.safeParse(input)
  if (!coachId || !parsed.success) return false

  try {
    const preferences: NotificationPreferences = parsed.data
    await d1.run(
      'UPDATE profiles SET notification_preferences = ?, updated_at = ? WHERE id = ?',
      [JSON.stringify(preferences), new Date().toISOString(), coachId]
    )
    revalidatePath('/coach/ayarlar')
    return true
  } catch (error) {
    console.error('Error in updateNotificationPreferences:', error)
    return false
  }
}
