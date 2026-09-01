import { EMAIL_CONFIG } from './index'

type NewMessageTemplateParams = {
  coachName: string
  studentName: string
  messagePreview: string
  messageUrl: string
}

type NewStudentTemplateParams = {
  coachName: string
  studentName: string
  packageName: string | null
  dashboardUrl: string
}

type ReminderTemplateParams = {
  coachName: string
  studentName: string
  appointmentTitle: string
  appointmentTime: string
  meetingUrl: string | null
}

type CoachInvitationTemplateParams = {
  coachName: string
  inviteUrl: string
  accessEndsAt: string
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function baseStyles(): string {
  return `
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 24px; border-radius: 12px 12px 0 0; text-align: center; }
      .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
      .content { background: #ffffff; padding: 32px 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
      .content h2 { margin: 0 0 16px 0; font-size: 20px; color: #111827; }
      .content p { margin: 0 0 16px 0; color: #4b5563; }
      .preview-box { background: #f9fafb; border-left: 4px solid #6366f1; padding: 16px; margin: 16px 0; border-radius: 0 8px 8px 0; }
      .preview-box p { margin: 0; color: #374151; font-style: italic; }
      .btn { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin: 16px 0; }
      .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
      .info-row:last-child { border-bottom: none; }
      .info-label { color: #6b7280; font-size: 14px; }
      .info-value { color: #111827; font-weight: 500; }
      .footer { text-align: center; padding: 24px; color: #9ca3af; font-size: 12px; }
    </style>
  `
}

export function newMessageEmailTemplate(params: NewMessageTemplateParams): string {
  const { coachName, studentName, messagePreview, messageUrl } = params
  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yeni Mesaj</title>
  ${baseStyles()}
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${EMAIL_CONFIG.appName}</h1>
    </div>
    <div class="content">
      <h2>Yeni Mesaj Aldiniz</h2>
      <p>Merhaba <strong>${coachName}</strong>,</p>
      <p><strong>${studentName}</strong> size bir mesaj gonderdi.</p>
      <div class="preview-box">
        <p>"${messagePreview}"</p>
      </div>
      <a href="${messageUrl}" class="btn">Mesaja Git</a>
    </div>
    <div class="footer">
      <p>Bu email ${EMAIL_CONFIG.appName} tarafindan gonderilmistir.</p>
      <p>Bildirim tercihlerinizi panelinizden degistirebilirsiniz.</p>
    </div>
  </div>
</body>
</html>`
}

export function newStudentEmailTemplate(params: NewStudentTemplateParams): string {
  const { coachName, studentName, packageName, dashboardUrl } = params
  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yeni Ogrenci</title>
  ${baseStyles()}
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${EMAIL_CONFIG.appName}</h1>
    </div>
    <div class="content">
      <h2>Yeni Ogrenci Katildi!</h2>
      <p>Merhaba <strong>${coachName}</strong>,</p>
      <p><strong>${studentName}</strong> davetinizi kabul ederek aramiza katildi.</p>
      ${packageName ? `
      <div class="preview-box">
        <div class="info-row">
          <span class="info-label">Paket</span>
          <span class="info-value">${packageName}</span>
        </div>
      </div>` : ''}
      <a href="${dashboardUrl}" class="btn">Panele Git</a>
    </div>
    <div class="footer">
      <p>Bu email ${EMAIL_CONFIG.appName} tarafindan gonderilmistir.</p>
      <p>Bildirim tercihlerinizi panelinizden degistirebilirsiniz.</p>
    </div>
  </div>
</body>
</html>`
}

export function reminderEmailTemplate(params: ReminderTemplateParams): string {
  const { coachName, studentName, appointmentTitle, appointmentTime, meetingUrl } = params
  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Randevu Hatirlatmasi</title>
  ${baseStyles()}
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${EMAIL_CONFIG.appName}</h1>
    </div>
    <div class="content">
      <h2>Randevu Hatirlatmasi</h2>
      <p>Merhaba <strong>${coachName}</strong>,</p>
      <p>Yaklasan randevunuzun hatirlatmasi:</p>
      <div class="preview-box">
        <div class="info-row">
          <span class="info-label">Randevu</span>
          <span class="info-value">${appointmentTitle}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Ogrenci</span>
          <span class="info-value">${studentName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Tarih / Saat</span>
          <span class="info-value">${appointmentTime}</span>
        </div>
      </div>
      ${meetingUrl ? `<a href="${meetingUrl}" class="btn">Gorusmeye Katil</a>` : ''}
    </div>
    <div class="footer">
      <p>Bu email ${EMAIL_CONFIG.appName} tarafindan gonderilmistir.</p>
      <p>Bildirim tercihlerinizi panelinizden degistirebilirsiniz.</p>
    </div>
  </div>
</body>
</html>`
}

export function coachInvitationEmailTemplate(params: CoachInvitationTemplateParams): string {
  const coachName = escapeHtml(params.coachName)
  const inviteUrl = escapeHtml(params.inviteUrl)
  const accessEndsAt = escapeHtml(params.accessEndsAt)

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NexCoach Koç Daveti</title>
  ${baseStyles()}
</head>
<body>
  <div class="container">
    <div class="header"><h1>${EMAIL_CONFIG.appName}</h1></div>
    <div class="content">
      <h2>Koç hesabınızı oluşturun</h2>
      <p>Merhaba <strong>${coachName}</strong>,</p>
      <p>NexCoach koç paneline davet edildiniz. Aşağıdaki tek kullanımlık bağlantı 48 saat geçerlidir.</p>
      <div class="preview-box">
        <div class="info-row">
          <span class="info-label">Panel erişim bitişi</span>
          <span class="info-value">${accessEndsAt}</span>
        </div>
      </div>
      <a href="${inviteUrl}" class="btn">Hesabımı Oluştur</a>
      <p>Bu daveti siz beklemiyorsanız e-postayı yok sayabilirsiniz.</p>
    </div>
    <div class="footer"><p>Bu e-posta ${EMAIL_CONFIG.appName} tarafından gönderilmiştir.</p></div>
  </div>
</body>
</html>`
}
