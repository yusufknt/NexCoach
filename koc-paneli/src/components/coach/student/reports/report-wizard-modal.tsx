'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { X, CheckCircle2 } from 'lucide-react'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6 overflow-hidden">
      <div className="w-full max-w-3xl rounded-2xl border border-border bg-card flex flex-col max-h-[90vh] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border p-5 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-foreground">Aylık Gelişim Raporu Oluştur</h2>
            <p className="text-xs text-muted-foreground mt-1">Öğrencinin aylık verilerini inceleyin ve raporu yayınlayın.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          
          {errorMessage && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-400 flex items-center gap-2">
              <span className="font-bold">Hata:</span> {errorMessage}
            </div>
          )}

          {/* Step 1: Month Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">1. Raporlanacak Ayı Seçin</Label>
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full appearance-none rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              >
                <option value="" className="bg-background text-muted-foreground">-- Lütfen Bir Ay Seçiniz --</option>
                {monthOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-background text-foreground">
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Step 2: Stats Display */}
          {selectedMonth && stats && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                <Label className="text-sm font-semibold text-foreground">2. Otomatik Hesaplanmış Veri Özeti</Label>
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              
              {stats.totalEntries === 0 ? (
                <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-4 text-sm text-yellow-600/90 flex flex-col items-center justify-center text-center gap-2">
                  <svg className="w-8 h-8 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p>Seçilen ay için öğrenciye ait herhangi bir günlük kayıt bulunamadı. Rapor boş verilerle oluşturulacaktır.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Main KPIs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-xl border border-border/60 bg-muted/10 p-3 text-center flex flex-col justify-center">
                      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Toplam Giriş</span>
                      <span className="font-bold text-foreground text-lg">{stats.totalEntries} <span className="text-sm font-normal text-muted-foreground">Gün</span></span>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-muted/10 p-3 text-center flex flex-col justify-center">
                      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Kilo Değişimi</span>
                      <span className={`font-bold text-lg ${stats.weightDiff && stats.weightDiff < 0 ? 'text-primary' : 'text-red-400'}`}>
                        {stats.weightDiff !== null 
                          ? `${stats.weightDiff > 0 ? '+' : ''}${stats.weightDiff.toFixed(1)} kg` 
                          : '—'}
                      </span>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-muted/10 p-3 text-center flex flex-col justify-center">
                      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Ort. Bel</span>
                      <span className="font-bold text-foreground text-lg">
                        {stats.avgWaist ? `${stats.avgWaist.toFixed(1)} cm` : '—'}
                      </span>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-primary/5 p-3 text-center flex flex-col justify-center">
                      <span className="text-[11px] font-medium text-primary uppercase tracking-wider mb-1">Antrenman</span>
                      <span className="font-bold text-foreground text-lg">
                        {stats.workoutsCompleted} <span className="text-sm font-normal text-muted-foreground">/ {stats.workoutsTarget}</span>
                      </span>
                    </div>
                  </div>

                  {/* Weekly Table */}
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-bold text-primary uppercase tracking-widest pl-1">Haftalık Karşılaştırma</h4>
                    <div className="overflow-x-auto rounded-xl border border-border bg-muted/10">
                      <table className="w-full text-left text-sm border-collapse min-w-[500px]">
                        <thead>
                          <tr className="border-b border-border bg-muted/30">
                            <th className="py-2.5 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Metrik</th>
                            <th className="py-2.5 px-3 font-semibold text-center text-muted-foreground text-xs uppercase">Hafta 1</th>
                            <th className="py-2.5 px-3 font-semibold text-center text-muted-foreground text-xs uppercase">Hafta 2</th>
                            <th className="py-2.5 px-3 font-semibold text-center text-muted-foreground text-xs uppercase">Hafta 3</th>
                            <th className="py-2.5 px-3 font-semibold text-center text-muted-foreground text-xs uppercase">Hafta 4</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60 text-foreground">
                          <tr className="hover:bg-muted/20 transition-colors">
                            <td className="py-2.5 px-4 text-muted-foreground font-medium text-xs">Ort. Kilo</td>
                            {stats.weeklyBreakdown.map((w, idx) => (
                              <td key={idx} className="py-2.5 px-3 text-center font-medium">
                                {w.avg_weight ? `${w.avg_weight.toFixed(1)}` : '—'}
                              </td>
                            ))}
                          </tr>
                          <tr className="hover:bg-muted/20 transition-colors">
                            <td className="py-2.5 px-4 text-muted-foreground font-medium text-xs">Ort. Bel</td>
                            {stats.weeklyBreakdown.map((w, idx) => (
                              <td key={idx} className="py-2.5 px-3 text-center font-medium">
                                {w.avg_waist ? `${w.avg_waist.toFixed(1)}` : '—'}
                              </td>
                            ))}
                          </tr>
                          <tr className="hover:bg-muted/20 transition-colors">
                            <td className="py-2.5 px-4 text-muted-foreground font-medium text-xs">Antrenman (Tam./Hdf)</td>
                            {stats.weeklyBreakdown.map((w, idx) => (
                              <td key={idx} className="py-2.5 px-3 text-center font-medium text-primary">
                                {w.workouts_completed}/{w.workouts_target}
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Photos */}
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-bold text-primary uppercase tracking-widest pl-1">Gelişim Fotoğrafları</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {stats.weeklyBreakdown.map((w, idx) => (
                        <div key={idx} className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-border bg-muted/20 flex flex-col">
                          <div className="absolute top-0 left-0 right-0 bg-black/60 backdrop-blur-sm z-10 p-1.5 text-center">
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">{idx + 1}. Hafta</span>
                          </div>
                          {w.photo_url ? (
                            <Image
                              src={w.photo_url}
                              alt={`${idx + 1}. Hafta`}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              unoptimized
                            />
                          ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/40 gap-2">
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-[10px] uppercase font-semibold">Yok</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Comments */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">3. Koç Değerlendirmesi</Label>
            <Textarea
              value={coachComment}
              onChange={(e) => setCoachComment(e.target.value)}
              placeholder="Öğrencinin bu ayki gelişimi hakkında yorumlarınız, gelecek ay için tavsiyeleriniz..."
              className="min-h-[140px] resize-y rounded-xl border-border bg-muted/10 text-sm focus:border-primary focus:ring-primary"
            />
          </div>

          {/* Step 4: Publish Settings */}
          <div className="rounded-xl border border-border/60 bg-muted/10 p-4 flex items-start gap-3">
            <div className="pt-0.5">
              <label className="relative flex cursor-pointer items-center rounded-full">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                />
                <div className="h-6 w-11 rounded-full bg-muted-foreground/30 transition-all peer-checked:bg-primary"></div>
                <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-all peer-checked:left-6"></div>
              </label>
            </div>
            <div>
              <Label className="text-sm font-semibold text-foreground cursor-pointer" onClick={() => setIsPublished(!isPublished)}>
                Raporu Yayınla (Öğrenci Görsün)
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">Kapalı olursa rapor sadece sizin (koç) görebileceğiniz taslak olarak kaydedilir.</p>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="border-t border-border p-5 shrink-0 flex items-center justify-between bg-muted/5 rounded-b-2xl">
          <Button variant="ghost" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            İptal
          </Button>
          <Button
            onClick={onSubmit}
            disabled={generatingPdf || !selectedMonth}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 font-semibold"
          >
            {generatingPdf ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                PDF Üretiliyor...
              </span>
            ) : (
              'Kaydet ve PDF Üret'
            )}
          </Button>
        </div>

      </div>
    </div>
  )
}
