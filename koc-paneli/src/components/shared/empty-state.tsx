import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

type EmptyStateProps = {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-[#27272A] bg-[#18181B]/50 px-6 py-12 text-center',
        className
      )}
    >
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#27272A]">
          <Icon className="h-6 w-6 text-[#C4C9AC]" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-[#E5E1E4]">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-[#C4C9AC]">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
