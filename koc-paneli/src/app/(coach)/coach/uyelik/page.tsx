import { Clock3 } from 'lucide-react'

export default function CoachAccessExpiredPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="surface-card max-w-lg p-8 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
          <Clock3 className="size-6" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">Panel erişiminiz aktif değil</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Kullanım süreniz sona ermiş veya hesabınız geçici olarak durdurulmuş olabilir. Erişimi yenilemek için NexCoach yöneticisiyle iletişime geçin.
        </p>
      </div>
    </div>
  )
}
