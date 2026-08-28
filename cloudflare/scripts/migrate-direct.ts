/**
 * NexCoach Direct Data Migration
 * Supabase PostgreSQL → Cloudflare D1 (wrangler d1 execute kullanarak)
 *
 * Kullanım:
 *   cd cloudflare && npx tsx scripts/migrate-direct.ts
 *
 * .env dosyasını koc-paneli/.env'den okur.
 * D1'e doğrudan wrangler CLI ile yazar.
 *
 * GÜVENLİK: Supabase'den SADECE READ yapar.
 */

import { createClient } from '@supabase/supabase-js'
import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// ============================================
// Config - koc-paneli/.env'den oku
// ============================================

const envPath = resolve(__dirname, '../../koc-paneli/.env')
const envContent = readFileSync(envPath, 'utf-8')
const envVars: Record<string, string> = {}
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) envVars[match[1].trim()] = match[2].trim()
}

const SUPABASE_URL = envVars['NEXT_PUBLIC_SUPABASE_URL']
const SUPABASE_SERVICE_KEY = envVars['SUPABASE_SERVICE_ROLE_KEY']
const D1_DB_NAME = 'nexcoach-db'

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY bulunamadı')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// ============================================
// Tablo sırası (FK bağımlılıklarına göre)
// ============================================

const MIGRATION_ORDER = [
  'profiles',
  'packages',
  'coach_students',
  'progress_entries',
  'programs',
  'messages',
  'calendar_events',
  'payments',
  'monthly_reports',
  'student_profiles',
  'invitations',
] as const

// ============================================
// D1'e SQL çalıştır (wrangler CLI üzerinden)
// ============================================

