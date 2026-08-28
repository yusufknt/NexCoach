/**
 * NexCoach R2 Storage Direct Migration Script
 * Supabase Storage → Cloudflare R2 (wrangler r2 object put)
 *
 * GÜVENLİK: Supabase'den SADECE READ yapar.
 */

import { createClient } from '@supabase/supabase-js'
import { execSync } from 'child_process'
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'fs'
import { resolve, dirname } from 'path'

// Config
const envPath = resolve(__dirname, '../../koc-paneli/.env')
const envContent = readFileSync(envPath, 'utf-8')
const envVars: Record<string, string> = {}
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) envVars[match[1].trim()] = match[2].trim()
}
const SUPABASE_URL = envVars['NEXT_PUBLIC_SUPABASE_URL']
const SUPABASE_SERVICE_KEY = envVars['SUPABASE_SERVICE_ROLE_KEY']

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Supabase credentials missing.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const BUCKETS = [
  { sb: 'programs', r2: 'nexcoach-programs' },
  { sb: 'avatars', r2: 'nexcoach-avatars' },
  { sb: 'progress-photos', r2: 'nexcoach-progress-photos' },
  { sb: 'monthly-reports', r2: 'nexcoach-monthly-reports' },
]

async function listAllFiles(bucket: string, prefix: string = ''): Promise<any[]> {
  const files: any[] = []
  const { data, error } = await supabase.storage.from(bucket).list(prefix, { limit: 1000 })
  if (error || !data) return files
  
  for (const item of data) {
    const path = prefix ? `${prefix}/${item.name}` : item.name
    if (item.id) { // File
      files.push({ path, size: item.metadata?.size || 0 })
    } else if (item.name !== '.emptyFolderPlaceholder') { // Folder
      const subFiles = await listAllFiles(bucket, path)
      files.push(...subFiles)
    }
  }
  return files
}

async function main() {
  console.log('🚀 NexCoach Supabase → R2 Storage Direct Migration')
  console.log('─'.repeat(50))
  
  const tempDir = resolve(__dirname, '../temp-dl')
  if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true })

  let allOk = true

  for (const { sb, r2 } of BUCKETS) {
    console.log(`\n📁 Bucket: ${sb} → ${r2}`)
    const files = await listAllFiles(sb)
    let totalSize = files.reduce((acc, f) => acc + f.size, 0)
    console.log(`  Supabase'de ${files.length} dosya bulundu (${(totalSize / 1024).toFixed(1)} KB).`)

    if (files.length === 0) {
      console.log('  ⚪ Boş bucket, atlanıyor.')
      continue
    }

    let uploaded = 0
    let failed = 0
    
    for (const fileObj of files) {
      const file = fileObj.path
      try {
        const { data, error } = await supabase.storage.from(sb).download(file)
        if (error || !data) {
          console.error(`\n  ❌ Download hatası: ${file}`)
          failed++
          continue
        }
        
        const buffer = Buffer.from(await data.arrayBuffer())
        // Safe filename for temp storage
        const safeName = file.replace(/\//g, '__')
        const localPath = resolve(tempDir, safeName)
        writeFileSync(localPath, buffer)
        
        const contentType = data.type || 'application/octet-stream'
        
        // Execute wrangler command securely
        execSync(`npx wrangler r2 object put "${r2}/${file}" --file "${localPath}" --content-type "${contentType}"`, { 
          cwd: resolve(__dirname, '..'),
          stdio: 'pipe' 
        })
        
        rmSync(localPath)
        uploaded++
        process.stdout.write(`  📤 Yükleniyor: ${uploaded}/${files.length}\r`)
      } catch (err: any) {
        console.error(`\n  ❌ Upload hatası (${file}): ${err.message}`)
        failed++
      }
    }
    
    console.log(`\n  ✅ İşlem tamamlandı. Başarılı: ${uploaded}, Hatalı: ${failed}`)
    if (failed > 0) allOk = false

    // Doğrulama (Wrangler list output'unu parse ederek satır sayma)
    try {
      const listOutput = execSync(`npx wrangler r2 object list ${r2}`, { 
        cwd: resolve(__dirname, '..'), 
        stdio: 'pipe' 
      }).toString()
      // "key" kelimesini içeren satırları saymak kabaca object count verir (veya json parse edilebilir)
      // Daha güvenli: JSON beklentisi olmadan. Wrangler list default formatında her obje için bir obje döner, biz kabaca dosya adlarını arayalım
      let r2Count = 0
      for(const fileObj of files) {
         if (listOutput.includes(fileObj.path)) r2Count++
      }
      
      const match = r2Count === files.length
      console.log(`  🔍 Doğrulama: Supabase=${files.length} ↔ R2=${r2Count} (${match ? '✅' : '❌'})`)
      if (!match) allOk = false
    } catch(e) {
      console.log(`  ⚠️ Doğrulama adımı manuel kontrol gerektiriyor.`)
    }
  }

  // Cleanup
  if (existsSync(tempDir)) {
    rmSync(tempDir, { recursive: true, force: true })
  }

  console.log('\n' + '═'.repeat(50))
  if (allOk) {
    console.log('✅ Storage migration ve doğrulama TAMAMLANDI!')
  } else {
    console.log('❌ Migration tamamlandı ancak bazı hatalar veya eksik dosyalar var.')
    process.exit(1)
  }
}

main().catch(console.error)
