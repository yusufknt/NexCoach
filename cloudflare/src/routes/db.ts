import { Hono } from 'hono'
import type { Env } from '../types/env'

export const dbRoutes = new Hono<{ Bindings: Env }>()

// Parameter binding helper (handles undefined, null, objects to JSON)
function sanitizeParam(val: any): any {
  if (val === undefined) return null
  if (val === null) return null
  if (typeof val === 'boolean') return val ? 1 : 0
  if (typeof val === 'object' && !(val instanceof ArrayBuffer)) {
    return JSON.stringify(val)
  }
  return val
}

function sanitizeParams(params?: any[]): any[] {
  if (!params || !Array.isArray(params)) return []
  return params.map(sanitizeParam)
}

// 1. Query: SELECT multiple rows
dbRoutes.post('/query', async (c) => {
  try {
    const { query, params } = await c.req.json<{ query: string; params?: any[] }>()
    if (!query) {
      return c.json({ success: false, error: 'Query is required' }, 400)
    }

    const boundParams = sanitizeParams(params)
    const stmt = boundParams.length > 0
      ? c.env.DB.prepare(query).bind(...boundParams)
      : c.env.DB.prepare(query)

    const result = await stmt.all()
    return c.json({
      success: true,
      data: result.results ?? [],
      meta: result.meta,
    })
  } catch (err) {
    console.error('D1 query error:', err)
    return c.json({ success: false, error: String(err) }, 500)
  }
})

// 2. First: SELECT single row
dbRoutes.post('/first', async (c) => {
  try {
    const { query, params } = await c.req.json<{ query: string; params?: any[] }>()
    if (!query) {
      return c.json({ success: false, error: 'Query is required' }, 400)
    }

    const boundParams = sanitizeParams(params)
    const stmt = boundParams.length > 0
      ? c.env.DB.prepare(query).bind(...boundParams)
      : c.env.DB.prepare(query)

    const result = await stmt.first()
    return c.json({
      success: true,
      data: result ?? null,
    })
  } catch (err) {
    console.error('D1 first error:', err)
    return c.json({ success: false, error: String(err) }, 500)
  }
})

// 3. Run: INSERT, UPDATE, DELETE
dbRoutes.post('/run', async (c) => {
  try {
    const { query, params } = await c.req.json<{ query: string; params?: any[] }>()
    if (!query) {
      return c.json({ success: false, error: 'Query is required' }, 400)
    }

    const boundParams = sanitizeParams(params)
    const stmt = boundParams.length > 0
      ? c.env.DB.prepare(query).bind(...boundParams)
      : c.env.DB.prepare(query)

    const result = await stmt.run()
    return c.json({
      success: true,
      data: {
        success: result.success,
        meta: result.meta,
      },
    })
  } catch (err) {
    console.error('D1 run error:', err)
    return c.json({ success: false, error: String(err) }, 500)
  }
})

// 4. Batch: Execute multiple statements atomically
dbRoutes.post('/batch', async (c) => {
  try {
    const { statements } = await c.req.json<{
      statements: Array<{ query: string; params?: any[] }>
    }>()

    if (!statements || !Array.isArray(statements) || statements.length === 0) {
      return c.json({ success: false, error: 'Statements array is required' }, 400)
    }

    const d1Statements = statements.map((s) => {
      const boundParams = sanitizeParams(s.params)
      return boundParams.length > 0
        ? c.env.DB.prepare(s.query).bind(...boundParams)
        : c.env.DB.prepare(s.query)
    })

    const results = await c.env.DB.batch(d1Statements)
    return c.json({
      success: true,
      data: results.map((r) => ({
        results: r.results ?? [],
        meta: r.meta,
        success: r.success,
      })),
    })
  } catch (err) {
    console.error('D1 batch error:', err)
    return c.json({ success: false, error: String(err) }, 500)
  }
})
