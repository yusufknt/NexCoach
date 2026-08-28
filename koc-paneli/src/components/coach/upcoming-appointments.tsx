import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, ArrowUpRight } from 'lucide-react'
import { formatDateTime } from '@/lib/coach/format'
import type { UpcomingAppointment } from '@/lib/coach/types'

type UpcomingAppointmentsProps = {
  appointments: UpcomingAppointment[]
}

export function UpcomingAppointments({
  appointments,
}: UpcomingAppointmentsProps) {
  return (
    <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs transition-all hover:shadow-md">
      <div className="flex items-center justify-between border-b border-border/70 pb-4">
        <div>
          <CardTitle className="text-base font-bold text-foreground">
            Yaklaşan Randevular
          </CardTitle>
          <p className="text-xs text-muted-foreground">Bugün ve yarın planlananlar</p>
        </div>
        <Link
          href="/coach/takvim"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Takvime git"
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="pt-4">
        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground">
              <Calendar className="h-5 w-5" />
            </div>
            <p className="mt-3 text-xs font-medium text-muted-foreground">
              Yaklaşan randevu bulunmuyor.
            </p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {appointments.map((appointment) => {
              const appDate = new Date(appointment.startTime)
              return (
                <li
                  key={appointment.id}
                  className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/20 p-3 transition-colors hover:bg-muted/60"
                >
                  {/* Date tile */}
                  <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <span className="text-sm font-bold leading-none">
                      {appDate.getDate()}
                    </span>
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-blue-500">
                      {appDate.toLocaleDateString('tr-TR', { month: 'short' })}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {appointment.title}
                    </p>
                    {appointment.studentName && (
                      <p className="truncate text-xs text-muted-foreground">
                        {appointment.studentName}
                      </p>
                    )}
                  </div>

                  <span className="shrink-0 rounded-lg bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
                    {appDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </Card>
  )
}
