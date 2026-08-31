'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import * as Sentry from '@sentry/nextjs'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to Sentry
    console.error(error)
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center text-foreground">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-10 w-10 text-destructive" />
      </div>
      <h1 className="mb-2 text-3xl font-bold text-foreground">Bir şeyler ters gitti!</h1>
      <p className="text-muted-foreground max-w-md mx-auto mb-8">
        İsteğinizi işlerken beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.
        Sorun devam ederse sistem yöneticisine başvurun.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={() => reset()} 
          className="w-full sm:w-auto flex items-center justify-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Yeniden Dene
        </Button>
        <a href="mailto:destek@NexCoach.com">
          <Button variant="outline" className="w-full sm:w-auto">
            Destek Ekibine Ulaş
          </Button>
        </a>
      </div>
    </div>
  )
}
