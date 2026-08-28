'use server'

import { getSidebarBadges } from '@/lib/student/dashboard.server'
import type { SidebarBadges } from './types'

export async function fetchStudentSidebarBadges(studentId: string): Promise<SidebarBadges> {
  return getSidebarBadges(studentId)
}
