'use server'

import { revalidatePath } from 'next/cache'
import { d1 } from '@/lib/cloudflare/d1'
import { cfStorage } from '@/lib/cloudflare/storage'
import { getAuthenticatedCoachId } from '@/lib/coach/auth'

export type MonthlyReport = {
  id: string
  student_id: string
  coach_id: string
  report_month: string
  coach_comment: string | null
  is_published: boolean
  pdf_path: string | null
  metrics_summary: {
    avg_weight?: number | null
    weight_diff?: number | null
    avg_waist?: number | null
    avg_sleep?: number | null
    avg_steps?: number | null
    avg_diet?: number | null
    avg_energy?: number | null
    bench_max?: number | null
    squat_max?: number | null
    deadlift_max?: number | null
    workouts_completed?: number | null
    workouts_target?: number | null
    weekly_breakdown?: Array<{
      week_number: number
      label: string
      avg_weight: number | null
      avg_waist: number | null
      bench_max: number | null
      squat_max: number | null
      deadlift_max: number | null
      avg_sleep: number | null
      avg_steps: number | null
      avg_diet: number | null
      avg_energy: number | null
      workouts_completed: number
      workouts_target: number
      photo_url: string | null
    }> | null
  }
  created_at: string
  updated_at: string
}

export type ActionResult = { success: true; data?: unknown } | { success: false; error: string }

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

export async function getMonthlyReports(studentId: string): Promise<MonthlyReport[]> {
  const coachId = await getAuthenticatedCoachId()
  if (!coachId) return []

  try {
    const data = await d1.query<any>(
      `SELECT * FROM monthly_reports 
       WHERE student_id = ? AND coach_id = ? 
       ORDER BY report_month DESC`,
      [studentId, coachId]
    )

    return (data ?? []).map((row) => {
      let metrics = {}
      if (row.metrics_summary) {
        try {
          metrics = typeof row.metrics_summary === 'string'
            ? JSON.parse(row.metrics_summary)
            : row.metrics_summary
        } catch {
          metrics = {}
        }
      }
      return {
        ...row,
        is_published: Boolean(row.is_published),
        metrics_summary: metrics,
      }
    })
  } catch (error) {
    console.error('Error fetching monthly reports:', error)
    return []
  }
}

export type SaveMonthlyReportInput = {
  coachStudentId: string
  studentId: string
  reportMonth: string
  coachComment: string
  isPublished: boolean
  metricsSummary: {
    avg_weight?: number | null
    weight_diff?: number | null
    avg_waist?: number | null
    avg_sleep?: number | null
    avg_steps?: number | null
    avg_diet?: number | null
    avg_energy?: number | null
    bench_max?: number | null
    squat_max?: number | null
    deadlift_max?: number | null
    workouts_completed?: number | null
    workouts_target?: number | null
    weekly_breakdown?: Array<{
      week_number: number
      label: string
      avg_weight: number | null
      avg_waist: number | null
      bench_max: number | null
      squat_max: number | null
      deadlift_max: number | null
      avg_sleep: number | null
      avg_steps: number | null
      avg_diet: number | null
      avg_energy: number | null
      workouts_completed: number
      workouts_target: number
      photo_url: string | null
    }> | null
  }
  pdfBase64: string
}

