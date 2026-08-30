'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Calendar, FileText, ExternalLink, Dumbbell, Scale, MessageSquare
} from 'lucide-react'
import { formatDate } from '@/lib/coach/format'
import { getReportSignedUrl } from '@/lib/coach/report-actions'

type MonthlyReportItem = {
  id: string
  report_month: string
  coach_comment: string | null
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
}

type ReportsClientProps = {
  initialReports: MonthlyReportItem[]
}

const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
]

export function ReportsClient({ initialReports }: ReportsClientProps) {
  const [reports] = useState<MonthlyReportItem[]>(initialReports)

  const handleOpenPdf = async (reportId: string) => {
    const url = await getReportSignedUrl(reportId)
    if (url) {
      window.open(url, '_blank')
    } else {
      alert('Rapor yüklenemedi. Lütfen tekrar deneyin.')
    }
  }

  const getMonthLabel = (dateStr: string) => {
    const parts = dateStr.split('-')
    const monthIndex = parseInt(parts[1]) - 1
    const year = parts[0]
    return `${MONTH_NAMES[monthIndex]} ${year}`
  }

  return (
    <div className="space-y-6">
      {reports.length === 0 ? (
        <Card className="surface-card">
          <CardContent className="py-16 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Henüz Yayınlanmış Raporunuz Yok</p>
            <p className="text-xs text-muted-foreground mt-1">Koçunuz aylık gelişim raporunuzu hazırlayıp yayınladığında burada görünecektir.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {reports.map((report) => {
            const summary = report.metrics_summary || {}
            return (
              <Card key={report.id} className="surface-card border border-border/60 overflow-hidden flex flex-col justify-between">
                <div>
                  <CardHeader className="flex flex-row items-center justify-between bg-muted/30 pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="font-bold text-foreground">{getMonthLabel(report.report_month)}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{formatDate(report.created_at)}</span>
                  </CardHeader>
                  
                  <CardContent className="p-5 space-y-4">
                    {/* Coach Comment */}
                    {report.coach_comment && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" /> Koçun Notu
                        </span>
                        <p className="text-xs text-muted-foreground italic bg-muted/30 border border-border rounded-lg p-3 line-clamp-4 leading-relaxed">
                          &ldquo;{report.coach_comment}&rdquo;
                        </p>
                      </div>
                    )}

                    {/* Physical Metrics Grid */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                        <Scale className="h-3 w-3" /> Aylık Ağırlık & Ölçü Ortalamaları
                      </span>
                      <div className="grid grid-cols-2 gap-2 bg-muted/30 border border-border rounded-xl p-3 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Aylık Değişim:</span>
                          <span className={`font-semibold ${summary.weight_diff && summary.weight_diff < 0 ? 'text-primary' : 'text-red-400'}`}>
                            {summary.weight_diff !== undefined && summary.weight_diff !== null 
                              ? `${summary.weight_diff > 0 ? '+' : ''}${Number(summary.weight_diff).toFixed(1)} kg`
                              : '—'
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Ortalama Bel:</span>
                          <span className="font-semibold text-foreground">
                            {summary.avg_waist 
                              ? `${Number(summary.avg_waist).toFixed(1)} cm`
                              : '—'
                            }
                          </span>
                        </div>
                        <div className="flex justify-between col-span-2 border-t border-border pt-1.5 mt-1">
                          <span className="text-muted-foreground">Antrenman Uyum Oranı:</span>
                          <span className="font-semibold text-foreground">
                            {summary.workouts_completed || 0} / {summary.workouts_target || 0} Gün
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Lift Progression */}
                    {(summary.bench_max || summary.squat_max || summary.deadlift_max) && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                          <Dumbbell className="h-3 w-3" /> En Yüksek Kaldırışlar
                        </span>
                        <div className="grid grid-cols-3 gap-2 bg-muted/30 border border-border rounded-xl p-2.5 text-center text-xs">
                          <div>
                            <span className="text-[10px] text-muted-foreground block">Bench</span>
                            <span className="font-bold text-foreground">{summary.bench_max ? `${summary.bench_max} kg` : '—'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground block">Squat</span>
                            <span className="font-bold text-foreground">{summary.squat_max ? `${summary.squat_max} kg` : '—'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground block">Deadlift</span>
                            <span className="font-bold text-foreground">{summary.deadlift_max ? `${summary.deadlift_max} kg` : '—'}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </div>

                <div className="p-5 pt-0 border-t border-border mt-2">
                  <Button
                    onClick={() => handleOpenPdf(report.id)}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary font-bold py-2 rounded-xl transition duration-200 flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" /> PDF Gelişim Raporunu Aç
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
