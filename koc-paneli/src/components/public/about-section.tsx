import { BarChart3, MessageSquareText, Route } from 'lucide-react'
import type { Profile } from '@/types'
import { Card, CardContent } from '@/components/ui/card'

type AboutSectionProps = { coach: Profile | null }

const steps = [
  { icon: Route, number: '01', title: 'Sana özel plan', text: 'Hedefin, geçmişin ve günlük düzenin analiz edilir; uygulanabilir yol haritan oluşturulur.' },
  { icon: BarChart3, number: '02', title: 'Ölçülebilir ilerleme', text: 'Programını, ölçümlerini ve gelişimini tek panelden takip ederek nerede olduğunu net biçimde görürsün.' },
  { icon: MessageSquareText, number: '03', title: 'Sürekli iletişim', text: 'Soruların cevapsız kalmaz. Geri bildirimlerle programın ihtiyaçlarına göre güncel tutulur.' },
]

export function AboutSection({ coach }: AboutSectionProps) {
  const bio = coach?.bio?.trim() || 'Bilimsel temelli programları düzenli takip ve sürdürülebilir alışkanlıklarla birleştirerek hedeflerinize güvenle ilerlemenize yardımcı oluyoruz.'

  return (
    <section className="public-section border-y border-white/[0.07] bg-[#0e111a]" id="nasil-calisir">
      <div className="public-container">
        <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
          <div id="hakkimda">
            <p className="section-eyebrow">Neden NexCoach?</p>
            <h2 className="section-title mt-4">Koçluğun net, düzenli ve erişilebilir hali.</h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/58">{bio}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {steps.map(({ icon: Icon, number, title, text }) => (
              <Card key={number} className="rounded-xl border-white/[0.08] bg-white/[0.025] py-0 shadow-none hover:-translate-y-1 hover:border-primary/25 hover:shadow-none">
                <CardContent className="flex h-full flex-col px-6 py-7">
                  <div className="flex items-center justify-between">
                    <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-5" aria-hidden="true" /></span>
                    <span className="font-heading text-xs font-bold tracking-widest text-white/25">{number}</span>
                  </div>
                  <h3 className="mt-8 text-lg font-semibold tracking-tight">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/52">{text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
