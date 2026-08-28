
import { d1 } from '@/lib/cloudflare/d1'
import type { CoachProfile, NotificationPreferences } from './types'

export async function getCoachProfile(coachId: string): Promise<CoachProfile | null> {
  const profile = await d1.first<{
    id: string
    full_name: string | null
    bio: string | null
    avatar_url: string | null
  }>(
    'SELECT id, full_name, bio, avatar_url FROM profiles WHERE id = ?',
    [coachId]
  )

  if (!profile) {
    return null
  }

  
  const user = await d1.first<{ email: string }>('SELECT email FROM user WHERE id = ?', [coachId])

  return {
    id: profile.id,
    fullName: profile.full_name ?? '',
    bio: profile.bio ?? null,
    avatarUrl: profile.avatar_url ?? null,
    email: user?.email ?? null,
  }
}

export async function getNotificationPreferences(coachId: string): Promise<NotificationPreferences> {
  const row = await d1.first<{ notification_preferences: any }>(
    'SELECT notification_preferences FROM profiles WHERE id = ?',
    [coachId]
  )

  let prefs: any = null
  if (row?.notification_preferences) {
    try {
      prefs = typeof row.notification_preferences === 'string'
        ? JSON.parse(row.notification_preferences)
        : row.notification_preferences
    } catch {
      prefs = null
    }
  }

  return {
    emailOnMessage: prefs?.emailOnMessage ?? true,
    emailOnNewStudent: prefs?.emailOnNewStudent ?? true,
    emailReminderBefore24h: prefs?.emailReminderBefore24h ?? true,
  }
}
