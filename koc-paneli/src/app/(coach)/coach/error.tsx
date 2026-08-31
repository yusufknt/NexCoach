'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import * as Sentry from '@sentry/nextjs'

export default function CoachError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex h-[80vh] flex-col items-center justify-center bg-background p-4 text-center text-foreground">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 mb-6 shadow-[0_0_24px_rgba(239,68,68,0.1)]">
        <AlertTriangle className="h-8 w-8 text-red-400" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-foreground">Koç Panelinde Bir Hata Oluştu</h2>
      <p className="mx-auto mb-8 max-w-md text-muted-foreground">
        Verileri yüklerken veya bir işlemi gerçekleştirirken sorun yaşadık. Lütfen tekrar deneyin.
      </p>
      
      <Button 
        onClick={() => reset()} 
        className="flex items-center justify-center gap-2"
      >
        <RotateCcw className="h-4 w-4" />
        Yeniden Dene
      </Button>
    </div>
  )
}
