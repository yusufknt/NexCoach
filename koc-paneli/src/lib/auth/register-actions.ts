'use server'

import { d1 } from '@/lib/cloudflare/d1'
import { revalidateTag } from 'next/cache'
import { sendNewStudentNotification } from '@/lib/email/send'

type RegisterResult = { success: true } | { success: false; error: string }

export async function registerWithInvitation(
  formData: FormData
): Promise<RegisterResult> {
  const fullName = String(formData.get('fullName') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const passwordConfirm = String(formData.get('passwordConfirm') ?? '')
  const inviteToken = String(formData.get('inviteToken') ?? '').trim()

  if (!fullName || !email || !password) {
    return { success: false, error: 'Tüm zorunlu alanları doldurun.' }
  }

  if (password.length < 8) {
    return { success: false, error: 'Şifre en az 8 karakter olmalı.' }
  }

  if (password !== passwordConfirm) {
    return { success: false, error: 'Şifreler eşleşmiyor.' }
  }

  if (!inviteToken) {
    return { success: false, error: 'Davet linki geçersiz.' }
  }

  const invitation = await d1.first<{
    id: string
    coach_id: string
    package_id: string | null
    expires_at: string
    status: string
  }>(
    "SELECT id, coach_id, package_id, expires_at, status FROM invitations WHERE token = ? AND status = 'pending' LIMIT 1",
    [inviteToken]
  )

  if (!invitation) {
    return { success: false, error: 'Davet linki geçersiz veya süresi dolmuş.' }
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return { success: false, error: 'Davet linkinin süresi dolmuş.' }
  }

  const WORKER_URL = process.env.CLOUDFLARE_WORKER_URL || process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL || 'https://nexcoach-api.yusufk6509.workers.dev'
  
  const authResponse = await fetch(`${WORKER_URL}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name: fullName }),
  })

  if (!authResponse.ok) {
    const err = await authResponse.json().catch(()=>({}));
    return { success: false, error: err.message || 'Kayıt oluşturulurken bir hata oluştu.' }
  }

  const authData = await authResponse.json();
  const studentId = authData.user?.id || authData.id;

  if (!studentId) {
    return { success: false, error: 'Kayıt başarılı fakat kullanıcı ID alınamadı.' }
  }

  const now = new Date().toISOString()

  // 2. Profile'ı D1'e kaydet veya güncelle
  const existingProfile = await d1.first<{ id: string }>(
    'SELECT id FROM profiles WHERE id = ? LIMIT 1',
    [studentId]
  )

  if (existingProfile) {
    await d1.run(
      "UPDATE profiles SET role = 'student', full_name = ?, updated_at = ? WHERE id = ?",
      [fullName, now, studentId]
    )
  } else {
    await d1.run(
      "INSERT INTO profiles (id, full_name, role, created_at, updated_at) VALUES (?, ?, 'student', ?, ?)",
      [studentId, fullName, now, now]
    )
  }

  let endDate: string | null = null
  let packageName: string | null = null
  if (invitation.package_id) {
    const pkg = await d1.first<{ name: string; duration_days: number }>(
      'SELECT name, duration_days FROM packages WHERE id = ? LIMIT 1',
      [invitation.package_id]
    )
    if (pkg?.duration_days) {
      const end = new Date()
      end.setDate(end.getDate() + pkg.duration_days)
      endDate = end.toISOString().split('T')[0]
    }
    if (pkg?.name) {
      packageName = pkg.name
    }
  }

  const startDate = new Date().toISOString().split('T')[0]
  const relId = crypto.randomUUID()

  try {
    await d1.run(
      `INSERT INTO coach_students (id, coach_id, student_id, package_id, start_date, end_date, status, payment_status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'active', 'pending', ?)`,
      [relId, invitation.coach_id, studentId, invitation.package_id || null, startDate, endDate, now]
    )
  } catch (linkError) {
    console.error('Error linking student to coach in D1:', linkError)
    return { success: false, error: 'Öğrenci-koç ilişkisi oluşturulurken bir hata oluştu.' }
  }

  await d1.run(
    "UPDATE invitations SET status = 'accepted' WHERE id = ?",
    [invitation.id]
  )

  revalidateTag('students', 'max')
  revalidateTag('student-dashboard', 'max')
  revalidateTag('student-sidebar', 'max')

  sendNewStudentNotification({
    coachId: invitation.coach_id,
    studentName: fullName,
    packageName,
  })

  // Set-cookie forwarding cannot be done here easily, so they will need to login!
  // Return success
  return { success: true }
}
