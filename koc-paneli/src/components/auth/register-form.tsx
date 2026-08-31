'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { registerWithInvitation } from '@/lib/auth/register-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Ad soyad en az 2 karakter olmalı'),
    email: z.string().email('Geçerli bir email girin'),
    password: z.string().min(8, 'Şifre en az 8 karakter olmalı'),
    passwordConfirm: z.string(),
    acceptTerms: z.boolean().refine(val => val === true, 'Sözleşmeleri kabul etmelisiniz'),
    acceptKvkk: z.boolean().refine(val => val === true, 'Aydınlatma metnini onaylamalısınız'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Şifreler eşleşmiyor',
    path: ['passwordConfirm'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

type RegisterFormProps = {
  inviteToken: string
  coachName: string
  packageName: string | null
}

export function RegisterForm({ inviteToken, coachName, packageName }: RegisterFormProps) {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      passwordConfirm: '',
      acceptTerms: undefined,
      acceptKvkk: undefined,
    } as any,
  })

  async function onSubmit(values: RegisterFormValues) {
    setErrorMessage(null)

    const formData = new FormData()
    formData.append('fullName', values.fullName)
    formData.append('email', values.email)
    formData.append('password', values.password)
    formData.append('passwordConfirm', values.passwordConfirm)
    formData.append('inviteToken', inviteToken)

    const result = await registerWithInvitation(formData)

    if (!result.success) {
      setErrorMessage(result.error)
      return
    }

    router.push('/giris?registered=1')
    router.refresh()
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="flex flex-col items-center text-center">
        <h1 className="font-heading text-3xl font-extrabold uppercase tracking-tight text-foreground">
          Kayıt Ol
        </h1>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary mt-1">
          Elite Coaching Dashboard
        </p>
      </div>

      <Card className="surface-card w-full">
        <CardHeader>
          <CardTitle>Hesap Oluştur</CardTitle>
          <CardDescription className="text-sm text-muted-foreground space-y-1">
            <p>
              <span className="text-foreground font-medium">{coachName}</span> tarafından davet edildiniz.
            </p>
            {packageName && (
              <p>
                Paket: <span className="text-primary font-medium">{packageName}</span>
              </p>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-muted-foreground">Ad Soyad</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Ahmet Yılmaz"
                autoComplete="name"
                aria-invalid={errors.fullName ? "true" : "false"}
                aria-describedby={errors.fullName ? "fullName-error" : undefined}
                {...register('fullName')}
              />
              {errors.fullName && (
                <p id="fullName-error" className="text-sm text-destructive" role="alert">{errors.fullName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@email.com"
                autoComplete="email"
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? "email-error" : undefined}
                {...register('email')}
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-destructive" role="alert">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-muted-foreground">Şifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                autoComplete="new-password"
                aria-invalid={errors.password ? "true" : "false"}
                aria-describedby={errors.password ? "password-error" : undefined}
                {...register('password')}
              />
              {errors.password && (
                <p id="password-error" className="text-sm text-destructive" role="alert">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm" className="text-sm font-medium text-muted-foreground">Şifre Tekrar</Label>
              <Input
                id="passwordConfirm"
                type="password"
                placeholder="••••••"
                autoComplete="new-password"
                aria-invalid={errors.passwordConfirm ? "true" : "false"}
                aria-describedby={errors.passwordConfirm ? "passwordConfirm-error" : undefined}
                {...register('passwordConfirm')}
              />
              {errors.passwordConfirm && (
                <p id="passwordConfirm-error" className="text-sm text-destructive" role="alert">{errors.passwordConfirm.message}</p>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <Controller
                control={control}
                name="acceptTerms"
                render={({ field }) => (
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="acceptTerms"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <div className="grid leading-none">
                      <label
                        htmlFor="acceptTerms"
                        className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        <Link href="/sozlesmeler/kullanici-sozlesmesi" target="_blank" className="text-primary hover:underline">Kullanıcı Sözleşmesi</Link>'ni ve{' '}
                        <Link href="/sozlesmeler/gizlilik-politikasi" target="_blank" className="text-primary hover:underline">Gizlilik Politikası</Link>'nı okudum, kabul ediyorum.
                      </label>
                      {errors.acceptTerms && (
                        <p className="text-xs text-destructive mt-1">{errors.acceptTerms.message}</p>
                      )}
                    </div>
                  </div>
                )}
              />

              <Controller
                control={control}
                name="acceptKvkk"
                render={({ field }) => (
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="acceptKvkk"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <div className="grid leading-none">
                      <label
                        htmlFor="acceptKvkk"
                        className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        KVKK kapsamında <Link href="/sozlesmeler/aydinlatma-metni" target="_blank" className="text-primary hover:underline">Aydınlatma Metni</Link>'ni okudum.
                      </label>
                      {errors.acceptKvkk && (
                        <p className="text-xs text-destructive mt-1">{errors.acceptKvkk.message}</p>
                      )}
                    </div>
                  </div>
                )}
              />
            </div>

            {errorMessage && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
      <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
              {isSubmitting ? 'Kayıt oluşturuluyor...' : 'Kayıt Ol'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
