# Database Schema & Migrations

Cloudflare D1 (SQLite) serves as the primary operational database.

## Schema Location (Active)
`cloudflare/d1/migrations/`
- `0001_initial_schema.sql`: Core tables migrated from PostgreSQL (profiles, coach_students, messages, calendar, programs, etc.)
- `0002_better_auth.sql`: Better Auth standard tables (user, session, account, verification)
- `0003_add_issuer.sql`: Better Auth account table extensions
- `0004_admin_and_coach_access.sql`: Admin membership, coach access periods, single-use coach invitations and admin audit logs

## Admin & Access Tables
- `admins`: Better Auth users allowed to access `/admin/*`; kept separate from the `profiles` coach/student constraint.
- `coach_access`: Manual IBAN-era entitlement state (`pending`, `active`, `expired`, `suspended`), access dates, payment note and activating admin.
- `coach_invitations`: 48-hour coach onboarding invitations. Stores only a SHA-256 token hash plus intended email, name and access dates.
- `admin_audit_logs`: Append-only records for coach invitation and access mutations.

Migration `0004` backfills existing coach profiles as active with no forced end date so deploying the access gate does not lock current coaches.

## TypeScript Types
`koc-paneli/src/types/database.ts` and `koc-paneli/src/types/index.ts`

## Yedekleme ve Kurtarma (Backups & PITR)

Cloudflare D1, yerleşik olarak **Time Travel (Point-in-Time Recovery)** özelliğine sahiptir. Veritabanınızı geçmişteki herhangi bir saniyeye geri döndürebilirsiniz (Ücretsiz planda son 7 gün, ücretli planda son 30 gün).

### Veritabanını Geri Döndürme (Restore)
Yanlışlıkla bir tablo silindiğinde veya hatalı veri yazıldığında aşağıdaki komutu kullanarak veritabanını belirli bir zamana geri alabilirsiniz:

```bash
wrangler d1 time-travel restore nexcoach-db --timestamp="2026-08-31T15:00:00Z"
```

### İkincil Yedekleme Stratejisi (D1 Export to R2)
Sadece Time Travel'a güvenmemek adına, periyodik tam yedeklemeler alınmalıdır:
1. Cloudflare Workers üzerinde bir Cron Trigger oluşturulur.
2. Bu Worker belirli aralıklarla (örneğin her gece) veritabanı SQL dökümünü (`wrangler d1 export nexcoach-db`) çalıştırıp sıkıştırır.
3. Çıkan `.sql` dosyası güvenli bir R2 Bucket'ında arşivlenir.
