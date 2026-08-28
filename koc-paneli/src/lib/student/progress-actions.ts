'use server'

import { revalidatePath } from 'next/cache'
import { d1 } from '@/lib/cloudflare/d1'
import { cfStorage } from '@/lib/cloudflare/storage'
import { getAuthenticatedStudentId } from '@/lib/student/auth'

type ActionResponse = {
  success: boolean
  error?: string
}

export async function submitWeeklyProgress(formData: FormData): Promise<ActionResponse> {
  const studentId = await getAuthenticatedStudentId()
  if (!studentId) {
    return { success: false, error: 'Oturum bulunamadı.' }
  }

  // Get coach_id
  const rel = await d1.first<{ coach_id: string }>(
    "SELECT coach_id FROM coach_students WHERE student_id = ? AND status = 'active' LIMIT 1",
    [studentId]
  )

  const coachId = rel?.coach_id
  if (!coachId) {
    return { success: false, error: 'Aktif bir koç bulunamadı.' }
  }

  const date = String(formData.get('date') ?? '')
  const weightVal = formData.get('weight')
  const weight = weightVal ? parseFloat(String(weightVal)) : null
  const note = String(formData.get('note') ?? '').trim() || null

  if (!date || weight === null || Number.isNaN(weight)) {
    return { success: false, error: 'Tarih ve kilo alanları zorunludur.' }
  }

  // Parse optional metrics
  const parseOptional = (key: string): number | null => {
    const val = String(formData.get(key) ?? '').trim()
    if (!val) return null
    const num = parseFloat(val)
    return Number.isNaN(num) ? null : num
  }

  const waist_cm = parseOptional('waistCm')
  const chest_cm = parseOptional('chestCm')
  const right_upper_arm_cm = parseOptional('rightUpperArmCm')
  const left_upper_arm_cm = parseOptional('leftUpperArmCm')
  const right_thigh_cm = parseOptional('rightThighCm')
  const left_thigh_cm = parseOptional('leftThighCm')

  const bench_press_max = parseOptional('benchPressMax')
  const squat_max = parseOptional('squatMax')
  const deadlift_max = parseOptional('deadliftMax')

  const workout_days_completed = parseOptional('workoutDaysCompleted')
  const workout_days_target = parseOptional('workoutDaysTarget')
  const sleep_hours_avg = parseOptional('sleepHoursAvg')
  const steps_avg = parseOptional('stepsAvg')
  const energy_level = parseOptional('energyLevel')
  const diet_compliance = parseOptional('dietCompliance')

  // Upload photo if exists
  const photoFile = formData.get('weeklyPhoto')
  let beforePhotoPath: string | null = null

  if (photoFile && photoFile instanceof File && photoFile.size > 0) {
    if (!photoFile.type.startsWith('image/')) {
      return { success: false, error: 'Fotoğraf dosyası geçersiz tipte.' }
    }
    if (photoFile.size > 10 * 1024 * 1024) {
      return { success: false, error: 'Fotoğraf boyutu 10MB\'tan büyük olamaz.' }
    }

    const extension = photoFile.name.split('.').pop()?.toLowerCase() || 'jpg'
    const safeExtension = extension.replace(/[^a-z0-9]/g, '').slice(0, 8) || 'jpg'
    const path = `${studentId}/${crypto.randomUUID()}-weekly.${safeExtension}`

    const buffer = await photoFile.arrayBuffer()
    const { error: uploadErr } = await cfStorage.upload('progress-photos', path, buffer, photoFile.type)

    if (uploadErr) {
      console.error('Error uploading weekly photo:', uploadErr)
      return { success: false, error: 'Fotoğraf yüklenirken hata oluştu.' }
    }
    beforePhotoPath = path
  }

  // Construct custom_metrics
  const custom_metrics = {
    entry_type: 'weekly',
    waist_cm,
    chest_cm,
    right_upper_arm_cm,
    left_upper_arm_cm,
    right_thigh_cm,
    left_thigh_cm,
    bench_press_max,
    squat_max,
    deadlift_max,
    workout_days_completed,
    workout_days_target,
    sleep_hours_avg,
    steps_avg,
    energy_level,
    diet_compliance,
    before_photo_path: beforePhotoPath || null,
  }

  const id = crypto.randomUUID()
  try {
    await d1.run(
      `INSERT INTO progress_entries (id, student_id, coach_id, date, weight, note, custom_metrics)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, studentId, coachId, date, weight, note, JSON.stringify(custom_metrics)]
    )
  } catch (error: any) {
    console.error('Error saving weekly progress:', error)
    return { success: false, error: error.message || 'Veritabanına kaydedilirken bir hata oluştu.' }
  }

  revalidatePath('/student/ilerleme')
  revalidatePath('/student/dashboard')
  return { success: true }
}

const PHOTO_URL_EXPIRES_IN = 60 * 60

export async function updateProgressEntryPhoto(
  entryId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string; photoUrl?: string | null }> {
  const studentId = await getAuthenticatedStudentId()
  if (!studentId) {
    return { success: false, error: 'Oturum bulunamadı.' }
  }

  const entry = await d1.first<{ student_id: string; custom_metrics: any }>(
    'SELECT student_id, custom_metrics FROM progress_entries WHERE id = ? LIMIT 1',
    [entryId]
  )

  if (!entry) {
    return { success: false, error: 'Kayıt bulunamadı.' }
  }

  if (entry.student_id !== studentId) {
    return { success: false, error: 'Bu işlem için yetkiniz yok.' }
  }

  const photoFile = formData.get('photo')
  if (!photoFile || !(photoFile instanceof File) || photoFile.size === 0) {
    return { success: false, error: 'Dosya seçilmedi.' }
  }

  if (!photoFile.type.startsWith('image/')) {
    return { success: false, error: 'Geçersiz dosya tipi.' }
  }
  if (photoFile.size > 10 * 1024 * 1024) {
    return { success: false, error: 'Fotoğraf 10MB\'tan büyük olamaz.' }
  }

  const extension = photoFile.name.split('.').pop()?.toLowerCase() || 'jpg'
  const safeExtension = extension.replace(/[^a-z0-9]/g, '').slice(0, 8) || 'jpg'
  const path = `${studentId}/${crypto.randomUUID()}-weekly.${safeExtension}`

  const buffer = await photoFile.arrayBuffer()
  const { error: uploadErr } = await cfStorage.upload('progress-photos', path, buffer, photoFile.type)

  if (uploadErr) {
    console.error('Error uploading weekly photo:', uploadErr)
    return { success: false, error: 'Fotoğraf yüklenirken hata oluştu.' }
  }

  let metrics: Record<string, unknown> = {}
  if (entry.custom_metrics) {
    try {
      metrics = typeof entry.custom_metrics === 'string'
        ? JSON.parse(entry.custom_metrics)
        : entry.custom_metrics
    } catch {
      metrics = {}
    }
  }
  metrics.before_photo_path = path

  try {
    await d1.run(
      'UPDATE progress_entries SET custom_metrics = ? WHERE id = ?',
      [JSON.stringify(metrics), entryId]
    )
  } catch (updateError) {
    console.error('Error updating progress entry metrics:', updateError)
    return { success: false, error: 'Kayıt güncellenemedi.' }
  }

  const { data } = await cfStorage.createSignedUrl('progress-photos', path, PHOTO_URL_EXPIRES_IN)
  const signedUrl = data?.signedUrl ?? null

  revalidatePath('/student/ilerleme')
  revalidatePath('/student/dashboard')

  return { success: true, photoUrl: signedUrl }
}

export async function deleteProgressEntryPhoto(
  entryId: string
): Promise<{ success: boolean; error?: string }> {
  const studentId = await getAuthenticatedStudentId()
  if (!studentId) {
    return { success: false, error: 'Oturum bulunamadı.' }
  }

  const entry = await d1.first<{ student_id: string; custom_metrics: any }>(
    'SELECT student_id, custom_metrics FROM progress_entries WHERE id = ? LIMIT 1',
    [entryId]
  )

  if (!entry) {
    return { success: false, error: 'Kayıt bulunamadı.' }
  }

  if (entry.student_id !== studentId) {
    return { success: false, error: 'Bu işlem için yetkiniz yok.' }
  }

  let metrics: Record<string, unknown> = {}
  if (entry.custom_metrics) {
    try {
      metrics = typeof entry.custom_metrics === 'string'
        ? JSON.parse(entry.custom_metrics)
        : entry.custom_metrics
    } catch {
      metrics = {}
    }
  }
  metrics.before_photo_path = null

  try {
    await d1.run(
      'UPDATE progress_entries SET custom_metrics = ? WHERE id = ?',
      [JSON.stringify(metrics), entryId]
    )
  } catch (updateError) {
    console.error('Error deleting progress photo from db:', updateError)
    return { success: false, error: 'Kayıt güncellenemedi.' }
  }

  revalidatePath('/student/ilerleme')
  revalidatePath('/student/dashboard')

  return { success: true }
}
