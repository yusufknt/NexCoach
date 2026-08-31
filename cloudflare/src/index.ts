import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Env } from './types/env'
import { healthRoutes } from './routes/health'
import { storageRoutes } from './routes/storage'
import { migrationRoutes } from './routes/migration'
import { dbRoutes } from './routes/db'
import { authRoutes } from './routes/auth'
import { hasInternalApiAccess } from './security'

const app = new Hono<{ Bindings: Env }>()

// ============================================
// Middleware
// ============================================

app.use('*', async (c, next) => {
  const configuredOrigins = c.env.CORS_ORIGIN.split(',').map((value) => value.trim()).filter(Boolean)
  const allowedOrigins = c.env.ENVIRONMENT === 'production'
    ? configuredOrigins
    : [...configuredOrigins, 'http://localhost:3000']
  const corsMiddleware = cors({
    origin: (originHeader) => allowedOrigins.includes(originHeader) ? originHeader : null,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-API-Secret'],
    credentials: true,
    maxAge: 86400,
  })
  return corsMiddleware(c, next)
})

app.use('/api/auth/*', async (c, next) => {
  const path = new URL(c.req.url).pathname
  if (c.req.method !== 'POST' || !['/api/auth/sign-in/email', '/api/auth/sign-up/email'].includes(path)) {
    return next()
  }

  const clientAddress = c.req.header('cf-connecting-ip') || 'unknown'
  const { success } = await c.env.AUTH_RATE_LIMITER.limit({ key: `${path}:${clientAddress}` })
  if (!success) {
    c.header('Retry-After', '60')
    return c.json({ success: false, error: 'Too many authentication attempts' }, 429)
  }
  return next()
})

// ============================================
// API Secret Guard for Protected Endpoints
// ============================================

app.use('/api/admin/*', async (c, next) => {
  if (!hasInternalApiAccess(c.req.raw, c.env)) {
    return c.json({ success: false, error: 'Unauthorized' }, 401)
  }
  return next()
})

app.use('/api/db/*', async (c, next) => {
  if (!hasInternalApiAccess(c.req.raw, c.env)) {
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
