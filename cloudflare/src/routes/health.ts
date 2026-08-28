import { Hono } from 'hono'
import type { Env } from '../types/env'

export const healthRoutes = new Hono<{ Bindings: Env }>()

// D1 ve R2 bağlantı kontrolü
healthRoutes.get('/', async (c) => {
  const checks: Record<string, string> = {}

  // D1 check
  try {
    const result = await c.env.DB.prepare('SELECT 1 as ok').first()
    checks.d1 = result?.ok === 1 ? 'connected' : 'error'
  } catch {
    checks.d1 = 'error'
  }

  // R2 check (list ile basit kontrol)
  try {
    await c.env.R2_PROGRAMS.list({ limit: 1 })
    checks.r2_programs = 'connected'
  } catch {
    checks.r2_programs = 'error'
  }

  try {
    await c.env.R2_AVATARS.list({ limit: 1 })
    checks.r2_avatars = 'connected'
  } catch {
    checks.r2_avatars = 'error'
  }

  try {
    await c.env.R2_PROGRESS_PHOTOS.list({ limit: 1 })
    checks.r2_progress_photos = 'connected'
  } catch {
    checks.r2_progress_photos = 'error'
  }

  try {
    await c.env.R2_MONTHLY_REPORTS.list({ limit: 1 })
    checks.r2_monthly_reports = 'connected'
  } catch {
    checks.r2_monthly_reports = 'error'
  }

  const allOk = Object.values(checks).every((v) => v === 'connected')

  return c.json({
    success: true,
    data: {
      status: allOk ? 'healthy' : 'degraded',
      environment: c.env.ENVIRONMENT,
      checks,
      timestamp: new Date().toISOString(),
    },
  })
})

// D1 tablo durumu
healthRoutes.get('/tables', async (c) => {
  try {
    const result = await c.env.DB.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY name"
    ).all()

    return c.json({
      success: true,
      data: {
        tables: result.results?.map((r) => r.name) ?? [],
        count: result.results?.length ?? 0,
      },
    })
  } catch (err) {
    return c.json({ success: false, error: String(err) }, 500)
  }
})
