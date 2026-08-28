const WORKER_URL = 'https://nexcoach-api.yusufk6509.workers.dev';
const API_SECRET = 'nexcoach_prod_sec_2026_cf';

async function createAccount(email, password, name, role) {
  let res = await fetch(`${WORKER_URL}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3000' },
    body: JSON.stringify({ email, password, name })
  });
  let json = await res.json();
  if(!json.user) {
    console.error("Signup failed for", email, json);
    return;
  }
  const userId = json.user.id;
  
  // Link to profile
  // Check if profile exists
  res = await fetch(`${WORKER_URL}/api/db/first`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Secret': API_SECRET, 'Origin': 'http://localhost:3000' },
    body: JSON.stringify({
      query: 'SELECT id FROM profiles WHERE id = ?',
      params: [userId]
    })
  });
  const existing = await res.json();
  
  if (existing.data) {
    await fetch(`${WORKER_URL}/api/db/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Secret': API_SECRET, 'Origin': 'http://localhost:3000' },
      body: JSON.stringify({
        query: 'UPDATE profiles SET role = ? WHERE id = ?',
        params: [role, userId]
      })
    });
  } else {
    await fetch(`${WORKER_URL}/api/db/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Secret': API_SECRET, 'Origin': 'http://localhost:3000' },
      body: JSON.stringify({
        query: 'INSERT INTO profiles (id, full_name, role) VALUES (?, ?, ?)',
        params: [userId, name, role]
      })
    });
  }
  console.log(`Account ${email} created & mapped as ${role}. User ID: ${userId}`);
}

async function run() {
  await createAccount('coach@test.com', 'Test1234!', 'Test Coach', 'coach');
  await createAccount('student@test.com', 'Test1234!', 'Test Student', 'student');
}

run();
