import { Skeleton } from '@/components/ui/skeleton'

export default function PublicLoading() {
  return (
    <div className="dark min-h-screen bg-background pt-32" data-public-shell>
      <div className="public-container grid gap-14 py-12 lg:grid-cols-2 lg:items-center" aria-label="Sayfa yükleniyor" aria-busy="true">
        <div>
          <Skeleton className="h-8 w-44 rounded-full bg-muted" />
          <Skeleton className="mt-7 h-16 w-full max-w-xl bg-muted sm:h-24" />
          <Skeleton className="mt-6 h-6 w-full max-w-lg bg-muted" />
          <Skeleton className="mt-3 h-6 w-4/5 max-w-md bg-muted" />
          <div className="mt-9 flex gap-3"><Skeleton className="h-12 w-40 bg-muted" /><Skeleton className="h-12 w-40 bg-muted" /></div>
        </div>
        <Skeleton className="mx-auto aspect-[5/6] w-full max-w-[520px] rounded-[1.25rem] bg-muted" />
      </div>
    </div>
  )
}
