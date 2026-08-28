import type { ReactNode } from 'react'
import { PageHeader } from '@/components/shared/page-header'

type CoachPageHeaderProps = {
  eyebrow?: string
  title: string
  description: string
  action?: ReactNode
}

export function CoachPageHeader({
  eyebrow = 'Elite Coaching',
  title,
  description,
  action,
}: CoachPageHeaderProps) {
  return (
    <PageHeader
      eyebrow={eyebrow}
      title={title}
      description={description}
      action={action}
    />
  )
}
