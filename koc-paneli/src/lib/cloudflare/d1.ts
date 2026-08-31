/**
 * Cloudflare D1 Database Client
 * Executes parameterized SQL queries via Cloudflare Worker API.
 */

const WORKER_URL = process.env.CLOUDFLARE_WORKER_URL || process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL || 'https://nexcoach-api.yusufk6509.workers.dev'
const API_SECRET = process.env.CLOUDFLARE_API_SECRET

function getApiSecret(): string {
  if (!API_SECRET) throw new Error('CLOUDFLARE_API_SECRET is not configured')
  return API_SECRET
}

type QueryResult<T> = {
  success: boolean
  data?: T
  error?: string
  meta?: unknown
}

async function request<T>(endpoint: string, body: unknown): Promise<T> {
  const url = `${WORKER_URL}/api/db/${endpoint}`
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Secret': getApiSecret(),
      },
      body: JSON.stringify(body),
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`D1 API error [${response.status}]: ${text}`)
    }

    const json = (await response.json()) as QueryResult<T>
    if (!json.success) {
      throw new Error(`D1 query failed: ${json.error}`)
    }

    return json.data as T
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      throw new Error(`D1 API request timed out connecting to ${url}`)
    }
    throw error
  }
}

export const d1 = {
  /**
   * Execute a query and return all matching rows as an array of type T.
   */
  async query<T = Record<string, unknown>>(query: string, params: unknown[] = []): Promise<T[]> {
    return request<T[]>('query', { query, params })
  },

  /**
   * Execute a query and return the first matching row or null.
   */
  async first<T = Record<string, unknown>>(query: string, params: unknown[] = []): Promise<T | null> {
    return request<T | null>('first', { query, params })
  },

  /**
   * Execute an INSERT, UPDATE, or DELETE statement.
   */
  async run(query: string, params: unknown[] = []): Promise<{ success: boolean; meta?: unknown }> {
    return request<{ success: boolean; meta?: unknown }>('run', { query, params })
  },

  /**
   * Execute multiple statements in batch.
   */
  async batch(statements: Array<{ query: string; params?: unknown[] }>): Promise<unknown[]> {
    return request<unknown[]>('batch', { statements })
  },
}
