'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ProgressEntry } from '@/types'
import { formatDate } from '@/lib/coach/format'
import {
  Activity,
  CalendarDays,
  Camera,
  ChevronDown,
  Dumbbell,
  HeartPulse,
  Minus,
  Ruler,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react'

type ProgressEntryListProps = {
  entries: ProgressEntry[]
}

type EntryFilter = 'all' | 'body' | 'performance' | 'lifestyle' | 'photos'
type SortOrder = 'newest' | 'oldest'

type MetricItem = {
  label: string
  value: string
  unit?: string
}

const INITIAL_VISIBLE_COUNT = 6

const filters: Array<{ value: EntryFilter; label: string }> = [
  { value: 'all', label: 'Tümü' },
  { value: 'body', label: 'Vücut' },
  { value: 'performance', label: 'Performans' },
  { value: 'lifestyle', label: 'Yaşam' },
  { value: 'photos', label: 'Fotoğraflı' },
]

function getMetricString(value: unknown): string | null {
  if (value === undefined || value === null) return null
  const result = String(value).trim()
  return result.length > 0 ? result : null
}

function getEntryMetrics(entry: ProgressEntry) {
  const metrics = entry.custom_metrics || {}

  const waist = getMetricString(metrics.waist_cm ?? metrics.waist)
  const chest = getMetricString(metrics.chest_cm ?? metrics.chest)
  const rightArm = getMetricString(metrics.right_upper_arm_cm ?? metrics.right_arm)
  const leftArm = getMetricString(metrics.left_upper_arm_cm ?? metrics.left_arm)
  const rightThigh = getMetricString(metrics.right_thigh_cm ?? metrics.right_thigh)
  const leftThigh = getMetricString(metrics.left_thigh_cm ?? metrics.left_thigh)
  const bodyFat = getMetricString(metrics.body_fat_percentage ?? metrics.body_fat)

  const bench = getMetricString(metrics.bench_press_max ?? metrics.bench)
  const squat = getMetricString(metrics.squat_max ?? metrics.squat)
  const deadlift = getMetricString(metrics.deadlift_max ?? metrics.deadlift)

  const sleep = getMetricString(metrics.sleep_hours_avg ?? metrics.sleep)
  const steps = getMetricString(metrics.steps_avg ?? metrics.steps)
  const diet = getMetricString(metrics.diet_compliance ?? metrics.diet)
  const energy = getMetricString(metrics.energy_level ?? metrics.energy)
  const workoutsCompleted = getMetricString(metrics.workout_days_completed)
  const workoutsTarget = getMetricString(metrics.workout_days_target)

  const body: MetricItem[] = [
    ...(waist ? [{ label: 'Bel', value: waist, unit: 'cm' }] : []),
    ...(chest ? [{ label: 'Göğüs', value: chest, unit: 'cm' }] : []),
    ...(rightArm || leftArm
      ? [{ label: 'Kol (Sağ / Sol)', value: `${rightArm ?? '—'} / ${leftArm ?? '—'}`, unit: 'cm' }]
      : []),
    ...(rightThigh || leftThigh
      ? [{ label: 'Uyluk (Sağ / Sol)', value: `${rightThigh ?? '—'} / ${leftThigh ?? '—'}`, unit: 'cm' }]
      : []),
    ...(bodyFat ? [{ label: 'Yağ oranı', value: bodyFat, unit: '%' }] : []),
  ]

  const performance: MetricItem[] = [
    ...(bench ? [{ label: 'Bench press', value: bench, unit: 'kg' }] : []),
    ...(squat ? [{ label: 'Squat', value: squat, unit: 'kg' }] : []),
    ...(deadlift ? [{ label: 'Deadlift', value: deadlift, unit: 'kg' }] : []),
  ]

  const lifestyle: MetricItem[] = [
    ...(sleep ? [{ label: 'Uyku', value: sleep, unit: 'sa' }] : []),
    ...(steps && !Number.isNaN(Number(steps))
      ? [{ label: 'Günlük adım', value: Math.round(Number(steps)).toLocaleString('tr-TR') }]
      : []),
    ...(diet ? [{ label: 'Diyet uyumu', value: diet, unit: '/10' }] : []),
    ...(energy ? [{ label: 'Enerji', value: energy, unit: '/10' }] : []),
    ...(workoutsCompleted || workoutsTarget
      ? [{
          label: 'Antrenman',
          value: `${workoutsCompleted ?? '—'} / ${workoutsTarget ?? '—'}`,
          unit: 'gün',
        }]
      : []),
  ]

  return { body, performance, lifestyle }
}

function entryMatchesFilter(entry: ProgressEntry, filter: EntryFilter) {
  if (filter === 'all') return true
  if (filter === 'photos') return Boolean(entry.before_photo_url || entry.after_photo_url)

  const metrics = getEntryMetrics(entry)
  if (filter === 'body') return entry.weight !== null || metrics.body.length > 0
  return metrics[filter].length > 0
}

export function ProgressEntryList({ entries }: ProgressEntryListProps) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<EntryFilter>('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT)

  const chronologicalEntries = useMemo(
    () => [...entries].sort((a, b) => a.date.localeCompare(b.date)),
    [entries]
  )

  const previousWeightById = useMemo(() => {
    const result = new Map<string, number | null>()
    let previousWeight: number | null = null

    chronologicalEntries.forEach((entry) => {
      result.set(entry.id, previousWeight)
      if (entry.weight !== null) previousWeight = Number(entry.weight)
    })

    return result
  }, [chronologicalEntries])

  const latestEntryId = chronologicalEntries.at(-1)?.id

  const filteredEntries = useMemo(() => {
    const matching = chronologicalEntries.filter((entry) => entryMatchesFilter(entry, activeFilter))
    return sortOrder === 'newest' ? matching.reverse() : matching
  }, [activeFilter, chronologicalEntries, sortOrder])

  const visibleEntries = filteredEntries.slice(0, visibleCount)
  const remainingCount = filteredEntries.length - visibleEntries.length

  useEffect(() => {
    if (!lightboxUrl) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightboxUrl(null)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [lightboxUrl])

  if (entries.length === 0) {
    return (
      <div className="surface-card border-dashed px-6 py-14 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Activity className="h-5 w-5" />
        </div>
        <h3 className="mt-4 text-base font-semibold">Henüz ilerleme kaydı yok</h3>
        <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">
          Öğrencinin ilk kaydı oluşturulduğunda ölçümler, yaşam verileri ve fotoğraflar burada görünecek.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="surface-card flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="İlerleme kayıtlarını filtrele">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => {
                setActiveFilter(filter.value)
                setVisibleCount(INITIAL_VISIBLE_COUNT)
              }}
              aria-pressed={activeFilter === filter.value}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                activeFilter === filter.value
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          Sıralama
          <select
            value={sortOrder}
            onChange={(event) => {
              setSortOrder(event.target.value as SortOrder)
              setVisibleCount(INITIAL_VISIBLE_COUNT)
            }}
            className="coach-input h-9 min-w-36 px-3 text-xs font-semibold text-foreground"
            aria-label="İlerleme kayıtlarını sırala"
          >
            <option value="newest">En yeni kayıt</option>
            <option value="oldest">En eski kayıt</option>
          </select>
        </label>
      </div>

      {visibleEntries.length === 0 ? (
        <div className="surface-card border-dashed p-10 text-center text-sm text-muted-foreground">
          Bu filtreye uygun ilerleme kaydı bulunmuyor.
        </div>
      ) : (
        <div className="relative space-y-5 before:absolute before:bottom-8 before:left-[19px] before:top-8 before:w-px before:bg-border sm:before:left-[23px]">
          {visibleEntries.map((entry) => (
            <ProgressEntryCard
              key={entry.id}
              entry={entry}
              previousWeight={previousWeightById.get(entry.id) ?? null}
              isLatest={entry.id === latestEntryId}
              onPhotoClick={setLightboxUrl}
            />
          ))}
        </div>
      )}

      {remainingCount > 0 && (
        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + INITIAL_VISIBLE_COUNT)}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm transition hover:border-primary/30 hover:bg-primary/5"
          >
            <ChevronDown className="h-4 w-4 text-primary" />
            {Math.min(remainingCount, INITIAL_VISIBLE_COUNT)} kayıt daha göster
          </button>
        </div>
      )}

      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-slate-950/95 p-4 backdrop-blur-md"
          onClick={() => setLightboxUrl(null)}
          role="dialog"
          aria-modal="true"
          aria-label="İlerleme fotoğrafı önizlemesi"
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            className="absolute right-4 top-4 rounded-full border border-white/15 bg-white/10 p-2.5 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Fotoğraf önizlemesini kapat"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="max-h-[88vh] max-w-[92vw] text-center" onClick={(event) => event.stopPropagation()}>
            <img
              src={lightboxUrl}
              alt="İlerleme kaydı fotoğrafı"
              className="mx-auto max-h-[86vh] rounded-2xl border border-white/10 object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  )
}

