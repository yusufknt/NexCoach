import { redirect } from 'next/navigation'
import { getAuthenticatedStudentId } from '@/lib/student/auth'
import { d1 } from '@/lib/cloudflare/d1'
import { ReportsClient } from '@/components/student/reports-client'
import { CoachPageHeader } from '@/components/coach/page-header'
import type { MonthlyReport } from '@/lib/coach/report-actions'

export default async function StudentReportsPage() {
  const studentId = await getAuthenticatedStudentId()
  if (!studentId) redirect('/giris')

  const reports = await d1.query<any>(
    'SELECT * FROM monthly_reports WHERE student_id = ? AND is_published = 1 ORDER BY report_month DESC',
    [studentId]
  )

  const mappedReports = (reports ?? []).map((r) => {
    let metrics = {}
    if (r.metrics_summary) {
      try {
        metrics = typeof r.metrics_summary === 'string' ? JSON.parse(r.metrics_summary) : r.metrics_summary
      } catch {
        metrics = {}
      }
    }
    return {
      id: r.id,
      report_month: r.report_month,
      coach_comment: r.coach_comment,
      metrics_summary: metrics,
      created_at: r.created_at,
    }
  })

  return (
    <div className="coach-page">
      <div className="coach-container space-y-8">
        <CoachPageHeader
          eyebrow="Student Portal"
          title="Aylık Raporlarım"
          description="Koçunuz tarafından hazırlanan aylık gelişim ve ölçüm analizleriniz."
        />
        <ReportsClient initialReports={mappedReports} />
      </div>
    </div>
  )
}
