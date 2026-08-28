'use server'

import { revalidatePath } from 'next/cache'
import { d1 } from '@/lib/cloudflare/d1'
import { cfStorage } from '@/lib/cloudflare/storage'
import { getAuthenticatedCoachId } from '@/lib/coach/auth'
import type { CreateProgressEntryInput, CreateProgressEntryResult } from '@/lib/coach/progress.server'

export async function createProgressEntry(
  input: CreateProgressEntryInput
): Promise<CreateProgressEntryResult> {
  const coachId = await getAuthenticatedCoachId()
  if (!coachId) {
    return { success: false, error: 'Oturum bulunamadı.' }
  }

  const relation = await d1.first<{ id: string }>(
    'SELECT id FROM coach_students WHERE id = ? AND coach_id = ? AND student_id = ? LIMIT 1',
    [input.coachStudentId, coachId, input.studentId]
  )

  if (!relation) {
    return { success: false, error: 'Öğrenci ilişkisi bulunamadı.' }
  }

  const id = crypto.randomUUID()
  try {
    await d1.run(
      `INSERT INTO progress_entries (id, student_id, coach_id, date, weight, note, custom_metrics)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.studentId,
        coachId,
        input.date,
        input.weight,
        input.note,
        JSON.stringify(input.customMetrics || {}),
      ]
    )

    revalidatePath(`/coach/ogrenciler/${input.coachStudentId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Kayıt eklenemedi.' }
  }
}

export async function createProgressEntryFromForm(
  formData: FormData
): Promise<CreateProgressEntryResult> {
  const coachId = await getAuthenticatedCoachId()
  if (!coachId) {
    return { success: false, error: 'Oturum bulunamadı.' }
  }

  const coachStudentId = String(formData.get('coachStudentId') ?? '')
  const studentId = String(formData.get('studentId') ?? '')
  const date = String(formData.get('date') ?? '')
  const weightRaw = String(formData.get('weight') ?? '').trim()
  const noteRaw = String(formData.get('note') ?? '').trim()
  const customMetricsRaw = String(formData.get('customMetricsJson') ?? '').trim()
  const beforePhoto = formData.get('beforePhoto')
  const afterPhoto = formData.get('afterPhoto')

  if (!coachStudentId || !studentId || !date) {
    return { success: false, error: 'Tarih ve öğrenci bilgisi zorunludur.' }
  }

  const weight = weightRaw ? Number(weightRaw) : null
  if (weightRaw && Number.isNaN(weight)) {
    return { success: false, error: 'Geçerli bir kilo değeri girin.' }
  }

  let customMetrics: Record<string, unknown> = {}
  if (customMetricsRaw) {
    try {
      const parsed: unknown = JSON.parse(customMetricsRaw)
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return { success: false, error: 'Özel metrikler JSON nesnesi olmalı.' }
      }
      customMetrics = parsed as Record<string, unknown>
    } catch {
      return { success: false, error: 'Özel metrikler geçerli JSON olmalı.' }
    }
  }

  const relation = await d1.first<{ id: string }>(
    'SELECT id FROM coach_students WHERE id = ? AND coach_id = ? AND student_id = ? LIMIT 1',
    [coachStudentId, coachId, studentId]
  )

  if (!relation) {
    return { success: false, error: 'Öğrenci ilişkisi bulunamadı.' }
  }

  const beforePhotoPath = await uploadProgressPhoto(coachId, studentId, beforePhoto, 'before')
  const afterPhotoPath = await uploadProgressPhoto(coachId, studentId, afterPhoto, 'after')

  if (beforePhotoPath === false || afterPhotoPath === false) {
    return { success: false, error: 'Fotoğraf yüklenemedi.' }
  }

  if (beforePhotoPath) {
    customMetrics.before_photo_path = beforePhotoPath
  }
  if (afterPhotoPath) {
    customMetrics.after_photo_path = afterPhotoPath
  }

  const id = crypto.randomUUID()
  try {
    await d1.run(
      `INSERT INTO progress_entries (id, student_id, coach_id, date, weight, note, custom_metrics)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        studentId,
        coachId,
        date,
        weight,
        noteRaw || null,
        JSON.stringify(customMetrics),
      ]
    )

    revalidatePath(`/coach/ogrenciler/${coachStudentId}`)
    revalidatePath('/student/ilerleme')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Kayıt eklenemedi.' }
  }
}

async function uploadProgressPhoto(
  coachId: string,
  studentId: string,
  fileValue: FormDataEntryValue | null,
  kind: 'before' | 'after'
): Promise<string | null | false> {
  if (!(fileValue instanceof File) || fileValue.size === 0) {
    return null
  }

  if (!fileValue.type.startsWith('image/')) {
    return false
  }

  const extension = fileValue.name.split('.').pop()?.toLowerCase() || 'jpg'
  const safeExtension = extension.replace(/[^a-z0-9]/g, '').slice(0, 8) || 'jpg'
  const path = `${coachId}/${studentId}/${crypto.randomUUID()}-${kind}.${safeExtension}`

  const buffer = await fileValue.arrayBuffer()
  const { error } = await cfStorage.upload('progress-photos', path, buffer, fileValue.type)

  if (error) {
    return false
  }

  return path
}
