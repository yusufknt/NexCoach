/**
 * Cloudflare D1 Database Client
 * Executes parameterized SQL queries via Cloudflare Worker API.
 */

const WORKER_URL = process.env.CLOUDFLARE_WORKER_URL || process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL || 'https://nexcoach-api.yusufk6509.workers.dev'
const API_SECRET = process.env.CLOUDFLARE_API_SECRET || 'nexcoach_prod_sec_2026_cf'

type QueryResult<T> = {
  success: boolean
  data?: T
  error?: string
  meta?: any
}

async function request<T>(endpoint: string, body: any): Promise<T> {
  const url = `${WORKER_URL}/api/db/${endpoint}`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Secret': API_SECRET,
    },
    body: JSON.stringify(body),
    cache: 'no-store',
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
}

export const d1 = {
  /**
   * Execute a query and return all matching rows as an array of type T.
   */
  async query<T = Record<string, any>>(query: string, params: any[] = []): Promise<T[]> {
    return request<T[]>('query', { query, params })
  },

  /**
   * Execute a query and return the first matching row or null.
   */
  async first<T = Record<string, any>>(query: string, params: any[] = []): Promise<T | null> {
    return request<T | null>('first', { query, params })
  },

  /**
   * Execute an INSERT, UPDATE, or DELETE statement.
   */
  async run(query: string, params: any[] = []): Promise<{ success: boolean; meta?: any }> {
    return request<{ success: boolean; meta?: any }>('run', { query, params })
  },

  /**
   * Execute multiple statements in batch.
   */
  async batch(statements: Array<{ query: string; params?: any[] }>): Promise<any[]> {
    return request<any[]>('batch', { statements })
  },
}
