'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FileText } from 'lucide-react'
import {
  getMonthlyReports,
  saveMonthlyReport,
  deleteMonthlyReport,
  publishMonthlyReport,
  getReportSignedUrl,
  type MonthlyReport
} from '@/lib/coach/report-actions'
import type { ProgressEntry } from '@/types'
import {
  MONTH_NAMES,
  calculateMonthStats,
  getPdfUtils,
} from './reports/report-utils'
import { ReportCard } from './reports/report-card'
import { ReportWizardModal } from './reports/report-wizard-modal'
import { ReportPdfTemplate } from './reports/report-pdf-template'

type ReportsTabProps = {
  coachStudentId: string
  studentId: string
  entries: ProgressEntry[]
}

export function ReportsTab({ coachStudentId, studentId, entries }: ReportsTabProps) {
  const [reports, setReports] = useState<MonthlyReport[]>([])
  const [loading, setLoading] = useState(true)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // Wizard States
  const [selectedMonth, setSelectedMonth] = useState('') // 'YYYY-MM'
  const [coachComment, setCoachComment] = useState('')
  const [isPublished, setIsPublished] = useState(true)

  const pdfTemplateRef = useRef<HTMLDivElement>(null)

  const fetchReports = useCallback(async () => {
    setLoading(true)
    const data = await getMonthlyReports(studentId)
    setReports(data)
    setLoading(false)
  }, [studentId])

  useEffect(() => {
    let active = true
    const run = async () => {
      await Promise.resolve()
      if (active) {
        fetchReports()
      }
    }
    run()
    return () => {
      active = false
    }
  }, [fetchReports])

  const monthOptions = useMemo(() => {
    const options = []
    const d = new Date()
    for (let i = 0; i < 6; i++) {
      const year = d.getFullYear()
      const month = d.getMonth()
      const mStr = String(month + 1).padStart(2, '0')
      const value = `${year}-${mStr}`
      const label = `${MONTH_NAMES[month]} ${year}`
      options.push({ value, label })
      d.setMonth(d.getMonth() - 1)
    }
    return options
  }, [])

  const stats = useMemo(() => {
    return calculateMonthStats(selectedMonth, entries)
  }, [selectedMonth, entries])

  const handleCreateReport = async () => {
    if (!selectedMonth || !stats) {
      setErrorMessage('Lütfen bir ay seçin.')
      return
    }

    setGeneratingPdf(true)
    setErrorMessage(null)

    try {
      const { jsPDF, html2canvas } = await getPdfUtils()
      const templateEl = pdfTemplateRef.current
      if (!templateEl) {
        throw new Error('Template element not found')
      }

      // templateEl.style.display = 'block'
      
      // Wait for images to load
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const canvas = await html2canvas(templateEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#09090b',
        logging: false
      })

      // templateEl.style.display = 'none'

      const imgData = canvas.toDataURL('image/jpeg', 0.9)
      
      // Create a PDF with the exact dimensions of the canvas (single continuous page)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      })

      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height)

      const pdfBlob = pdf.output('blob')
      const reader = new FileReader()
      const pdfBase64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            const base64String = reader.result.split(',')[1]
            resolve(base64String)
          } else {
            reject(new Error('PDF okuma hatası.'))
          }
        }
        reader.onerror = reject
        reader.readAsDataURL(pdfBlob)
      })

      const pdfBase64 = await pdfBase64Promise

      const result = await saveMonthlyReport({
        coachStudentId,
        studentId,
        reportMonth: `${selectedMonth}-01`,
        coachComment,
        isPublished,
        metricsSummary: {
          avg_weight: stats.avgWeight,
          weight_diff: stats.weightDiff,
          avg_waist: stats.avgWaist,
          avg_sleep: stats.avgSleep,
          avg_steps: stats.avgSteps,
          avg_diet: stats.avgDiet,
          avg_energy: stats.avgEnergy,
          bench_max: stats.benchMax,
          squat_max: stats.squatMax,
          deadlift_max: stats.deadliftMax,
          workouts_completed: stats.workoutsCompleted,
          workouts_target: stats.workoutsTarget,
          weekly_breakdown: stats.weeklyBreakdown,
        },
        pdfBase64,
      })

      if (result.success) {
        setWizardOpen(false)
        setCoachComment('')
        setSelectedMonth('')
        fetchReports()
      } else {
        setErrorMessage(result.error || 'Rapor oluşturulurken hata oluştu.')
      }
    } catch (err) {
      const e = err as Error
      console.error(e)
      setErrorMessage(e.message || 'PDF oluşturulurken beklenmedik bir hata oluştu.')
    } finally {
      setGeneratingPdf(false)
    }
  }

  const handleDelete = async (reportId: string) => {
    if (confirm('Bu gelişim raporunu silmek istediğinize emin misiniz?')) {
      const res = await deleteMonthlyReport(reportId, coachStudentId)
      if (res.success) {
        fetchReports()
      } else {
        alert(res.error)
      }
    }
  }

  const handlePublish = async (reportId: string) => {
    const res = await publishMonthlyReport(reportId, coachStudentId)
    if (res.success) {
      fetchReports()
    } else {
      alert(res.error)
    }
  }

  const handleOpenPdf = async (reportId: string) => {
    const url = await getReportSignedUrl(reportId)
    if (url) {
      window.open(url, '_blank')
    } else {
      alert('Rapor indirme linki oluşturulamadı.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">Gelişim Raporları</h3>
          <p className="text-sm text-muted-foreground">Aylık gelişim ve özet PDF raporları.</p>
        </div>
        <Button onClick={() => setWizardOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-1.5 h-4 w-4" /> Yeni Rapor Hazırla
        </Button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-sm text-muted-foreground">Yükleniyor...</div>
      ) : reports.length === 0 ? (
        <Card className="rounded-2xl border border-dashed border-border/80 bg-muted/30">
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
            <p className="text-sm font-medium text-foreground">Henüz Hazırlanmış Rapor Yok</p>
            <p className="text-xs text-muted-foreground mt-1">Öğrencinin aylık gelişim özetini ve yorumlarınızı içeren ilk raporu hazırlayın.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onOpenPdf={handleOpenPdf}
              onPublish={handlePublish}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <ReportWizardModal
        isOpen={wizardOpen}
        onClose={() => { setWizardOpen(false); setSelectedMonth(''); setCoachComment(''); }}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        coachComment={coachComment}
        setCoachComment={setCoachComment}
        isPublished={isPublished}
        setIsPublished={setIsPublished}
        monthOptions={monthOptions}
        stats={stats}
        generatingPdf={generatingPdf}
        errorMessage={errorMessage}
        onSubmit={handleCreateReport}
      />

      <ReportPdfTemplate
        ref={pdfTemplateRef}
        selectedMonth={selectedMonth}
        stats={stats}
        coachComment={coachComment}
      />
    </div>
  )
}
