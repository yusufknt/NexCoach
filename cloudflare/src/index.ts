import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Env } from './types/env'
import { healthRoutes } from './routes/health'
import { storageRoutes } from './routes/storage'
import { migrationRoutes } from './routes/migration'
import { dbRoutes } from './routes/db'
import { authRoutes } from './routes/auth'

const app = new Hono<{ Bindings: Env }>()

// ============================================
// Middleware
// ============================================

app.use('*', async (c, next) => {
  const origin = c.req.header('origin') || '*';
  const corsMiddleware = cors({
    origin: (originHeader) => originHeader || '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-API-Secret'],
    credentials: true,
    maxAge: 86400,
  })
  return corsMiddleware(c, next)
})

// ============================================
// API Secret Guard for Protected Endpoints
// ============================================

app.use('/api/admin/*', async (c, next) => {
  const secret = c.req.header('X-API-Secret')
  if (c.env.API_SECRET && secret !== c.env.API_SECRET) {
    return c.json({ success: false, error: 'Unauthorized' }, 401)
  }
  return next()
})

app.use('/api/db/*', async (c, next) => {
  const secret = c.req.header('X-API-Secret')
  if (c.env.API_SECRET && secret !== c.env.API_SECRET) {
    return c.json({ success: false, error: 'Unauthorized' }, 401)
  }
  return next()
})

// ============================================
// Routes
// ============================================

app.route('/api/health', healthRoutes)
app.route('/api/storage', storageRoutes)
app.route('/api/db', dbRoutes)
app.route('/api/auth', authRoutes)
app.route('/api/admin/migration', migrationRoutes)

// ============================================
// 404 Handler
// ============================================

app.notFound((c) => {
  return c.json({ success: false, error: 'Not Found' }, 404)
})

// ============================================
// Error Handler
// ============================================

app.onError((err, c) => {
  console.error('Worker error:', err.message, err.stack, err.cause)
  return c.json({ success: false, error: 'Internal Server Error' }, 500)
})

export default app
