'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { ArrowUpRight, TrendingUp } from 'lucide-react'
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

  // Calculate total latest revenue
  const totalRevenue = revenue.reduce((acc, curr) => acc + (curr.revenue || 0), 0)
  const latestRevenue = revenue[revenue.length - 1]?.revenue || 0
  const latestGrowth = growth[growth.length - 1]?.count || 0

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
              <span className="inline-flex items-center text-xs font-semibold text-emerald-600">
                <ArrowUpRight className="mr-0.5 h-3.5 w-3.5" />
                21.8%
              </span>
              <span className="text-xs text-muted-foreground">bu ay</span>
            </div>
          </div>

          {/* Segmented Filter Pills */}
          <div className="flex items-center rounded-xl bg-muted/70 p-1 text-xs font-semibold">
            <button
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
            <BarChart data={revenue} barSize={34} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
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
                {revenue.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === revenue.length - 1 ? '#0066FF' : '#E2E8F0'}
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
                {latestGrowth} Aktif Üye
              </span>
              <span className="inline-flex items-center text-xs font-semibold text-blue-600">
                <TrendingUp className="mr-1 h-3.5 w-3.5" />
                İstikrarlı Artış
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
            <AreaChart data={growth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
