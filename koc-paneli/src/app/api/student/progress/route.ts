import { NextResponse } from 'next/server'
import { getAuthenticatedStudentId } from '@/lib/student/auth'
import { getProgressData } from '@/lib/student/progress.server'

export async function GET() {
  const studentId = await getAuthenticatedStudentId()
  if (!studentId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const progress = await getProgressData(studentId)
  if (progress === null) {
    return NextResponse.json({ error: 'No progress data' }, { status: 404 })
  }

  return NextResponse.json(progress)
}
