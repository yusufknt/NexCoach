import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, CalendarDays, UserRound } from 'lucide-react'
import { cancelCoachInvitation } from '@/lib/admin/admin-actions'
import { getAdminCoaches, getAdminCoachInvitations } from '@/lib/admin/admin.server'
import { CoachInviteForm } from '@/components/admin/coach-invite-form'
import { AccessStatusBadge, InvitationStatusBadge } from '@/components/admin/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils/format'

function inputDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export default async function AdminCoachesPage() {
  const [coaches, invitations] = await Promise.all([
    getAdminCoaches(),
    getAdminCoachInvitations(),
  ])
  if (!coaches || !invitations) redirect('/giris')

  const startsAt = new Date()
  const endsAt = new Date()
  endsAt.setDate(endsAt.getDate() + 30)

  return (
    <div className="coach-page">
      <div className="coach-container space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Yönetim</p>
          <h1 className="mt-1 text-3xl font-bold">Koçlar</h1>
          <p className="mt-2 text-sm text-muted-foreground">Koç davetlerini, erişim sürelerini ve öğrenci bağlantılarını yönetin.</p>
        </div>

        <CoachInviteForm defaultStartsAt={inputDate(startsAt)} defaultEndsAt={inputDate(endsAt)} />

        <Card>
          <CardHeader><CardTitle>Kayıtlı koçlar</CardTitle></CardHeader>
          <CardContent className="px-0">
            {coaches.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">Henüz kayıtlı koç yok.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-left text-sm">
                  <thead className="border-y bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Koç</th>
                      <th className="px-4 py-3 font-semibold">Durum</th>
                      <th className="px-4 py-3 font-semibold">Öğrenciler</th>
                      <th className="px-4 py-3 font-semibold">Erişim bitişi</th>
                      <th className="px-4 py-3 font-semibold">Son oturum</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {coaches.map((coach) => (
                      <tr key={coach.id} className="list-row">
                        <td className="px-4 py-4">
                          <p className="font-semibold">{coach.fullName}</p>
                          <p className="text-xs text-muted-foreground">{coach.email}</p>
                        </td>
                        <td className="px-4 py-4"><AccessStatusBadge status={coach.accessStatus} endsAt={coach.endsAt} /></td>
                        <td className="px-4 py-4">
                          <span className="font-semibold tabular-nums">{coach.activeStudentCount}</span>
                          <span className="text-muted-foreground"> / {coach.studentCount} aktif</span>
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">{coach.endsAt ? formatDate(coach.endsAt) : 'Süresiz'}</td>
                        <td className="px-4 py-4 text-muted-foreground">
                          {coach.lastSessionAt ? formatDate(new Date(coach.lastSessionAt).toISOString()) : 'Henüz yok'}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Button variant="ghost" render={<Link href={`/admin/koclar/${coach.id}`} />}>
                            Detay <ArrowRight className="size-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Koç davetleri</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {invitations.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Henüz davet oluşturulmadı.</p>
            ) : invitations.map((invitation) => (
              <div key={invitation.id} className="flex flex-col justify-between gap-4 rounded-xl border p-4 sm:flex-row sm:items-center">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted"><UserRound className="size-4" /></span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{invitation.fullName}</p>
                    <p className="truncate text-xs text-muted-foreground">{invitation.email}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarDays className="size-3" /> Panel: {formatDate(invitation.accessStartsAt)} – {formatDate(invitation.accessEndsAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <InvitationStatusBadge status={invitation.status} />
                  {invitation.status === 'pending' && (
                    <form action={cancelCoachInvitation}>
                      <input type="hidden" name="invitationId" value={invitation.id} />
                      <Button type="submit" variant="ghost" size="sm">İptal et</Button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
