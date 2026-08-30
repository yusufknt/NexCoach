'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { X, Camera } from 'lucide-react'

type ProgressEntryModalProps = {
  isOpen: boolean
  onClose: () => void
  entryType: 'daily' | 'weekly'
  setEntryType: (t: 'daily' | 'weekly') => void
  newDate: string
  setNewDate: (d: string) => void
  newWeight: string
  setNewWeight: (w: string) => void
  newNote: string
  setNewNote: (n: string) => void
  waistCm: string
  setWaistCm: (v: string) => void
  chestCm: string
  setChestCm: (v: string) => void
  rightUpperArmCm: string
  setRightUpperArmCm: (v: string) => void
  leftUpperArmCm: string
  setLeftUpperArmCm: (v: string) => void
  rightThighCm: string
  setRightThighCm: (v: string) => void
  leftThighCm: string
  setLeftThighCm: (v: string) => void
  benchPressMax: string
  setBenchPressMax: (v: string) => void
  squatMax: string
  setSquatMax: (v: string) => void
  deadliftMax: string
  setDeadliftMax: (v: string) => void
  workoutDaysCompleted: string
  setWorkoutDaysCompleted: (v: string) => void
  workoutDaysTarget: string
  setWorkoutDaysTarget: (v: string) => void
  sleepHoursAvg: string
  setSleepHoursAvg: (v: string) => void
  stepsAvg: string
  setStepsAvg: (v: string) => void
  energyLevel: string
  setEnergyLevel: (v: string) => void
  dietCompliance: string
  setDietCompliance: (v: string) => void
  photoPreview: string | null
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemovePhoto: () => void
  errorMessage: string | null
  saving: boolean
  onSubmit: () => void
}

