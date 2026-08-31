import type { Env } from './types/env'

const encoder = new TextEncoder()

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

export function hasInternalApiAccess(request: Request, env: Env): boolean {
  const provided = request.headers.get('X-API-Secret')
  if (!provided || !env.API_SECRET) return false

  const providedBytes = encoder.encode(provided)
  const expectedBytes = encoder.encode(env.API_SECRET)
  return providedBytes.byteLength === expectedBytes.byteLength
    && crypto.subtle.timingSafeEqual(providedBytes, expectedBytes)
}

export async function signStorageAccess(
  env: Env,
  bucket: string,
  key: string,
  expiresAt: number
): Promise<string> {
  const signingKey = await importHmacKey(env.URL_SIGNING_SECRET)
  const signature = await crypto.subtle.sign(
    'HMAC',
    signingKey,
    encoder.encode(`${bucket}\n${key}\n${expiresAt}`)
  )
  return toBase64Url(new Uint8Array(signature))
}

export async function verifyStorageAccess(
  env: Env,
  bucket: string,
  key: string,
  expiresAt: number,
  signature: string
): Promise<boolean> {
  if (!env.URL_SIGNING_SECRET || !Number.isSafeInteger(expiresAt)) return false
  if (expiresAt <= Math.floor(Date.now() / 1000)) return false

  const expected = await signStorageAccess(env, bucket, key, expiresAt)
  const providedBytes = encoder.encode(signature)
  const expectedBytes = encoder.encode(expected)
  return providedBytes.byteLength === expectedBytes.byteLength
    && crypto.subtle.timingSafeEqual(providedBytes, expectedBytes)
}
