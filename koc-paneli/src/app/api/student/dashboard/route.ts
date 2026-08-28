import { NextResponse } from 'next/server'
import { getAuthenticatedStudentId } from '@/lib/student/auth'
import { getStudentDashboard } from '@/lib/student/dashboard.server'

export async function GET() {
  const studentId = await getAuthenticatedStudentId()
  if (!studentId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const data = await getStudentDashboard(studentId)
  if (!data) {
    return NextResponse.json({ error: 'No data' }, { status: 404 })
  }

  return NextResponse.json(data)
}
