'use client'

import { forwardRef } from 'react'
import { formatDate } from '@/lib/coach/format'
import { getMonthLabel, type MonthStats } from './report-utils'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { Activity, Dumbbell, Scale, Ruler, Flame, Utensils, Moon, Footprints, Target } from 'lucide-react'

type ReportPdfTemplateProps = {
  selectedMonth: string
  stats: MonthStats
  coachComment: string
}

export const ReportPdfTemplate = forwardRef<HTMLDivElement, ReportPdfTemplateProps>(
  function ReportPdfTemplate({ selectedMonth, stats, coachComment }, ref) {
    if (!stats) return null

    // Prepare chart data from weekly breakdown
    const chartData = stats.weeklyBreakdown.map((w, idx) => ({
      name: `${idx + 1}. Hafta`,
      Kilo: w.avg_weight ? Number(w.avg_weight.toFixed(1)) : null,
      Bel: w.avg_waist ? Number(w.avg_waist.toFixed(1)) : null,
      Bench: w.bench_max || 0,
      Squat: w.squat_max || 0,
      Deadlift: w.deadlift_max || 0,
    }))

    // Helper for progress bar percentages
    const getPercentage = (value: number | null, max: number) => {
      if (!value) return 0
      return Math.min(100, (value / max) * 100)
    }

    return (
      <div
        ref={ref}
        id="pdf-report-template"
        className="w-[900px] bg-[#09090b] text-white p-10 space-y-8 font-sans fixed left-[-9999px] top-[0] -z-50"
      >
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-primary" />

        {/* Header Section */}
        <div className="flex justify-between items-center border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
              <Activity className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-primary text-4xl font-extrabold tracking-wider uppercase">FITCOACH</h1>
              <p className="text-xs text-zinc-400 uppercase tracking-widest mt-1">Kinetic Performance System</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-white uppercase tracking-wide">Aylık Gelişim Raporu</h2>
            <p className="text-lg font-semibold text-primary mt-1">
              {selectedMonth ? getMonthLabel(`${selectedMonth}-01`) : ''}
            </p>
          </div>
        </div>

        {/* Info & Global KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-4 grid grid-cols-4 gap-4 bg-[#18181b] p-5 rounded-2xl border border-zinc-800">
            <div className="flex flex-col">
              <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold mb-1">Rapor Tarihi</span>
              <span className="font-bold text-white text-lg">{formatDate(new Date().toISOString())}</span>
            </div>
            <div className="flex flex-col border-l border-zinc-800 pl-4">
              <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1"><Scale className="w-3 h-3"/> Kilo Değişimi</span>
              <span className={`font-bold text-xl ${stats.weightDiff && stats.weightDiff < 0 ? 'text-primary' : (stats.weightDiff && stats.weightDiff > 0 ? 'text-red-400' : 'text-white')}`}>
                {stats.weightDiff !== null ? `${stats.weightDiff > 0 ? '+' : ''}${stats.weightDiff.toFixed(1)} kg` : '—'}
              </span>
            </div>
            <div className="flex flex-col border-l border-zinc-800 pl-4">
              <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1"><Ruler className="w-3 h-3"/> Ort. Bel</span>
              <span className="font-bold text-white text-xl">
                {stats.avgWaist ? `${stats.avgWaist.toFixed(1)} cm` : '—'}
              </span>
            </div>
            <div className="flex flex-col border-l border-zinc-800 pl-4">
              <span className="text-xs text-primary uppercase tracking-wider font-semibold mb-1 flex items-center gap-1"><Target className="w-3 h-3"/> Antrenman Uyumu</span>
              <span className="font-bold text-white text-xl">
                {stats.workoutsCompleted} <span className="text-sm text-zinc-400">/ {stats.workoutsTarget} Gün</span>
              </span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-2 gap-6">
          {/* Body Composition Chart */}
          <div className="bg-[#18181b] rounded-2xl p-5 border border-zinc-800">
            <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4"/> Vücut Kompozisyonu
            </h3>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                  <YAxis yAxisId="right" orientation="right" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '12px' }}
                    labelStyle={{ display: 'none' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line yAxisId="left" type="monotone" dataKey="Kilo" stroke="#22c55e" strokeWidth={3} dot={{ r: 4, fill: '#22c55e', strokeWidth: 0 }} isAnimationActive={false} connectNulls />
                  <Line yAxisId="right" type="monotone" dataKey="Bel" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} isAnimationActive={false} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Strength Progression Chart */}
          <div className="bg-[#18181b] rounded-2xl p-5 border border-zinc-800">
            <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
              <Dumbbell className="w-4 h-4"/> Güç Gelişimi (Maksimum)
            </h3>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: '#27272a', opacity: 0.4 }}
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '12px' }}
                    labelStyle={{ display: 'none' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Bench" fill="#3b82f6" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                  <Bar dataKey="Squat" fill="#f59e0b" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                  <Bar dataKey="Deadlift" fill="#ef4444" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Lifestyle & Habits Section */}
        <div className="bg-[#18181b] rounded-2xl p-6 border border-zinc-800">
          <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-5 border-l-2 border-primary pl-3">
            Yaşam Tarzı ve Alışkanlıklar
          </h3>
          <div className="grid grid-cols-4 gap-6">
            
            {/* Diet */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                <span className="flex items-center gap-1"><Utensils className="w-3 h-3"/> Beslenme/Diyet</span>
                <span className="text-white font-bold">{stats.avgDiet ? `${stats.avgDiet.toFixed(1)}/10` : '—'}</span>
              </div>
              <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full" 
                  style={{ width: `${getPercentage(stats.avgDiet, 10)}%` }}
                />
              </div>
            </div>

            {/* Energy */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                <span className="flex items-center gap-1"><Flame className="w-3 h-3"/> Enerji Seviyesi</span>
                <span className="text-white font-bold">{stats.avgEnergy ? `${stats.avgEnergy.toFixed(1)}/10` : '—'}</span>
              </div>
              <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500 rounded-full" 
                  style={{ width: `${getPercentage(stats.avgEnergy, 10)}%` }}
                />
              </div>
            </div>

            {/* Sleep */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                <span className="flex items-center gap-1"><Moon className="w-3 h-3"/> Uyku (Saat)</span>
                <span className="text-white font-bold">{stats.avgSleep ? `${stats.avgSleep.toFixed(1)}s` : '—'}</span>
              </div>
              <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full" 
                  style={{ width: `${getPercentage(stats.avgSleep, 10)}%` }}
                />
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                <span className="flex items-center gap-1"><Footprints className="w-3 h-3"/> Günlük Adım</span>
                <span className="text-white font-bold">{stats.avgSteps ? Math.round(stats.avgSteps).toLocaleString('tr-TR') : '—'}</span>
              </div>
              <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-sky-500 rounded-full" 
                  style={{ width: `${getPercentage(stats.avgSteps, 12000)}%` }}
                />
              </div>
              <p className="text-[9px] text-zinc-500 text-right mt-1">*12.000 adım hedefine göre</p>
            </div>

          </div>
        </div>

        {/* Weekly Photos Grid */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-primary uppercase tracking-widest border-l-2 border-primary pl-3">
            Gelişim Fotoğrafları
          </h3>
          <div className="grid grid-cols-4 gap-4">
            {stats.weeklyBreakdown.map((w, idx) => (
              <div key={idx} className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#18181b] flex flex-col justify-between h-[220px] relative">
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md z-10">
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">{idx + 1}. Hafta</span>
                </div>
                <div className="relative flex-1 bg-black/40 flex items-center justify-center overflow-hidden">
                  {w.photo_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={w.photo_url}
                      alt={`${idx + 1}. Hafta Foto`}
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <span className="text-xs text-zinc-500 block font-semibold mb-1">Fotoğraf</span>
                      <span className="text-[10px] text-zinc-600 block uppercase tracking-wider">Yüklenmedi</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coach Assessment Comment Section */}
        <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20 relative overflow-hidden">
          <div className="absolute -top-4 -right-4 p-4 opacity-10">
            <Activity className="w-32 h-32 text-primary" />
          </div>
          <div className="relative z-10">
            <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
              Koçun Değerlendirmesi & Tavsiyeler
            </h3>
            <p className="text-sm leading-relaxed text-zinc-200 whitespace-pre-wrap font-medium">
              {coachComment || 'Bu ay için koç yorumu eklenmemiştir.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-800 pt-6 flex justify-between items-center text-[10px] text-zinc-500 font-medium">
          <span>© {new Date().getFullYear()} FITCOACH. KINETIC PERFORMANCE COACHING PORTAL.</span>
          <span className="uppercase tracking-widest">Başarıya Giden Yol.</span>
        </div>
      </div>
    )
  }
)
