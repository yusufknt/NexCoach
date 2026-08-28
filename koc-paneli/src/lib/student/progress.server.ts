import { d1 } from '@/lib/cloudflare/d1'
import { cfStorage } from '@/lib/cloudflare/storage'
import type { ProgressSummary, ProgressEntryItem } from './types'

const PHOTO_URL_EXPIRES_IN = 60 * 60

export async function getProgressData(studentId: string): Promise<{
  summary: ProgressSummary
  entries: ProgressEntryItem[]
  coachId: string | null
}> {
  // Get coach_id
  const rel = await d1.first<{ coach_id: string }>(
    "SELECT coach_id FROM coach_students WHERE student_id = ? AND status = 'active' LIMIT 1",
    [studentId]
  )

  const coachId = rel?.coach_id ?? null

  // All progress entries
  const entries = await d1.query<any>(
    'SELECT * FROM progress_entries WHERE student_id = ? ORDER BY date ASC',
    [studentId]
  )

  const allEntries = entries ?? []
  const weightsOnly = allEntries.filter((e) => e.weight != null)

  const startWeight = weightsOnly.length > 0 ? Number(weightsOnly[0].weight) : null
  const currentWeight = weightsOnly.length > 0 ? Number(weightsOnly[weightsOnly.length - 1].weight) : null
  const difference = startWeight != null && currentWeight != null ? currentWeight - startWeight : null

  const mapped: ProgressEntryItem[] = await Promise.all(
    allEntries.map(async (e) => {
      let customMetrics: Record<string, any> = {}
      if (e.custom_metrics) {
        try {
          customMetrics = typeof e.custom_metrics === 'string'
            ? JSON.parse(e.custom_metrics)
            : e.custom_metrics
        } catch {
          customMetrics = {}
        }
      }

      const beforePhotoPath =
        typeof customMetrics.before_photo_path === 'string'
          ? customMetrics.before_photo_path
          : null
      const afterPhotoPath =
        typeof customMetrics.after_photo_path === 'string'
          ? customMetrics.after_photo_path
          : null

      const [beforePhotoUrl, afterPhotoUrl] = await Promise.all([
        createSignedProgressPhotoUrl(beforePhotoPath),
        createSignedProgressPhotoUrl(afterPhotoPath),
      ])

      return {
        id: e.id,
        date: e.date,
        weight: e.weight != null ? Number(e.weight) : null,
        note: e.note,
        beforePhotoUrl,
        afterPhotoUrl,
        createdAt: e.created_at,
        isOwnEntry: e.student_id === studentId && e.coach_id !== studentId,
        customMetrics,
      }
    })
  )

  mapped.reverse()

  return {
    summary: { startWeight, currentWeight, difference },
    entries: mapped,
    coachId,
  }
}

async function createSignedProgressPhotoUrl(path: string | null) {
  if (!path) {
    return null
  }

  const { data, error } = await cfStorage.createSignedUrl(
    'progress-photos',
    path,
    PHOTO_URL_EXPIRES_IN
  )

  if (error || !data) {
    return null
  }

  return data.signedUrl
}
