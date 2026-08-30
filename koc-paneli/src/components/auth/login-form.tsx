'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authClient } from '@/lib/auth-client'
import { getDashboardPath, resolveUserRole } from '@/lib/auth'
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

const loginSchema = z.object({
  email: z.string().email('Geçerli bir email girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: LoginFormValues) {
    setErrorMessage(null)

    const { data, error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
    })

    if (error) {
      setErrorMessage(error.message || 'Giriş başarısız.')
      return
    }

    if (!data?.user) {
      setErrorMessage('Giriş başarısız. Lütfen tekrar deneyin.')
      return
    }

    let userRole = null;
    try {
      const WORKER_URL = process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL || 'https://nexcoach-api.yusufk6509.workers.dev'
      const API_SECRET = 'nexcoach_prod_sec_2026_cf'
      const res = await fetch(`${WORKER_URL}/api/db/first`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Secret': API_SECRET,
        },
        body: JSON.stringify({
          query: 'SELECT role FROM profiles WHERE id = ?',
          params: [data.user.id],
        }),
      })
      if (res.ok) {
        const resJson = await res.json()
        userRole = resJson?.data?.role
      }
    } catch {
      // Handled below
    }

    const role = resolveUserRole(userRole, null)

    if (!role) {
      setErrorMessage(
        'Profil rolü bulunamadı. Lütfen yöneticinizle iletişime geçin.'
      )
      return
    }


    const destination = getDashboardPath(role)
    router.replace(destination)
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="flex flex-col items-center text-center">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground">
          NexCoach
        </h1>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Online Kocluk Paneli
        </p>
      </div>

      <Card className="surface-card w-full">
        <CardHeader>
          <CardTitle>Giriş Yap</CardTitle>
          <CardDescription>
            Email ve şifrenizle hesabınıza giriş yapın.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@nexcoach.com"
                autoComplete="email"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">Şifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                autoComplete="current-password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
            {errorMessage && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
      <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
              {isSubmitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
