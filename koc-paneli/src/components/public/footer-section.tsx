import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { BrandLockup } from './brand-lockup'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function FooterSection() {
  return (
    <footer className="bg-background">
      <div className="public-container py-16 sm:py-20">
        <div className="flex flex-col items-start justify-between gap-8 border-b border-border pb-12 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <h2 className="font-heading text-3xl font-bold tracking-[-0.04em] sm:text-4xl">Bir sonraki adımın bugün başlasın.</h2>
            <p className="mt-4 text-sm leading-6 text-white/50">Planlı ilerlemek, süreci ölçmek ve koçunla bağlantıda kalmak için NexCoach’e katıl.</p>
          </div>
          <Link href="#paketler" className={cn(buttonVariants({ size: 'lg' }), 'h-12 gap-2 px-6')}>Paketleri incele <ArrowRight className="size-4" /></Link>
        </div>
        <div className="flex flex-col gap-7 pt-9 sm:flex-row sm:items-center sm:justify-between">
          <BrandLockup />
          <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/48" aria-label="Alt menü">
            <a href="#hakkimda" className="hover:text-white">Hakkımızda</a>
            <a href="#paketler" className="hover:text-white">Paketler</a>
            <Link href="/giris" className="hover:text-white">Giriş</Link>
          </nav>
          <p className="text-xs text-white/35">© {new Date().getFullYear()} NexCoach</p>
        </div>
      </div>
    </footer>
  )
}
