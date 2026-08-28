import { d1 } from '@/lib/cloudflare/d1'
import { getAuthenticatedCoachId } from '@/lib/coach/auth'

export type ProgramListItem = {
  id: string
  title: string
  description: string | null
  fileName: string
  filePath: string
  createdAt: string
}

export async function getStudentPrograms(
  studentId: string
): Promise<ProgramListItem[] | null> {
  const coachId = await getAuthenticatedCoachId()
  if (!coachId) {
    return null
  }

  const data = await d1.query<{
    id: string
    title: string
    description: string | null
    file_name: string
    file_url: string
    created_at: string
  }>(
    `SELECT id, title, description, file_name, file_url, created_at 
     FROM programs 
     WHERE coach_id = ? AND student_id = ? 
     ORDER BY created_at DESC`,
    [coachId, studentId]
  )

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    fileName: row.file_name,
    filePath: row.file_url,
    createdAt: row.created_at,
  }))
}

export function buildProgramStoragePath(
  coachId: string,
  studentId: string,
  fileName: string
): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
  return `${coachId}/${studentId}/${Date.now()}-${safeName}`
}
