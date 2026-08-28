import { Card, CardTitle } from '@/components/ui/card'
import { CheckCircle2, MessageSquare, UserPlus, Activity } from 'lucide-react'
import { formatRelativeTime } from '@/lib/coach/format'
import type { ActivityItem } from '@/lib/coach/types'

type ActivityFeedProps = {
  activities: ActivityItem[]
}

const activityConfig = {
  new_student: {
    icon: UserPlus,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  message: {
    icon: MessageSquare,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  progress: {
    icon: CheckCircle2,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs transition-all hover:shadow-md">
      <div className="flex items-center justify-between border-b border-border/70 pb-4">
        <div>
          <CardTitle className="text-base font-bold text-foreground">
            Son Aktiviteler
          </CardTitle>
          <p className="text-xs text-muted-foreground">Platform içi son hareketler</p>
        </div>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground">
          <Activity className="h-4 w-4" />
        </div>
      </div>

      <div className="pt-4">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground">
              <Activity className="h-5 w-5" />
            </div>
            <p className="mt-3 text-xs font-medium text-muted-foreground">
              Henüz aktivite bulunmuyor.
            </p>
          </div>
        ) : (
          <ul className="relative space-y-4 before:absolute before:bottom-3 before:left-[15px] before:top-3 before:w-px before:bg-border/80">
            {activities.map((activity) => {
              const cfg = activityConfig[activity.type] || {
                icon: Activity,
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              }
              const Icon = cfg.icon

              return (
                <li key={activity.id} className="relative flex items-start gap-3.5">
                  <div
                    className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-border/60 ${cfg.bg} ${cfg.color} shadow-xs`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {activity.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="mt-1 text-[11px] font-medium text-muted-foreground/70">
                      {formatRelativeTime(activity.createdAt)}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </Card>
  )
}