function ProgressEntryCard({
  entry,
  previousWeight,
  isLatest,
  onPhotoClick,
}: {
  entry: ProgressEntry
  previousWeight: number | null
  isLatest: boolean
  onPhotoClick: (url: string) => void
}) {
  const metrics = getEntryMetrics(entry)
  const weight = entry.weight !== null ? Number(entry.weight) : null
  const weightDelta = weight !== null && previousWeight !== null ? weight - previousWeight : null
  const hasPhotos = Boolean(entry.before_photo_url || entry.after_photo_url)
  const hasMetrics = metrics.body.length + metrics.performance.length + metrics.lifestyle.length > 0

  return (
    <article className="relative pl-10 sm:pl-12">
      <div
        className={`absolute left-2 top-8 z-10 h-6 w-6 rounded-full border-[6px] border-background sm:left-3 ${
          isLatest ? 'bg-primary shadow-[0_0_0_4px_rgba(0,102,255,0.12)]' : 'bg-slate-300 dark:bg-slate-600'
        }`}
        aria-hidden="true"
      />

      <div
        className={`surface-card overflow-hidden ${
          isLatest ? 'border-primary/30 shadow-[0_10px_35px_-20px_rgba(0,102,255,0.45)]' : ''
        }`}
      >
        <div className={`h-1 w-full ${isLatest ? 'bg-primary' : 'bg-border/70'}`} />
        <div
          className={`grid gap-6 p-5 sm:p-6 ${
            hasPhotos
              ? 'lg:grid-cols-[170px_minmax(0,1fr)_300px] xl:grid-cols-[180px_minmax(0,1fr)_340px]'
              : 'lg:grid-cols-[180px_minmax(0,1fr)]'
          }`}
        >
          <div className="flex flex-row items-start justify-between gap-4 border-b border-border pb-5 lg:flex-col lg:justify-start lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <CalendarDays className="h-4 w-4 text-primary" />
                {formatDate(entry.date)}
              </div>
              {isLatest && (
                <span className="mt-3 inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                  Son kayıt
                </span>
              )}
            </div>

            <div className="text-right lg:mt-6 lg:text-left">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Kilo</p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
                {weight !== null ? weight.toFixed(1) : '—'}
                {weight !== null && <span className="ml-1 text-sm font-semibold text-muted-foreground">kg</span>}
              </p>
              <WeightDelta value={weightDelta} />
            </div>
          </div>

          <div className="min-w-0 space-y-5">
            {hasMetrics ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <MetricGroup title="Vücut ölçüleri" icon={Ruler} metrics={metrics.body} />
                <MetricGroup title="Performans" icon={Dumbbell} metrics={metrics.performance} />
                <MetricGroup title="Yaşam" icon={HeartPulse} metrics={metrics.lifestyle} />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5 text-sm text-muted-foreground">
                Bu kayıtta ek ölçüm bulunmuyor.
              </div>
            )}

            {entry.note && (
              <div className="rounded-xl border border-primary/10 bg-primary/[0.045] p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Kayıt notu</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground/80">
                  {entry.note}
                </p>
              </div>
            )}
          </div>

          {hasPhotos && (
            <div className="border-t border-border pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4 text-primary" />
                  <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-foreground">Fotoğraflar</h4>
                </div>
                <span className="text-[10px] text-muted-foreground">Büyütmek için seç</span>
              </div>
              <div className={`grid gap-3 ${entry.before_photo_url && entry.after_photo_url ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {entry.before_photo_url && (
                  <ProgressPhoto
                    label="Önce"
                    url={entry.before_photo_url}
                    onClick={() => onPhotoClick(entry.before_photo_url!)}
                  />
                )}
                {entry.after_photo_url && (
                  <ProgressPhoto
                    label="Sonra"
                    url={entry.after_photo_url}
                    onClick={() => onPhotoClick(entry.after_photo_url!)}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

function WeightDelta({ value }: { value: number | null }) {
  if (value === null) {
    return <p className="mt-2 text-xs text-muted-foreground">Önceki veri yok</p>
  }

  const Icon = value > 0 ? TrendingUp : value < 0 ? TrendingDown : Minus

  return (
    <div className="mt-2 inline-flex flex-wrap items-center gap-1.5 rounded-lg bg-primary/[0.08] px-2 py-1 text-xs font-semibold text-primary">
      <Icon className="h-3.5 w-3.5" />
      {value > 0 ? '+' : ''}{value.toFixed(1)} kg
      <span className="font-normal text-muted-foreground">önceki kayda göre</span>
    </div>
  )
}

function MetricGroup({
  title,
  icon: Icon,
  metrics,
}: {
  title: string
  icon: typeof Ruler
  metrics: MetricItem[]
}) {
  return (
    <section className="rounded-xl border border-border/80 bg-muted/25 p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-3.5 w-3.5" />
        </div>
        <h4 className="text-[11px] font-bold uppercase tracking-[0.1em] text-foreground">{title}</h4>
      </div>

      {metrics.length > 0 ? (
        <dl className="space-y-2.5">
          {metrics.map((metric) => (
            <div key={metric.label} className="flex items-end justify-between gap-3 border-b border-border/60 pb-2 last:border-0 last:pb-0">
              <dt className="text-xs text-muted-foreground">{metric.label}</dt>
              <dd className="text-right text-sm font-bold tabular-nums text-foreground">
                {metric.value}
                {metric.unit && <span className="ml-1 text-[10px] font-medium text-muted-foreground">{metric.unit}</span>}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-xs leading-5 text-muted-foreground">Bu kategoride veri yok.</p>
      )}
    </section>
  )
}

function ProgressPhoto({ label, url, onClick }: { label: string; url: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative aspect-[3/4] min-h-44 w-full overflow-hidden rounded-xl border border-border bg-muted text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      aria-label={`${label} fotoğrafını büyüt`}
    >
      <img
        src={url}
        alt={`${label} ilerleme fotoğrafı`}
        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        crossOrigin="anonymous"
      />
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent px-3 pb-2.5 pt-8 text-xs font-bold text-white">
        {label}
      </span>
    </button>
  )
}
