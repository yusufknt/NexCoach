import { CoachRegisterForm } from '@/components/auth/coach-register-form'
import { validateCoachInvitation } from '@/lib/admin/coach-invite.server'

type CoachRegisterPageProps = {
  searchParams: Promise<{ token?: string }>
}

export default async function CoachRegisterPage({ searchParams }: CoachRegisterPageProps) {
  const { token = '' } = await searchParams
  const invitation = await validateCoachInvitation(token)

  return (
    <div className="relative flex min-h-[calc(100vh-3.5rem)] items-center justify-center overflow-hidden bg-background p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--primary)_1px,transparent_1px)] opacity-10 [background-size:18px_18px]" />
      <div className="relative flex w-full justify-center">
        {invitation ? (
          <CoachRegisterForm
            token={token}
            fullName={invitation.fullName}
            email={invitation.email}
            accessEndsAt={invitation.accessEndsAt}
          />
        ) : (
          <div className="surface-card w-full max-w-md p-8 text-center">
            <h1 className="text-xl font-bold">Davet geçersiz</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Bu bağlantı kullanılmış, iptal edilmiş veya süresi dolmuş. Yeni davet için NexCoach yöneticisiyle iletişime geçin.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
