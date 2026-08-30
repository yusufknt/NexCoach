import { LoginForm } from '@/components/auth/login-form'

type Props = {
  searchParams: Promise<{ registered?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const { registered } = await searchParams

  return (
    <div className="relative flex min-h-[calc(100vh-3.5rem)] items-center justify-center overflow-hidden bg-background p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--primary)_1px,transparent_1px)] opacity-10 [background-size:18px_18px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-primary/5 to-transparent" />

      <div className="relative w-full max-w-md space-y-4">
        {registered === '1' && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center shadow-sm">
            <p className="text-sm font-medium text-emerald-700">
              Kayıt başarılı!
            </p>
            <p className="mt-1 text-xs text-emerald-700/75">
              Hesabınız oluşturuldu. Şimdi giriş yapabilirsiniz.
            </p>
          </div>
        )}
        <LoginForm />
      </div>
    </div>
  )
}
