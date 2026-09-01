const workerUrl = (
  process.env.CLOUDFLARE_WORKER_URL
  || process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL
  || 'https://nexcoach-api.yusufk6509.workers.dev'
).replace(/\/$/, '')
const apiSecret = process.env.CLOUDFLARE_API_SECRET
const email = (process.env.ADMIN_EMAIL || 'admin@test.com').trim().toLowerCase()
const password = process.env.ADMIN_PASSWORD || ''
const name = (process.env.ADMIN_NAME || 'NexCoach Admin').trim()

if (!apiSecret) throw new Error('CLOUDFLARE_API_SECRET is required.')
if (password.length < 8) throw new Error('ADMIN_PASSWORD must be at least 8 characters.')

async function dbRequest(endpoint, query, params) {
  const response = await fetch(`${workerUrl}/api/db/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Secret': apiSecret,
    },
    body: JSON.stringify({ query, params }),
  })
  const result = await response.json()
  if (!response.ok || !result.success) {
    throw new Error(result.error || `D1 request failed with ${response.status}`)
  }
  return result.data
}

let userId
const signUpResponse = await fetch(`${workerUrl}/api/auth/sign-up/email`, {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Origin': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  },
  body: JSON.stringify({ email, password, name }),
})

if (signUpResponse.ok) {
  const data = await signUpResponse.json()
  userId = data.user?.id || data.id
} else {
  const existingUser = await dbRequest(
    'first',
    'SELECT id FROM "user" WHERE lower(email) = ? LIMIT 1',
    [email]
  )
  userId = existingUser?.id
}

if (!userId) throw new Error('Admin user could not be created or found.')

await dbRequest(
  'run',
  'INSERT INTO admins (user_id) VALUES (?) ON CONFLICT(user_id) DO NOTHING',
  [userId]
)

process.stdout.write(`Admin access is ready for ${email}.\n`)
