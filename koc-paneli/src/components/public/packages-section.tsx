import Link from 'next/link'
import { ArrowRight, Check, PackageOpen } from 'lucide-react'
import { getActivePackages, formatDuration, formatPrice } from '@/lib/public/landing'
import { Card, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export async function PackagesSection() {
  const packages = await getActivePackages()

  return (
    <section className="public-section" id="paketler">
      <div className="public-container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="section-eyebrow">Koçluk paketleri</p>
          <h2 className="section-title mt-4">Hedefin için doğru başlangıcı seç.</h2>
          <p className="mt-5 text-base leading-7 text-white/55">Karmaşık seçenekler yok. İhtiyaç duyduğun destek seviyesini seç, yolculuğuna bugün başla.</p>
        </div>

        {packages.length === 0 ? (
          <div className="mx-auto mt-12 max-w-xl border border-dashed border-white/15 bg-white/[0.025] px-6 py-12 text-center">
            <PackageOpen className="mx-auto size-7 text-primary" aria-hidden="true" />
            <h3 className="mt-4 text-lg font-semibold">Yeni paketler hazırlanıyor</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/50">Koçluk paketleri çok yakında burada olacak. Mevcut hesabınla giriş yaparak güncellemeleri takip edebilirsin.</p>
            <Link href="/giris" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'mt-6 h-11 px-5')}>Hesabıma git</Link>
          </div>
        ) : (
          <div className="mx-auto mt-12 grid max-w-6xl gap-5 md:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg, idx) => {
              const isHighlighted = packages.length === 1 || idx === Math.min(1, packages.length - 1)
              return (
                <Card key={pkg.id} className={cn('relative rounded-xl border-white/[0.08] bg-white/[0.025] py-0 shadow-none', isHighlighted && 'border-primary/45 bg-primary/[0.045]')}>
                  {isHighlighted && <div className="absolute inset-x-5 top-0 h-px bg-primary" />}
                  <CardContent className="flex h-full flex-col px-6 py-7 sm:px-7 sm:py-8">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold tracking-tight">{pkg.name}</h3>
                        {pkg.description && <p className="mt-2 text-sm leading-6 text-white/50">{pkg.description}</p>}
                      </div>
                      {isHighlighted && <span className="shrink-0 rounded-full bg-primary/12 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">Önerilen</span>}
                    </div>
                    <div className="mt-7 flex items-baseline gap-2 border-b border-white/[0.08] pb-7">
                      <span className="font-heading text-4xl font-bold tracking-[-0.04em] text-white">{formatPrice(pkg.price)}</span>
                      <span className="text-xs text-white/42">/ {formatDuration(pkg.duration_days)}</span>
                    </div>
                    <ul className="my-7 flex-1 space-y-3.5">
                      {(pkg.features ?? []).map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex gap-3 text-sm leading-6 text-white/65">
                          <Check className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" /> {feature}
                        </li>
                      ))}
                    </ul>
                    <Link href="/giris" className={cn(buttonVariants({ variant: isHighlighted ? 'default' : 'outline', size: 'lg' }), isHighlighted && 'public-primary-button', 'h-11 w-full gap-2')}>
                      Paketi seç <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
