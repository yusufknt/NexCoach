import { Card, CardContent } from '@/components/ui/card'
import { Users, MessageSquare, Calendar, Activity } from 'lucide-react'
import type { DashboardStats } from '@/lib/coach/types'

type DashboardStatsProps = {
  stats: DashboardStats
  appointmentCount: number
  activityCount: number
}

export function DashboardStatsCards({
  stats,
  appointmentCount,
  activityCount,
}: DashboardStatsProps) {
  const items = [
    {
      title: 'Aktif Danışan',
      value: stats.activeStudentCount,
      detail: 'mevcut aktif kayıt',
      icon: Users,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
    },
    {
      title: 'Okunmamış Mesaj',
      value: stats.unreadMessageCount,
      detail: stats.unreadMessageCount > 0 ? 'yanıt bekleyen mesaj' : 'tümü okundu',
      icon: MessageSquare,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
    },
    {
      title: 'Yaklaşan Randevu',
      value: appointmentCount,
      detail: 'önümüzdeki 48 saat',
      icon: Calendar,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
    },
    {
      title: 'Son Aktiviteler',
      value: activityCount,
      detail: 'aktivite akışındaki kayıt',
      icon: Activity,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Card
            key={item.title}
            className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-xs transition-all duration-200 hover:border-border hover:shadow-md"
          >
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${item.iconBg}`}>
                    <Icon className={`h-4 w-4 ${item.iconColor}`} />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {item.title}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <div>
                  <div className="text-3xl font-bold tracking-tight text-foreground">
                    {item.value}
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    {item.detail}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
