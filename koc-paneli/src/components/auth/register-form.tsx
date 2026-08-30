'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { registerWithInvitation } from '@/lib/auth/register-actions'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
    password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
    passwordConfirm: z.string(),
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
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      passwordConfirm: '',
    },
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
                {...register('fullName')}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@email.com"
                autoComplete="email"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-muted-foreground">Şifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                autoComplete="new-password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm" className="text-sm font-medium text-muted-foreground">Şifre Tekrar</Label>
              <Input
                id="passwordConfirm"
                type="password"
                placeholder="••••••"
                autoComplete="new-password"
                {...register('passwordConfirm')}
              />
              {errors.passwordConfirm && (
                <p className="text-sm text-destructive">{errors.passwordConfirm.message}</p>
              )}
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
