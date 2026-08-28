'use client'

import { useEffect, useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { StudentSidebarClient } from '@/components/student/sidebar-client'
import { fetchStudentSidebarBadges } from '@/lib/student/sidebar-actions'
import type { SidebarBadges } from '@/lib/student/types'

export function StudentSidebar() {
  const [badges, setBadges] = useState<SidebarBadges>({
    unreadMessages: 0,
    hasNewProgram: false,
    coachName: 'Koç',
    coachAvatarUrl: null,
  })

  useEffect(() => {
    const fetchBadges = async () => {
      
      const { data: session } = await authClient.getSession();
      const user = session?.user;
      if (!user) return

      try {
        const data = await fetchStudentSidebarBadges(user.id)
        if (data) setBadges(data)
      } catch (err) {
        console.error('Error fetching sidebar badges:', err)
      }
    }

    fetchBadges()
  }, [])

  return <StudentSidebarClient badges={badges} />
}
