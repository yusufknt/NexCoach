import { Hono } from 'hono'
import type { Env } from '../types/env'

export const migrationRoutes = new Hono<{ Bindings: Env }>()

// ============================================
// Data Migration Endpoints (Supabase → D1)
// Admin API secret ile korunuyor
// ============================================

// Tek tablo için batch insert endpoint'i
// migrate-data.ts script'i bu endpoint'i kullanarak
// Supabase'den okunan verileri D1'e yazar
migrationRoutes.post('/import/:table', async (c) => {
  const table = c.req.param('table')
  const ALLOWED_TABLES = [
    'profiles', 'packages', 'coach_students', 'progress_entries',
    'programs', 'messages', 'calendar_events', 'payments',
    'monthly_reports', 'student_profiles', 'invitations',
  ]

  if (!ALLOWED_TABLES.includes(table)) {
    return c.json({ success: false, error: `Table "${table}" is not allowed` }, 400)
  }

  try {
    const body = await c.req.json<{ rows: Record<string, unknown>[] }>()
    if (!body.rows || !Array.isArray(body.rows) || body.rows.length === 0) {
      return c.json({ success: false, error: 'No rows provided' }, 400)
    }

    const columns = Object.keys(body.rows[0])
    const placeholders = columns.map(() => '?').join(', ')
    const sql = `INSERT OR REPLACE INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`

    const stmts = body.rows.map((row) => {
      const values = columns.map((col) => {
        const val = row[col]
        // JSONB/array alanları string'e çevir
        if (val !== null && typeof val === 'object') return JSON.stringify(val)
        // Boolean → integer
        if (typeof val === 'boolean') return val ? 1 : 0
        return val ?? null
      })
      return c.env.DB.prepare(sql).bind(...values)
    })

    // D1 batch (max 100 per batch)
    const BATCH_SIZE = 100
    let inserted = 0
    for (let i = 0; i < stmts.length; i += BATCH_SIZE) {
      const batch = stmts.slice(i, i + BATCH_SIZE)
      await c.env.DB.batch(batch)
      inserted += batch.length
    }

    return c.json({
      success: true,
      data: { table, inserted, total: body.rows.length },
    })
  } catch (err) {
    return c.json({ success: false, error: String(err) }, 500)
  }
})

// Tablo satır sayısı kontrolü
migrationRoutes.get('/count/:table', async (c) => {
  const table = c.req.param('table')

  try {
    const result = await c.env.DB.prepare(`SELECT COUNT(*) as count FROM ${table}`).first()
    return c.json({
      success: true,
      data: { table, count: result?.count ?? 0 },
    })
  } catch (err) {
    return c.json({ success: false, error: String(err) }, 500)
  }
})

// Tüm tabloların satır sayıları
migrationRoutes.get('/status', async (c) => {
  const tables = [
    'profiles', 'packages', 'coach_students', 'progress_entries',
    'programs', 'messages', 'calendar_events', 'payments',
    'monthly_reports', 'student_profiles', 'invitations',
  ]

  const counts: Record<string, number> = {}
  for (const table of tables) {
    try {
      const result = await c.env.DB.prepare(`SELECT COUNT(*) as count FROM ${table}`).first()
      counts[table] = (result?.count as number) ?? 0
    } catch {
      counts[table] = -1 // tablo henüz yok
    }
  }

  return c.json({ success: true, data: { counts } })
})
