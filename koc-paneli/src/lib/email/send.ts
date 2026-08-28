'use server'

import { resend, EMAIL_CONFIG } from './index'

import { d1 } from '@/lib/cloudflare/d1'
import { newMessageEmailTemplate, newStudentEmailTemplate, reminderEmailTemplate } from './templates'
import type { NotificationPreferences } from '@/lib/coach/types'

async function getCoachEmailAndPrefs(coachId: string): Promise<{ email: string | null; prefs: NotificationPreferences } | null> {
  const profile = await d1.first<{ notification_preferences: any }>(
    'SELECT notification_preferences FROM profiles WHERE id = ?',
    [coachId]
  )

  if (!profile) return null

  
  const user = await d1.first<{ email: string }>('SELECT email FROM user WHERE id = ?', [coachId])

  let prefs: any = null
  if (profile.notification_preferences) {
    try {
      prefs = typeof profile.notification_preferences === 'string'
        ? JSON.parse(profile.notification_preferences)
        : profile.notification_preferences
    } catch {
      prefs = null
    }
  }

  return {
    email: user?.email ?? null,
    prefs: {
      emailOnMessage: prefs?.emailOnMessage ?? true,
      emailOnNewStudent: prefs?.emailOnNewStudent ?? true,
      emailReminderBefore24h: prefs?.emailReminderBefore24h ?? true,
    },
  }
}

export async function sendNewMessageNotification(params: {
  coachId: string
  studentId: string
  messageContent: string
}): Promise<void> {
  if (!resend) return

  const coachData = await getCoachEmailAndPrefs(params.coachId)
  if (!coachData?.email || !coachData.prefs.emailOnMessage) return

  const studentProfile = await d1.first<{ full_name: string | null }>(
    'SELECT full_name FROM profiles WHERE id = ?',
    [params.studentId]
  )

  const studentName = studentProfile?.full_name ?? 'Öğrenci'
  const preview = params.messageContent.length > 100
    ? params.messageContent.slice(0, 100) + '...'
    : params.messageContent

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const messageUrl = `${appUrl}/coach/mesajlar`

  const coachProfile = await d1.first<{ full_name: string | null }>(
    'SELECT full_name FROM profiles WHERE id = ?',
    [params.coachId]
  )

  const coachName = coachProfile?.full_name ?? 'Koç'

  try {
    await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: coachData.email,
      subject: `${studentName} size mesaj gönderdi`,
      html: newMessageEmailTemplate({
        coachName,
        studentName,
        messagePreview: preview,
        messageUrl,
      }),
    })
  } catch (error) {
    console.error('Failed to send new message email:', error)
  }
}

export async function sendNewStudentNotification(params: {
  coachId: string
  studentName: string
  packageName: string | null
}): Promise<void> {
  if (!resend) return

  const coachData = await getCoachEmailAndPrefs(params.coachId)
  if (!coachData?.email || !coachData.prefs.emailOnNewStudent) return

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const dashboardUrl = `${appUrl}/coach/dashboard`

  const coachProfile = await d1.first<{ full_name: string | null }>(
    'SELECT full_name FROM profiles WHERE id = ?',
    [params.coachId]
  )

  const coachName = coachProfile?.full_name ?? 'Koç'

  try {
    await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: coachData.email,
      subject: `Yeni öğrenci: ${params.studentName} katıldı!`,
      html: newStudentEmailTemplate({
        coachName,
        studentName: params.studentName,
        packageName: params.packageName,
        dashboardUrl,
      }),
    })
  } catch (error) {
    console.error('Failed to send new student email:', error)
  }
}

export async function sendReminderNotification(params: {
  coachId: string
  coachEmail: string
  coachName: string
  studentName: string
  appointmentTitle: string
  appointmentTime: string
  meetingUrl: string | null
}): Promise<void> {
  if (!resend) return

  const coachData = await getCoachEmailAndPrefs(params.coachId)
  if (!coachData?.email || !coachData.prefs.emailReminderBefore24h) return

  try {
    await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: params.coachEmail,
      subject: `Hatırlatma: ${params.appointmentTitle} - ${params.appointmentTime}`,
      html: reminderEmailTemplate({
        coachName: params.coachName,
        studentName: params.studentName,
        appointmentTitle: params.appointmentTitle,
        appointmentTime: params.appointmentTime,
        meetingUrl: params.meetingUrl,
      }),
    })
  } catch (error) {
    console.error('Failed to send reminder email:', error)
  }
}
