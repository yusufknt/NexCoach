'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { X } from 'lucide-react'
import type { MonthStats } from './report-utils'

type ReportWizardModalProps = {
  isOpen: boolean
  onClose: () => void
  selectedMonth: string
  setSelectedMonth: (val: string) => void
  coachComment: string
  setCoachComment: (val: string) => void
  isPublished: boolean
  setIsPublished: (val: boolean) => void
  monthOptions: { value: string; label: string }[]
  stats: MonthStats
  generatingPdf: boolean
  errorMessage: string | null
  onSubmit: () => void
}

export function ReportWizardModal({
  isOpen,
  onClose,
  selectedMonth,
  setSelectedMonth,
  coachComment,
  setCoachComment,
  isPublished,
  setIsPublished,
  monthOptions,
  stats,
  generatingPdf,
  errorMessage,
  onSubmit,
}: ReportWizardModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-muted/30 p-5 sm:p-6 shadow-2xl my-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Aylık Rapor Sihirbazı</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400">
            {errorMessage}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label className="text-muted-foreground">Raporlanacak Ay Seçimi</Label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="coach-input mt-1.5 w-full bg-muted/30 text-foreground"
            >
              <option value="">-- Ay Seçiniz --</option>
              {monthOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {selectedMonth && stats && (
            <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-4">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Otomatik Hesaplanan Gelişim Verileri</h3>
              
              {stats.totalEntries === 0 ? (
                <p className="text-xs text-yellow-500">Seçilen ay için öğrenciye ait herhangi bir kayıt bulunamadı. Rapor boş oluşturulacaktır.</p>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-lg bg-muted/30 p-2 text-center">
                      <span className="text-[10px] block text-muted-foreground">Toplam Giriş</span>
                      <span className="font-bold text-foreground text-sm">{stats.totalEntries} Gün</span>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-2 text-center">
                      <span className="text-[10px] block text-muted-foreground">Kilo Farkı</span>
                      <span className={`font-bold text-sm ${stats.weightDiff && stats.weightDiff < 0 ? 'text-primary' : 'text-red-400'}`}>
                        {stats.weightDiff !== null 
                          ? `${stats.weightDiff > 0 ? '+' : ''}${stats.weightDiff.toFixed(1)} kg` 
                          : '—'}
                      </span>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-2 text-center">
                      <span className="text-[10px] block text-muted-foreground">Aylık Ort. Bel</span>
                      <span className="font-bold text-foreground text-sm">
                        {stats.avgWaist ? `${stats.avgWaist.toFixed(1)} cm` : '—'}
                      </span>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-2 text-center">
                      <span className="text-[10px] block text-muted-foreground">Antrenman</span>
                      <span className="font-bold text-foreground text-sm">
                        {stats.workoutsCompleted} / {stats.workoutsTarget} G
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 space-y-2">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Hafta Hafta Karşılaştırma Analizi</h4>
                    <div className="overflow-x-auto rounded-lg border border-border bg-muted/30">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-border text-muted-foreground bg-muted/30">
                            <th className="py-2 px-3 font-semibold">Metrik</th>
                            <th className="py-2 px-3 font-semibold text-center">1. Hafta</th>
                            <th className="py-2 px-3 font-semibold text-center">2. Hafta</th>
                            <th className="py-2 px-3 font-semibold text-center">3. Hafta</th>
                            <th className="py-2 px-3 font-semibold text-center">4. Hafta</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#27272A]/50 text-foreground">
                          <tr>
                            <td className="py-2 px-3 text-muted-foreground font-medium">Ort. Kilo</td>
                            {stats.weeklyBreakdown.map((w, idx) => (
                              <td key={idx} className="py-2 px-3 text-center">
                                {w.avg_weight ? `${w.avg_weight.toFixed(1)} kg` : '—'}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="py-2 px-3 text-muted-foreground font-medium">Ort. Bel</td>
                            {stats.weeklyBreakdown.map((w, idx) => (
                              <td key={idx} className="py-2 px-3 text-center">
                                {w.avg_waist ? `${w.avg_waist.toFixed(1)} cm` : '—'}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="py-2 px-3 text-muted-foreground font-medium">Antrenman</td>
                            {stats.weeklyBreakdown.map((w, idx) => (
                              <td key={idx} className="py-2 px-3 text-center">
                                {w.workouts_completed} / {w.workouts_target} G
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="py-2 px-3 text-muted-foreground font-medium">Bench / Squat / DL</td>
                            {stats.weeklyBreakdown.map((w, idx) => (
                              <td key={idx} className="py-2 px-3 text-center">
                                {w.bench_max || '—'} / {w.squat_max || '—'} / {w.deadlift_max || '—'}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="py-2 px-3 text-muted-foreground font-medium">Uyku / Adım</td>
                            {stats.weeklyBreakdown.map((w, idx) => (
                              <td key={idx} className="py-2 px-3 text-center text-[10px]">
                                {w.avg_sleep ? `${w.avg_sleep.toFixed(1)}s` : '—'} / {w.avg_steps ? Math.round(w.avg_steps).toLocaleString('tr-TR') : '—'}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="py-2 px-3 text-muted-foreground font-medium">Diyet / Enerji</td>
                            {stats.weeklyBreakdown.map((w, idx) => (
                              <td key={idx} className="py-2 px-3 text-center text-[10px]">
                                {w.avg_diet ? `${w.avg_diet.toFixed(1)}/10` : '—'} / {w.avg_energy ? `${w.avg_energy.toFixed(1)}/10` : '—'}
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 space-y-2">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Haftalık Progress Fotoğrafları</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {stats.weeklyBreakdown.map((w, idx) => (
                        <div key={idx} className="text-center space-y-1">
                          <span className="text-[10px] text-muted-foreground block">{idx + 1}. Hafta</span>
                          {w.photo_url ? (
                            <div className="relative aspect-[4/3] w-full overflow-hidden rounded border border-border bg-black/20">
                              <Image
                                src={w.photo_url}
                                alt={`${idx + 1}. Hafta Foto`}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className="aspect-[4/3] w-full rounded border border-dashed border-border bg-muted/30 flex items-center justify-center text-[9px] text-muted-foreground">
                              Yok
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <div>
            <Label className="text-muted-foreground">Koç Değerlendirmesi & Notları</Label>
            <Textarea
              value={coachComment}
              onChange={(e) => setCoachComment(e.target.value)}
              placeholder="Bu ayki gelişim hakkında yorumlarınız, antrenman ve beslenme tavsiyeleriniz..."
              className="coach-input mt-1.5 min-h-[120px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublished"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="accent-[#C3F400] h-4 w-4 rounded border-border/60 bg-muted/30"
            />
            <Label htmlFor="isPublished" className="text-foreground cursor-pointer">
              Direkt Öğrenciye Yayınla (Görünür Kıl)
            </Label>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-border mt-6">
          <Button variant="ghost" onClick={onClose} className="text-muted-foreground hover:bg-muted">
            İptal
          </Button>
          <Button
            onClick={onSubmit}
            disabled={generatingPdf || !selectedMonth}
            className="bg-[#C3F400] text-[#283500] hover:bg-primary"
          >
            {generatingPdf ? 'PDF Hazırlanıyor...' : 'Kaydet ve PDF Üret'}
          </Button>
        </div>
      </div>
    </div>
  )
}
