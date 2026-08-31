import { Hono } from 'hono'
import { z } from 'zod'
import { hasInternalApiAccess, signStorageAccess, verifyStorageAccess } from '../security'
import type { Env, BucketName } from '../types/env'

export const storageRoutes = new Hono<{ Bindings: Env }>()

const VALID_BUCKETS: BucketName[] = ['programs', 'avatars', 'progress-photos', 'monthly-reports']
const PRIVATE_BUCKETS = new Set<BucketName>(['programs', 'progress-photos', 'monthly-reports'])
const MAX_UPLOAD_SIZE = 15 * 1024 * 1024
const MAX_SIGNED_URL_TTL = 60 * 60

const signRequestSchema = z.object({
  key: z.string().trim().min(1).max(1024),
  expiresIn: z.number().int().min(1).max(MAX_SIGNED_URL_TTL).default(300),
}).strict()

const deleteManySchema = z.object({
  keys: z.array(z.string().trim().min(1).max(1024)).min(1).max(100),
}).strict()

function getBucket(env: Env, bucketName: BucketName): R2Bucket | null {
  const map: Record<BucketName, R2Bucket> = {
    programs: env.R2_PROGRAMS,
    avatars: env.R2_AVATARS,
    'progress-photos': env.R2_PROGRESS_PHOTOS,
    'monthly-reports': env.R2_MONTHLY_REPORTS,
  }
  return map[bucketName] ?? null
}

function parseBucket(value: string): BucketName | null {
  return VALID_BUCKETS.includes(value as BucketName) ? value as BucketName : null
}

function isValidKey(key: string): boolean {
  return key.length > 0
    && key.length <= 1024
    && !key.startsWith('/')
    && !key.split('/').includes('..')
    && !key.includes('\0')
}

storageRoutes.use('*', async (c, next) => {
  if (c.req.method === 'GET') return next()
  if (!hasInternalApiAccess(c.req.raw, c.env)) {
    return c.json({ success: false, error: 'Unauthorized' }, 401)
  }
  return next()
})

storageRoutes.post('/:bucket/sign', async (c) => {
  const bucketName = parseBucket(c.req.param('bucket'))
  if (!bucketName) return c.json({ success: false, error: 'Invalid bucket name' }, 400)
  if (!c.env.URL_SIGNING_SECRET) {
    return c.json({ success: false, error: 'Storage signing is not configured' }, 503)
  }

  const parsed = signRequestSchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success || !isValidKey(parsed.data.key)) {
    return c.json({ success: false, error: 'Invalid signing request' }, 400)
  }

  const expiresAt = Math.floor(Date.now() / 1000) + parsed.data.expiresIn
  const signature = await signStorageAccess(c.env, bucketName, parsed.data.key, expiresAt)
  const encodedKey = parsed.data.key.split('/').map(encodeURIComponent).join('/')
  const url = new URL(`/api/storage/${bucketName}/${encodedKey}`, c.req.url)
  url.searchParams.set('expires', String(expiresAt))
  url.searchParams.set('signature', signature)

  return c.json({ success: true, data: { signedUrl: url.toString(), expiresAt } })
})

storageRoutes.get('/:bucket', async (c) => {
  const bucketName = parseBucket(c.req.param('bucket'))
  if (!bucketName) return c.json({ success: false, error: 'Invalid bucket name' }, 400)
  if (!hasInternalApiAccess(c.req.raw, c.env)) {
    return c.json({ success: false, error: 'Unauthorized' }, 401)
  }

  const bucket = getBucket(c.env, bucketName)
  if (!bucket) return c.json({ success: false, error: 'Bucket not found' }, 404)

  const prefix = c.req.query('prefix') || ''
  const requestedLimit = Number.parseInt(c.req.query('limit') || '100', 10)
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 1000) : 100
  const list = await bucket.list({ prefix, limit })
  return c.json({
    success: true,
    data: {
      objects: list.objects.map((object) => ({
        key: object.key,
        size: object.size,
        uploaded: object.uploaded.toISOString(),
      })),
      truncated: list.truncated,
      cursor: list.truncated ? list.cursor : undefined,
    },
  })
})

storageRoutes.get('/:bucket/:key{.+}', async (c) => {
  const bucketName = parseBucket(c.req.param('bucket'))
  const key = c.req.param('key')
  if (!bucketName || !isValidKey(key)) {
    return c.json({ success: false, error: 'Invalid storage path' }, 400)
  }

  if (PRIVATE_BUCKETS.has(bucketName)) {
    const expiresAt = Number(c.req.query('expires'))
    const signature = c.req.query('signature') || ''
    const authorized = await verifyStorageAccess(c.env, bucketName, key, expiresAt, signature)
    if (!authorized) return c.json({ success: false, error: 'Forbidden' }, 403)
  }

  const bucket = getBucket(c.env, bucketName)
  if (!bucket) return c.json({ success: false, error: 'Bucket not found' }, 404)
  const object = await bucket.get(key)
  if (!object) return c.json({ success: false, error: 'Not found' }, 404)

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('ETag', object.httpEtag)
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('Cache-Control', PRIVATE_BUCKETS.has(bucketName) ? 'private, no-store' : 'public, max-age=3600')
  return new Response(object.body, { headers })
})

storageRoutes.put('/:bucket/:key{.+}', async (c) => {
  const bucketName = parseBucket(c.req.param('bucket'))
  const key = c.req.param('key')
  if (!bucketName || !isValidKey(key)) {
    return c.json({ success: false, error: 'Invalid storage path' }, 400)
  }

  const contentLength = Number(c.req.header('Content-Length'))
  if (Number.isFinite(contentLength) && contentLength > MAX_UPLOAD_SIZE) {
    return c.json({ success: false, error: 'File is too large' }, 413)
  }
  if (!c.req.raw.body) return c.json({ success: false, error: 'File body is required' }, 400)

  const bucket = getBucket(c.env, bucketName)
  if (!bucket) return c.json({ success: false, error: 'Bucket not found' }, 404)
  const contentType = c.req.header('Content-Type') || 'application/octet-stream'
  await bucket.put(key, c.req.raw.body, { httpMetadata: { contentType } })
  return c.json({ success: true, data: { key, bucket: bucketName, size: contentLength || null } })
})

storageRoutes.delete('/:bucket/:key{.+}', async (c) => {
  const bucketName = parseBucket(c.req.param('bucket'))
  const key = c.req.param('key')
  if (!bucketName || !isValidKey(key)) {
    return c.json({ success: false, error: 'Invalid storage path' }, 400)
  }

  const bucket = getBucket(c.env, bucketName)
  if (!bucket) return c.json({ success: false, error: 'Bucket not found' }, 404)
  await bucket.delete(key)
  return c.json({ success: true, data: { key, deleted: true } })
})

storageRoutes.post('/:bucket/delete-multiple', async (c) => {
  const bucketName = parseBucket(c.req.param('bucket'))
  if (!bucketName) return c.json({ success: false, error: 'Invalid bucket name' }, 400)

  const parsed = deleteManySchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success || parsed.data.keys.some((key) => !isValidKey(key))) {
    return c.json({ success: false, error: 'Invalid keys' }, 400)
  }

  const bucket = getBucket(c.env, bucketName)
  if (!bucket) return c.json({ success: false, error: 'Bucket not found' }, 404)
  await bucket.delete(parsed.data.keys)
  return c.json({ success: true, data: { count: parsed.data.keys.length, deleted: true } })
})
