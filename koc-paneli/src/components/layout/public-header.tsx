'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BrandLockup } from '@/components/public/brand-lockup'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function PublicHeader() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/82 backdrop-blur-xl">
      <div className="public-container flex h-[4.5rem] items-center justify-between">
      <Link href="/" className="rounded-md outline-none transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-primary" aria-label="NexCoach ana sayfa">
        <BrandLockup compact showName />
      </Link>
      
      {/* Desktop Navigation */}
      <nav className="hidden items-center gap-7 md:flex" aria-label="Ana menü">
        <Link className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" href="/#hakkimda">
          Hakkımda
        </Link>
        <Link className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" href="/#paketler">
          Paketler
        </Link>
        <Link className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" href="/#referanslar">
          Referanslar
        </Link>
        <Link
          href="/giris"
          className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-10 px-5')}
        >
          Giriş Yap
        </Link>
      </nav>

      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
        aria-label="Menüyü aç/kapat"
        aria-expanded={isOpen}
      >
        <span className="material-symbols-outlined">{isOpen ? 'close' : 'menu'}</span>
      </button>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="absolute inset-x-0 top-[4.5rem] flex flex-col gap-2 border-b border-border bg-background p-5 shadow-2xl md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <Link 
            onClick={() => setIsOpen(false)} 
            className="rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            href="/#hakkimda"
          >
            Hakkımda
          </Link>
          <Link 
            onClick={() => setIsOpen(false)} 
            className="rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            href="/#paketler"
          >
            Paketler
          </Link>
          <Link 
            onClick={() => setIsOpen(false)} 
            className="rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            href="/#referanslar"
          >
            Referanslar
          </Link>
          <Link
            onClick={() => setIsOpen(false)}
            href="/giris"
            className={cn(buttonVariants({ size: 'lg' }), 'mt-2 h-11 w-full')}
          >
            Giriş Yap
          </Link>
        </div>
      )}
      </div>
    </header>
  )
}
