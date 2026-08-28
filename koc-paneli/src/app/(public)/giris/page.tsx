import { LoginForm } from '@/components/auth/login-form'

type Props = {
  searchParams: Promise<{ registered?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const { registered } = await searchParams

  return (
    <div className="relative flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4 overflow-hidden">
      {/* Background orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-[#ABD600]/8 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-[#C3F400]/4 blur-[120px]" />
      
      {/* Subtle radial grid pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff02_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      <div className="w-full max-w-md space-y-4">
        {registered === '1' && (
          <div className="rounded-xl border border-[#C3F400]/20 bg-[#C3F400]/5 p-4 text-center">
            <p className="text-sm font-medium text-[#C3F400]">
              Kayıt başarılı!
            </p>
            <p className="mt-1 text-xs text-[#C4C9AC]">
              Hesabınız oluşturuldu. Şimdi giriş yapabilirsiniz.
            </p>
          </div>
        )}
        <LoginForm />
      </div>
    </div>
  )
}
