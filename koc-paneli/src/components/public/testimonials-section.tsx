import { Quote } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const testimonials = [
  { name: 'Ayşe K.', role: '3 aylık öğrenci', quote: 'Program tamamen bana göre hazırlandı. Düzenli takip sayesinde hedef kiloma ulaştım ve alışkanlıklarımı koruyabiliyorum.' },
  { name: 'Mehmet T.', role: '6 aylık öğrenci', quote: 'Mesajlaşma ve haftalık geri bildirimler motivasyonumu yüksek tuttu. Profesyonel ve samimi bir koçluk deneyimi.' },
  { name: 'Zeynep A.', role: '1 aylık öğrenci', quote: 'İlk ayda bile farkı hissettim. Esnek randevu saatleri ve anlaşılır program yapısı çok işime yaradı.' },
]

export function TestimonialsSection() {
  return (
    <section className="public-section border-y border-white/[0.07] bg-[#0e111a]" id="referanslar">
      <div className="public-container">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="section-eyebrow">Gerçek deneyimler</p>
            <h2 className="section-title mt-4">İlerlemeyi birlikte görünür kılıyoruz.</h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-white/48">NexCoach, koç ve öğrenci arasındaki iletişimi düzenli bir sürece dönüştürür.</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {testimonials.map((item) => (
            <Card key={item.name} className="rounded-xl border-white/[0.08] bg-white/[0.025] py-0 shadow-none hover:border-white/[0.16] hover:shadow-none">
              <CardContent className="flex h-full flex-col px-6 py-7">
                <Quote className="size-6 text-primary" aria-hidden="true" />
                <blockquote className="mt-6 flex-1 text-[15px] leading-7 text-white/70">“{item.quote}”</blockquote>
                <div className="mt-7 border-t border-white/[0.08] pt-5">
                  <p className="text-sm font-semibold text-white">{item.name}</p>
                  <p className="mt-1 text-xs text-white/42">{item.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
