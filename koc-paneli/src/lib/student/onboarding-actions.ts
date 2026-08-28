'use server'

import { revalidatePath } from 'next/cache'
import { d1 } from '@/lib/cloudflare/d1'
import { cfStorage } from '@/lib/cloudflare/storage'
import { getAuthenticatedStudentId } from '@/lib/student/auth'

type OnboardingResult = {
  success: boolean
  error?: string
}

export async function submitOnboarding(
  formData: FormData
): Promise<OnboardingResult> {
  const studentId = await getAuthenticatedStudentId()
  if (!studentId) {
    return { success: false, error: 'Oturum bulunamadı.' }
  }

  // Parse form fields
  const heightCm = parseFloat(String(formData.get('heightCm') ?? ''))
  const birthDate = String(formData.get('birthDate') ?? '')
  const gender = String(formData.get('gender') ?? '')
  const experience = String(formData.get('experience') ?? '')
  const goal = String(formData.get('goal') ?? '')
  const initialWeight = parseFloat(String(formData.get('initialWeight') ?? ''))

  // Validate required fields
  if (!heightCm || !birthDate || !gender || !experience || !goal || !initialWeight) {
    return { success: false, error: 'Zorunlu alanlar eksik: boy, doğum tarihi, cinsiyet, deneyim, hedef ve kilo.' }
  }

  if (!['male', 'female'].includes(gender)) {
    return { success: false, error: 'Geçersiz cinsiyet değeri.' }
  }
  if (!['beginner', '1-3years', '3plus'].includes(experience)) {
    return { success: false, error: 'Geçersiz deneyim değeri.' }
  }
  if (!['muscle_gain', 'fat_loss', 'recomposition', 'strength'].includes(goal)) {
    return { success: false, error: 'Geçersiz hedef değeri.' }
  }

  // Parse optional measurement fields
  const parseOptional = (key: string): number | null => {
    const val = String(formData.get(key) ?? '').trim()
    if (!val) return null
    const num = parseFloat(val)
    return Number.isNaN(num) ? null : num
  }

  const chestCm = parseOptional('chestCm')
  const waistCm = parseOptional('waistCm')
  const hipCm = parseOptional('hipCm')
  const neckCm = parseOptional('neckCm')
  const rightUpperArmCm = parseOptional('rightUpperArmCm')
  const leftUpperArmCm = parseOptional('leftUpperArmCm')
  const rightThighCm = parseOptional('rightThighCm')
  const leftThighCm = parseOptional('leftThighCm')
  const rightCalfCm = parseOptional('rightCalfCm')
  const leftCalfCm = parseOptional('leftCalfCm')
  const bodyFatPercentage = parseOptional('bodyFatPercentage')

  // Parse optional text fields
  const injuries = String(formData.get('injuries') ?? '').trim() || null
  const supplements = String(formData.get('supplements') ?? '').trim() || null

  // Upload photos
  const frontPhoto = formData.get('photoFront')
  const sidePhoto = formData.get('photoSide')
  const backPhoto = formData.get('photoBack')

  const photoFrontPath = await uploadOnboardingPhoto(studentId, frontPhoto, 'front')
  const photoSidePath = await uploadOnboardingPhoto(studentId, sidePhoto, 'side')
  const photoBackPath = await uploadOnboardingPhoto(studentId, backPhoto, 'back')

  if (photoFrontPath === false || photoSidePath === false || photoBackPath === false) {
    return { success: false, error: 'Fotoğraf yüklenirken bir hata oluştu.' }
  }

  // Check if profile already exists
  const existing = await d1.first<{ id: string }>(
    'SELECT id FROM student_profiles WHERE student_id = ? LIMIT 1',
    [studentId]
  )

  const now = new Date().toISOString()

  try {
    if (existing) {
      await d1.run(
        `UPDATE student_profiles SET
          height_cm = ?,
          birth_date = ?,
          gender = ?,
          experience = ?,
          goal = ?,
          initial_weight = ?,
          chest_cm = ?,
          waist_cm = ?,
          hip_cm = ?,
          neck_cm = ?,
          right_upper_arm_cm = ?,
          left_upper_arm_cm = ?,
          right_thigh_cm = ?,
          left_thigh_cm = ?,
          right_calf_cm = ?,
          left_calf_cm = ?,
          body_fat_percentage = ?,
          photo_front_path = COALESCE(?, photo_front_path),
          photo_side_path = COALESCE(?, photo_side_path),
          photo_back_path = COALESCE(?, photo_back_path),
          injuries = ?,
          supplements = ?,
          onboarding_completed = 1,
          updated_at = ?
        WHERE student_id = ?`,
        [
          heightCm, birthDate, gender, experience, goal, initialWeight,
          chestCm, waistCm, hipCm, neckCm, rightUpperArmCm, leftUpperArmCm,
          rightThighCm, leftThighCm, rightCalfCm, leftCalfCm, bodyFatPercentage,
          photoFrontPath || null, photoSidePath || null, photoBackPath || null,
          injuries, supplements, now, studentId
        ]
      )
    } else {
      const id = crypto.randomUUID()
      await d1.run(
        `INSERT INTO student_profiles (
          id, student_id, height_cm, birth_date, gender, experience, goal, initial_weight,
          chest_cm, waist_cm, hip_cm, neck_cm, right_upper_arm_cm, left_upper_arm_cm,
          right_thigh_cm, left_thigh_cm, right_calf_cm, left_calf_cm, body_fat_percentage,
          photo_front_path, photo_side_path, photo_back_path, injuries, supplements,
          onboarding_completed, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          1, ?, ?
        )`,
        [
          id, studentId, heightCm, birthDate, gender, experience, goal, initialWeight,
          chestCm, waistCm, hipCm, neckCm, rightUpperArmCm, leftUpperArmCm,
          rightThighCm, leftThighCm, rightCalfCm, leftCalfCm, bodyFatPercentage,
          photoFrontPath || null, photoSidePath || null, photoBackPath || null, injuries, supplements,
          now, now
        ]
      )
    }
  } catch (error: any) {
    console.error('Error saving student profile:', error)
    return { success: false, error: error.message || 'Profil kaydedilirken bir hata oluştu.' }
  }

  revalidatePath('/student/dashboard')
  revalidatePath('/student/onboarding')
  return { success: true }
}

