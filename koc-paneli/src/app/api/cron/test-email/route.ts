import { NextResponse } from 'next/server'
import { d1 } from '@/lib/cloudflare/d1'
import { resend, EMAIL_CONFIG } from '@/lib/email'

function testEmailTemplate(): string {
  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Email</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 24px; border-radius: 12px 12px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
    .content { background: #ffffff; padding: 32px 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
    .content h2 { margin: 0 0 16px 0; font-size: 20px; color: #111827; }
    .content p { margin: 0 0 16px 0; color: #4b5563; }
    .success-box { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin: 16px 0; border-radius: 0 8px 8px 0; }
    .success-box p { margin: 0; color: #166534; }
    .footer { text-align: center; padding: 24px; color: #9ca3af; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${EMAIL_CONFIG.appName}</h1>
    </div>
    <div class="content">
      <h2>Email Bildirim Sistemi Aktif!</h2>
      <p>Merhaba,</p>
      <p>Bu bir test email'idir. Email bildirim sistemi basariyla kuruldu ve calisiyor.</p>
      <div class="success-box">
        <p>Bundan sonra asagidaki durumlarda email bildirimleri alacaksiniz:</p>
        <p>• Ogrencilerinizden yeni mesaj geldiginde</p>
        <p>• Yeni bir ogrenci kaydoldugunda</p>
        <p>• Randevunuzdan 24 saat once</p>
      </div>
      <p>Bildirim tercihlerinizi <strong>Ayarlar → Bildirimler</strong> bolumunden yonetebilirsiniz.</p>
    </div>
    <div class="footer">
      <p>Bu email ${EMAIL_CONFIG.appName} tarafindan gonderilmistir.</p>
      <p>Bildirim tercihlerinizi panelinizden degistirebilirsiniz.</p>
    </div>
  </div>
</body>
</html>`
}

export async function GET() {
  if (!resend) {
    return NextResponse.json({ error: 'Resend not configured' }, { status: 500 })
  }

  const coaches = await d1.query<{ id: string; full_name: string }>(
    "SELECT id, full_name FROM profiles WHERE role = 'coach'"
  )

  if (!coaches || coaches.length === 0) {
    return NextResponse.json({ message: 'No coaches found' })
  }

  
  let sent = 0
  let failed = 0

  for (const coach of coaches) {
    const user = await d1.first<{email:string}>('SELECT email FROM user WHERE id = ?', [coach.id])

    if (!user?.email) continue

    try {
      await resend.emails.send({
        from: EMAIL_CONFIG.from,
        to: user.email,
        subject: 'NexCoach - Email Bildirim Sistemi Test',
        html: testEmailTemplate(),
      })
      sent++
    } catch (error) {
      console.error(`Failed to send to ${user.email}:`, error)
      failed++
    }
  }

  return NextResponse.json({
    message: 'Test emails sent',
    total: coaches.length,
    sent,
    failed,
  })
}
