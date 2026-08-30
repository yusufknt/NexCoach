'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Flame, Calendar, FileText, MessageSquare, ArrowRight, Video, Check, Scale, User } from 'lucide-react'
import { formatDateTime, formatDate } from '@/lib/coach/format'
import { quickWeightEntry } from '@/lib/student/progress.client'
import type { StudentDashboardData } from '@/lib/student/types'
import type { StudentProfile } from '@/types'

type StudentDashboardClientProps = {
  data: StudentDashboardData
  studentId: string
  profile: StudentProfile | null
}

const experienceMap: Record<string, string> = {
  beginner: 'Yeni Başlayan',
  '1-3years': '1-3 Yıl',
  '3plus': '3+ Yıl',
}

const goalMap: Record<string, string> = {
  muscle_gain: 'Kas Kazanımı',
  fat_loss: 'Yağ Yakımı',
  recomposition: 'Rekomposizyon',
  strength: 'Güç',
}

function calculateAge(birthDate: string | null): number | string {
  if (!birthDate) return '-'
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}


export function StudentDashboardClient({ data, studentId, profile }: StudentDashboardClientProps) {
  const [weight, setWeight] = useState('')
  const [weightSaved, setWeightSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleQuickWeight = async () => {
    const w = parseFloat(weight)
    if (isNaN(w) || w <= 0) return
    setSaving(true)
    const result = await quickWeightEntry(studentId, data.coachId, w)
    if (result) {
      setWeightSaved(true)
      setWeight('')
      setTimeout(() => setWeightSaved(false), 3000)
    }
    setSaving(false)
  }

  const progressPercent = data.totalDays && data.daysRemaining != null
    ? Math.round(((data.totalDays - data.daysRemaining) / data.totalDays) * 100)
    : null

  return (
    <div className="space-y-6">
      {/* Unread message banner */}
      {data.unreadMessageCount > 0 && (
        <Link href="/student/mesajlar">
          <div className="flex items-center justify-between rounded-xl border border-primary/25 bg-primary/10 px-5 py-3 transition-all hover:bg-primary/15">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Koçunuzdan {data.unreadMessageCount} yeni mesaj var
              </span>
            </div>
            <ArrowRight className="h-4 w-4 text-primary" />
          </div>
        </Link>
      )}

      {/* Welcome + Coach Card */}
      <Card className="surface-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-border/60">
              {data.coachAvatarUrl && <AvatarImage src={data.coachAvatarUrl} />}
              <AvatarFallback className="bg-muted text-xl text-foreground">
                {data.coachName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Koçun</p>
              <p className="text-lg font-bold text-foreground">{data.coachName}</p>
              {data.packageName && (
                <p className="mt-0.5 text-sm text-primary">{data.packageName}</p>
              )}
            </div>
          </div>

          {/* Progress bar */}
          {progressPercent != null && (
            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                <span>Paket süresi</span>
                <span>{data.daysRemaining} gün kaldı</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary transition-all"
                  style={{ width: `${Math.min(progressPercent, 100)}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Physical Profile Card */}
      {profile && (
        <Card className="surface-card overflow-hidden">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <User className="h-4 w-4 text-primary" />
              Başlangıç Fiziksel Profilim
            </CardTitle>
            <Link
              href="/student/profil"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              Tüm Profilim
              <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
              <div className="rounded-lg bg-muted/30 p-3 text-center border border-border/40 hover:border-primary/30 transition-all">
                <p className="text-xs text-muted-foreground">Boy</p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {profile.height_cm ? `${profile.height_cm} cm` : '-'}
                </p>
              </div>
              <div className="rounded-lg bg-muted/30 p-3 text-center border border-border/40 hover:border-primary/30 transition-all">
                <p className="text-xs text-muted-foreground">Başlangıç Kilo</p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {profile.initial_weight ? `${profile.initial_weight} kg` : '-'}
                </p>
              </div>
              <div className="rounded-lg bg-muted/30 p-3 text-center border border-border/40 hover:border-primary/30 transition-all">
                <p className="text-xs text-muted-foreground">Yaş</p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {calculateAge(profile.birth_date)}
                </p>
              </div>
              <div className="rounded-lg bg-muted/30 p-3 text-center border border-border/40 hover:border-primary/30 transition-all">
                <p className="text-xs text-muted-foreground">Yağ Oranı</p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {profile.body_fat_percentage ? `%${profile.body_fat_percentage}` : '-'}
                </p>
              </div>
              <div className="rounded-lg bg-muted/30 p-3 text-center border border-border/40 hover:border-primary/30 transition-all col-span-1">
                <p className="text-xs text-muted-foreground">Hedef</p>
                <p className="mt-1 text-sm font-bold text-primary truncate">
                  {goalMap[profile.goal || ''] || profile.goal || '-'}
                </p>
              </div>
              <div className="rounded-lg bg-muted/30 p-3 text-center border border-border/40 hover:border-primary/30 transition-all col-span-1">
                <p className="text-xs text-muted-foreground">Deneyim</p>
                <p className="mt-1 text-sm font-bold text-foreground truncate">
                  {experienceMap[profile.experience || ''] || profile.experience || '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}


      {/* Streak + Quick Weight */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Streak */}
        <Card className="surface-card">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
              <Flame className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{data.streak}</p>
              <p className="text-sm text-muted-foreground">
                {data.streak > 0 ? 'Gün serisi! Devam et' : 'Bugün kayıt ekle!'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick weight */}
        <Card className="surface-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Scale className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">Hızlı Kilo Girişi</p>
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                step="0.1"
                placeholder="Ör: 75.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="coach-input"
                disabled={weightSaved}
              />
              <Button
                onClick={handleQuickWeight}
                disabled={saving || weightSaved || !weight}
                className={weightSaved ? 'bg-emerald-600 text-white' : 'bg-primary text-primary-foreground hover:bg-primary'}
                size="icon"
              >
                {weightSaved ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session + Program */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Upcoming session */}
        <Card className="surface-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              Yaklaşan Randevu
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.upcomingSession ? (
              <div>
                <p className="font-medium text-foreground">{data.upcomingSession.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatDateTime(data.upcomingSession.startTime)}
                </p>
                {data.upcomingSession.meetingUrl && (
                  <a
                    href={data.upcomingSession.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary/15 px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/25"
                  >
                    <Video className="h-3.5 w-3.5" />
                    Görüşmeye Katıl
                  </a>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Yaklaşan randevu yok.</p>
            )}
          </CardContent>
        </Card>

        {/* Latest program */}
        <Card className="surface-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <FileText className="h-4 w-4 text-primary" />
              Son Program
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.latestProgram ? (
              <div>
                <p className="font-medium text-foreground">{data.latestProgram.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatDate(data.latestProgram.createdAt)}
                </p>
                <Link
                  href="/student/programlar"
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
                >
                  Görüntüle
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Henüz program yüklenmedi.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