async function uploadOnboardingPhoto(
  studentId: string,
  fileValue: FormDataEntryValue | null,
  kind: 'front' | 'side' | 'back'
): Promise<string | null | false> {
  if (!(fileValue instanceof File) || fileValue.size === 0) {
    return null
  }

  if (!fileValue.type.startsWith('image/')) {
    return false
  }

  if (fileValue.size > 10 * 1024 * 1024) {
    return false
  }

  const extension = fileValue.name.split('.').pop()?.toLowerCase() || 'jpg'
  const safeExtension = extension.replace(/[^a-z0-9]/g, '').slice(0, 8) || 'jpg'
  const path = `${studentId}/${crypto.randomUUID()}-${kind}.${safeExtension}`

  const buffer = await fileValue.arrayBuffer()
  const { error } = await cfStorage.upload('progress-photos', path, buffer, fileValue.type)

  if (error) {
    console.error(`Error uploading onboarding photo (${kind}):`, error)
    return false
  }

  return path
}

export async function updateStudentOnboardingPhoto(
  formData: FormData,
  kind: 'front' | 'side' | 'back'
): Promise<{ success: boolean; error?: string; photoUrl?: string | null }> {
  const studentId = await getAuthenticatedStudentId()
  if (!studentId) {
    return { success: false, error: 'Oturum bulunamadı.' }
  }

  const photoFile = formData.get('photo')
  if (!photoFile) {
    return { success: false, error: 'Dosya seçilmedi.' }
  }

  const photoPath = await uploadOnboardingPhoto(studentId, photoFile, kind)
  if (photoPath === false) {
    return { success: false, error: 'Fotoğraf yüklenirken bir hata oluştu (Geçersiz format veya >10MB).' }
  }

  const dbColumn = `photo_${kind}_path`
  try {
    await d1.run(
      `UPDATE student_profiles SET ${dbColumn} = ?, updated_at = ? WHERE student_id = ?`,
      [photoPath, new Date().toISOString(), studentId]
    )
  } catch (dbError) {
    console.error('Error updating student profile photo path:', dbError)
    return { success: false, error: 'Veritabanı güncellenirken hata oluştu.' }
  }

  let signedUrl: string | null = null
  if (photoPath) {
    const { data } = await cfStorage.createSignedUrl('progress-photos', photoPath, 3600)
    signedUrl = data?.signedUrl ?? null
  }

  revalidatePath('/student/profil')
  revalidatePath('/student/dashboard')

  return { success: true, photoUrl: signedUrl }
}

export async function deleteStudentOnboardingPhoto(
  kind: 'front' | 'side' | 'back'
): Promise<{ success: boolean; error?: string }> {
  const studentId = await getAuthenticatedStudentId()
  if (!studentId) {
    return { success: false, error: 'Oturum bulunamadı.' }
  }

  const dbColumn = `photo_${kind}_path`
  try {
    await d1.run(
      `UPDATE student_profiles SET ${dbColumn} = NULL, updated_at = ? WHERE student_id = ?`,
      [new Date().toISOString(), studentId]
    )
  } catch (dbError) {
    console.error('Error deleting student profile photo path:', dbError)
    return { success: false, error: 'Fotoğraf silinirken veritabanı hatası oluştu.' }
  }

  revalidatePath('/student/profil')
  revalidatePath('/student/dashboard')

  return { success: true }
}
