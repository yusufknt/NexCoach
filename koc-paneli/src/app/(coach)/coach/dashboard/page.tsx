import { redirect } from 'next/navigation'
import { getDashboardData } from '@/lib/coach/dashboard.server'
import { DashboardStatsCards } from '@/components/coach/dashboard-stats'
import { UpcomingAppointments } from '@/components/coach/upcoming-appointments'
import { ActivityFeed } from '@/components/coach/activity-feed'
import { DashboardCharts } from '@/components/coach/dashboard-charts'
import { QuickActions } from '@/components/coach/quick-actions'
import { TopStudents } from '@/components/coach/top-students'
import { CoachPageHeader } from '@/components/coach/page-header'
import { Bell, Search, ShieldCheck } from 'lucide-react'

export default async function CoachDashboardPage() {
  const data = await getDashboardData()

  if (!data) {
    redirect('/giris')
  }

  return (
    <div className="coach-page">
      <div className="coach-container space-y-6">
        <CoachPageHeader
          eyebrow="Genel Bakış"
          title="Koçluk Paneli"
          description="Danışanlarınızı, seanslarınızı ve gelir akışınızı tek ekrandan yönetin."
          action={
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative min-w-0 sm:w-80">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  className="h-10 w-full rounded-xl border border-border bg-card pl-10 pr-3 text-sm text-foreground shadow-xs outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/15"
                  placeholder="Danışan veya program ara..."
                  type="search"
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-xs transition-colors hover:bg-muted">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  {data.stats.unreadMessageCount > 0 && (
                    <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-blue-600" />
                  )}
                </div>
                <div className="hidden items-center gap-1.5 rounded-xl border border-blue-200/70 bg-blue-50/80 px-3 py-2 text-xs font-semibold text-primary shadow-xs sm:flex">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Pro Coach</span>
                </div>
              </div>
            </div>
          }
        />

        {/* 4 Top KPI Metric Cards */}
        <DashboardStatsCards
          stats={data.stats}
          appointmentCount={data.upcomingAppointments.length}
          activityCount={data.activities.length}
        />

        {/* Danışan Spotlight & Quick Actions Band */}
        <QuickActions students={data.topStudents} />

        {/* Revenue & Growth Charts */}
        <DashboardCharts revenue={data.revenue} growth={data.growth} />

        {/* Bottom 3-column widgets */}
        <div className="grid gap-6 xl:grid-cols-3">
          <UpcomingAppointments appointments={data.upcomingAppointments} />
          <ActivityFeed activities={data.activities} />
          <TopStudents students={data.topStudents} />
        </div>
      </div>
    </div>
  )
}
