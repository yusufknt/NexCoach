import { redirect } from 'next/navigation'
import { validateInvitation } from '@/lib/coach/invite.server'
import { RegisterForm } from '@/components/auth/register-form'

type Props = {
  searchParams: Promise<{ invite?: string }>
}

export default async function RegisterPage({ searchParams }: Props) {
  const { invite } = await searchParams

  if (!invite) {
    redirect('/giris')
  }

  const result = await validateInvitation(invite)

  if (!result.valid || !result.invitation) {
    return (
      <div className="relative flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4 overflow-hidden">
        <div className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="pointer-events-none absolute -right-40 -bottom-40 h-[600px] w-[600px] rounded-full bg-primary/4 blur-[120px]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--primary)_1px,transparent_1px)] opacity-[0.02] [background-size:16px_16px]" />
        <div className="w-full max-w-md text-center space-y-4">
          <h1 className="font-heading text-2xl font-extrabold text-foreground">
            Geçersiz Davet Linki
          </h1>
          <p className="text-sm text-muted-foreground">
            Bu davet linki geçersiz, süresi dolmuş veya zaten kullanılmış. Koçunuzdan yeni bir davet linki isteyin.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4 overflow-hidden">
      <div className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-primary/8 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 -bottom-40 h-[600px] w-[600px] rounded-full bg-primary/4 blur-[120px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--primary)_1px,transparent_1px)] opacity-[0.02] [background-size:16px_16px]" />
      <RegisterForm
        inviteToken={invite}
        coachName={result.invitation.coachName}
        packageName={result.invitation.packageName}
      />
    </div>
  )
}
