import { Badge } from '@/components/ui/badge'
import type { CoachAccessStatus, CoachInvitationStatus } from '@/types/database'

const accessLabels: Record<CoachAccessStatus, string> = {
  pending: 'Bekliyor',
  active: 'Aktif',
  expired: 'Süresi doldu',
  suspended: 'Askıda',
}

const invitationLabels: Record<CoachInvitationStatus, string> = {
  pending: 'Bekliyor',
  accepted: 'Kabul edildi',
  expired: 'Süresi doldu',
  cancelled: 'İptal edildi',
}

export function AccessStatusBadge({ status, endsAt }: { status: CoachAccessStatus; endsAt?: string | null }) {
  const effectiveStatus = status === 'active' && endsAt && new Date(endsAt) <= new Date() ? 'expired' : status
  const variant = effectiveStatus === 'active' ? 'default' : effectiveStatus === 'suspended' ? 'destructive' : 'secondary'
  return <Badge variant={variant}>{accessLabels[effectiveStatus]}</Badge>
}

export function InvitationStatusBadge({ status }: { status: CoachInvitationStatus }) {
  const variant = status === 'accepted' ? 'default' : status === 'cancelled' ? 'destructive' : 'secondary'
  return <Badge variant={variant}>{invitationLabels[status]}</Badge>
}
