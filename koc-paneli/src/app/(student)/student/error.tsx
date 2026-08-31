'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RotateCcw, Mail } from 'lucide-react'
import * as Sentry from '@sentry/nextjs'

export default function StudentError({
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
    <div className="flex h-[80vh] flex-col items-center justify-center p-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 mb-6 shadow-[0_0_24px_rgba(239,68,68,0.1)]">
        <AlertTriangle className="h-8 w-8 text-red-400" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-foreground">Öğrenci Panelinde Bir Hata Oluştu</h2>
      <p className="mx-auto mb-8 max-w-md text-muted-foreground">
        Beklenmeyen bir hata meydana geldi. Sorun devam ederse lütfen koçunuzla iletişime geçin.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={() => reset()} 
          className="flex w-full items-center justify-center gap-2 sm:w-auto"
        >
          <RotateCcw className="h-4 w-4" />
          Yeniden Dene
        </Button>
        <a href="mailto:koc@NexCoach.com">
          <Button variant="outline" className="flex w-full items-center justify-center gap-2 sm:w-auto">
            <Mail className="h-4 w-4" />
            Koça E-posta Gönder
          </Button>
        </a>
      </div>
    </div>
  )
}
