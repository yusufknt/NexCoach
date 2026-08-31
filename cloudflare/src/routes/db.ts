import { Hono } from 'hono'
import { z } from 'zod'
import type { Env } from '../types/env'

export const dbRoutes = new Hono<{ Bindings: Env }>()

const MAX_DB_REQUEST_SIZE = 64 * 1024
const querySchema = z.object({
  query: z.string().trim().min(1).max(20_000),
  params: z.array(z.unknown()).max(100).optional(),
}).strict()
const batchSchema = z.object({
  statements: z.array(querySchema).min(1).max(50),
}).strict()

function isReadQuery(query: string): boolean {
  return /^(SELECT|WITH)\b/i.test(query.trimStart())
}

function isMutationQuery(query: string): boolean {
  return /^(INSERT|UPDATE|DELETE)\b/i.test(query.trimStart())
}

dbRoutes.use('*', async (c, next) => {
  const contentLength = Number(c.req.header('Content-Length'))
  if (Number.isFinite(contentLength) && contentLength > MAX_DB_REQUEST_SIZE) {
    return c.json({ success: false, error: 'Request body is too large' }, 413)
  }
  return next()
})

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
    const parsed = querySchema.safeParse(await c.req.json().catch(() => null))
    if (!parsed.success || !isReadQuery(parsed.data.query)) {
      return c.json({ success: false, error: 'Invalid read query request' }, 400)
    }
    const { query, params } = parsed.data

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
    const parsed = querySchema.safeParse(await c.req.json().catch(() => null))
    if (!parsed.success || !isReadQuery(parsed.data.query)) {
      return c.json({ success: false, error: 'Invalid read query request' }, 400)
    }
    const { query, params } = parsed.data

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
    const parsed = querySchema.safeParse(await c.req.json().catch(() => null))
    if (!parsed.success || !isMutationQuery(parsed.data.query)) {
      return c.json({ success: false, error: 'Invalid mutation request' }, 400)
    }
    const { query, params } = parsed.data

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
    const parsed = batchSchema.safeParse(await c.req.json().catch(() => null))
    if (!parsed.success || parsed.data.statements.some((statement) => !isMutationQuery(statement.query))) {
      return c.json({ success: false, error: 'Invalid batch request' }, 400)
    }
    const { statements } = parsed.data

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
