'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setIsVisible(true)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'true')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border p-4 shadow-lg sm:p-6">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl">
        <div className="text-sm text-muted-foreground">
          Platformumuz, oturum yönetimi ve size daha iyi hizmet sunabilmek için çerezler (cookies) kullanmaktadır. 
          Sitemizi kullanarak çerez kullanımını kabul etmiş sayılırsınız. Daha fazla bilgi için{' '}
          <Link href="/sozlesmeler/cerez-politikasi" className="text-primary hover:underline font-medium">
            Çerez Politikamızı
          </Link>{' '}
          inceleyebilirsiniz.
        </div>
        <div className="flex gap-2 shrink-0">
          <Button onClick={acceptCookies} className="whitespace-nowrap">
            Kabul Et ve Kapat
          </Button>
        </div>
      </div>
    </div>
  )
}
