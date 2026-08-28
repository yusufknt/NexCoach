import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

type LoadingSpinnerProps = {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

const sizeStyles = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
}

export function LoadingSpinner({
  size = 'md',
  className,
  text,
}: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-[#ABD600]', sizeStyles[size])} />
      {text && <p className="text-sm text-[#C4C9AC]">{text}</p>}
    </div>
  )
}
