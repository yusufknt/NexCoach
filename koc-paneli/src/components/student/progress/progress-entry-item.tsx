'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  Calendar, Trash2, Ruler, Dumbbell, Smile,
  ChevronDown, ChevronUp
} from 'lucide-react'
import { formatDate } from '@/lib/coach/format'
import type { ProgressEntryItem } from '@/lib/student/types'

type ProgressEntryItemRowProps = {
  entry: ProgressEntryItem
  isExpanded: boolean
  onToggleExpand: () => void
  onDelete: () => void
  onPhotoClick: (url: string) => void
}

export function ProgressEntryItemRow({
  entry,
  isExpanded,
  onToggleExpand,
  onDelete,
  onPhotoClick,
}: ProgressEntryItemRowProps) {
  const m = entry.customMetrics || {}
  const isWeekly = m.entry_type === 'weekly'

  const getMetricString = (val: unknown): string | null => {
    if (val === undefined || val === null) return null
    const str = String(val).trim()
    return str.length > 0 ? str : null
  }

  const waist = getMetricString(m.waist_cm ?? m.waist)
  const chest = getMetricString(m.chest_cm ?? m.chest)
  const rightArm = getMetricString(m.right_upper_arm_cm ?? m.right_arm)
  const leftArm = getMetricString(m.left_upper_arm_cm ?? m.left_arm)
  const rightThigh = getMetricString(m.right_thigh_cm ?? m.right_thigh)
  const leftThigh = getMetricString(m.left_thigh_cm ?? m.left_thigh)

  const bench = getMetricString(m.bench_press_max ?? m.bench)
  const squat = getMetricString(m.squat_max ?? m.squat)
  const deadlift = getMetricString(m.deadlift_max ?? m.deadlift)

  const sleep = getMetricString(m.sleep_hours_avg ?? m.sleep)
  const steps = getMetricString(m.steps_avg ?? m.steps)
  const diet = getMetricString(m.diet_compliance ?? m.diet)
  const energy = getMetricString(m.energy_level ?? m.energy)
  const workoutsCompleted = getMetricString(m.workout_days_completed)
  const workoutsTarget = getMetricString(m.workout_days_target)

  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Date & Weight */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#ABD600]/10 text-[#ABD600]">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-[#C4C9AC] block font-semibold uppercase tracking-wider">
              {formatDate(entry.date)}
            </span>
            <span className="text-base font-extrabold text-[#E5E1E4]">
              {entry.weight !== null ? `${Number(entry.weight).toFixed(1)} kg` : '—'}
            </span>
          </div>
        </div>

        {/* Middle: Note or Weekly Badges */}
        <div className="flex-1 min-w-0 hidden md:block">
          <div className="flex flex-wrap gap-1.5 items-center">
            {isWeekly && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#ABD600]/10 text-[#ABD600] border border-[#ABD600]/20 font-medium">
                Haftalık Detaylı
              </span>
            )}
            {!isWeekly && entry.note && (
              <p className="text-xs text-[#C4C9AC] italic truncate max-w-xs">
                &ldquo;{entry.note}&rdquo;
              </p>
            )}
            {isWeekly && waist && (
              <span className="text-[9px] px-1.5 py-0.5 rounded border border-[#00eefc]/25 text-[#00eefc] bg-[#00eefc]/5">
                Bel: {waist} cm
              </span>
            )}
            {isWeekly && bench && (
              <span className="text-[9px] px-1.5 py-0.5 rounded border border-yellow-500/25 text-yellow-400 bg-yellow-500/5">
                Bench: {bench} kg
              </span>
            )}
            {isWeekly && steps && !isNaN(Number(steps)) && (
              <span className="text-[9px] px-1.5 py-0.5 rounded border border-pink-500/25 text-pink-400 bg-pink-500/5">
                Adım: {Math.round(Number(steps)).toLocaleString('tr-TR')}
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {isWeekly && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleExpand}
              className="text-[#C4C9AC] hover:text-[#E5E1E4] hover:bg-[#2A2A2C]"
            >
              {isExpanded ? (
                <>Gizle <ChevronUp className="ml-1 h-4 w-4" /></>
              ) : (
                <>Detaylar <ChevronDown className="ml-1 h-4 w-4" /></>
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="text-[#C4C9AC] hover:text-red-400 hover:bg-red-500/10 h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Expandable Weekly Metrics */}
      {isWeekly && isExpanded && (
        <div className="mt-4 pl-14 space-y-4 border-l border-[#27272A]/50">
          {entry.note && (
            <div className="text-xs text-[#C4C9AC] bg-[#18181B]/40 p-2.5 rounded-lg border border-[#27272A]/50">
              <span className="font-semibold text-[#E5E1E4] block mb-1">Haftalık Yorum:</span>
              &ldquo;{entry.note}&rdquo;
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-3 text-xs">
            {/* Body Measurements */}
            <div className="space-y-2 p-3 rounded-lg bg-[#18181B]/30 border border-[#27272A]/30">
              <div className="flex items-center gap-1.5 text-[#00eefc] font-semibold mb-1">
                <Ruler className="h-3.5 w-3.5" />
                <span>Vücut Ölçüleri</span>
              </div>
              <div className="space-y-1 text-[#C4C9AC]">
                <div className="flex justify-between"><span>Bel:</span> <span className="text-[#E5E1E4] font-medium">{waist ? `${waist} cm` : '—'}</span></div>
                <div className="flex justify-between"><span>Göğüs:</span> <span className="text-[#E5E1E4] font-medium">{chest ? `${chest} cm` : '—'}</span></div>
                <div className="flex justify-between"><span>Sağ Kol:</span> <span className="text-[#E5E1E4] font-medium">{rightArm ? `${rightArm} cm` : '—'}</span></div>
                <div className="flex justify-between"><span>Sol Kol:</span> <span className="text-[#E5E1E4] font-medium">{leftArm ? `${leftArm} cm` : '—'}</span></div>
                <div className="flex justify-between"><span>Sağ Uyluk:</span> <span className="text-[#E5E1E4] font-medium">{rightThigh ? `${rightThigh} cm` : '—'}</span></div>
                <div className="flex justify-between"><span>Sol Uyluk:</span> <span className="text-[#E5E1E4] font-medium">{leftThigh ? `${leftThigh} cm` : '—'}</span></div>
              </div>
            </div>

            {/* Lifts */}
            <div className="space-y-2 p-3 rounded-lg bg-[#18181B]/30 border border-[#27272A]/30">
              <div className="flex items-center gap-1.5 text-yellow-400 font-semibold mb-1">
                <Dumbbell className="h-3.5 w-3.5" />
                <span>Güç Limitleri</span>
              </div>
              <div className="space-y-1 text-[#C4C9AC]">
                <div className="flex justify-between"><span>Bench Press:</span> <span className="text-[#E5E1E4] font-medium">{bench ? `${bench} kg` : '—'}</span></div>
                <div className="flex justify-between"><span>Squat:</span> <span className="text-[#E5E1E4] font-medium">{squat ? `${squat} kg` : '—'}</span></div>
                <div className="flex justify-between"><span>Deadlift:</span> <span className="text-[#E5E1E4] font-medium">{deadlift ? `${deadlift} kg` : '—'}</span></div>
              </div>
            </div>

            {/* Lifestyle */}
            <div className="space-y-2 p-3 rounded-lg bg-[#18181B]/30 border border-[#27272A]/30">
              <div className="flex items-center gap-1.5 text-pink-400 font-semibold mb-1">
                <Smile className="h-3.5 w-3.5" />
                <span>Yaşam Tarzı & Uyum</span>
              </div>
              <div className="space-y-1 text-[#C4C9AC]">
                <div className="flex justify-between"><span>Ort. Uyku:</span> <span className="text-[#E5E1E4] font-medium">{sleep ? `${sleep} sa` : '—'}</span></div>
                <div className="flex justify-between"><span>Ort. Adım:</span> <span className="text-[#E5E1E4] font-medium">{steps ? Math.round(Number(steps)).toLocaleString('tr-TR') : '—'}</span></div>
                <div className="flex justify-between"><span>Antrenman:</span> <span className="text-[#E5E1E4] font-medium">{workoutsCompleted && workoutsTarget ? `${workoutsCompleted}/${workoutsTarget} gün` : '—'}</span></div>
                <div className="flex justify-between"><span>Diyet Uyumu:</span> <span className="text-[#E5E1E4] font-medium">{diet ? `${diet}/10` : '—'}</span></div>
                <div className="flex justify-between"><span>Enerji Seviyesi:</span> <span className="text-[#E5E1E4] font-medium">{energy ? `${energy}/10` : '—'}</span></div>
              </div>
            </div>
          </div>

          {/* Weekly Photo Slot */}
          {entry.beforePhotoUrl && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#E5E1E4] uppercase tracking-wider">Haftalık Gelişim Fotoğrafı</h4>
              <div className="relative w-40 aspect-[3/4] rounded-lg overflow-hidden border border-[#27272A] bg-black/20 shrink-0">
                <Image
                  src={entry.beforePhotoUrl}
                  alt="Haftalık Gelişim Fotoğrafı"
                  width={160}
                  height={213}
                  className="w-full h-full object-cover transition-all duration-300 hover:scale-105 cursor-pointer"
                  onClick={() => onPhotoClick(entry.beforePhotoUrl!)}
                  unoptimized
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
