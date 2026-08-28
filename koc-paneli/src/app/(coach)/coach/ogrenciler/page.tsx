import { redirect } from 'next/navigation'
import { getAuthenticatedCoachId } from '@/lib/coach/auth'
import { getCoachPackages } from '@/lib/coach/invite.server'
import { CoachPageHeader } from '@/components/coach/page-header'
import { InviteStudentButton } from '@/components/coach/students/invite-student-button'
import { CoachStudentsClient } from '@/components/coach/students-client'

export default async function CoachStudentsPage() {
  const coachId = await getAuthenticatedCoachId()
  if (!coachId) {
    redirect('/giris')
  }

  const packages = await getCoachPackages()

  return (
    <div className="coach-page">
      <div className="coach-container space-y-8">
        <CoachPageHeader
          title="Öğrencilerim"
          description="Tüm öğrencilerinizi görüntüleyin ve yönetin."
          action={<InviteStudentButton packages={packages} />}
        />
        <CoachStudentsClient />
      </div>
    </div>
  )
}
