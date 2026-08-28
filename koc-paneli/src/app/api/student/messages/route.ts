import { NextResponse } from 'next/server'
import { getAuthenticatedStudentId } from '@/lib/student/auth'
import { getStudentCoachInfo, getInitialMessages } from '@/lib/student/messages.server'

export async function GET() {
  const studentId = await getAuthenticatedStudentId()
  if (!studentId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const coachInfo = await getStudentCoachInfo(studentId)
  if (!coachInfo) {
    return NextResponse.json({ error: 'No coach found' }, { status: 404 })
  }

  const messages = await getInitialMessages(studentId, coachInfo.id)

  return NextResponse.json({ coachInfo, messages })
}
