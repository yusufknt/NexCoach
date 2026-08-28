import Image from 'next/image'

type BrandLockupProps = {
  compact?: boolean
  showName?: boolean
  className?: string
}

export function BrandLockup({ compact = false, showName = false, className = '' }: BrandLockupProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className={`brand-logo ${compact ? 'brand-logo--compact' : ''}`}>
        <Image
          src="/logo/logo.png"
          alt={showName ? '' : 'NexCoach'}
          width={1080}
          height={1080}
          sizes={compact ? '42px' : '60px'}
          priority
        />
      </span>
      {showName && (
        <span className="font-heading text-[1.05rem] font-semibold tracking-[-0.045em] text-white sm:text-[1.15rem]">
          NexCoach
        </span>
      )}
    </span>
  )
}
