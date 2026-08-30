import type React from 'react'
import type { ProgressEntry } from '@/types'

export const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
]

export const getPdfUtils = async () => {
  const { jsPDF } = await import('jspdf')
  const { default: html2canvas } = await import('html2canvas-pro')
  return { jsPDF, html2canvas }
}

export function getMonthLabel(dateStr: string) {
  const parts = dateStr.split('-')
  const monthIndex = parseInt(parts[1], 10) - 1
  const year = parts[0]
  return `${MONTH_NAMES[monthIndex]} ${year}`
}

export function getWeeklyDiff(
  current: number | null | undefined,
  prev: number | null | undefined,
  isWeightOrWaist: boolean = false
) {
  if (current === null || current === undefined || prev === null || prev === undefined) return null
  const diff = current - prev
  if (Math.abs(diff) < 0.05) return null
  const isGood = isWeightOrWaist ? diff < 0 : diff > 0
  const sign = diff > 0 ? '+' : ''
  const color = isGood ? '#0066FF' : '#EF4444'
  return { diff, sign, color }
}

export function getNetDiff(
  w4: number | null | undefined,
  w1: number | null | undefined,
  isWeightOrWaist: boolean = false
): string {
  if (w4 === null || w4 === undefined || w1 === null || w1 === undefined) return '—'
  const diff = w4 - w1
  if (Math.abs(diff) < 0.05) return '0.0'
  const sign = diff > 0 ? '+' : ''
  return `${sign}${diff.toFixed(1)}`
}

export type MonthStats = ReturnType<typeof calculateMonthStats>

