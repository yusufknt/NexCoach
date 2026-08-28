import { Skeleton } from '@/components/ui/skeleton'

export default function PublicLoading() {
  return (
    <div className="public-shell min-h-screen bg-[#0b0d14] pt-32">
      <div className="public-container grid gap-14 py-12 lg:grid-cols-2 lg:items-center" aria-label="Sayfa yükleniyor" aria-busy="true">
        <div>
          <Skeleton className="h-8 w-44 rounded-full bg-white/[0.07]" />
          <Skeleton className="mt-7 h-16 w-full max-w-xl bg-white/[0.07] sm:h-24" />
          <Skeleton className="mt-6 h-6 w-full max-w-lg bg-white/[0.07]" />
          <Skeleton className="mt-3 h-6 w-4/5 max-w-md bg-white/[0.07]" />
          <div className="mt-9 flex gap-3"><Skeleton className="h-12 w-40 bg-white/[0.07]" /><Skeleton className="h-12 w-40 bg-white/[0.07]" /></div>
        </div>
        <Skeleton className="mx-auto aspect-[5/6] w-full max-w-[520px] rounded-[1.25rem] bg-white/[0.07]" />
      </div>
    </div>
  )
}
