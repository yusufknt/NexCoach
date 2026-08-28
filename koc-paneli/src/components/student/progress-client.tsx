'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { formatDate } from '@/lib/coach/format'
import { addProgressEntry, deleteProgressEntry } from '@/lib/student/progress.client'
import { submitWeeklyProgress } from '@/lib/student/progress-actions'
import type { ProgressSummary, ProgressEntryItem } from '@/lib/student/types'
import { ProgressSummaryCards } from './progress/progress-summary-cards'
import { ProgressWeightChart, type TimeRange } from './progress/progress-weight-chart'
import { ProgressEntryItemRow } from './progress/progress-entry-item'
import { ProgressEntryModal } from './progress/progress-entry-modal'
import { ProgressLightbox } from './progress/progress-lightbox'

type ProgressClientProps = {
  summary: ProgressSummary
  initialEntries: ProgressEntryItem[]
  studentId: string
  coachId: string | null
}

export function ProgressClient({ summary, initialEntries, studentId, coachId }: ProgressClientProps) {
  const [entries, setEntries] = useState(initialEntries)
  const [modalOpen, setModalOpen] = useState(false)
  const [timeRange, setTimeRange] = useState<TimeRange>('all')
  const [referenceTime] = useState(() => Date.now())

  // Lightbox state
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

  // Toggle expanded entries
  const [expandedEntries, setExpandedEntries] = useState<Record<string, boolean>>({})

  // Form State
  const [entryType, setEntryType] = useState<'daily' | 'weekly'>('daily')
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10))
  const [newWeight, setNewWeight] = useState('')
  const [newNote, setNewNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Weekly Form State
  const [waistCm, setWaistCm] = useState('')
  const [chestCm, setChestCm] = useState('')
  const [rightUpperArmCm, setRightUpperArmCm] = useState('')
  const [leftUpperArmCm, setLeftUpperArmCm] = useState('')
  const [rightThighCm, setRightThighCm] = useState('')
  const [leftThighCm, setLeftThighCm] = useState('')
  
  const [benchPressMax, setBenchPressMax] = useState('')
  const [squatMax, setSquatMax] = useState('')
  const [deadliftMax, setDeadliftMax] = useState('')
  
  const [workoutDaysCompleted, setWorkoutDaysCompleted] = useState('3')
  const [workoutDaysTarget, setWorkoutDaysTarget] = useState('4')
  const [sleepHoursAvg, setSleepHoursAvg] = useState('7')
  const [stepsAvg, setStepsAvg] = useState('')
  const [energyLevel, setEnergyLevel] = useState('7')
  const [dietCompliance, setDietCompliance] = useState('8')
  const [weeklyPhoto, setWeeklyPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  // Chart data
  const chartData = useMemo(() => {
    const reversed = [...entries].reverse()
    const withWeight = reversed.filter((e) => e.weight != null)
    const cutoff = timeRange === '1w' ? referenceTime - 7 * 86400000
      : timeRange === '1m' ? referenceTime - 30 * 86400000 : 0

    return withWeight
      .filter((e) => new Date(e.date).getTime() >= cutoff)
      .map((e) => ({ date: formatDate(e.date), weight: e.weight! }))
  }, [entries, referenceTime, timeRange])

  const toggleExpand = (id: string) => {
    setExpandedEntries(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const resetForm = () => {
    setNewDate(new Date().toISOString().slice(0, 10))
    setNewWeight('')
    setNewNote('')
    setEntryType('daily')
    setWaistCm('')
    setChestCm('')
    setRightUpperArmCm('')
    setLeftUpperArmCm('')
    setRightThighCm('')
    setLeftThighCm('')
    setBenchPressMax('')
    setSquatMax('')
    setDeadliftMax('')
    setWorkoutDaysCompleted('3')
    setWorkoutDaysTarget('4')
    setSleepHoursAvg('7')
    setStepsAvg('')
    setEnergyLevel('7')
    setDietCompliance('8')
    setWeeklyPhoto(null)
    setPhotoPreview(null)
    setErrorMessage(null)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Yalnızca resim dosyası seçebilirsiniz.')
        return
      }
      setWeeklyPhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAdd = async () => {
    if (!coachId) return
    setErrorMessage(null)
    setSaving(true)

    const w = newWeight ? parseFloat(newWeight) : null
    if (!newDate || w === null || Number.isNaN(w)) {
      setErrorMessage('Tarih ve Kilo alanları zorunludur.')
      setSaving(false)
      return
    }

    try {
      if (entryType === 'daily') {
        const result = await addProgressEntry(studentId, coachId, {
          date: newDate, weight: w, note: newNote,
        })
        if (result) {
          setEntries((prev) => [{
            id: result.id, date: result.date, weight: result.weight,
            note: result.note, beforePhotoUrl: null, afterPhotoUrl: null,
            createdAt: result.created_at, isOwnEntry: true, customMetrics: {}
          }, ...prev])
          setModalOpen(false)
          resetForm()
        } else {
          setErrorMessage('Kayıt eklenirken bir hata oluştu.')
        }
      } else {
        const formData = new FormData()
        formData.append('date', newDate)
        formData.append('weight', newWeight)
        formData.append('note', newNote)
        
        formData.append('waistCm', waistCm)
        formData.append('chestCm', chestCm)
        formData.append('rightUpperArmCm', rightUpperArmCm)
        formData.append('leftUpperArmCm', leftUpperArmCm)
        formData.append('rightThighCm', rightThighCm)
        formData.append('leftThighCm', leftThighCm)
        
        formData.append('benchPressMax', benchPressMax)
        formData.append('squatMax', squatMax)
        formData.append('deadliftMax', deadliftMax)
        
        formData.append('workoutDaysCompleted', workoutDaysCompleted)
        formData.append('workoutDaysTarget', workoutDaysTarget)
        formData.append('sleepHoursAvg', sleepHoursAvg)
        formData.append('stepsAvg', stepsAvg)
        formData.append('energyLevel', energyLevel)
        formData.append('dietCompliance', dietCompliance)
        
        if (weeklyPhoto) {
          formData.append('weeklyPhoto', weeklyPhoto)
        }

        const res = await submitWeeklyProgress(formData)
        if (res.success) {
          window.location.reload()
        } else {
          setErrorMessage(res.error || 'Haftalık kayıt kaydedilirken hata oluştu.')
        }
      }
    } catch (e) {
      console.error(e)
      setErrorMessage('Bir şeyler ters gitti.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Bu kaydı silmek istediğinize emin misiniz?')) {
      const ok = await deleteProgressEntry(id)
      if (ok) setEntries((prev) => prev.filter((e) => e.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <ProgressSummaryCards summary={summary} />

      {/* Chart */}
      <ProgressWeightChart
        chartData={chartData}
        timeRange={timeRange}
        setTimeRange={setTimeRange}
      />

      {/* Add entry button */}
      <div className="flex justify-end">
        <Button onClick={() => setModalOpen(true)} className="bg-[#C3F400] text-[#283500] hover:bg-[#ABD600]">
          <Plus className="mr-2 h-4 w-4" /> Yeni Kayıt Ekle
        </Button>
      </div>

      {/* Entry list */}
      <Card className="coach-card">
        <CardHeader><CardTitle className="text-base text-[#E5E1E4]">Kayıt Geçmişi</CardTitle></CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-sm text-[#C4C9AC]">Henüz kayıt yok.</p>
          ) : (
            <div className="divide-y divide-[#27272A]/50">
              {entries.map((e) => (
                <ProgressEntryItemRow
                  key={e.id}
                  entry={e}
                  isExpanded={!!expandedEntries[e.id]}
                  onToggleExpand={() => toggleExpand(e.id)}
                  onDelete={() => handleDelete(e.id)}
                  onPhotoClick={(url) => setLightboxUrl(url)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Entry Modal */}
      <ProgressEntryModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); resetForm(); }}
        entryType={entryType}
        setEntryType={setEntryType}
        newDate={newDate}
        setNewDate={setNewDate}
        newWeight={newWeight}
        setNewWeight={setNewWeight}
        newNote={newNote}
        setNewNote={setNewNote}
        waistCm={waistCm}
        setWaistCm={setWaistCm}
        chestCm={chestCm}
        setChestCm={setChestCm}
        rightUpperArmCm={rightUpperArmCm}
        setRightUpperArmCm={setRightUpperArmCm}
        leftUpperArmCm={leftUpperArmCm}
        setLeftUpperArmCm={setLeftUpperArmCm}
        rightThighCm={rightThighCm}
        setRightThighCm={setRightThighCm}
        leftThighCm={leftThighCm}
        setLeftThighCm={setLeftThighCm}
        benchPressMax={benchPressMax}
        setBenchPressMax={setBenchPressMax}
        squatMax={squatMax}
        setSquatMax={setSquatMax}
        deadliftMax={deadliftMax}
        setDeadliftMax={setDeadliftMax}
        workoutDaysCompleted={workoutDaysCompleted}
        setWorkoutDaysCompleted={setWorkoutDaysCompleted}
        workoutDaysTarget={workoutDaysTarget}
        setWorkoutDaysTarget={setWorkoutDaysTarget}
        sleepHoursAvg={sleepHoursAvg}
        setSleepHoursAvg={setSleepHoursAvg}
        stepsAvg={stepsAvg}
        setStepsAvg={setStepsAvg}
        energyLevel={energyLevel}
        setEnergyLevel={setEnergyLevel}
        dietCompliance={dietCompliance}
        setDietCompliance={setDietCompliance}
        photoPreview={photoPreview}
        onPhotoChange={handlePhotoChange}
        onRemovePhoto={() => { setWeeklyPhoto(null); setPhotoPreview(null); }}
        errorMessage={errorMessage}
        saving={saving}
        onSubmit={handleAdd}
      />

      {/* Lightbox */}
      <ProgressLightbox
        url={lightboxUrl}
        onClose={() => setLightboxUrl(null)}
      />
    </div>
  )
}
