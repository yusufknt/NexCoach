import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { StudentStatusBadge } from '@/components/coach/student-status-badge'
import { formatDate } from '@/lib/coach/format'
import type { CoachStudentDetail } from '@/lib/coach/types'
import type { StudentOnboardingView } from '@/lib/coach/onboarding.server'

type StudentProfileHeaderProps = {
  student: CoachStudentDetail
  onboarding: StudentOnboardingView | null
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

export function StudentProfileHeader({ student, onboarding }: StudentProfileHeaderProps) {
  return (
    <Card className="surface-card">
      <CardContent className="p-6 space-y-4">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 border border-border/50 shadow-sm">
              {student.avatarUrl && (
                <AvatarImage src={student.avatarUrl} alt={student.fullName} />
              )}
              <AvatarFallback className="bg-primary/10 text-base font-semibold text-primary">
                {student.fullName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">{student.fullName}</h1>
                <StudentStatusBadge status={student.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                {student.packageName ?? 'Paket atanmamış'} · Başlangıç:{' '}
                {formatDate(student.startDate)}
                {student.endDate
                  ? ` · Bitiş: ${formatDate(student.endDate)}`
                  : ''}
              </p>
            </div>
          </div>

          <Link
            href="/coach/ogrenciler"
            className={buttonVariants({
              variant: 'outline',
              size: 'sm',
              className: 'border-border text-foreground hover:bg-muted',
            })}
          >
            Listeye dön
          </Link>
        </div>

        {/* Quick Physical Profile metrics bar */}
        {onboarding?.profile && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border/70 pt-3.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span>Boy:</span>
              <span className="font-medium text-foreground">{onboarding.profile.height_cm} cm</span>
            </div>
            <div className="h-3 w-[1px] bg-border/60 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <span>Başlangıç Kilosu:</span>
              <span className="font-medium text-foreground">{onboarding.profile.initial_weight} kg</span>
            </div>
            <div className="h-3 w-[1px] bg-border/60 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <span>Yaş:</span>
              <span className="font-medium text-foreground">{calculateAge(onboarding.profile.birth_date)}</span>
            </div>
            <div className="h-3 w-[1px] bg-border/60 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <span>Hedef:</span>
              <span className="font-medium text-primary">
                {onboarding.profile.goal ? (goalMap[onboarding.profile.goal] || onboarding.profile.goal) : '-'}
              </span>
            </div>
            <div className="h-3 w-[1px] bg-border/60 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <span>Deneyim:</span>
              <span className="font-medium text-foreground">
                {onboarding.profile.experience ? (experienceMap[onboarding.profile.experience] || onboarding.profile.experience) : '-'}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
