import { redirect } from 'next/navigation'
import { getAuthenticatedCoachId } from '@/lib/coach/auth'
import { getCoachPackages } from '@/lib/coach/invite.server'
import { CoachPageHeader } from '@/components/coach/page-header'
import { InviteStudentButton } from '@/components/coach/students/invite-student-button'
import { CoachStudentsClient } from '@/components/coach/students-client'

type CoachStudentsPageProps = {
  searchParams: Promise<{ q?: string }>
}

export default async function CoachStudentsPage({ searchParams }: CoachStudentsPageProps) {
  const coachId = await getAuthenticatedCoachId()
  if (!coachId) {
    redirect('/giris')
  }

  const packages = await getCoachPackages()
  const { q = '' } = await searchParams

  return (
    <div className="coach-page">
      <div className="coach-container space-y-8">
        <CoachPageHeader
          title="Öğrencilerim"
          description="Tüm öğrencilerinizi görüntüleyin ve yönetin."
          action={<InviteStudentButton packages={packages} />}
        />
        <CoachStudentsClient initialQuery={q} />
      </div>
    </div>
  )
}
