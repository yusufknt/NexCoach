import { type NextRequest, NextResponse } from 'next/server'

const WORKER_URL =
  process.env.CLOUDFLARE_WORKER_URL ||
  process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL ||
  'https://nexcoach-api.yusufk6509.workers.dev'

async function authProxyHandler(
  request: NextRequest,
  context: { params: Promise<{ all: string[] }> }
) {
  const { all } = await context.params
  const path = all ? all.join('/') : ''
  const search = request.nextUrl.search || ''
  const targetUrl = `${WORKER_URL}/api/auth/${path}${search}`

  const reqHeaders = new Headers()
  request.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'host') {
      reqHeaders.set(key, value)
    }
  })

  // Ensure __Secure-better-auth.session_token is passed to worker if better-auth.session_token exists
  const incomingCookie = request.headers.get('cookie') || ''
  if (incomingCookie && !incomingCookie.includes('__Secure-better-auth.session_token=')) {
    const match = incomingCookie.match(/(?:^|;\s*)better-auth\.session_token=([^;]+)/)
    if (match) {
      reqHeaders.set(
        'cookie',
        `${incomingCookie}; __Secure-better-auth.session_token=${match[1]}`
      )
    }
  }

  const isBodyAllowed = request.method !== 'GET' && request.method !== 'HEAD'
  let body: ArrayBuffer | undefined = undefined
  if (isBodyAllowed) {
    body = await request.arrayBuffer()
  }

  const upstreamRes = await fetch(targetUrl, {
    method: request.method,
    headers: reqHeaders,
    body,
    redirect: 'manual',
    cache: 'no-store',
  })

  const resHeaders = new Headers()
  upstreamRes.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase()
    if (lowerKey !== 'set-cookie' && lowerKey !== 'content-encoding' && lowerKey !== 'content-length') {
      resHeaders.set(key, value)
    }
  })

  const response = new NextResponse(upstreamRes.body, {
    status: upstreamRes.status,
    statusText: upstreamRes.statusText,
    headers: resHeaders,
  })

  // Forward Set-Cookie headers properly to Next.js domain
  const setCookies = upstreamRes.headers.getSetCookie
    ? upstreamRes.headers.getSetCookie()
    : [upstreamRes.headers.get('set-cookie')].filter(Boolean) as string[]

  const isHttps = request.nextUrl.protocol === 'https:'

  for (const cookieStr of setCookies) {
    response.headers.append('set-cookie', cookieStr)

    // For HTTP/localhost support, also issue non-secure cookie variant if Secure cookie was set
    if (!isHttps && cookieStr.includes('__Secure-better-auth.session_token')) {
      const nonSecureCookie = cookieStr
        .replace(/__Secure-/g, '')
        .replace(/;\s*Secure/gi, '')
      response.headers.append('set-cookie', nonSecureCookie)
    }
  }

  return response
}

export const GET = authProxyHandler
export const POST = authProxyHandler
export const PUT = authProxyHandler
export const DELETE = authProxyHandler
export const PATCH = authProxyHandler
export const OPTIONS = authProxyHandler
