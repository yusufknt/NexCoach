import { d1 } from '@/lib/cloudflare/d1'
import { cfStorage } from '@/lib/cloudflare/storage'
import type { OnboardingStatus } from './types'
import type { StudentProfile } from '@/types'

// Check if a student has completed onboarding
export async function checkOnboardingStatus(studentId: string): Promise<OnboardingStatus> {
  const data = await d1.first<{ onboarding_completed: number | boolean }>(
    'SELECT onboarding_completed FROM student_profiles WHERE student_id = ? LIMIT 1',
    [studentId]
  )

  if (!data) {
    return { completed: false, studentProfileExists: false }
  }

  return {
    completed: Boolean(data.onboarding_completed),
    studentProfileExists: true,
  }
}

// Get full student onboarding profile data
export async function getStudentProfile(studentId: string): Promise<StudentProfile | null> {
  const data = await d1.first<StudentProfile>(
    'SELECT * FROM student_profiles WHERE student_id = ? LIMIT 1',
    [studentId]
  )

  if (!data) {
    return null
  }

  return {
    ...data,
    onboarding_completed: Boolean(data.onboarding_completed),
  }
}

// Get signed URLs for onboarding photos
export async function getOnboardingPhotoUrls(profile: StudentProfile): Promise<{
  frontUrl: string | null
  sideUrl: string | null
  backUrl: string | null
}> {
  async function getSignedUrl(path: string | null): Promise<string | null> {
    if (!path) return null
    const { data } = await cfStorage.createSignedUrl('progress-photos', path, 3600)
    return data?.signedUrl ?? null
  }

  const [frontUrl, sideUrl, backUrl] = await Promise.all([
    getSignedUrl(profile.photo_front_path),
    getSignedUrl(profile.photo_side_path),
    getSignedUrl(profile.photo_back_path),
  ])

  return { frontUrl, sideUrl, backUrl }
}
