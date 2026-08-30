import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, PlayCircle } from 'lucide-react'
import type { Profile } from '@/types'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type HeroSectionProps = {
  coach: Profile | null
}

export function HeroSection({ coach }: HeroSectionProps) {
  const name = coach?.full_name && coach.full_name !== 'İsimsiz' ? coach.full_name : 'uzman koçunuz'
  const avatarUrl = coach?.avatar_url

  return (
    <section className="relative overflow-hidden pb-20 pt-32 sm:pb-24 sm:pt-40 lg:min-h-[760px] lg:pb-28 lg:pt-44">
      <div className="hero-grid absolute inset-0" aria-hidden="true" />
      <div className="public-container relative grid items-center gap-14 lg:grid-cols-[1.08fr_.92fr] lg:gap-16">
        <div className="max-w-3xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3.5 py-2 text-xs font-semibold tracking-wide text-white/75">
            <span className="size-1.5 rounded-full bg-primary shadow-sm" />
            Kişisel koçluk, tek bir yerde
          </div>
          <h1 className="max-w-[13ch] font-heading text-[2.8rem] font-bold leading-[1.03] tracking-[-0.055em] text-white sm:text-6xl lg:text-[4.65rem]">
            Hedefine giden yol, <span className="text-primary">sana özel.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-7 text-white/62 sm:text-lg sm:leading-8">
            NexCoach ile {name} tarafından hazırlanan programını takip et, ilerlemeni görünür kıl ve ihtiyaç duyduğun anda destek al.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="#paketler" className={cn(buttonVariants({ size: 'lg' }), 'h-12 justify-center gap-2 px-6 text-sm sm:w-auto')}>
              Koçluğa başla <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href="#nasil-calisir" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-12 justify-center gap-2 px-6 text-sm sm:w-auto')}>
              <PlayCircle className="size-4" aria-hidden="true" /> Nasıl çalışır?
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/55">
            {['Kişisel program', 'Haftalık takip', 'Doğrudan iletişim'].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary" aria-hidden="true" /> {item}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[520px] lg:mx-0">
          <div className="relative aspect-[5/6] overflow-hidden rounded-[1.25rem] border border-border bg-card shadow-2xl">
            {avatarUrl ? (
              <Image src={avatarUrl} alt={`${name} profil fotoğrafı`} fill sizes="(max-width: 1024px) 90vw, 42vw" className="object-cover" priority />
            ) : (
              <div className="flex h-full items-center justify-center px-12 text-center">
                <div>
                  <div className="mx-auto flex size-20 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 font-heading text-3xl font-bold text-primary">N</div>
                  <p className="mt-5 text-sm leading-6 text-white/50">Koç profil fotoğrafı eklendiğinde burada otomatik olarak gösterilir.</p>
                </div>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
            <div className="absolute inset-x-5 bottom-5 flex items-center justify-between gap-4 rounded-xl border border-border bg-popover/90 p-4 backdrop-blur-md sm:inset-x-6 sm:bottom-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/45">NexCoach ile</p>
                <p className="mt-1 text-sm font-semibold text-white sm:text-base">Planın her zaman yanında</p>
              </div>
              <span className="flex shrink-0 items-center gap-2 text-xs font-semibold text-primary">
                <span className="size-2 rounded-full bg-primary" /> Aktif
              </span>
            </div>
          </div>
          <div className="absolute -right-4 top-14 hidden w-44 border-l-2 border-primary bg-card p-4 shadow-xl sm:block">
            <p className="text-2xl font-bold text-white">%100</p>
            <p className="mt-1 text-xs leading-5 text-white/50">Sana göre hazırlanan yol haritası</p>
          </div>
        </div>
      </div>
    </section>
  )
}
