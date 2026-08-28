'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BrandLockup } from '@/components/public/brand-lockup'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function PublicHeader() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.08] bg-[#0b0d14]/82 backdrop-blur-xl">
      <div className="public-container flex h-[4.5rem] items-center justify-between">
      <Link href="/" className="rounded-md outline-none transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-primary" aria-label="NexCoach ana sayfa">
        <BrandLockup compact showName />
      </Link>
      
      {/* Desktop Navigation */}
      <nav className="hidden items-center gap-7 md:flex" aria-label="Ana menü">
        <a className="text-sm font-medium text-white/65 transition-colors hover:text-white" href="#hakkimda">
          Hakkımda
        </a>
        <a className="text-sm font-medium text-white/65 transition-colors hover:text-white" href="#paketler">
          Paketler
        </a>
        <a className="text-sm font-medium text-white/65 transition-colors hover:text-white" href="#referanslar">
          Referanslar
        </a>
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
        className="flex size-10 items-center justify-center rounded-lg text-white/75 transition-colors hover:bg-white/[0.07] hover:text-white md:hidden"
        aria-label="Menüyü aç/kapat"
        aria-expanded={isOpen}
      >
        <span className="material-symbols-outlined">{isOpen ? 'close' : 'menu'}</span>
      </button>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="absolute inset-x-0 top-[4.5rem] flex flex-col gap-2 border-b border-white/[0.08] bg-[#0b0d14] p-5 shadow-2xl md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <a 
            onClick={() => setIsOpen(false)} 
            className="rounded-lg px-3 py-3 text-sm font-medium text-white/70 hover:bg-white/[0.06] hover:text-white" 
            href="#hakkimda"
          >
            Hakkımda
          </a>
          <a 
            onClick={() => setIsOpen(false)} 
            className="rounded-lg px-3 py-3 text-sm font-medium text-white/70 hover:bg-white/[0.06] hover:text-white" 
            href="#paketler"
          >
            Paketler
          </a>
          <a 
            onClick={() => setIsOpen(false)} 
            className="rounded-lg px-3 py-3 text-sm font-medium text-white/70 hover:bg-white/[0.06] hover:text-white" 
            href="#referanslar"
          >
            Referanslar
          </a>
          <Link
            onClick={() => setIsOpen(false)}
            href="/giris"
            className={cn(buttonVariants({ size: 'lg' }), 'public-primary-button mt-2 h-11 w-full')}
          >
            Giriş Yap
          </Link>
        </div>
      )}
      </div>
    </header>
  )
}
