import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { FileUp, MessageSquare, CalendarPlus, ArrowRight } from 'lucide-react'
import type { TopActiveStudent } from '@/lib/coach/types'

type QuickActionsProps = {
  students?: TopActiveStudent[]
}

const actions = [
  {
    label: 'Program Hazırla',
    description: 'Antrenman & Beslenme',
    href: '/coach/ogrenciler',
    icon: FileUp,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
  },
  {
    label: 'Mesaj Gönder',
    description: 'Danışanlara hızlı ulaş',
    href: '/coach/mesajlar',
    icon: MessageSquare,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
  },
  {
    label: 'Randevu Planla',
    description: 'Birebir seans ekle',
    href: '/coach/takvim',
    icon: CalendarPlus,
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-50',
  },
]

export function QuickActions({ students = [] }: QuickActionsProps) {
  return (
    <div className="space-y-4">
      {/* Student Spotlight Strip (Inspired by Reference Image Leads Bar) */}
      <Card className="overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              <h3 className="text-base font-bold text-foreground">
                Danışan Takibi & Hızlı İletişim
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Aktif danışanlarınızın haftalık durumunu inceleyin ve hemen aksiyon alın.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {students.slice(0, 5).map((student) => {
              const firstName = student.fullName.split(' ')[0]
              return (
                <Link
                  key={student.studentId}
                  href={`/coach/ogrenciler/${student.studentId}`}
                  className="group flex flex-col items-center gap-1.5 transition-transform hover:scale-105"
                  title={student.fullName}
                >
                  <Avatar className="h-10 w-10 border-2 border-border transition-colors group-hover:border-primary">
                    {student.avatarUrl && <AvatarImage src={student.avatarUrl} alt={student.fullName} />}
                    <AvatarFallback className="bg-slate-100 text-xs font-semibold text-slate-700">
                      {student.fullName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-[60px] truncate text-[11px] font-medium text-muted-foreground group-hover:text-foreground">
                    {firstName}
                  </span>
                </Link>
              )
            })}

            <Link
              href="/coach/ogrenciler"
              className="flex h-10 items-center gap-1.5 rounded-full border border-border/80 bg-muted/40 px-3 text-xs font-semibold text-foreground transition-all hover:bg-muted hover:text-primary"
            >
              <span>Tümü</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </Card>

      {/* Quick Action Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Link key={action.href} href={action.href} className="group">
              <Card className="h-full rounded-2xl border border-border/80 bg-card p-4.5 shadow-xs transition-all duration-200 hover:border-border hover:shadow-md">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${action.iconBg} transition-transform duration-200 group-hover:scale-105`}
                  >
                    <Icon className={`h-5 w-5 ${action.iconColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-foreground">
                      {action.label}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {action.description}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/50 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary" />
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
