'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts'
import { ArrowDownRight, ArrowUpRight, TrendingDown, TrendingUp } from 'lucide-react'
import type { MonthlyRevenue, MonthlyStudentGrowth } from '@/lib/coach/types'

type DashboardChartsProps = {
  revenue: MonthlyRevenue[]
  growth: MonthlyStudentGrowth[]
}

type CustomTooltipProps = {
  active?: boolean
  payload?: { value?: number | string; name?: string }[]
  label?: string
  isCurrency?: boolean
}

const CustomChartTooltip = ({
  active,
  payload,
  label,
  isCurrency = false,
}: CustomTooltipProps) => {
  if (active && payload && payload.length > 0) {
    const val = Number(payload[0].value ?? 0)
    const formatted = isCurrency
      ? `₺${val.toLocaleString('tr-TR')}`
      : `${val} Danışan`

    return (
      <div className="rounded-xl border border-border/80 bg-white p-3 shadow-lg ring-1 ring-black/5 dark:bg-slate-900">
        <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-sm font-bold text-foreground">{formatted}</p>
      </div>
    )
  }
  return null
}

export function DashboardCharts({ revenue, growth }: DashboardChartsProps) {
  const [activeTab, setActiveTab] = useState<'month' | 'year'>('month')

  const latestYear = revenue[revenue.length - 1]?.period.slice(0, 4)
    ?? growth[growth.length - 1]?.period.slice(0, 4)
  const selectedRevenue = activeTab === 'month'
    ? revenue.slice(-6)
    : revenue.filter((item) => item.period.startsWith(latestYear ?? ''))
  const selectedGrowth = activeTab === 'month'
    ? growth.slice(-6)
    : growth.filter((item) => item.period.startsWith(latestYear ?? ''))

  const latestRevenue = selectedRevenue[selectedRevenue.length - 1]?.revenue ?? 0
  const previousRevenue = selectedRevenue[selectedRevenue.length - 2]?.revenue ?? 0
  const revenueChange = previousRevenue === 0
    ? null
    : ((latestRevenue - previousRevenue) / previousRevenue) * 100
  const latestGrowth = selectedGrowth[selectedGrowth.length - 1]?.count ?? 0
  const previousGrowth = selectedGrowth[selectedGrowth.length - 2]?.count ?? 0
  const growthDifference = latestGrowth - previousGrowth

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Revenue Trend Chart (Stripe Inspired) */}
      <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs transition-all hover:shadow-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">Gelir Trendi</span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                ₺{latestRevenue.toLocaleString('tr-TR')}
              </span>
              <span className={`inline-flex items-center text-xs font-semibold ${
                revenueChange !== null && revenueChange < 0 ? 'text-rose-600' : 'text-emerald-600'
              }`}>
                {revenueChange !== null && revenueChange < 0
                  ? <ArrowDownRight className="mr-0.5 h-3.5 w-3.5" />
                  : <ArrowUpRight className="mr-0.5 h-3.5 w-3.5" />}
                {revenueChange === null ? 'Karşılaştırma yok' : `${Math.abs(revenueChange).toFixed(1)}%`}
              </span>
              <span className="text-xs text-muted-foreground">önceki aya göre</span>
            </div>
          </div>

          {/* Segmented Filter Pills */}
          <div className="flex items-center rounded-xl bg-muted/70 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('month')}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                activeTab === 'month'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Son 6 Ay
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('year')}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                activeTab === 'year'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Bu Yıl
            </button>
          </div>
        </div>

        <div className="mt-6 h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={selectedRevenue} barSize={34} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#E2E8F0" strokeDasharray="4 4" opacity={0.6} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                tickFormatter={(v) => `₺${v >= 1000 ? `${v / 1000}k` : v}`}
              />
              <Tooltip
                cursor={{ fill: 'rgba(0, 102, 255, 0.04)', radius: 8 }}
                content={<CustomChartTooltip isCurrency />}
              />
              <Bar dataKey="revenue" radius={[8, 8, 8, 8]}>
                {selectedRevenue.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === selectedRevenue.length - 1 ? '#0066FF' : '#E2E8F0'}
                    className="transition-colors hover:fill-blue-500"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Growth Chart (Linear/Apple Area Chart) */}
      <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs transition-all hover:shadow-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">Danışan Büyümesi</span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                {latestGrowth} Aktif Danışan
              </span>
              <span className={`inline-flex items-center text-xs font-semibold ${
                growthDifference < 0 ? 'text-rose-600' : 'text-blue-600'
              }`}>
                {growthDifference < 0
                  ? <TrendingDown className="mr-1 h-3.5 w-3.5" />
                  : <TrendingUp className="mr-1 h-3.5 w-3.5" />}
                {growthDifference === 0
                  ? 'Değişmedi'
                  : `${Math.abs(growthDifference)} ${growthDifference > 0 ? 'artış' : 'azalış'}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
            <span className="text-xs font-medium text-muted-foreground">Aktif Danışan</span>
          </div>
        </div>

        <div className="mt-6 h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={selectedGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0066FF" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#0066FF" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#E2E8F0" strokeDasharray="4 4" opacity={0.6} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ stroke: '#0066FF', strokeWidth: 1, strokeDasharray: '3 3' }}
                content={<CustomChartTooltip />}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#0066FF"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#growthGradient)"
                dot={{ fill: '#0066FF', strokeWidth: 2, stroke: '#FFFFFF', r: 4 }}
                activeDot={{ fill: '#0066FF', strokeWidth: 2, stroke: '#FFFFFF', r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
