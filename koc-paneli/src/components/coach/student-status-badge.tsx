import { StatusBadge } from '@/components/shared/status-badge'
import type { CoachStudent } from '@/types'

const statusVariantMap: Record<
  CoachStudent['status'],
  'success' | 'warning' | 'neutral'
> = {
  active: 'success',
  paused: 'warning',
  completed: 'neutral',
}

const statusLabelMap: Record<CoachStudent['status'], string> = {
  active: 'Aktif',
  paused: 'Duraklatıldı',
  completed: 'Tamamlandı',
}

type StudentStatusBadgeProps = {
  status: CoachStudent['status']
}

export function StudentStatusBadge({ status }: StudentStatusBadgeProps) {
  return (
    <StatusBadge
      label={statusLabelMap[status]}
      variant={statusVariantMap[status]}
    />
  )
}
