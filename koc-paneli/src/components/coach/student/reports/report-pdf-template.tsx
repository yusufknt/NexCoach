'use client'

import { forwardRef } from 'react'
import { formatDate } from '@/lib/coach/format'
import { getMonthLabel, getWeeklyDiff, getNetDiff, type MonthStats } from './report-utils'

type ReportPdfTemplateProps = {
  selectedMonth: string
  stats: MonthStats
  coachComment: string
}

export const ReportPdfTemplate = forwardRef<HTMLDivElement, ReportPdfTemplateProps>(
  function ReportPdfTemplate({ selectedMonth, stats, coachComment }, ref) {
    return (
      <div
        ref={ref}
        id="pdf-report-template"
        className="w-[800px] bg-[#09090b] text-white p-8 space-y-8 font-sans fixed left-[-9999px] top-[0] -z-50"
      >
        {/* Neon green top line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />

        {/* Header */}
        <div className="flex justify-between items-end border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-primary text-3xl font-extrabold tracking-wider uppercase">FITCOACH</h1>
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-0.5">Kinetic Performance Coaching Portal</p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold text-white uppercase tracking-wide">AYLIK GELİŞİM RAPORU</h2>
            <p className="text-sm font-semibold text-primary">{selectedMonth ? getMonthLabel(`${selectedMonth}-01`) : ''}</p>
          </div>
        </div>

        {/* Profile / Metadata Info */}
        <div className="grid grid-cols-2 gap-4 bg-[#18181b] rounded-xl p-4 border border-zinc-800">
          <div className="text-sm">
            <span className="text-xs text-zinc-400 block">Öğrenci:</span>
            <span className="font-bold text-white text-base">Sporcu Gelişim Raporu</span>
          </div>
          <div className="text-sm text-right">
            <span className="text-xs text-zinc-400 block">Rapor Tarihi:</span>
            <span className="font-semibold text-white">{formatDate(new Date().toISOString())}</span>
          </div>
        </div>

        {/* Weekly Comparison Table */}
        {stats && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-primary uppercase tracking-widest border-l-2 border-primary pl-2">Haftalık İlerleme & Karşılaştırma Analizi</h3>
            
            <div className="overflow-hidden rounded-xl border border-zinc-800 bg-[#18181b]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#18181b] text-primary uppercase tracking-wider text-[10px] border-b border-zinc-800">
                    <th className="py-2.5 px-4 font-bold border-r border-zinc-800">METRİK</th>
                    <th className="py-2.5 px-3 font-bold border-r border-zinc-800 text-center">1. HAFTA</th>
                    <th className="py-2.5 px-3 font-bold border-r border-zinc-800 text-center">2. HAFTA</th>
                    <th className="py-2.5 px-3 font-bold border-r border-zinc-800 text-center">3. HAFTA</th>
                    <th className="py-2.5 px-3 font-bold border-r border-zinc-800 text-center">4. HAFTA</th>
                    <th className="py-2.5 px-3 font-bold text-center bg-primary/10 text-white">AYLIK NET FARK</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-zinc-100">
                  {/* Kilo */}
                  <tr>
                    <td className="py-2 px-4 font-medium border-r border-zinc-800 text-zinc-400">Ortalama Kilo</td>
                    {stats.weeklyBreakdown.map((w, idx) => {
                      const prev = idx > 0 ? stats.weeklyBreakdown[idx - 1] : null
                      const trend = prev ? getWeeklyDiff(w.avg_weight, prev.avg_weight, true) : null
                      return (
                        <td key={idx} className="py-2 px-3 border-r border-zinc-800 text-center">
                          <span className="font-semibold">{w.avg_weight ? `${w.avg_weight.toFixed(1)} kg` : '—'}</span>
                          {trend && (
                            <span style={{ color: trend.color }} className="text-[9px] font-bold ml-1">
                              ({trend.sign}{trend.diff.toFixed(1)})
                            </span>
                          )}
                        </td>
                      )
                    })}
                    <td className="py-2 px-3 text-center font-bold bg-primary/5">
                      {getNetDiff(
                        stats.weeklyBreakdown[3]?.avg_weight || stats.weeklyBreakdown[2]?.avg_weight || stats.weeklyBreakdown[1]?.avg_weight,
                        stats.weeklyBreakdown[0]?.avg_weight || stats.weeklyBreakdown[1]?.avg_weight,
                        true
                      )} kg
                    </td>
                  </tr>

                  {/* Bel */}
                  <tr>
                    <td className="py-2 px-4 font-medium border-r border-zinc-800 text-zinc-400">Ortalama Bel Ölçüsü</td>
                    {stats.weeklyBreakdown.map((w, idx) => {
                      const prev = idx > 0 ? stats.weeklyBreakdown[idx - 1] : null
                      const trend = prev ? getWeeklyDiff(w.avg_waist, prev.avg_waist, true) : null
                      return (
                        <td key={idx} className="py-2 px-3 border-r border-zinc-800 text-center">
                          <span className="font-semibold">{w.avg_waist ? `${w.avg_waist.toFixed(1)} cm` : '—'}</span>
                          {trend && (
                            <span style={{ color: trend.color }} className="text-[9px] font-bold ml-1">
                              ({trend.sign}{trend.diff.toFixed(1)})
                            </span>
                          )}
                        </td>
                      )
                    })}
                    <td className="py-2 px-3 text-center font-bold bg-primary/5">
                      {getNetDiff(
                        stats.weeklyBreakdown[3]?.avg_waist || stats.weeklyBreakdown[2]?.avg_waist || stats.weeklyBreakdown[1]?.avg_waist,
                        stats.weeklyBreakdown[0]?.avg_waist || stats.weeklyBreakdown[1]?.avg_waist,
                        true
                      )} cm
                    </td>
                  </tr>

                  {/* Bench Press */}
                  <tr>
                    <td className="py-2 px-4 font-medium border-r border-zinc-800 text-zinc-400">Bench Press Max</td>
                    {stats.weeklyBreakdown.map((w, idx) => {
                      const prev = idx > 0 ? stats.weeklyBreakdown[idx - 1] : null
                      const trend = prev ? getWeeklyDiff(w.bench_max, prev.bench_max, false) : null
                      return (
                        <td key={idx} className="py-2 px-3 border-r border-zinc-800 text-center">
                          <span className="font-semibold text-primary">{w.bench_max ? `${w.bench_max} kg` : '—'}</span>
                          {trend && (
                            <span style={{ color: trend.color }} className="text-[9px] font-bold ml-1">
                              ({trend.sign}{trend.diff.toFixed(1)})
                            </span>
                          )}
                        </td>
                      )
                    })}
                    <td className="py-2 px-3 text-center font-bold bg-primary/5 text-primary">
                      {getNetDiff(
                        stats.weeklyBreakdown[3]?.bench_max || stats.weeklyBreakdown[2]?.bench_max || stats.weeklyBreakdown[1]?.bench_max,
                        stats.weeklyBreakdown[0]?.bench_max || stats.weeklyBreakdown[1]?.bench_max,
                        false
                      )} kg
                    </td>
                  </tr>

                  {/* Squat */}
                  <tr>
                    <td className="py-2 px-4 font-medium border-r border-zinc-800 text-zinc-400">Squat Max</td>
                    {stats.weeklyBreakdown.map((w, idx) => {
                      const prev = idx > 0 ? stats.weeklyBreakdown[idx - 1] : null
                      const trend = prev ? getWeeklyDiff(w.squat_max, prev.squat_max, false) : null
                      return (
                        <td key={idx} className="py-2 px-3 border-r border-zinc-800 text-center">
                          <span className="font-semibold text-primary">{w.squat_max ? `${w.squat_max} kg` : '—'}</span>
                          {trend && (
                            <span style={{ color: trend.color }} className="text-[9px] font-bold ml-1">
                              ({trend.sign}{trend.diff.toFixed(1)})
                            </span>
                          )}
                        </td>
                      )
                    })}
                    <td className="py-2 px-3 text-center font-bold bg-primary/5 text-primary">
                      {getNetDiff(
                        stats.weeklyBreakdown[3]?.squat_max || stats.weeklyBreakdown[2]?.squat_max || stats.weeklyBreakdown[1]?.squat_max,
                        stats.weeklyBreakdown[0]?.squat_max || stats.weeklyBreakdown[1]?.squat_max,
                        false
                      )} kg
                    </td>
                  </tr>

                  {/* Deadlift */}
                  <tr>
                    <td className="py-2 px-4 font-medium border-r border-zinc-800 text-zinc-400">Deadlift Max</td>
                    {stats.weeklyBreakdown.map((w, idx) => {
                      const prev = idx > 0 ? stats.weeklyBreakdown[idx - 1] : null
                      const trend = prev ? getWeeklyDiff(w.deadlift_max, prev.deadlift_max, false) : null
                      return (
                        <td key={idx} className="py-2 px-3 border-r border-zinc-800 text-center">
                          <span className="font-semibold text-primary">{w.deadlift_max ? `${w.deadlift_max} kg` : '—'}</span>
                          {trend && (
                            <span style={{ color: trend.color }} className="text-[9px] font-bold ml-1">
                              ({trend.sign}{trend.diff.toFixed(1)})
                            </span>
                          )}
                        </td>
                      )
                    })}
                    <td className="py-2 px-3 text-center font-bold bg-primary/5 text-primary">
                      {getNetDiff(
                        stats.weeklyBreakdown[3]?.deadlift_max || stats.weeklyBreakdown[2]?.deadlift_max || stats.weeklyBreakdown[1]?.deadlift_max,
                        stats.weeklyBreakdown[0]?.deadlift_max || stats.weeklyBreakdown[1]?.deadlift_max,
                        false
                      )} kg
                    </td>
                  </tr>

                  {/* Antrenman */}
                  <tr>
                    <td className="py-2 px-4 font-medium border-r border-zinc-800 text-zinc-400">Antrenman Uyum Oranı</td>
                    {stats.weeklyBreakdown.map((w, idx) => (
                      <td key={idx} className="py-2 px-3 border-r border-zinc-800 text-center">
                        <span className="font-semibold">{w.workouts_completed} / {w.workouts_target} G</span>
                      </td>
                    ))}
                    <td className="py-2 px-3 text-center font-bold bg-primary/5 text-white">
                      {stats.workoutsCompleted} / {stats.workoutsTarget} G
                    </td>
                  </tr>

                  {/* Uyku */}
                  <tr>
                    <td className="py-2 px-4 font-medium border-r border-zinc-800 text-zinc-400">Ortalama Uyku</td>
                    {stats.weeklyBreakdown.map((w, idx) => {
                      const prev = idx > 0 ? stats.weeklyBreakdown[idx - 1] : null
                      const trend = prev ? getWeeklyDiff(w.avg_sleep, prev.avg_sleep, false) : null
                      return (
                        <td key={idx} className="py-2 px-3 border-r border-zinc-800 text-center">
                          <span className="font-semibold">{w.avg_sleep ? `${w.avg_sleep.toFixed(1)} sa` : '—'}</span>
                          {trend && (
                            <span style={{ color: trend.color }} className="text-[9px] font-bold ml-1">
                              ({trend.sign}{trend.diff.toFixed(1)})
                            </span>
                          )}
                        </td>
                      )
                    })}
                    <td className="py-2 px-3 text-center font-bold bg-primary/5">
                      {getNetDiff(
                        stats.weeklyBreakdown[3]?.avg_sleep || stats.weeklyBreakdown[2]?.avg_sleep || stats.weeklyBreakdown[1]?.avg_sleep,
                        stats.weeklyBreakdown[0]?.avg_sleep || stats.weeklyBreakdown[1]?.avg_sleep,
                        false
                      )} sa
                    </td>
                  </tr>

                  {/* Adım */}
                  <tr>
                    <td className="py-2 px-4 font-medium border-r border-zinc-800 text-zinc-400">Günlük Ortalama Adım</td>
                    {stats.weeklyBreakdown.map((w, idx) => {
                      const prev = idx > 0 ? stats.weeklyBreakdown[idx - 1] : null
                      const trend = prev ? getWeeklyDiff(w.avg_steps, prev.avg_steps, false) : null
                      return (
                        <td key={idx} className="py-2 px-3 border-r border-zinc-800 text-center">
                          <span className="font-semibold">{w.avg_steps ? Math.round(w.avg_steps).toLocaleString('tr-TR') : '—'}</span>
                          {trend && (
                            <span style={{ color: trend.color }} className="text-[9px] font-bold ml-1">
                              ({trend.sign}{Math.round(trend.diff).toLocaleString('tr-TR')})
                            </span>
                          )}
                        </td>
                      )
                    })}
                    <td className="py-2 px-3 text-center font-bold bg-primary/5">
                      {getNetDiff(
                        stats.weeklyBreakdown[3]?.avg_steps || stats.weeklyBreakdown[2]?.avg_steps || stats.weeklyBreakdown[1]?.avg_steps,
                        stats.weeklyBreakdown[0]?.avg_steps || stats.weeklyBreakdown[1]?.avg_steps,
                        false
                      )}
                    </td>
                  </tr>

                  {/* Diyet */}
                  <tr>
                    <td className="py-2 px-4 font-medium border-r border-zinc-800 text-zinc-400">Beslenme / Diyet Uyumu</td>
                    {stats.weeklyBreakdown.map((w, idx) => {
                      const prev = idx > 0 ? stats.weeklyBreakdown[idx - 1] : null
                      const trend = prev ? getWeeklyDiff(w.avg_diet, prev.avg_diet, false) : null
                      return (
                        <td key={idx} className="py-2 px-3 border-r border-zinc-800 text-center">
                          <span className="font-semibold text-primary">{w.avg_diet ? `${w.avg_diet.toFixed(1)}/10` : '—'}</span>
                          {trend && (
                            <span style={{ color: trend.color }} className="text-[9px] font-bold ml-1">
                              ({trend.sign}{trend.diff.toFixed(1)})
                            </span>
                          )}
                        </td>
                      )
                    })}
                    <td className="py-2 px-3 text-center font-bold bg-primary/5 text-primary">
                      {getNetDiff(
                        stats.weeklyBreakdown[3]?.avg_diet || stats.weeklyBreakdown[2]?.avg_diet || stats.weeklyBreakdown[1]?.avg_diet,
                        stats.weeklyBreakdown[0]?.avg_diet || stats.weeklyBreakdown[1]?.avg_diet,
                        false
                      )}
                    </td>
                  </tr>

                  {/* Enerji */}
                  <tr>
                    <td className="py-2 px-4 font-medium border-r border-zinc-800 text-zinc-400">Genel Enerji Seviyesi</td>
                    {stats.weeklyBreakdown.map((w, idx) => {
                      const prev = idx > 0 ? stats.weeklyBreakdown[idx - 1] : null
                      const trend = prev ? getWeeklyDiff(w.avg_energy, prev.avg_energy, false) : null
                      return (
                        <td key={idx} className="py-2 px-3 border-r border-zinc-800 text-center">
                          <span className="font-semibold">{w.avg_energy ? `${w.avg_energy.toFixed(1)}/10` : '—'}</span>
                          {trend && (
                            <span style={{ color: trend.color }} className="text-[9px] font-bold ml-1">
                              ({trend.sign}{trend.diff.toFixed(1)})
                            </span>
                          )}
                        </td>
                      )
                    })}
                    <td className="py-2 px-3 text-center font-bold bg-primary/5">
                      {getNetDiff(
                        stats.weeklyBreakdown[3]?.avg_energy || stats.weeklyBreakdown[2]?.avg_energy || stats.weeklyBreakdown[1]?.avg_energy,
                        stats.weeklyBreakdown[0]?.avg_energy || stats.weeklyBreakdown[1]?.avg_energy,
                        false
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Coach Assessment Comment Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-primary uppercase tracking-widest border-l-2 border-primary pl-2">Koçun Değerlendirmesi & Tavsiyeleri</h3>
          <div className="bg-[#18181b] rounded-xl p-5 border border-zinc-800 min-h-[140px] text-sm leading-relaxed text-zinc-200 whitespace-pre-wrap">
            {coachComment || 'Bu ay için koç yorumu eklenmemiştir.'}
          </div>
        </div>

        {/* Weekly Progress Photos Grid */}
        {stats && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-primary uppercase tracking-widest border-l-2 border-primary pl-2">Haftalık Gelişim Fotoğrafları</h3>
            <div className="grid grid-cols-4 gap-4">
              {stats.weeklyBreakdown.map((w, idx) => (
                <div key={idx} className="overflow-hidden rounded-xl border border-zinc-800 bg-[#18181b] flex flex-col justify-between h-[180px]">
                  <div className="relative flex-1 bg-black/40 flex items-center justify-center overflow-hidden">
                    {w.photo_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={w.photo_url}
                        alt={`${idx + 1}. Hafta Foto`}
                        className="aspect-[4/3] w-full h-full object-cover"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <span className="text-[10px] text-zinc-400 block uppercase tracking-wider font-bold">Fotoğraf</span>
                        <span className="text-[8px] text-zinc-400 block uppercase tracking-wider mt-0.5">Yüklenmedi</span>
                      </div>
                    )}
                  </div>
                  <div className="p-2 text-center text-[10px] text-zinc-400 font-bold border-t border-zinc-800 uppercase tracking-wider bg-[#18181b]">
                    {idx + 1}. HAFTA
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-zinc-800 pt-6 flex justify-between items-center text-[10px] text-zinc-400">
          <span>© {new Date().getFullYear()} FITCOACH. Tüm Hakları Saklıdır.</span>
          <span className="font-semibold text-primary uppercase tracking-widest">KINETIC PERFORMANCE SYSTEM</span>
        </div>
      </div>
    )
  }
)
