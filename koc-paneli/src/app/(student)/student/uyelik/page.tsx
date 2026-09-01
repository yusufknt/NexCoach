import { Clock3 } from 'lucide-react'

export default function StudentAccessExpiredPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="surface-card max-w-lg p-8 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
          <Clock3 className="size-6" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">Üyeliğiniz aktif değil</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Koçluk üyeliğiniz sona ermiş veya koçunuzun panel erişimi geçici olarak durdurulmuş olabilir. Yenileme için koçunuzla iletişime geçin.
        </p>
      </div>
    </div>
  )
}
