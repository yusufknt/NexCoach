import { NextResponse } from 'next/server'
import { getAuthenticatedCoachId } from '@/lib/coach/auth'
import { getDashboardData } from '@/lib/coach/dashboard.server'

export async function GET() {
  const coachId = await getAuthenticatedCoachId()
  if (!coachId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const data = await getDashboardData()
  if (!data) {
    return NextResponse.json({ error: 'No data' }, { status: 404 })
  }

  return NextResponse.json(data)
}
