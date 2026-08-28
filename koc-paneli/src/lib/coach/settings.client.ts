import { authClient } from '@/lib/auth-client'
import { cfStorage } from '@/lib/cloudflare/storage'
import { d1 } from '@/lib/cloudflare/d1'
import type { NotificationPreferences } from './types'

export async function updateProfile(data: { fullName: string; bio: string }) {
  const { data: session } = await authClient.getSession()
  if (!session?.user) return false

  try {
    const WORKER_URL = process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL || 'https://nexcoach-api.yusufk6509.workers.dev'
    const API_SECRET = 'nexcoach_prod_sec_2026_cf'

    const res = await fetch(`${WORKER_URL}/api/db/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Secret': API_SECRET,
      },
      body: JSON.stringify({
        query: 'UPDATE profiles SET full_name = ?, bio = ?, updated_at = ? WHERE id = ?',
        params: [data.fullName, data.bio, new Date().toISOString(), session.user.id],
      }),
    })

    const json = await res.json()
    return Boolean(json.success)
  } catch (error) {
    console.error('Error updating profile in D1:', error)
    return false
  }
}

export async function uploadAvatar(file: File): Promise<string | null> {
  const { data: session } = await authClient.getSession()
  if (!session?.user) return null

  const fileExt = file.name.split('.').pop() || 'jpg'
  const filePath = `${session.user.id}/avatar.${fileExt}`

  const { error } = await cfStorage.upload('avatars', filePath, file, file.type);
  if (error) return null;
  const publicUrl = cfStorage.getPublicUrl('avatars', filePath).data.publicUrl;
  

  try {
    const WORKER_URL = process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL || 'https://nexcoach-api.yusufk6509.workers.dev'
    const API_SECRET = 'nexcoach_prod_sec_2026_cf'

    await fetch(`${WORKER_URL}/api/db/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Secret': API_SECRET,
      },
      body: JSON.stringify({
        query: 'UPDATE profiles SET avatar_url = ?, updated_at = ? WHERE id = ?',
        params: [publicUrl, new Date().toISOString(), session.user.id],
      }),
    })
  } catch (error) {
    console.error('Failed to update avatar_url in profiles:', error)
  }

  return publicUrl
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await authClient.changePassword({ newPassword, currentPassword })
  
  if (error) {
    return { success: false, error: error.message || 'Şifre güncellenirken bir hata oluştu' }
  }
  return { success: true }
}

export async function updateNotificationPreferences(prefs: NotificationPreferences) {
  const { data: session } = await authClient.getSession()
  if (!session?.user) return false

  try {
    const WORKER_URL = process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL || 'https://nexcoach-api.yusufk6509.workers.dev'
    const API_SECRET = 'nexcoach_prod_sec_2026_cf'

    const res = await fetch(`${WORKER_URL}/api/db/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Secret': API_SECRET,
      },
      body: JSON.stringify({
        query: 'UPDATE profiles SET notification_preferences = ?, updated_at = ? WHERE id = ?',
        params: [JSON.stringify(prefs), new Date().toISOString(), session.user.id],
      }),
    })

    const json = await res.json()
    return Boolean(json.success)
  } catch (error) {
    console.error('Error updating notification preferences:', error)
    return false
  }
}
