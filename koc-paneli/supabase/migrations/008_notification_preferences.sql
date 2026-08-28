-- Koç bildirim tercihleri (JSONB)
alter table public.profiles
  add column if not exists notification_preferences jsonb default '{"emailOnMessage":true,"emailOnNewStudent":true,"emailReminderBefore24h":true}'::jsonb;
