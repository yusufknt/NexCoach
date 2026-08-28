import { d1 } from '@/lib/cloudflare/d1'
import { cfStorage } from '@/lib/cloudflare/storage'
import { getAuthenticatedCoachId } from '@/lib/coach/auth'
import type { ProgressEntry } from '@/types'

const PHOTO_URL_EXPIRES_IN = 60 * 60

export type CreateProgressEntryInput = {
  coachStudentId: string
  studentId: string
  date: string
  weight: number | null
  note: string | null
  customMetrics: Record<string, unknown>
}

export type CreateProgressEntryResult =
  | { success: true }
  | { success: false; error: string }

export async function getProgressEntries(
  studentId: string
): Promise<ProgressEntry[] | null> {
  const coachId = await getAuthenticatedCoachId()
  if (!coachId) {
    return null
  }

  const rows = await d1.query<any>(
    `SELECT * FROM progress_entries 
     WHERE coach_id = ? AND student_id = ? 
     ORDER BY date ASC`,
    [coachId, studentId]
  )

  if (!rows) {
    return []
  }

  return Promise.all(
    rows.map(async (entry) => {
      let customMetrics: Record<string, unknown> = {}
      if (entry.custom_metrics) {
        try {
          customMetrics = typeof entry.custom_metrics === 'string'
            ? JSON.parse(entry.custom_metrics)
            : entry.custom_metrics
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
        ...entry,
        weight: entry.weight !== null ? Number(entry.weight) : null,
        custom_metrics: customMetrics,
        before_photo_url: beforePhotoUrl,
        after_photo_url: afterPhotoUrl,
      }
    })
  )
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
