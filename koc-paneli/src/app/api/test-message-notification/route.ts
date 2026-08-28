import { NextResponse } from 'next/server'
import { sendNewMessageNotification } from '@/lib/email/send'
import { d1 } from '@/lib/cloudflare/d1'

export async function GET() {
  try {
    const coachId = '4d35aa51-b50a-4f35-924d-bb8be4f93aae'
    
    const student = await d1.first<{ student_id: string }>(
      'SELECT student_id FROM coach_students WHERE coach_id = ? LIMIT 1',
      [coachId]
    )

    const studentId = student?.student_id ?? '00000000-0000-0000-0000-000000000000'

    await sendNewMessageNotification({
      coachId,
      studentId,
      messageContent: 'Bu bir test mesajıdır. Email bildirim sistemi çalışıyor mu kontrol ediyoruz.',
    })

    return NextResponse.json({ success: true, message: 'Notification sent' })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
