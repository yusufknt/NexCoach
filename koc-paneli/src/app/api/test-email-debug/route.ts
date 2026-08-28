import { NextResponse } from 'next/server'
import { d1 } from '@/lib/cloudflare/d1'
import type { NotificationPreferences } from '@/lib/coach/types'

export async function GET() {
  const coach = await d1.first<{
    id: string
    full_name: string
    notification_preferences: any
  }>(
    "SELECT id, full_name, notification_preferences FROM profiles WHERE role = 'coach' LIMIT 1"
  )

  if (!coach) {
    return NextResponse.json({ error: 'No coaches found' }, { status: 404 })
  }

  
  const userData = { user: await d1.first<{email:string}>('SELECT email FROM user WHERE id = ?', [coach.id]) }; const userError = null;

  let prefs: any = null
  if (coach.notification_preferences) {
    try {
      prefs = typeof coach.notification_preferences === 'string'
        ? JSON.parse(coach.notification_preferences)
        : coach.notification_preferences
    } catch {
      prefs = null
    }
  }

  return NextResponse.json({
    coach: {
      id: coach.id,
      fullName: coach.full_name,
      email: userData?.user?.email ?? null,
      notificationPreferences: {
        emailOnMessage: prefs?.emailOnMessage ?? true,
        emailOnNewStudent: prefs?.emailOnNewStudent ?? true,
        emailReminderBefore24h: prefs?.emailReminderBefore24h ?? true,
      },
    },
    errors: {
      userError: null,
    },
  })
}
