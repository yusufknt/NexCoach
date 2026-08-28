import { Hono } from 'hono'
import type { Env, BucketName } from '../types/env'

export const storageRoutes = new Hono<{ Bindings: Env }>()

// R2 bucket helper
function getBucket(env: Env, bucketName: BucketName): R2Bucket | null {
  const map: Record<BucketName, R2Bucket> = {
    programs: env.R2_PROGRAMS,
    avatars: env.R2_AVATARS,
    'progress-photos': env.R2_PROGRESS_PHOTOS,
    'monthly-reports': env.R2_MONTHLY_REPORTS,
  }
  return map[bucketName] ?? null
}

const VALID_BUCKETS: BucketName[] = ['programs', 'avatars', 'progress-photos', 'monthly-reports']

// Bucket listele
storageRoutes.get('/:bucket', async (c) => {
  const bucketName = c.req.param('bucket') as BucketName
  if (!VALID_BUCKETS.includes(bucketName)) {
    return c.json({ success: false, error: 'Invalid bucket name' }, 400)
  }

  const bucket = getBucket(c.env, bucketName)
  if (!bucket) return c.json({ success: false, error: 'Bucket not found' }, 404)

  const prefix = c.req.query('prefix') || ''
  const limit = parseInt(c.req.query('limit') || '100', 10)

  try {
    const list = await bucket.list({ prefix, limit })
    return c.json({
      success: true,
      data: {
        objects: list.objects.map((obj) => ({
          key: obj.key,
          size: obj.size,
          uploaded: obj.uploaded.toISOString(),
        })),
        truncated: list.truncated,
        cursor: list.truncated ? list.cursor : undefined,
      },
    })
  } catch (err) {
    return c.json({ success: false, error: String(err) }, 500)
  }
})

// Dosya oku
storageRoutes.get('/:bucket/:key{.+}', async (c) => {
  const bucketName = c.req.param('bucket') as BucketName
  if (!VALID_BUCKETS.includes(bucketName)) {
    return c.json({ success: false, error: 'Invalid bucket name' }, 400)
  }

  const bucket = getBucket(c.env, bucketName)
  if (!bucket) return c.json({ success: false, error: 'Bucket not found' }, 404)

  const key = c.req.param('key')

  try {
    const object = await bucket.get(key)
    if (!object) return c.json({ success: false, error: 'Not found' }, 404)

    const headers = new Headers()
    headers.set('Content-Type', object.httpMetadata?.contentType || 'application/octet-stream')
    headers.set('Cache-Control', 'public, max-age=3600')
    headers.set('ETag', object.httpEtag)

    return new Response(object.body, { headers })
  } catch (err) {
    return c.json({ success: false, error: String(err) }, 500)
  }
})

// Dosya yükle
storageRoutes.put('/:bucket/:key{.+}', async (c) => {
  const bucketName = c.req.param('bucket') as BucketName
  if (!VALID_BUCKETS.includes(bucketName)) {
    return c.json({ success: false, error: 'Invalid bucket name' }, 400)
  }

  const bucket = getBucket(c.env, bucketName)
  if (!bucket) return c.json({ success: false, error: 'Bucket not found' }, 404)

  const key = c.req.param('key')
  const contentType = c.req.header('Content-Type') || 'application/octet-stream'

  try {
    const body = await c.req.arrayBuffer()
    await bucket.put(key, body, {
      httpMetadata: { contentType },
    })

    return c.json({
      success: true,
      data: { key, bucket: bucketName, size: body.byteLength },
    })
  } catch (err) {
    return c.json({ success: false, error: String(err) }, 500)
  }
})

// Dosya sil
storageRoutes.delete('/:bucket/:key{.+}', async (c) => {
  const bucketName = c.req.param('bucket') as BucketName
  if (!VALID_BUCKETS.includes(bucketName)) {
    return c.json({ success: false, error: 'Invalid bucket name' }, 400)
  }

  const bucket = getBucket(c.env, bucketName)
  if (!bucket) return c.json({ success: false, error: 'Bucket not found' }, 404)

  const key = c.req.param('key')

  try {
    await bucket.delete(key)
    return c.json({ success: true, data: { key, deleted: true } })
  } catch (err) {
    return c.json({ success: false, error: String(err) }, 500)
  }
})

// Çoklu dosya sil
storageRoutes.post('/:bucket/delete-multiple', async (c) => {
  const bucketName = c.req.param('bucket') as BucketName
  if (!VALID_BUCKETS.includes(bucketName)) {
    return c.json({ success: false, error: 'Invalid bucket name' }, 400)
  }

  const bucket = getBucket(c.env, bucketName)
  if (!bucket) return c.json({ success: false, error: 'Bucket not found' }, 404)

  try {
    const { keys } = await c.req.json<{ keys: string[] }>()
    if (!keys || !Array.isArray(keys)) {
      return c.json({ success: false, error: 'Keys array is required' }, 400)
    }

    await bucket.delete(keys)
    return c.json({ success: true, data: { count: keys.length, deleted: true } })
  } catch (err) {
    return c.json({ success: false, error: String(err) }, 500)
  }
})
