'use client'

import type { StudentOnboardingView } from '@/lib/coach/onboarding.server'
import type { CoachStudentDetail } from '@/lib/coach/types'
import { ProfileInfoCards } from './profile/profile-info-cards'
import { ProfilePhotosCard } from './profile/profile-photos-card'
import { MembershipCard } from './profile/membership-card'

type ProfileTabProps = {
  onboarding: StudentOnboardingView | null
  student?: CoachStudentDetail
  isEditable?: boolean
}

export function ProfileTab({ onboarding, student, isEditable = false }: ProfileTabProps) {
  if (!onboarding) {
    return (
      <div className="space-y-6">
        {student && <MembershipCard student={student} />}
        <p className="rounded-2xl border border-dashed border-border/80 bg-muted/30 p-8 text-center text-sm text-muted-foreground">
          Öğrenci henüz profil bilgilerini tamamlamamış.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {student && <MembershipCard student={student} />}
      <ProfileInfoCards profile={onboarding.profile} />
      <ProfilePhotosCard
        initialFrontPhoto={onboarding.photoUrls.frontUrl}
        initialSidePhoto={onboarding.photoUrls.sideUrl}
        initialBackPhoto={onboarding.photoUrls.backUrl}
        isEditable={isEditable}
      />
    </div>
  )
}
