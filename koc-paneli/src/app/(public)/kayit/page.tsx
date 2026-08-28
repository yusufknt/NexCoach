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
        <div className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-[#ABD600]/8 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-[#C3F400]/4 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff02_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="w-full max-w-md text-center space-y-4">
          <h1 className="font-heading text-2xl font-extrabold text-[#E5E1E4]">
            Geçersiz Davet Linki
          </h1>
          <p className="text-sm text-[#C4C9AC]">
            Bu davet linki geçersiz, süresi dolmuş veya zaten kullanılmış. Koçunuzdan yeni bir davet linki isteyin.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4 overflow-hidden">
      <div className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-[#ABD600]/8 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-[#C3F400]/4 blur-[120px]" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff02_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      <RegisterForm
        inviteToken={invite}
        coachName={result.invitation.coachName}
        packageName={result.invitation.packageName}
      />
    </div>
  )
}
