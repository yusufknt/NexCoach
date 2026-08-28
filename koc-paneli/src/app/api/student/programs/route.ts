import { NextResponse } from 'next/server'
import { getAuthenticatedStudentId } from '@/lib/student/auth'
import { getStudentPrograms } from '@/lib/student/programs.server'

export async function GET() {
  const studentId = await getAuthenticatedStudentId()
  if (!studentId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const programs = await getStudentPrograms(studentId)
  if (programs === null) {
    return NextResponse.json({ error: 'No programs' }, { status: 404 })
  }

  return NextResponse.json(programs)
}