export function ProgressEntryModal({
  isOpen,
  onClose,
  entryType,
  setEntryType,
  newDate,
  setNewDate,
  newWeight,
  setNewWeight,
  newNote,
  setNewNote,
  waistCm,
  setWaistCm,
  chestCm,
  setChestCm,
  rightUpperArmCm,
  setRightUpperArmCm,
  leftUpperArmCm,
  setLeftUpperArmCm,
  rightThighCm,
  setRightThighCm,
  leftThighCm,
  setLeftThighCm,
  benchPressMax,
  setBenchPressMax,
  squatMax,
  setSquatMax,
  deadliftMax,
  setDeadliftMax,
  workoutDaysCompleted,
  setWorkoutDaysCompleted,
  workoutDaysTarget,
  setWorkoutDaysTarget,
  sleepHoursAvg,
  setSleepHoursAvg,
  stepsAvg,
  setStepsAvg,
  energyLevel,
  setEnergyLevel,
  dietCompliance,
  setDietCompliance,
  photoPreview,
  onPhotoChange,
  onRemovePhoto,
  errorMessage,
  saving,
  onSubmit,
}: ProgressEntryModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-muted/30 p-5 sm:p-6 shadow-2xl my-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Yeni Kayıt Ekle</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400">
            {errorMessage}
          </div>
        )}

        <div className="mb-5 flex rounded-lg bg-[#27272A] p-1">
          <button
            type="button"
            onClick={() => setEntryType('daily')}
            className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition ${
              entryType === 'daily' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Günlük Kilo Girişi
          </button>
          <button
            type="button"
            onClick={() => setEntryType('weekly')}
            className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition ${
              entryType === 'weekly' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Haftalık Detaylı Giriş
          </button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-muted-foreground text-xs">Tarih</Label>
              <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="coach-input mt-1" />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Kilo (kg) *</Label>
              <Input type="number" step="0.1" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} placeholder="Ör: 75.5" className="coach-input mt-1" required />
            </div>
          </div>

          {entryType === 'weekly' && (
            <>
              {/* Part 1: Body Measurements */}
              <div className="border-t border-border pt-4">
                <h3 className="mb-3 text-xs font-bold text-primary uppercase tracking-wider">Vücut Ölçüleri (Cm)</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="text-muted-foreground text-xs">Bel Çevresi (En Kritik Derece)</Label>
                    <Input type="number" step="0.1" value={waistCm} onChange={(e) => setWaistCm(e.target.value)} placeholder="Ör: 82" className="coach-input mt-1" />
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Göğüs Çevresi</Label>
                    <Input type="number" step="0.1" value={chestCm} onChange={(e) => setChestCm(e.target.value)} placeholder="Ör: 96" className="coach-input mt-1" />
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Sağ Üst Kol Çevresi</Label>
                    <Input type="number" step="0.1" value={rightUpperArmCm} onChange={(e) => setRightUpperArmCm(e.target.value)} placeholder="Ör: 36.5" className="coach-input mt-1" />
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Sol Üst Kol Çevresi</Label>
                    <Input type="number" step="0.1" value={leftUpperArmCm} onChange={(e) => setLeftUpperArmCm(e.target.value)} placeholder="Ör: 36" className="coach-input mt-1" />
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Sağ Uyluk (Üst Bacak)</Label>
                    <Input type="number" step="0.1" value={rightThighCm} onChange={(e) => setRightThighCm(e.target.value)} placeholder="Ör: 58" className="coach-input mt-1" />
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Sol Uyluk (Üst Bacak)</Label>
                    <Input type="number" step="0.1" value={leftThighCm} onChange={(e) => setLeftThighCm(e.target.value)} placeholder="Ör: 57.5" className="coach-input mt-1" />
                  </div>
                </div>
              </div>

              {/* Part 2: Best Lifts */}
              <div className="border-t border-border pt-4">
                <h3 className="mb-3 text-xs font-bold text-primary uppercase tracking-wider">Haftalık En İyi Kaldırışlar (Kg)</h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <Label className="text-muted-foreground text-xs">Bench Press</Label>
                    <Input type="number" step="0.5" value={benchPressMax} onChange={(e) => setBenchPressMax(e.target.value)} placeholder="Ör: 80" className="coach-input mt-1" />
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Squat</Label>
                    <Input type="number" step="0.5" value={squatMax} onChange={(e) => setSquatMax(e.target.value)} placeholder="Ör: 100" className="coach-input mt-1" />
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Deadlift</Label>
                    <Input type="number" step="0.5" value={deadliftMax} onChange={(e) => setDeadliftMax(e.target.value)} placeholder="Ör: 120" className="coach-input mt-1" />
                  </div>
                </div>
              </div>

              {/* Part 3: Lifestyle */}
              <div className="border-t border-border pt-4">
                <h3 className="mb-3 text-xs font-bold text-primary uppercase tracking-wider">Yaşam Tarzı ve Performans</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="text-muted-foreground text-xs">Tamamlanan Antrenman Günü</Label>
                    <select
                      value={workoutDaysCompleted}
                      onChange={(e) => setWorkoutDaysCompleted(e.target.value)}
                      className="coach-input mt-1 w-full bg-muted/30 text-foreground"
                    >
                      {[0, 1, 2, 3, 4, 5, 6, 7].map((num) => (
                        <option key={num} value={num}>{num} Gün</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Hedef Antrenman Günü</Label>
                    <select
                      value={workoutDaysTarget}
                      onChange={(e) => setWorkoutDaysTarget(e.target.value)}
                      className="coach-input mt-1 w-full bg-muted/30 text-foreground"
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                        <option key={num} value={num}>{num} Gün</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Ortalama Uyku Süresi (Saat)</Label>
                    <Input type="number" step="0.5" value={sleepHoursAvg} onChange={(e) => setSleepHoursAvg(e.target.value)} placeholder="Ör: 7.5" className="coach-input mt-1" />
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Günlük Ortalama Adım (Opsiyonel)</Label>
                    <Input type="number" step="1" value={stepsAvg} onChange={(e) => setStepsAvg(e.target.value)} placeholder="Ör: 8000" className="coach-input mt-1" />
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs flex justify-between">
                      <span>Enerji Seviyesi (1-10)</span>
                      <span className="font-semibold text-primary">{energyLevel}/10</span>
                    </Label>
                    <input
                      type="range" min="1" max="10" step="1"
                      value={energyLevel} onChange={(e) => setEnergyLevel(e.target.value)}
                      className="accent-[#C3F400] w-full mt-2 h-1.5 bg-[#27272A] rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs flex justify-between">
                      <span>Diyet Uyumu (1-10)</span>
                      <span className="font-semibold text-primary">{dietCompliance}/10</span>
                    </Label>
                    <input
                      type="range" min="1" max="10" step="1"
                      value={dietCompliance} onChange={(e) => setDietCompliance(e.target.value)}
                      className="accent-[#C3F400] w-full mt-2 h-1.5 bg-[#27272A] rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Part 4: Photo */}
              <div className="border-t border-border pt-4">
                <h3 className="mb-2 text-xs font-bold text-primary uppercase tracking-wider">Haftalık Progress Fotoğrafı</h3>
                <div className="mt-1 flex items-center justify-center rounded-xl border border-dashed border-border/60 p-4 text-center bg-[#0E0E10]/40">
                  {photoPreview ? (
                    <div className="relative group max-w-[200px] overflow-hidden rounded-lg">
                      <Image src={photoPreview} alt="Fotoğraf Önizleme" width={200} height={150} className="aspect-[4/3] object-cover" />
                      <button
                        type="button"
                        onClick={onRemovePhoto}
                        className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-foreground hover:bg-black/90"
                      >
                        <X className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer flex-col items-center justify-center">
                      <Camera className="mb-2 h-8 w-8 text-muted-foreground" />
                      <span className="text-xs font-semibold text-primary">Fotoğraf Seç veya Sürükle</span>
                      <span className="text-[10px] text-muted-foreground mt-1">PNG, JPG (Max 10MB)</span>
                      <input type="file" accept="image/*" onChange={onPhotoChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="border-t border-border pt-4">
            <Label className="text-muted-foreground text-xs">
              {entryType === 'weekly' ? 'Haftalık Değerlendirme & Yorum' : 'Günlük Not'}
            </Label>
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder={entryType === 'weekly' ? 'Bu hafta nasıl geçti? Zorlandığınız yerler veya notlarınız...' : 'Bugün nasıl geçti?'}
              className="coach-input mt-1.5 min-h-[70px] resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-border mt-4">
          <Button variant="ghost" onClick={onClose} className="text-muted-foreground hover:bg-muted">İptal</Button>
          <Button onClick={onSubmit} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary">
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>
      </div>
    </div>
  )
}
