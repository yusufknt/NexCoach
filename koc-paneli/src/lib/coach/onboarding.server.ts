import { d1 } from '@/lib/cloudflare/d1'
import { cfStorage } from '@/lib/cloudflare/storage'
import type { StudentProfile } from '@/types'

export type StudentOnboardingView = {
  profile: StudentProfile
  photoUrls: {
    frontUrl: string | null
    sideUrl: string | null
    backUrl: string | null
  }
}

// Get student onboarding profile for coach view
export async function getStudentOnboardingProfile(
  studentId: string,
  coachId: string
): Promise<StudentOnboardingView | null> {
  // Verify coach-student relationship
  const relation = await d1.first<{ id: string }>(
    'SELECT id FROM coach_students WHERE coach_id = ? AND student_id = ? LIMIT 1',
    [coachId, studentId]
  )

  if (!relation) return null

  // Get student profile
  const profile = await d1.first<StudentProfile>(
    'SELECT * FROM student_profiles WHERE student_id = ? LIMIT 1',
    [studentId]
  )

  if (!profile) return null

  // Get URLs for photos
  async function getPhotoUrl(path: string | null): Promise<string | null> {
    if (!path) return null
    const { data } = await cfStorage.createSignedUrl('progress-photos', path, 3600)
    return data?.signedUrl ?? null
  }

  const [frontUrl, sideUrl, backUrl] = await Promise.all([
    getPhotoUrl(profile.photo_front_path),
    getPhotoUrl(profile.photo_side_path),
    getPhotoUrl(profile.photo_back_path),
  ])

  return {
    profile,
    photoUrls: { frontUrl, sideUrl, backUrl },
  }
}
