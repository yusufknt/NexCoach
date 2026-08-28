/**
 * NexCoach Data Migration Script
 * Supabase PostgreSQL → Cloudflare D1
 *
 * Kullanım:
 *   SUPABASE_URL=... SUPABASE_SERVICE_KEY=... WORKER_URL=... API_SECRET=... npx tsx scripts/migrate-data.ts
 *
 * Güvenlik:
 *   - Supabase'den SADECE READ yapar
 *   - D1'e INSERT OR REPLACE yapar
 *   - Supabase'de hiçbir veri değiştirmez
 */

import { createClient } from '@supabase/supabase-js'

// ============================================
// Config
// ============================================

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const WORKER_URL = process.env.WORKER_URL || 'http://localhost:8787'
const API_SECRET = process.env.API_SECRET

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !API_SECRET) {
  console.error('❌ Gerekli environment değişkenleri eksik:')
  console.error('   SUPABASE_URL, SUPABASE_SERVICE_KEY, API_SECRET')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// ============================================
// Tablo sırası (FK bağımlılıklarına göre)
// ============================================

const MIGRATION_ORDER = [
  'profiles',           // bağımsız (auth.users referansı Supabase'de kalıyor)
  'packages',           // profiles → coach_id
  'coach_students',     // profiles, packages
  'progress_entries',   // profiles
  'programs',           // profiles
  'messages',           // profiles
  'calendar_events',    // profiles
  'payments',           // profiles, packages
  'monthly_reports',    // profiles
  'student_profiles',   // profiles
  'invitations',        // profiles, packages
] as const

// ============================================
// PostgreSQL → SQLite dönüşüm
// ============================================

function transformRow(table: string, row: Record<string, unknown>): Record<string, unknown> {
  const transformed = { ...row }

  // Boolean → integer
  for (const [key, val] of Object.entries(transformed)) {
    if (typeof val === 'boolean') {
      transformed[key] = val ? 1 : 0
    }
    // text[] → JSON array string
    if (Array.isArray(val)) {
      transformed[key] = JSON.stringify(val)
    }
    // JSONB object → JSON string
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      transformed[key] = JSON.stringify(val)
    }
  }

  return transformed
}

// ============================================
// Migration Runner
// ============================================

const BATCH_SIZE = 200

async function migrateTable(table: string): Promise<{ ok: boolean; count: number; error?: string }> {
  console.log(`\n📦 ${table} tablosu migrate ediliyor...`)

  try {
    // Supabase'den tüm veriyi oku (pagination ile)
    let allRows: Record<string, unknown>[] = []
    let page = 0
    const PAGE_SIZE = 1000

    while (true) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
        .order('created_at', { ascending: true })

      if (error) throw new Error(`Supabase read error: ${error.message}`)
      if (!data || data.length === 0) break

      allRows = allRows.concat(data)
      if (data.length < PAGE_SIZE) break
      page++
    }

    if (allRows.length === 0) {
      console.log(`  ⚪ Boş tablo, atlanıyor`)
      return { ok: true, count: 0 }
    }

    // Dönüştür ve batch halinde gönder
    const transformedRows = allRows.map((row) => transformRow(table, row))

    let sent = 0
    for (let i = 0; i < transformedRows.length; i += BATCH_SIZE) {
      const batch = transformedRows.slice(i, i + BATCH_SIZE)

      const res = await fetch(`${WORKER_URL}/api/admin/migration/import/${table}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Secret': API_SECRET!,
        },
        body: JSON.stringify({ rows: batch }),
      })

      if (!res.ok) {
        const body = await res.text()
        throw new Error(`Worker import error: ${res.status} ${body}`)
      }

      sent += batch.length
      process.stdout.write(`  📤 ${sent}/${transformedRows.length}\r`)
    }

    console.log(`  ✅ ${transformedRows.length} satır başarıyla aktarıldı`)
    return { ok: true, count: transformedRows.length }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`  ❌ Hata: ${message}`)
    return { ok: false, count: 0, error: message }
  }
}

// ============================================
// Ana Fonksiyon
// ============================================

async function main() {
  console.log('🚀 NexCoach Supabase → D1 Data Migration')
  console.log(`   Worker: ${WORKER_URL}`)
  console.log(`   Supabase: ${SUPABASE_URL}`)
  console.log('─'.repeat(50))

  const results: Record<string, { ok: boolean; count: number; error?: string }> = {}

  for (const table of MIGRATION_ORDER) {
    results[table] = await migrateTable(table)
  }

  // Sonuç raporu
  console.log('\n' + '═'.repeat(50))
  console.log('📊 Migration Sonuçları:')
  console.log('═'.repeat(50))

  let totalOk = 0
  let totalFailed = 0
  let totalRows = 0

  for (const [table, result] of Object.entries(results)) {
    const icon = result.ok ? '✅' : '❌'
    console.log(`  ${icon} ${table}: ${result.count} satır${result.error ? ` (${result.error})` : ''}`)
    if (result.ok) totalOk++
    else totalFailed++
    totalRows += result.count
  }

  console.log('─'.repeat(50))
  console.log(`  Toplam: ${totalRows} satır, ${totalOk} başarılı, ${totalFailed} hatalı`)

  if (totalFailed > 0) process.exit(1)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
