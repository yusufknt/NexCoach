const assert = require('assert');

const WORKER_URL = 'https://nexcoach-api.yusufk6509.workers.dev';
const ORIGIN = 'http://localhost:3000';

async function testLoginFlow(email, password, expectedRole) {
  console.log(`\nTesting login for ${email} (${expectedRole})`);
  
  let res = await fetch(`${WORKER_URL}/api/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': ORIGIN },
    body: JSON.stringify({ email, password })
  });
  
  let json = await res.json();
  if(!json.user) {
    console.error("Login response:", json);
    assert.fail(`Login failed for ${email}`);
  }
  const cookie = res.headers.get('set-cookie') || '';
  console.log(`   Login PASS. Cookie obtained: ${cookie.substring(0, 20)}...`);

  // Verify session endpoint
  res = await fetch(`${WORKER_URL}/api/auth/get-session`, {
    headers: { 'cookie': cookie, 'Origin': ORIGIN, 'Content-Type': 'application/json' }
  });
  json = await res.json();
  assert(json.user && json.session, 'Session fetch failed');
  console.log(`   Session Fetch PASS.`);

  // Verify role mapping through Next.js proxy simulation
  const API_SECRET = 'nexcoach_prod_sec_2026_cf';
  res = await fetch(`${WORKER_URL}/api/db/first`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Secret': API_SECRET, 'Origin': ORIGIN },
    body: JSON.stringify({
      query: 'SELECT role FROM profiles WHERE id = ?',
      params: [json.user.id]
    })
  });
  let dbJson = await res.json();
  assert(dbJson.success && dbJson.data.role === expectedRole, `Role mismatch for ${email}. Expected ${expectedRole}`);
  console.log(`   Authorization/Role Match PASS.`);
  
  // Logout
  res = await fetch(`${WORKER_URL}/api/auth/sign-out`, {
    method: 'POST',
    headers: { 'cookie': cookie, 'Origin': ORIGIN, 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  json = await res.json();
  assert(json.success, 'Logout failed');
  console.log(`   Logout PASS.`);
}

async function run() {
  await testLoginFlow('coach@test.com', 'Test1234!', 'coach');
  await testLoginFlow('student@test.com', 'Test1234!', 'student');
  
  console.log('\n--- Testing Invalid Password ---');
  const res = await fetch(`${WORKER_URL}/api/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': ORIGIN },
    body: JSON.stringify({ email: 'coach@test.com', password: 'WrongPassword!' })
  });
  assert(res.status === 401 || res.status === 400 || res.status === 403, `Invalid password should fail. Status: ${res.status}`);
  console.log('   Invalid password correctly rejected.');
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
