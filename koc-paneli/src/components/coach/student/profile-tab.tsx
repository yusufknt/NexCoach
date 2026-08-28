'use client'

import type { StudentOnboardingView } from '@/lib/coach/onboarding.server'
import { ProfileInfoCards } from './profile/profile-info-cards'
import { ProfilePhotosCard } from './profile/profile-photos-card'

type ProfileTabProps = {
  onboarding: StudentOnboardingView | null
  isEditable?: boolean
}

export function ProfileTab({ onboarding, isEditable = false }: ProfileTabProps) {
  if (!onboarding) {
    return (
      <p className="rounded-2xl border border-dashed border-[#444933] bg-[#18181B]/60 p-8 text-center text-sm text-[#C4C9AC]">
        Öğrenci henüz profil bilgilerini tamamlamamış.
      </p>
    )
  }

  return (
    <div className="space-y-6">
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
