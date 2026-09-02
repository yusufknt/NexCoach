import { redirect } from 'next/navigation'
import { getAuthenticatedCoachId } from '@/lib/coach/auth'
import { CoachPageHeader } from '@/components/coach/page-header'
import { InviteStudentButton } from '@/components/coach/students/invite-student-button'
import { CoachStudentsClient } from '@/components/coach/students-client'
import { getCoachPackages, getCoachInvitations } from '@/lib/coach/invite.server'
import { InvitationsList } from '@/components/coach/students/invitations-list'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type CoachStudentsPageProps = {
  searchParams: Promise<{ q?: string }>
}

export default async function CoachStudentsPage({ searchParams }: CoachStudentsPageProps) {
  const coachId = await getAuthenticatedCoachId()
  if (!coachId) {
    redirect('/giris')
  }

  const { q = '' } = await searchParams

  const packages = await getCoachPackages()
  const allInvitations = await getCoachInvitations()
  const pendingInvitations = (allInvitations ?? []).filter(inv => inv.status === 'pending')

  return (
    <div className="coach-page">
      <div className="coach-container space-y-8">
        <CoachPageHeader
          title="Öğrencilerim"
          description="Tüm öğrencilerinizi görüntüleyin ve yönetin."
          action={<InviteStudentButton packages={packages} />}
        />
        
        <Tabs defaultValue="students" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="students">Aktif Öğrenciler</TabsTrigger>
            <TabsTrigger value="invitations">Bekleyen Davetler ({pendingInvitations.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="students" className="mt-0">
            <CoachStudentsClient initialQuery={q} />
          </TabsContent>
          
          <TabsContent value="invitations" className="mt-0">
            <InvitationsList invitations={pendingInvitations} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
