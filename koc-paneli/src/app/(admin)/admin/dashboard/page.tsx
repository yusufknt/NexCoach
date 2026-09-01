import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Activity, Clock3, GraduationCap, UserCheck, Users, UserX } from 'lucide-react'
import { getAdminDashboardData } from '@/lib/admin/admin.server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData()
  if (!data) redirect('/giris')

  const metrics = [
    { label: 'Toplam koç', value: data.totalCoaches, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Aktif koç', value: data.activeCoaches, icon: UserCheck, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Pasif koç', value: data.inactiveCoaches, icon: UserX, color: 'text-rose-600 bg-rose-50' },
    { label: 'Toplam öğrenci', value: data.totalStudents, icon: GraduationCap, color: 'text-violet-600 bg-violet-50' },
    { label: 'Aktif üyelik', value: data.activeRelationships, icon: Activity, color: 'text-cyan-600 bg-cyan-50' },
    { label: 'Bekleyen davet', value: data.pendingInvitations, icon: Clock3, color: 'text-amber-600 bg-amber-50' },
  ]

  return (
    <div className="coach-page">
      <div className="coach-container space-y-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Yönetim</p>
            <h1 className="mt-1 text-3xl font-bold">Genel Bakış</h1>
            <p className="mt-2 text-sm text-muted-foreground">Platformdaki koç, öğrenci ve erişim durumlarını izleyin.</p>
          </div>
          <Button render={<Link href="/admin/koclar" />}>Koçları Yönet</Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <Card key={metric.label}>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="text-sm text-muted-foreground">{metric.label}</CardTitle>
                  <span className={`flex size-9 items-center justify-center rounded-xl ${metric.color}`}><Icon className="size-4" /></span>
                </CardHeader>
                <CardContent><p className="text-3xl font-bold tabular-nums">{metric.value}</p></CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
