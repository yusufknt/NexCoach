import { Card, CardContent } from '@/components/ui/card'
import {
  Users,
  MessageSquare,
  Calendar,
  Activity,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react'
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
      trend: '+12.5%',
      trendLabel: 'geçen aya göre',
      trendPositive: true,
      icon: Users,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      bars: [30, 45, 60, 40, 75, 100, 65, 80, 90, 50],
      activeBarColor: 'bg-blue-600',
    },
    {
      title: 'Okunmamış Mesaj',
      value: stats.unreadMessageCount,
      trend: stats.unreadMessageCount > 0 ? 'Bekliyor' : 'Tümü okundu',
      trendLabel: 'gelen kutusu',
      trendPositive: stats.unreadMessageCount === 0,
      icon: MessageSquare,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      bars: [20, 50, 30, 70, 40, 85, 100, 45, 60, 35],
      activeBarColor: 'bg-emerald-500',
    },
    {
      title: 'Yaklaşan Randevu',
      value: appointmentCount,
      trend: '48 Saat',
      trendLabel: 'planlanan görüşmeler',
      trendPositive: true,
      icon: Calendar,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
      bars: [40, 25, 60, 80, 50, 90, 100, 70, 55, 45],
      activeBarColor: 'bg-amber-500',
    },
    {
      title: 'Haftalık Aktivite',
      value: activityCount,
      trend: '+18.4%',
      trendLabel: 'bu hafta canlı',
      trendPositive: true,
      icon: Activity,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50',
      bars: [35, 55, 40, 70, 90, 65, 100, 80, 75, 60],
      activeBarColor: 'bg-indigo-600',
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

              <div className="mt-4 flex items-end justify-between">
                <div>
                  <div className="text-3xl font-bold tracking-tight text-foreground">
                    {item.value}
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[11px]">
                    <span
                      className={`inline-flex items-center font-medium ${
                        item.trendPositive ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {item.trendPositive ? (
                        <ArrowUpRight className="mr-0.5 h-3 w-3" />
                      ) : null}
                      {item.trend}
                    </span>
                    <span className="text-muted-foreground">{item.trendLabel}</span>
                  </div>
                </div>

                {/* Mini Sparkline Bar Chart from Reference Image */}
                <div className="flex h-10 items-end gap-[3px] pb-1">
                  {item.bars.map((heightPercent, idx) => {
                    const isPeak = heightPercent === 100
                    return (
                      <div
                        key={idx}
                        className={`w-1 rounded-full transition-all duration-300 ${
                          isPeak ? item.activeBarColor : 'bg-muted-foreground/15'
                        }`}
                        style={{ height: `${Math.max(15, heightPercent)}%` }}
                      />
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
