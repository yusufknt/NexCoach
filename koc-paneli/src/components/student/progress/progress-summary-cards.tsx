import { Card, CardContent } from '@/components/ui/card'
import { TrendingDown, TrendingUp, Minus } from 'lucide-react'
import type { ProgressSummary } from '@/lib/student/types'

type ProgressSummaryCardsProps = {
  summary: ProgressSummary
}

export function ProgressSummaryCards({ summary }: ProgressSummaryCardsProps) {
  const DiffIcon = summary.difference == null ? Minus
    : summary.difference < 0 ? TrendingDown : TrendingUp
  const diffColor = summary.difference == null ? 'text-muted-foreground'
    : summary.difference < 0 ? 'text-primary' : 'text-red-400'

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card className="surface-card">
        <CardContent className="p-5">
          <p className="text-xs text-muted-foreground">Başlangıç</p>
          <p className="text-2xl font-bold text-foreground">
            {summary.startWeight != null ? `${summary.startWeight} kg` : '—'}
          </p>
        </CardContent>
      </Card>
      <Card className="surface-card">
        <CardContent className="p-5">
          <p className="text-xs text-muted-foreground">Mevcut</p>
          <p className="text-2xl font-bold text-foreground">
            {summary.currentWeight != null ? `${summary.currentWeight} kg` : '—'}
          </p>
        </CardContent>
      </Card>
      <Card className="surface-card">
        <CardContent className="flex items-center gap-3 p-5">
          <DiffIcon className={`h-6 w-6 ${diffColor}`} />
          <div>
            <p className="text-xs text-muted-foreground">Fark</p>
            <p className={`text-2xl font-bold ${diffColor}`}>
              {summary.difference != null
                ? `${summary.difference > 0 ? '+' : ''}${summary.difference.toFixed(1)} kg`
                : '—'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
