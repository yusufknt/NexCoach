import { NextResponse } from 'next/server'
import { getAuthenticatedCoachId } from '@/lib/coach/auth'
import { getCoachStudents } from '@/lib/coach/students.server'

export async function GET() {
  const coachId = await getAuthenticatedCoachId()
  if (!coachId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const students = await getCoachStudents()
  if (students === null) {
    return NextResponse.json({ error: 'No students' }, { status: 404 })
  }

  return NextResponse.json(students)
}
