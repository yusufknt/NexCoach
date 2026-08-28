import { cn } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'

type ErrorMessageProps = {
  title?: string
  message: string
  retry?: () => void
  className?: string
}

export function ErrorMessage({
  title = 'Bir hata oluştu',
  message,
  retry,
  className,
}: ErrorMessageProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 px-6 py-8 text-center',
        className
      )}
    >
      <AlertCircle className="mb-3 h-8 w-8 text-red-400" />
      <h3 className="text-lg font-semibold text-[#E5E1E4]">{title}</h3>
      <p className="mt-2 text-sm text-[#C4C9AC]">{message}</p>
      {retry && (
        <button
          onClick={retry}
          className="mt-4 rounded-lg bg-[#ABD600] px-4 py-2 text-sm font-medium text-[#1a1a1a] transition-colors hover:bg-[#9ab300]"
        >
          Tekrar Dene
        </button>
      )}
    </div>
  )
}
