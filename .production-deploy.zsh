#!/bin/zsh

set -euo pipefail

PROJECT_ROOT="/Users/yusufkantarcioglu/Desktop/masaustu/NexCoach"
WORKER_DIR="$PROJECT_ROOT/cloudflare"
APP_DIR="$PROJECT_ROOT/koc-paneli"
SECRET_DIR="$(mktemp -d "${TMPDIR:-/tmp}/nexcoach-production.XXXXXX")"

cleanup() {
  find "$SECRET_DIR" -type f -delete 2>/dev/null || true
  rmdir "$SECRET_DIR" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

API_SECRET_FILE="$SECRET_DIR/api-secret"
URL_SIGNING_SECRET_FILE="$SECRET_DIR/url-signing-secret"
CRON_SECRET_FILE="$SECRET_DIR/cron-secret"

umask 077
openssl rand -hex 32 > "$API_SECRET_FILE"
openssl rand -hex 32 > "$URL_SIGNING_SECRET_FILE"
openssl rand -hex 32 > "$CRON_SECRET_FILE"

cd "$WORKER_DIR"
if ! npx wrangler whoami >/dev/null; then
  print -u2 "Cloudflare oturumu bulunamadı. Önce: cd $WORKER_DIR && npx wrangler login"
  exit 1
fi

cd "$PROJECT_ROOT"
if ! vercel whoami >/dev/null; then
  vercel login
fi

if [[ ! -f .vercel/project.json ]]; then
  vercel link
fi

print "Cloudflare Worker'ın son kod sürümü deploy ediliyor..."
cd "$WORKER_DIR"
npx wrangler deploy --env=""

print "Vercel production secret'ları güncelleniyor..."
cd "$PROJECT_ROOT"
vercel env add CLOUDFLARE_API_SECRET production --sensitive --force < "$API_SECRET_FILE"
vercel env add CRON_SECRET production --sensitive --force < "$CRON_SECRET_FILE"

print "Cloudflare Worker secret'ları güncelleniyor..."
cd "$WORKER_DIR"
npx wrangler secret put API_SECRET --env="" < "$API_SECRET_FILE"
npx wrangler secret put URL_SIGNING_SECRET --env="" < "$URL_SIGNING_SECRET_FILE"

print "Cloudflare Worker secret'larla yeniden doğrulanıyor..."
npx wrangler deploy --env=""

print "Vercel production deployu başlatılıyor..."
cd "$PROJECT_ROOT"
DEPLOYMENT_URL="$(vercel deploy --prod --yes)"

print "Production güvenlik smoke testleri çalıştırılıyor..."
DB_STATUS="$(curl -sS -o /dev/null -w '%{http_code}' -X POST \
  'https://nexcoach-api.yusufk6509.workers.dev/api/db/query' \
  -H 'content-type: application/json' \
  --data '{"query":"SELECT 1"}')"
R2_STATUS="$(curl -sS -o /dev/null -w '%{http_code}' \
  'https://nexcoach-api.yusufk6509.workers.dev/api/storage/progress-photos/security-smoke-test')"
APP_STATUS="$(curl -sS -o /dev/null -w '%{http_code}' "$DEPLOYMENT_URL")"

if [[ "$DB_STATUS" != "401" || "$R2_STATUS" != "403" || "$APP_STATUS" -lt 200 || "$APP_STATUS" -ge 400 ]]; then
  print -u2 "Smoke test başarısız: DB=$DB_STATUS R2=$R2_STATUS APP=$APP_STATUS"
  exit 1
fi

print "Production deployu tamamlandı: $DEPLOYMENT_URL"
print "Güvenlik testleri başarılı: DB=401 R2=403 APP=$APP_STATUS"
print "Geçici secret dosyaları siliniyor."
