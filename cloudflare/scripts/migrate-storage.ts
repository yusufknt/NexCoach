/**
 * NexCoach Storage Migration Script
 * Supabase Storage → Cloudflare R2
 *
 * Kullanım:
 *   SUPABASE_URL=... SUPABASE_SERVICE_KEY=... WORKER_URL=... API_SECRET=... npx tsx scripts/migrate-storage.ts
 *
 * Güvenlik:
 *   - Supabase Storage'dan SADECE READ yapar
 *   - R2'ye upload yapar
 *   - Supabase'de hiçbir dosya silmez/değiştirmez
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
  console.error('❌ Gerekli environment değişkenleri eksik')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// ============================================
// Bucket Mapping (Supabase → R2)
// ============================================

const BUCKETS = [
  { supabase: 'programs', r2: 'programs' },
  { supabase: 'avatars', r2: 'avatars' },
  { supabase: 'progress-photos', r2: 'progress-photos' },
  { supabase: 'monthly-reports', r2: 'monthly-reports' },
] as const

// ============================================
// Migration Runner
// ============================================

async function migrateBucket(supabaseBucket: string, r2Bucket: string) {
  console.log(`\n📁 ${supabaseBucket} → ${r2Bucket}`)

  try {
    // Supabase Storage'dan dosya listele
    const { data: files, error } = await supabase.storage
      .from(supabaseBucket)
      .list('', { limit: 1000, sortBy: { column: 'created_at', order: 'asc' } })

    if (error) throw new Error(`List error: ${error.message}`)
    if (!files || files.length === 0) {
      console.log('  ⚪ Boş bucket')
      return { ok: true, count: 0 }
    }

    // Recursive folder listing
    const allFiles = await listAllFiles(supabaseBucket, '')
    console.log(`  📂 ${allFiles.length} dosya bulundu`)

    let uploaded = 0
    let failed = 0

    for (const filePath of allFiles) {
      try {
        // Supabase'den download
        const { data, error: dlError } = await supabase.storage
          .from(supabaseBucket)
          .download(filePath)

        if (dlError || !data) {
          console.error(`  ⚠️ Download başarısız: ${filePath}`)
          failed++
          continue
        }

        // R2'ye upload
        const arrayBuffer = await data.arrayBuffer()
        const res = await fetch(`${WORKER_URL}/api/storage/${r2Bucket}/${filePath}`, {
          method: 'PUT',
          headers: {
            'Content-Type': data.type || 'application/octet-stream',
            'X-API-Secret': API_SECRET!,
          },
          body: arrayBuffer,
        })

        if (!res.ok) {
          console.error(`  ⚠️ Upload başarısız: ${filePath} (${res.status})`)
          failed++
          continue
        }

        uploaded++
        process.stdout.write(`  📤 ${uploaded}/${allFiles.length}\r`)
      } catch (err) {
        console.error(`  ⚠️ ${filePath}: ${err}`)
        failed++
      }
    }

    console.log(`  ✅ ${uploaded} dosya aktarıldı${failed > 0 ? `, ${failed} hatalı` : ''}`)
    return { ok: failed === 0, count: uploaded }
  } catch (err) {
    console.error(`  ❌ ${err}`)
    return { ok: false, count: 0 }
  }
}

async function listAllFiles(bucket: string, prefix: string): Promise<string[]> {
  const files: string[] = []
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(prefix, { limit: 1000 })

  if (error || !data) return files

  for (const item of data) {
    const path = prefix ? `${prefix}/${item.name}` : item.name
    if (item.id) {
      // Dosya
      files.push(path)
    } else {
      // Klasör - recursive
      const subFiles = await listAllFiles(bucket, path)
      files.push(...subFiles)
    }
  }

  return files
}

// ============================================
// Ana Fonksiyon
// ============================================

async function main() {
  console.log('🚀 NexCoach Storage Migration: Supabase → R2')
  console.log('─'.repeat(50))

  for (const { supabase: sb, r2 } of BUCKETS) {
    await migrateBucket(sb, r2)
  }

  console.log('\n' + '═'.repeat(50))
  console.log('✅ Storage migration tamamlandı')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
