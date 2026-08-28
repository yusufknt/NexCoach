'use server'

import { revalidatePath } from 'next/cache'
import { d1 } from '@/lib/cloudflare/d1'
import { cfStorage } from '@/lib/cloudflare/storage'
import { getAuthenticatedCoachId } from '@/lib/coach/auth'
import { buildProgramStoragePath } from '@/lib/coach/programs.server'

const MAX_FILE_SIZE = 10 * 1024 * 1024

type ActionResult = { success: true } | { success: false; error: string }

async function verifyCoachStudent(
  coachId: string,
  coachStudentId: string,
  studentId: string
): Promise<boolean> {
  const row = await d1.first<{ id: string }>(
    'SELECT id FROM coach_students WHERE id = ? AND coach_id = ? AND student_id = ? LIMIT 1',
    [coachStudentId, coachId, studentId]
  )
  return Boolean(row)
}

export async function uploadProgram(formData: FormData): Promise<ActionResult> {
  const coachId = await getAuthenticatedCoachId()
  if (!coachId) {
    return { success: false, error: 'Oturum bulunamadı.' }
  }

  const coachStudentId = String(formData.get('coachStudentId') ?? '')
  const studentId = String(formData.get('studentId') ?? '')
  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const file = formData.get('file')

  if (!coachStudentId || !studentId || !title) {
    return { success: false, error: 'Başlık ve öğrenci bilgisi gerekli.' }
  }

  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: 'PDF dosyası seçin.' }
  }

  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    return { success: false, error: 'Sadece PDF dosyası yüklenebilir.' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: 'Dosya boyutu en fazla 10 MB olabilir.' }
  }

  const isLinked = await verifyCoachStudent(coachId, coachStudentId, studentId)
  if (!isLinked) {
    return { success: false, error: 'Öğrenci ilişkisi bulunamadı.' }
  }

  const storagePath = buildProgramStoragePath(coachId, studentId, file.name)
  const fileBuffer = await file.arrayBuffer()

  const { error: uploadError } = await cfStorage.upload(
    'programs',
    storagePath,
    fileBuffer,
    'application/pdf'
  )

  if (uploadError) {
    return { success: false, error: uploadError.message }
  }

  const id = crypto.randomUUID()
  try {
    await d1.run(
      `INSERT INTO programs (id, coach_id, student_id, title, description, file_url, file_name)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, coachId, studentId, title, description || null, storagePath, file.name]
    )
  } catch (err: any) {
    await cfStorage.remove('programs', [storagePath])
    return { success: false, error: err.message || 'Veritabanı kaydı oluşturulamadı.' }
  }

  revalidatePath(`/coach/ogrenciler/${coachStudentId}`)
  return { success: true }
}

export async function deleteProgram(
  programId: string,
  coachStudentId: string
): Promise<ActionResult> {
  const coachId = await getAuthenticatedCoachId()
  if (!coachId) {
    return { success: false, error: 'Oturum bulunamadı.' }
  }

  const program = await d1.first<{ id: string; file_url: string }>(
    'SELECT id, file_url FROM programs WHERE id = ? AND coach_id = ? LIMIT 1',
    [programId, coachId]
  )

  if (!program) {
    return { success: false, error: 'Program bulunamadı.' }
  }

  const { error: storageError } = await cfStorage.remove('programs', [program.file_url])
  if (storageError) {
    return { success: false, error: storageError.message }
  }

  try {
    await d1.run('DELETE FROM programs WHERE id = ? AND coach_id = ?', [programId, coachId])
  } catch (err: any) {
    return { success: false, error: err.message || 'Program silinemedi.' }
  }

  revalidatePath(`/coach/ogrenciler/${coachStudentId}`)
  return { success: true }
}

export async function getProgramDownloadUrl(
  programId: string
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  const coachId = await getAuthenticatedCoachId()
  if (!coachId) {
    return { success: false, error: 'Oturum bulunamadı.' }
  }

  const program = await d1.first<{ file_url: string; file_name: string }>(
    'SELECT file_url, file_name FROM programs WHERE id = ? AND coach_id = ? LIMIT 1',
    [programId, coachId]
  )

  if (!program) {
    return { success: false, error: 'Program bulunamadı.' }
  }

  const { data: signed, error: signError } = await cfStorage.createSignedUrl(
    'programs',
    program.file_url,
    120
  )

  if (signError || !signed?.signedUrl) {
    return { success: false, error: signError?.message ?? 'İndirme linki oluşturulamadı.' }
  }

  return { success: true, url: signed.signedUrl }
}
