import { d1 } from '@/lib/cloudflare/d1'
import { cfStorage } from '@/lib/cloudflare/storage'
import type { StudentProgram } from './types'

export async function getStudentPrograms(studentId: string): Promise<StudentProgram[]> {
  const data = await d1.query<{
    id: string
    title: string
    description: string | null
    file_url: string
    file_name: string
    created_at: string
  }>(
    `SELECT * FROM programs 
     WHERE student_id = ? 
     ORDER BY created_at DESC`,
    [studentId]
  )

  const threeDaysAgo = Date.now() - 3 * 86400000

  const programs = await Promise.all(
    (data ?? []).map(async (p) => {
      let fileUrl = p.file_url

      // Generate signed URL
      const { data: signedData, error: signError } = await cfStorage.createSignedUrl(
        'programs',
        p.file_url,
        3600
      )

      if (!signError && signedData?.signedUrl) {
        fileUrl = signedData.signedUrl
      }

      return {
        id: p.id,
        title: p.title,
        description: p.description,
        fileUrl,
        fileName: p.file_name,
        createdAt: p.created_at,
        isNew: new Date(p.created_at).getTime() > threeDaysAgo,
      }
    })
  )

  return programs
}
