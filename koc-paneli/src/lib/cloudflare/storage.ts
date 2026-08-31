/**
 * Cloudflare R2 Storage Client
 * Interacts with R2 buckets via Cloudflare Worker storage API.
 */

const WORKER_URL = process.env.CLOUDFLARE_WORKER_URL || process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL || 'https://nexcoach-api.yusufk6509.workers.dev'
const API_SECRET = process.env.CLOUDFLARE_API_SECRET

function getApiSecret(): string {
  if (!API_SECRET) throw new Error('CLOUDFLARE_API_SECRET is not configured')
  return API_SECRET
}

export type R2BucketType = 'programs' | 'avatars' | 'progress-photos' | 'monthly-reports'

export const cfStorage = {
  /**
   * Upload a file buffer or Blob to R2 bucket.
   */
  async upload(
    bucket: R2BucketType,
    path: string,
    data: ArrayBuffer | Uint8Array | Blob | Buffer,
    contentType: string = 'application/octet-stream'
  ): Promise<{ error: Error | null; data?: { key: string; bucket: string; size: number } }> {
    try {
      const cleanPath = path.startsWith('/') ? path.slice(1) : path
      const url = `${WORKER_URL}/api/storage/${bucket}/${cleanPath}`

      let body: BodyInit
      if (data instanceof Blob || data instanceof ArrayBuffer) {
        body = data
      } else if (data instanceof Uint8Array || Buffer.isBuffer(data)) {
        body = new Uint8Array(data)
      } else {
        body = data
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
          'X-API-Secret': getApiSecret(),
        },
        body,
      })

      if (!response.ok) {
        const text = await response.text()
        return { error: new Error(`R2 upload failed [${response.status}]: ${text}`) }
      }

      const resJson = await response.json()
      return { error: null, data: resJson.data }
    } catch (error: unknown) {
      return { error: error instanceof Error ? error : new Error(String(error)) }
    }
  },

  /**
   * Delete a single file from R2.
   */
  async remove(
    bucket: R2BucketType,
    paths: string[]
  ): Promise<{ error: Error | null }> {
    try {
      if (paths.length === 1) {
        const cleanPath = paths[0].startsWith('/') ? paths[0].slice(1) : paths[0]
        const url = `${WORKER_URL}/api/storage/${bucket}/${cleanPath}`
        const res = await fetch(url, {
          method: 'DELETE',
          headers: {
            'X-API-Secret': getApiSecret(),
          },
        })
        if (!res.ok) {
          const text = await res.text()
          return { error: new Error(`R2 delete failed: ${text}`) }
        }
        return { error: null }
      } else {
        const url = `${WORKER_URL}/api/storage/${bucket}/delete-multiple`
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Secret': getApiSecret(),
          },
          body: JSON.stringify({ keys: paths.map((p) => (p.startsWith('/') ? p.slice(1) : p)) }),
        })
        if (!res.ok) {
          const text = await res.text()
          return { error: new Error(`R2 batch delete failed: ${text}`) }
        }
        return { error: null }
      }
    } catch (error: unknown) {
      return { error: error instanceof Error ? error : new Error(String(error)) }
    }
  },

  /**
   * Get public or accessible direct URL for a file.
   */
  getPublicUrl(bucket: R2BucketType, path: string): { data: { publicUrl: string } } {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path
    return {
      data: {
        publicUrl: `${WORKER_URL}/api/storage/${bucket}/${cleanPath}`,
      },
    }
  },

  /**
   * Create a short-lived signed URL for a private object.
   */
  async createSignedUrl(
    bucket: R2BucketType,
    path: string,
    expiresIn: number = 300
  ): Promise<{ data: { signedUrl: string } | null; error: Error | null }> {
    try {
      const cleanPath = path.startsWith('/') ? path.slice(1) : path
      const response = await fetch(`${WORKER_URL}/api/storage/${bucket}/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Secret': getApiSecret(),
        },
        body: JSON.stringify({ key: cleanPath, expiresIn }),
        cache: 'no-store',
      })
      if (!response.ok) {
        return { data: null, error: new Error(`R2 signing failed [${response.status}]`) }
      }
      const json = await response.json() as { data?: { signedUrl?: string } }
      if (!json.data?.signedUrl) {
        return { data: null, error: new Error('R2 signing response is invalid') }
      }
      return { data: { signedUrl: json.data.signedUrl }, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) }
    }
  },
}
