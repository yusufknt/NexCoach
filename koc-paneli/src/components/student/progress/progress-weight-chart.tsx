'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

export type TimeRange = '1w' | '1m' | 'all'

type ProgressTooltipProps = {
  active?: boolean
  payload?: { value?: number | string }[]
  label?: string
}

function CustomTooltip({ active, payload, label }: ProgressTooltipProps) {
  if (active && payload?.[0]) {
    return (
      <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs shadow-lg">
        <p className="text-muted-foreground">{label}</p>
        <p className="font-medium text-foreground">{payload[0].value} kg</p>
      </div>
    )
  }
  return null
}

type ProgressWeightChartProps = {
  chartData: { date: string; weight: number }[]
  timeRange: TimeRange
  setTimeRange: (r: TimeRange) => void
}

export function ProgressWeightChart({
  chartData,
  timeRange,
  setTimeRange,
}: ProgressWeightChartProps) {
  return (
    <Card className="surface-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold text-muted-foreground">Kilo Değişimi</CardTitle>
        <div className="flex items-center gap-1">
          {(['1w', '1m', 'all'] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                timeRange === r ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {r === '1w' ? '1 Hafta' : r === '1m' ? '1 Ay' : 'Tümü'}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(196,201,172,0.08)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#C4C9AC', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#C4C9AC', fontSize: 11 }} domain={['auto', 'auto']} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="var(--primary)"
                  strokeWidth={2.5}
                  dot={{ fill: '#ABD600', strokeWidth: 0, r: 4 }}
                  activeDot={{ fill: '#C3F400', strokeWidth: 0, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">Henüz veri yok.</p>
        )}
      </CardContent>
    </Card>
  )
}
