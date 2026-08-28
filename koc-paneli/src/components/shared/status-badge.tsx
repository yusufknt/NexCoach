import { cn } from '@/lib/utils'

type StatusBadgeProps = {
  label: string
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  className?: string
}

const variantStyles: Record<string, string> = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-400',
  error: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-950/40 dark:text-rose-400',
  info: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950/40 dark:text-blue-400',
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-300',
}

export function StatusBadge({
  label,
  variant = 'neutral',
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 transition-all duration-200',
        variantStyles[variant],
        className
      )}
    >
      {label}
    </span>
  )
}
