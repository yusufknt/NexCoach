'use client'

import { useActionState } from 'react'
import { Copy, MailPlus } from 'lucide-react'
import { createCoachInvitation, type AdminActionResult } from '@/lib/admin/admin-actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState: AdminActionResult = { success: false, message: '' }

type CoachInviteFormProps = {
  defaultStartsAt: string
  defaultEndsAt: string
}

export function CoachInviteForm({ defaultStartsAt, defaultEndsAt }: CoachInviteFormProps) {
  const [state, formAction, isPending] = useActionState(createCoachInvitation, initialState)

  async function copyInviteUrl() {
    if (state.inviteUrl) await navigator.clipboard.writeText(state.inviteUrl)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><MailPlus className="size-4 text-primary" /> Koç davet et</CardTitle>
        <CardDescription>Tek kullanımlık bağlantı 48 saat geçerlidir.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="space-y-2 xl:col-span-1">
            <Label htmlFor="full-name">Ad soyad</Label>
            <Input id="full-name" name="fullName" placeholder="Ayşe Yılmaz" required minLength={2} />
          </div>
          <div className="space-y-2 xl:col-span-1">
            <Label htmlFor="email">E-posta</Label>
            <Input id="email" name="email" type="email" placeholder="koc@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="starts-at">Başlangıç</Label>
            <Input id="starts-at" name="startsAt" type="date" defaultValue={defaultStartsAt} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ends-at">Bitiş</Label>
            <Input id="ends-at" name="endsAt" type="date" defaultValue={defaultEndsAt} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment-note">Ödeme notu</Label>
            <Input id="payment-note" name="paymentNote" placeholder="IBAN / Eylül" />
          </div>
          <div className="flex flex-wrap items-center gap-3 md:col-span-2 xl:col-span-5">
            <Button type="submit" size="lg" disabled={isPending}>
              {isPending ? 'Oluşturuluyor...' : 'Davet Oluştur'}
            </Button>
            {state.message && (
              <p className={state.success ? 'text-sm text-emerald-700' : 'text-sm text-destructive'} role="status">
                {state.message}
              </p>
            )}
            {state.inviteUrl && (
              <Button type="button" variant="outline" size="lg" onClick={copyInviteUrl}>
                <Copy className="size-4" /> Bağlantıyı Kopyala
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
