'use client'

import { useActionState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { registerCoachWithInvitation, type CoachRegisterState } from '@/lib/auth/coach-register-actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState: CoachRegisterState = { success: false, message: '' }

type CoachRegisterFormProps = {
  token: string
  fullName: string
  email: string
  accessEndsAt: string
}

export function CoachRegisterForm(props: CoachRegisterFormProps) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(registerCoachWithInvitation, initialState)

  useEffect(() => {
    if (!state.success) return
    const timeout = window.setTimeout(() => router.push('/giris?registered=1'), 900)
    return () => window.clearTimeout(timeout)
  }, [router, state.success])

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Koç hesabınızı oluşturun</CardTitle>
        <CardDescription>
          Davetiniz <strong>{new Intl.DateTimeFormat('tr-TR', { dateStyle: 'long' }).format(new Date(props.accessEndsAt))}</strong> tarihine kadar panel erişimi sağlar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="token" value={props.token} />
          <div className="space-y-2">
            <Label htmlFor="coach-name">Ad soyad</Label>
            <Input id="coach-name" value={props.fullName} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="coach-email">E-posta</Label>
            <Input id="coach-email" type="email" value={props.email} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Şifre</Label>
            <Input id="password" name="password" type="password" minLength={8} autoComplete="new-password" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-confirm">Şifre tekrar</Label>
            <Input id="password-confirm" name="passwordConfirm" type="password" minLength={8} autoComplete="new-password" required />
          </div>
          <label className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
            <input className="mt-1" type="checkbox" name="acceptTerms" required />
            <span>
              <Link className="font-medium text-primary hover:underline" href="/sozlesmeler/kullanici-sozlesmesi" target="_blank">
                Kullanıcı Sözleşmesi
              </Link>{' '}ve gizlilik koşullarını kabul ediyorum.
            </span>
          </label>
          {state.message && (
            <p className={state.success ? 'text-sm text-emerald-700' : 'text-sm text-destructive'} role="status">
              {state.message}
            </p>
          )}
          <Button type="submit" size="lg" className="w-full" disabled={isPending || state.success}>
            {isPending ? 'Hesap oluşturuluyor...' : 'Hesabımı Oluştur'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