function d1Execute(sql: string, remote = true): string {
  const flag = remote ? '--remote' : '--local'
  // Escape single quotes in SQL for shell
  const escapedSql = sql.replace(/'/g, "'\\''")
  try {
    const result = execSync(
      `npx wrangler d1 execute ${D1_DB_NAME} ${flag} --command '${escapedSql}'`,
      { cwd: resolve(__dirname, '..'), encoding: 'utf-8', timeout: 30000 }
    )
    return result
  } catch (err: unknown) {
    const error = err as { stderr?: string; stdout?: string }
    throw new Error(`D1 execute failed: ${error.stderr || error.stdout || String(err)}`)
  }
}

function d1ExecuteJson(sql: string, remote = true): Record<string, unknown>[] {
  const flag = remote ? '--remote' : '--local'
  const escapedSql = sql.replace(/'/g, "'\\''")
  try {
    const result = execSync(
      `npx wrangler d1 execute ${D1_DB_NAME} ${flag} --command '${escapedSql}' --json`,
      { cwd: resolve(__dirname, '..'), encoding: 'utf-8', timeout: 30000 }
    )
    const parsed = JSON.parse(result)
    return parsed[0]?.results || []
  } catch (err: unknown) {
    const error = err as { stderr?: string; stdout?: string }
    throw new Error(`D1 execute failed: ${error.stderr || error.stdout || String(err)}`)
  }
}

// ============================================
// SQL değeri escape et
// ============================================

function sqlValue(val: unknown): string {
  if (val === null || val === undefined) return 'NULL'
  if (typeof val === 'boolean') return val ? '1' : '0'
  if (typeof val === 'number') return String(val)
  if (Array.isArray(val)) return sqlString(JSON.stringify(val))
  if (typeof val === 'object') return sqlString(JSON.stringify(val))
  return sqlString(String(val))
}

function sqlString(s: string): string {
  return "'" + s.replace(/'/g, "''") + "'"
}

// ============================================
// Tablo migration
// ============================================

async function migrateTable(table: string): Promise<{ count: number; error?: string }> {
  console.log(`\n📦 ${table}...`)

  try {
    // Supabase'den tüm veriyi oku
    let allRows: Record<string, unknown>[] = []
    let page = 0
    const PAGE_SIZE = 1000

    while (true) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
        .order('created_at', { ascending: true })

      if (error) throw new Error(`Supabase read: ${error.message}`)
      if (!data || data.length === 0) break
      allRows = allRows.concat(data)
      if (data.length < PAGE_SIZE) break
      page++
    }

    if (allRows.length === 0) {
      console.log('  ⚪ Boş tablo')
      return { count: 0 }
    }

    // Batch SQL insert - her 50 satırda bir execute et
    const BATCH = 50
    let inserted = 0
    const columns = Object.keys(allRows[0])

    for (let i = 0; i < allRows.length; i += BATCH) {
      const batch = allRows.slice(i, i + BATCH)
      const valuesSql = batch.map((row) => {
        const vals = columns.map((col) => sqlValue(row[col]))
        return `(${vals.join(', ')})`
      }).join(',\n')

      const sql = `INSERT OR REPLACE INTO ${table} (${columns.join(', ')}) VALUES ${valuesSql};`

      d1Execute(sql)
      inserted += batch.length
      process.stdout.write(`  📤 ${inserted}/${allRows.length}\r`)
    }

    console.log(`  ✅ ${allRows.length} satır`)
    return { count: allRows.length }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`  ❌ ${msg}`)
    return { count: 0, error: msg }
  }
}

// ============================================
// Doğrulama
// ============================================

async function verify(): Promise<boolean> {
  console.log('\n' + '═'.repeat(50))
  console.log('🔍 Doğrulama: Supabase ↔ D1')
  console.log('═'.repeat(50))

  let allOk = true

  for (const table of MIGRATION_ORDER) {
    // Supabase count
    const { count: sbCount, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.log(`  ❌ ${table}: Supabase count error: ${error.message}`)
      allOk = false
      continue
    }

    // D1 count
    const d1Result = d1ExecuteJson(`SELECT COUNT(*) as cnt FROM ${table}`)
    const d1Count = (d1Result[0] as Record<string, number>)?.cnt ?? -1

    const match = sbCount === d1Count
    const icon = match ? '✅' : '❌'
    console.log(`  ${icon} ${table}: Supabase=${sbCount} D1=${d1Count}`)
    if (!match) allOk = false
  }

  return allOk
}

// ============================================
// FK Bütünlük Kontrolü
// ============================================

async function verifyFK(): Promise<boolean> {
  console.log('\n🔗 FK Bütünlük Kontrolü (D1)')

  const checks = [
    { name: 'packages→profiles', sql: "SELECT COUNT(*) as cnt FROM packages WHERE coach_id NOT IN (SELECT id FROM profiles)" },
    { name: 'coach_students→profiles(coach)', sql: "SELECT COUNT(*) as cnt FROM coach_students WHERE coach_id NOT IN (SELECT id FROM profiles)" },
    { name: 'coach_students→profiles(student)', sql: "SELECT COUNT(*) as cnt FROM coach_students WHERE student_id NOT IN (SELECT id FROM profiles)" },
    { name: 'progress_entries→profiles', sql: "SELECT COUNT(*) as cnt FROM progress_entries WHERE student_id NOT IN (SELECT id FROM profiles)" },
    { name: 'programs→profiles', sql: "SELECT COUNT(*) as cnt FROM programs WHERE coach_id NOT IN (SELECT id FROM profiles)" },
    { name: 'messages→profiles(sender)', sql: "SELECT COUNT(*) as cnt FROM messages WHERE sender_id NOT IN (SELECT id FROM profiles)" },
    { name: 'monthly_reports→profiles', sql: "SELECT COUNT(*) as cnt FROM monthly_reports WHERE coach_id NOT IN (SELECT id FROM profiles)" },
    { name: 'invitations→profiles', sql: "SELECT COUNT(*) as cnt FROM invitations WHERE coach_id NOT IN (SELECT id FROM profiles)" },
  ]

  let allOk = true
  for (const check of checks) {
    const result = d1ExecuteJson(check.sql)
    const orphans = (result[0] as Record<string, number>)?.cnt ?? -1
    const ok = orphans === 0
    console.log(`  ${ok ? '✅' : '❌'} ${check.name}: ${orphans} orphan`)
    if (!ok) allOk = false
  }

  return allOk
}

// ============================================
// JSON/Null Kontrolü
// ============================================

async function verifyDataIntegrity(): Promise<boolean> {
  console.log('\n📋 Veri Bütünlük Kontrolü (D1)')

  const checks = [
    { name: 'profiles.notification_preferences JSON', sql: "SELECT COUNT(*) as cnt FROM profiles WHERE notification_preferences IS NOT NULL AND json_valid(notification_preferences) = 0" },
    { name: 'progress_entries.custom_metrics JSON', sql: "SELECT COUNT(*) as cnt FROM progress_entries WHERE custom_metrics IS NOT NULL AND json_valid(custom_metrics) = 0" },
    { name: 'monthly_reports.metrics_summary JSON', sql: "SELECT COUNT(*) as cnt FROM monthly_reports WHERE metrics_summary IS NOT NULL AND json_valid(metrics_summary) = 0" },
    { name: 'packages.features JSON array', sql: "SELECT COUNT(*) as cnt FROM packages WHERE features IS NOT NULL AND json_valid(features) = 0" },
    { name: 'profiles.created_at not null', sql: "SELECT COUNT(*) as cnt FROM profiles WHERE created_at IS NULL" },
    { name: 'coach_students.status valid', sql: "SELECT COUNT(*) as cnt FROM coach_students WHERE status NOT IN ('active','paused','completed')" },
    { name: 'invitations.status valid', sql: "SELECT COUNT(*) as cnt FROM invitations WHERE status NOT IN ('pending','accepted','expired')" },
  ]

  let allOk = true
  for (const check of checks) {
    try {
      const result = d1ExecuteJson(check.sql)
      const bad = (result[0] as Record<string, number>)?.cnt ?? -1
      const ok = bad === 0
      console.log(`  ${ok ? '✅' : '❌'} ${check.name}: ${bad} sorun`)
      if (!ok) allOk = false
    } catch {
      console.log(`  ⚠️ ${check.name}: kontrol yapılamadı`)
    }
  }

  return allOk
}

// ============================================
// Main
// ============================================

async function main() {
  console.log('🚀 NexCoach Supabase → D1 Direct Migration')
  console.log(`   Supabase: ${SUPABASE_URL}`)
  console.log(`   D1: ${D1_DB_NAME} (remote)`)
  console.log('─'.repeat(50))

  // Migration
  const results: Record<string, { count: number; error?: string }> = {}
  for (const table of MIGRATION_ORDER) {
    results[table] = await migrateTable(table)
  }

  // Sonuç
  console.log('\n' + '═'.repeat(50))
  console.log('📊 Migration Sonuçları:')
  let totalRows = 0
  let failed = 0
  for (const [table, r] of Object.entries(results)) {
    const icon = r.error ? '❌' : '✅'
    console.log(`  ${icon} ${table}: ${r.count}${r.error ? ` (${r.error})` : ''}`)
    totalRows += r.count
    if (r.error) failed++
  }
  console.log(`  Toplam: ${totalRows} satır, ${failed} hata`)

  // Doğrulama
  const countOk = await verify()
  const fkOk = await verifyFK()
  const dataOk = await verifyDataIntegrity()

  console.log('\n' + '═'.repeat(50))
  console.log(`📋 Final: count=${countOk ? '✅' : '❌'} FK=${fkOk ? '✅' : '❌'} data=${dataOk ? '✅' : '❌'}`)

  if (!countOk || !fkOk || !dataOk) process.exit(1)
  console.log('✅ Migration başarılı!')
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
