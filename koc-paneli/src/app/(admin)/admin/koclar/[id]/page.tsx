import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, CalendarDays, Mail, Users } from 'lucide-react'
import { updateCoachAccess } from '@/lib/admin/admin-actions'
import { getAuthenticatedAdminId } from '@/lib/admin/auth'
import { getAdminCoachDetail } from '@/lib/admin/admin.server'
import { AccessStatusBadge } from '@/components/admin/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatDate } from '@/lib/utils/format'

type AdminCoachDetailPageProps = { params: Promise<{ id: string }> }

export default async function AdminCoachDetailPage({ params }: AdminCoachDetailPageProps) {
  if (!await getAuthenticatedAdminId()) redirect('/giris')
  const { id } = await params
  const data = await getAdminCoachDetail(id)
  if (!data) notFound()

  const { coach, students } = data
  return (
    <div className="coach-page">
      <div className="coach-container space-y-8">
        <div>
          <Button variant="ghost" render={<Link href="/admin/koclar" />}><ArrowLeft className="size-4" /> Koçlara dön</Button>
          <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-bold">{coach.fullName}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><Mail className="size-4" /> {coach.email}</p>
            </div>
            <AccessStatusBadge status={coach.accessStatus} endsAt={coach.endsAt} />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="size-4 text-primary" /> Bağlı öğrenciler</CardTitle>
              <CardDescription>{students.length} öğrenci bu koça bağlı.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {students.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Bu koça bağlı öğrenci bulunmuyor.</p>
              ) : students.map((student) => (
                <div key={student.id} className="flex flex-col justify-between gap-3 rounded-xl border p-4 sm:flex-row sm:items-center">
                  <div>
                    <p className="font-semibold">{student.fullName}</p>
                    <p className="text-xs text-muted-foreground">{student.email}</p>
                  </div>
                  <div className="text-left text-xs text-muted-foreground sm:text-right">
                    <p className="font-medium text-foreground">{student.packageName ?? 'Paket atanmamış'}</p>
                    <p>{formatDate(student.startDate)} – {student.endDate ? formatDate(student.endDate) : 'Süresiz'}</p>
                    <p className="mt-1 capitalize">{student.status}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CalendarDays className="size-4 text-primary" /> Panel erişimi</CardTitle>
              <CardDescription>Pasif duruma alınan koçun açık oturumları kapatılır.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={updateCoachAccess} className="space-y-4">
                <input type="hidden" name="coachId" value={coach.id} />
                <div className="space-y-2">
                  <Label htmlFor="status">Durum</Label>
                  <select id="status" name="status" defaultValue={coach.accessStatus} className="input-surface h-9 w-full px-3 text-sm">
                    <option value="active">Aktif</option>
                    <option value="expired">Süresi doldu</option>
                    <option value="suspended">Askıya alındı</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ends-at">Erişim bitişi</Label>
                  <Input id="ends-at" name="endsAt" type="date" defaultValue={coach.endsAt?.slice(0, 10)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment-note">Ödeme notu</Label>
                  <Input id="payment-note" name="paymentNote" defaultValue={coach.paymentNote ?? ''} placeholder="IBAN ödemesi / dönem" />
                </div>
                <Button type="submit" size="lg" className="w-full">Erişimi Güncelle</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