export function calculateMonthStats(selectedMonth: string, entries: ProgressEntry[]) {
  if (!selectedMonth) return null

  const monthEntries = entries.filter((e) => e.date.startsWith(selectedMonth))
  if (monthEntries.length === 0) {
    return {
      totalEntries: 0,
      avgWeight: null,
      weightDiff: null,
      avgWaist: null,
      avgSleep: null,
      avgSteps: null,
      avgDiet: null,
      avgEnergy: null,
      benchMax: null,
      squatMax: null,
      deadliftMax: null,
      workoutsCompleted: 0,
      workoutsTarget: 0,
      photos: [] as string[],
      weeklyBreakdown: [
        { week_number: 1, label: '1. Hafta (1-7)', avg_weight: null, avg_waist: null, bench_max: null, squat_max: null, deadlift_max: null, avg_sleep: null, avg_steps: null, avg_diet: null, avg_energy: null, workouts_completed: 0, workouts_target: 0, photo_url: null },
        { week_number: 2, label: '2. Hafta (8-14)', avg_weight: null, avg_waist: null, bench_max: null, squat_max: null, deadlift_max: null, avg_sleep: null, avg_steps: null, avg_diet: null, avg_energy: null, workouts_completed: 0, workouts_target: 0, photo_url: null },
        { week_number: 3, label: '3. Hafta (15-21)', avg_weight: null, avg_waist: null, bench_max: null, squat_max: null, deadlift_max: null, avg_sleep: null, avg_steps: null, avg_diet: null, avg_energy: null, workouts_completed: 0, workouts_target: 0, photo_url: null },
        { week_number: 4, label: '4. Hafta (22+)', avg_weight: null, avg_waist: null, bench_max: null, squat_max: null, deadlift_max: null, avg_sleep: null, avg_steps: null, avg_diet: null, avg_energy: null, workouts_completed: 0, workouts_target: 0, photo_url: null }
      ]
    }
  }

  const sorted = [...monthEntries].sort((a, b) => a.date.localeCompare(b.date))
  const weights = sorted.map(e => e.weight).filter((w): w is number => w !== null)
  const avgWeight = weights.length > 0 ? weights.reduce((sum, w) => sum + w, 0) / weights.length : null
  const startWeight = weights.length > 0 ? weights[0] : null
  const endWeight = weights.length > 0 ? weights[weights.length - 1] : null
  const weightDiff = startWeight !== null && endWeight !== null ? endWeight - startWeight : null

  const waists: number[] = []
  const sleepHours: number[] = []
  const steps: number[] = []
  const diets: number[] = []
  const energies: number[] = []
  let benchMax = 0
  let squatMax = 0
  let deadliftMax = 0
  let workoutsCompleted = 0
  let workoutsTarget = 0
  const photos: string[] = []

  sorted.forEach((e) => {
    const m = (e.custom_metrics as Record<string, string | number | null | undefined>) || {}
    const waist = parseFloat(m.waist_cm?.toString() ?? '')
    if (!isNaN(waist)) waists.push(waist)
    const sleep = parseFloat(m.sleep_hours_avg?.toString() ?? '')
    if (!isNaN(sleep)) sleepHours.push(sleep)
    const step = parseFloat(m.steps_avg?.toString() ?? '')
    if (!isNaN(step)) steps.push(step)
    const diet = parseFloat(m.diet_compliance?.toString() ?? '')
    if (!isNaN(diet)) diets.push(diet)
    const energy = parseFloat(m.energy_level?.toString() ?? '')
    if (!isNaN(energy)) energies.push(energy)

    const bench = parseFloat(m.bench_press_max?.toString() ?? '')
    if (!isNaN(bench) && bench > benchMax) benchMax = bench
    const squat = parseFloat(m.squat_max?.toString() ?? '')
    if (!isNaN(squat) && squat > squatMax) squatMax = squat
    const dead = parseFloat(m.deadlift_max?.toString() ?? '')
    if (!isNaN(dead) && dead > deadliftMax) deadliftMax = dead

    const completed = parseInt(m.workout_days_completed?.toString() ?? '', 10)
    const target = parseInt(m.workout_days_target?.toString() ?? '', 10)
    if (!isNaN(completed)) workoutsCompleted += completed
    if (!isNaN(target)) workoutsTarget += target

    if (e.before_photo_url) {
      photos.push(e.before_photo_url)
    }
  })

  const avgWaist = waists.length > 0 ? waists.reduce((s, x) => s + x, 0) / waists.length : null
  const avgSleep = sleepHours.length > 0 ? sleepHours.reduce((s, x) => s + x, 0) / sleepHours.length : null
  const avgSteps = steps.length > 0 ? steps.reduce((s, x) => s + x, 0) / steps.length : null
  const avgDiet = diets.length > 0 ? diets.reduce((s, x) => s + x, 0) / diets.length : null
  const avgEnergy = energies.length > 0 ? energies.reduce((s, x) => s + x, 0) / energies.length : null

  const weekBins = [
    { num: 1, label: '1. Hafta (1-7)', startDay: 1, endDay: 7, entries: [] as ProgressEntry[] },
    { num: 2, label: '2. Hafta (8-14)', startDay: 8, endDay: 14, entries: [] as ProgressEntry[] },
    { num: 3, label: '3. Hafta (15-21)', startDay: 15, endDay: 21, entries: [] as ProgressEntry[] },
    { num: 4, label: '4. Hafta (22+)', startDay: 22, endDay: 31, entries: [] as ProgressEntry[] }
  ]

  sorted.forEach((e) => {
    const parts = e.date.split('-')
    const day = parseInt(parts[2], 10)
    if (isNaN(day)) return
    if (day >= 1 && day <= 7) weekBins[0].entries.push(e)
    else if (day >= 8 && day <= 14) weekBins[1].entries.push(e)
    else if (day >= 15 && day <= 21) weekBins[2].entries.push(e)
    else weekBins[3].entries.push(e)
  })

  const weeklyBreakdown = weekBins.map((bin) => {
    const wEntries = bin.entries
    if (wEntries.length === 0) {
      return {
        week_number: bin.num,
        label: bin.label,
        avg_weight: null,
        avg_waist: null,
        bench_max: null,
        squat_max: null,
        deadlift_max: null,
        avg_sleep: null,
        avg_steps: null,
        avg_diet: null,
        avg_energy: null,
        workouts_completed: 0,
        workouts_target: 0,
        photo_url: null
      }
    }

    const wWeights = wEntries.map(e => e.weight).filter((w): w is number => w !== null)
    const wAvgWeight = wWeights.length > 0 ? wWeights.reduce((s, x) => s + x, 0) / wWeights.length : null

    const wWaists: number[] = []
    const wSleep: number[] = []
    const wSteps: number[] = []
    const wDiets: number[] = []
    const wEnergies: number[] = []
    let wBench = 0
    let wSquat = 0
    let wDead = 0
    let wCompleted = 0
    let wTarget = 0
    let wPhotoUrl: string | null = null

    wEntries.forEach((e) => {
      const m = (e.custom_metrics as Record<string, string | number | null | undefined>) || {}
      const waist = parseFloat(m.waist_cm?.toString() ?? '')
      if (!isNaN(waist)) wWaists.push(waist)
      const sleep = parseFloat(m.sleep_hours_avg?.toString() ?? '')
      if (!isNaN(sleep)) wSleep.push(sleep)
      const step = parseFloat(m.steps_avg?.toString() ?? '')
      if (!isNaN(step)) wSteps.push(step)
      const diet = parseFloat(m.diet_compliance?.toString() ?? '')
      if (!isNaN(diet)) wDiets.push(diet)
      const energy = parseFloat(m.energy_level?.toString() ?? '')
      if (!isNaN(energy)) wEnergies.push(energy)

      const bench = parseFloat(m.bench_press_max?.toString() ?? '')
      if (!isNaN(bench) && bench > wBench) wBench = bench
      const squat = parseFloat(m.squat_max?.toString() ?? '')
      if (!isNaN(squat) && squat > wSquat) wSquat = squat
      const dead = parseFloat(m.deadlift_max?.toString() ?? '')
      if (!isNaN(dead) && dead > wDead) wDead = dead

      const completed = parseInt(m.workout_days_completed?.toString() ?? '', 10)
      const target = parseInt(m.workout_days_target?.toString() ?? '', 10)
      if (!isNaN(completed)) workoutsCompleted += completed
      if (!isNaN(target)) workoutsTarget += target

      if (e.before_photo_url && !wPhotoUrl) {
        wPhotoUrl = e.before_photo_url
      }
    })

    return {
      week_number: bin.num,
      label: bin.label,
      avg_weight: wAvgWeight,
      avg_waist: wWaists.length > 0 ? wWaists.reduce((s, x) => s + x, 0) / wWaists.length : null,
      bench_max: wBench || null,
      squat_max: wSquat || null,
      deadlift_max: wDead || null,
      avg_sleep: wSleep.length > 0 ? wSleep.reduce((s, x) => s + x, 0) / wSleep.length : null,
      avg_steps: wSteps.length > 0 ? wSteps.reduce((s, x) => s + x, 0) / wSteps.length : null,
      avg_diet: wDiets.length > 0 ? wDiets.reduce((s, x) => s + x, 0) / wDiets.length : null,
      avg_energy: wEnergies.length > 0 ? wEnergies.reduce((s, x) => s + x, 0) / wEnergies.length : null,
      workouts_completed: wCompleted,
      workouts_target: wTarget,
      photo_url: wPhotoUrl
    }
  })

  return {
    totalEntries: monthEntries.length,
    avgWeight,
    weightDiff,
    avgWaist,
    avgSleep,
    avgSteps,
    avgDiet,
    avgEnergy,
    benchMax: benchMax || null,
    squatMax: squatMax || null,
    deadliftMax: deadliftMax || null,
    workoutsCompleted,
    workoutsTarget,
    photos,
    weeklyBreakdown
  }
}
