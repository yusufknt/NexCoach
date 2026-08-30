'use client'

import { useState } from 'react'
import { ResponsiveContainer } from 'recharts'
import type { ProgressEntry } from '@/types'
import { formatDate } from '@/lib/coach/format'
import {
  BodyAreaChart,
  LiftsLineChart,
  LifestyleLineChart,
  StepsAreaChart,
  type ChartDataPoint,
} from './progress-chart-views'

type ProgressChartProps = {
  entries: ProgressEntry[]
}

type TabType = 'body' | 'lifts' | 'lifestyle' | 'steps'

export function ProgressChart({ entries }: ProgressChartProps) {
  const [activeTab, setActiveTab] = useState<TabType>('body')

  const chartData: ChartDataPoint[] = entries
    .map((entry) => {
      const m = entry.custom_metrics || {}
      
      const waist = m.waist_cm ?? m.waist
      const bench = m.bench_press_max ?? m.bench
      const squat = m.squat_max ?? m.squat
      const dead = m.deadlift_max ?? m.deadlift
      const sleep = m.sleep_hours_avg ?? m.sleep
      const steps = m.steps_avg ?? m.steps
      const diet = m.diet_compliance ?? m.diet
      const energy = m.energy_level ?? m.energy

      return {
        date: entry.date,
        label: formatDate(entry.date),
        weight: entry.weight ? parseFloat(entry.weight.toString()) : null,
        waist: waist ? parseFloat(waist.toString()) : null,
        bench: bench ? parseFloat(bench.toString()) : null,
        squat: squat ? parseFloat(squat.toString()) : null,
        deadlift: dead ? parseFloat(dead.toString()) : null,
        sleep: sleep ? parseFloat(sleep.toString()) : null,
        steps: steps ? parseFloat(steps.toString()) : null,
        diet: diet ? parseFloat(diet.toString()) : null,
        energy: energy ? parseFloat(energy.toString()) : null,
      }
    })
    .sort((a, b) => a.date.localeCompare(b.date))

  if (chartData.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border/60 bg-muted/30 p-8 text-center text-sm text-muted-foreground">
        Grafik için öğrenciden en az bir ilerleme kaydı alınmış olmalıdır.
      </p>
    )
  }

  const hasData = () => {
    switch (activeTab) {
      case 'body':
        return chartData.some((d) => d.weight !== null || d.waist !== null)
      case 'lifts':
        return chartData.some((d) => d.bench !== null || d.squat !== null || d.deadlift !== null)
      case 'lifestyle':
        return chartData.some((d) => d.sleep !== null || d.diet !== null || d.energy !== null)
      case 'steps':
        return chartData.some((d) => d.steps !== null)
    }
  }

  return (
        <div className="surface-card space-y-4 p-5 backdrop-blur-xl">
      {/* Chart Tabs Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex flex-wrap gap-1 bg-[#0E0E10] border border-border p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('body')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'body'
                ? 'bg-[#C3F400] text-[#283500]'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            Kilo & Bel
          </button>
          <button
            onClick={() => setActiveTab('lifts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'lifts'
                ? 'bg-[#C3F400] text-[#283500]'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            Güç Gelişimi
          </button>
          <button
            onClick={() => setActiveTab('lifestyle')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'lifestyle'
                ? 'bg-[#C3F400] text-[#283500]'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            Yaşam Tarzı
          </button>
          <button
            onClick={() => setActiveTab('steps')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'steps'
                ? 'bg-[#C3F400] text-[#283500]'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            Günlük Adım
          </button>
        </div>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
          Son {chartData.length} Kayıt Listeleniyor
        </span>
      </div>

      {!hasData() ? (
        <div className="h-64 flex items-center justify-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-xl bg-black/10">
          Seçilen sekmeye ait veri bulunamadı.
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === 'body' && <BodyAreaChart data={chartData} />}
            {activeTab === 'lifts' && <LiftsLineChart data={chartData} />}
            {activeTab === 'lifestyle' && <LifestyleLineChart data={chartData} />}
            {activeTab === 'steps' && <StepsAreaChart data={chartData} />}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
