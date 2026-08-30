'use client'

import { AlertCircle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PublicError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="dark flex min-h-screen items-center justify-center bg-background px-5 py-28 text-center text-foreground" data-public-shell>
      <div className="max-w-md">
        <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive"><AlertCircle className="size-6" /></span>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">Sayfa şu anda yüklenemiyor</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">Bağlantınızı kontrol edip yeniden deneyin. Sorun devam ederse kısa bir süre sonra tekrar uğrayın.</p>
        <Button size="lg" className="mt-7 h-11 gap-2 px-5" onClick={reset}><RotateCcw className="size-4" /> Yeniden dene</Button>
      </div>
    </main>
  )
}
