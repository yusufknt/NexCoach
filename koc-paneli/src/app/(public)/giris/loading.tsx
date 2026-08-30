import { Skeleton } from '@/components/ui/skeleton'

export default function LoginLoading() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
        <Skeleton className="mx-auto mb-3 h-10 w-10 rounded-xl" />
        <Skeleton className="mx-auto mb-8 h-7 w-40" />
        <div className="space-y-4">
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}