export async function saveMonthlyReport(input: SaveMonthlyReportInput): Promise<ActionResult> {
  const coachId = await getAuthenticatedCoachId()
  if (!coachId) {
    return { success: false, error: 'Oturum bulunamadı.' }
  }

  const {
    coachStudentId,
    studentId,
    reportMonth,
    coachComment,
    isPublished,
    metricsSummary,
    pdfBase64,
  } = input

  if (!coachStudentId || !studentId || !reportMonth) {
    return { success: false, error: 'Öğrenci bilgisi ve ay seçimi zorunludur.' }
  }

  const isLinked = await verifyCoachStudent(coachId, coachStudentId, studentId)
  if (!isLinked) {
    return { success: false, error: 'Öğrenci ilişkisi bulunamadı.' }
  }

  if (!pdfBase64) {
    return { success: false, error: 'Geçersiz PDF dosyası.' }
  }

  let pdfBuffer: Buffer
  try {
    pdfBuffer = Buffer.from(pdfBase64, 'base64')
  } catch (e) {
    console.error('Base64 decode error:', e)
    return { success: false, error: 'PDF verisi okunamadı.' }
  }

  const filename = `${reportMonth}-${crypto.randomUUID()}.pdf`
  const storagePath = `${coachId}/${studentId}/${filename}`

  const { error: uploadError } = await cfStorage.upload(
    'monthly-reports',
    storagePath,
    pdfBuffer,
    'application/pdf'
  )

  if (uploadError) {
    console.error('Error uploading PDF report:', uploadError)
    return { success: false, error: 'PDF dosyası yüklenemedi: ' + uploadError.message }
  }

  const existingReport = await d1.first<{ id: string; pdf_path: string | null }>(
    'SELECT id, pdf_path FROM monthly_reports WHERE student_id = ? AND report_month = ? LIMIT 1',
    [studentId, reportMonth]
  )

  const now = new Date().toISOString()
  const metricsJson = JSON.stringify(metricsSummary || {})

  try {
    if (existingReport) {
      if (existingReport.pdf_path && existingReport.pdf_path !== storagePath) {
        await cfStorage.remove('monthly-reports', [existingReport.pdf_path])
      }

      await d1.run(
        `UPDATE monthly_reports 
         SET coach_id = ?, coach_comment = ?, is_published = ?, pdf_path = ?, metrics_summary = ?, updated_at = ?
         WHERE id = ?`,
        [coachId, coachComment || null, isPublished ? 1 : 0, storagePath, metricsJson, now, existingReport.id]
      )
    } else {
      const id = crypto.randomUUID()
      await d1.run(
        `INSERT INTO monthly_reports (id, student_id, coach_id, report_month, coach_comment, is_published, pdf_path, metrics_summary, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, studentId, coachId, reportMonth, coachComment || null, isPublished ? 1 : 0, storagePath, metricsJson, now, now]
      )
    }
  } catch (err: any) {
    console.error('Error updating report database record:', err)
    await cfStorage.remove('monthly-reports', [storagePath])
    return { success: false, error: 'Rapor kaydedilemedi.' }
  }

  revalidatePath(`/coach/ogrenciler/${coachStudentId}`)
  return { success: true }
}

export async function deleteMonthlyReport(
  reportId: string,
  coachStudentId: string
): Promise<ActionResult> {
  const coachId = await getAuthenticatedCoachId()
  if (!coachId) {
    return { success: false, error: 'Oturum bulunamadı.' }
  }

  const report = await d1.first<{ id: string; pdf_path: string | null; coach_id: string }>(
    'SELECT id, pdf_path, coach_id FROM monthly_reports WHERE id = ? LIMIT 1',
    [reportId]
  )

  if (!report || report.coach_id !== coachId) {
    return { success: false, error: 'Rapor bulunamadı veya yetkiniz yok.' }
  }

  if (report.pdf_path) {
    await cfStorage.remove('monthly-reports', [report.pdf_path])
  }

  try {
    await d1.run('DELETE FROM monthly_reports WHERE id = ? AND coach_id = ?', [reportId, coachId])
  } catch (err: any) {
    console.error('Error deleting report record:', err)
    return { success: false, error: 'Rapor silinemedi.' }
  }

  revalidatePath(`/coach/ogrenciler/${coachStudentId}`)
  return { success: true }
}

export async function publishMonthlyReport(
  reportId: string,
  coachStudentId: string
): Promise<ActionResult> {
  const coachId = await getAuthenticatedCoachId()
  if (!coachId) {
    return { success: false, error: 'Oturum bulunamadı.' }
  }

  try {
    await d1.run(
      'UPDATE monthly_reports SET is_published = 1, updated_at = ? WHERE id = ? AND coach_id = ?',
      [new Date().toISOString(), reportId, coachId]
    )
  } catch (err: any) {
    console.error('Error publishing report:', err)
    return { success: false, error: 'Rapor yayınlanamadı.' }
  }

  revalidatePath(`/coach/ogrenciler/${coachStudentId}`)
  return { success: true }
}

export async function getReportSignedUrl(reportId: string): Promise<string | null> {
  const report = await d1.first<{ pdf_path: string | null }>(
    'SELECT pdf_path FROM monthly_reports WHERE id = ? LIMIT 1',
    [reportId]
  )

  if (!report?.pdf_path) {
    return null
  }

  const { data, error } = await cfStorage.createSignedUrl('monthly-reports', report.pdf_path, 3600)
  if (error || !data?.signedUrl) {
    return null
  }

  return data.signedUrl
}
