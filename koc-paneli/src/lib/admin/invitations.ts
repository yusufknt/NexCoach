export async function hashInvitationToken(token: string): Promise<string> {
  const encoded = new TextEncoder().encode(token)
  const digest = await crypto.subtle.digest('SHA-256', encoded)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export function createInvitationToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return Buffer.from(bytes).toString('base64url')
}

export function getAppUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL
  if (configuredUrl) return configuredUrl.replace(/\/$/, '')

  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL
  return productionHost ? `https://${productionHost}` : 'http://localhost:3000'
}
