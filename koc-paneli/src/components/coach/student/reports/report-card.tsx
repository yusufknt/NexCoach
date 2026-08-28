'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Trash2, ExternalLink } from 'lucide-react'
import { getMonthLabel } from './report-utils'
import type { MonthlyReport } from '@/lib/coach/report-actions'

type ReportCardProps = {
  report: MonthlyReport
  onOpenPdf: (reportId: string) => void
  onPublish: (reportId: string) => void
  onDelete: (reportId: string) => void
}

export function ReportCard({ report, onOpenPdf, onPublish, onDelete }: ReportCardProps) {
  return (
    <Card className="coach-card border border-[#444933] overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between bg-[#19191B] pb-3 border-b border-[#2C2C2E]">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#ABD600]" />
          <span className="font-bold text-[#E5E1E4]">{getMonthLabel(report.report_month)}</span>
        </div>
        <div>
          {report.is_published ? (
            <span className="rounded bg-[#ABD600]/10 px-2 py-0.5 text-[10px] font-bold text-[#ABD600]">Yayınlandı</span>
          ) : (
            <span className="rounded bg-yellow-500/10 px-2 py-0.5 text-[10px] font-bold text-yellow-400">Taslak</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {report.coach_comment && (
          <p className="text-xs text-[#C4C9AC] line-clamp-3 italic">
            &ldquo;{report.coach_comment}&rdquo;
          </p>
        )}

        {report.metrics_summary && (
          <div className="grid grid-cols-3 gap-2 bg-[#121214]/50 rounded-lg p-2 text-center text-[10px] text-[#C4C9AC] border border-[#27272A]">
            <div>
              <span className="block text-[#ABD600] font-semibold">
                {report.metrics_summary.weight_diff !== null && report.metrics_summary.weight_diff !== undefined 
                  ? `${report.metrics_summary.weight_diff > 0 ? '+' : ''}${Number(report.metrics_summary.weight_diff).toFixed(1)} kg`
                  : '—'
                }
              </span>
              <span>Kilo Farkı</span>
            </div>
            <div>
              <span className="block text-[#ABD600] font-semibold">
                {report.metrics_summary.avg_waist 
                  ? `${Number(report.metrics_summary.avg_waist).toFixed(1)} cm`
                  : '—'
                }
              </span>
              <span>Ort. Bel</span>
            </div>
            <div>
              <span className="block text-[#ABD600] font-semibold">
                {report.metrics_summary.workouts_completed || 0} G
              </span>
              <span>Antrenman</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-[#27272A]">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenPdf(report.id)}
              className="h-8 text-xs text-[#C4C9AC] hover:bg-[#2A2A2C] hover:text-[#E5E1E4]"
            >
              <ExternalLink className="mr-1 h-3.5 w-3.5" /> PDF
            </Button>
            {!report.is_published && (
              <Button
                size="sm"
                onClick={() => onPublish(report.id)}
                className="h-8 text-xs bg-[#ABD600]/10 text-[#ABD600] hover:bg-[#ABD600]/20"
              >
                Yayınla
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(report.id)}
            className="h-8 w-8 text-white/30 hover:bg-red-500/10 hover:text-red-400 p-0"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
