const WORKER_URL = process.env.CLOUDFLARE_WORKER_URL || 'https://nexcoach-api.yusufk6509.workers.dev';
const API_SECRET = process.env.CLOUDFLARE_API_SECRET;

if (!API_SECRET) throw new Error('CLOUDFLARE_API_SECRET is required');

async function createAccount(email, password, name, role) {
  try {
    let res = await fetch(`${WORKER_URL}/api/auth/sign-up/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3000' },
      body: JSON.stringify({ email, password, name })
    });
    
    let text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch(e) {
      console.error("Failed to parse json. Status:", res.status, "Body:", text);
      return;
    }

    if(!json.user) {
      console.error("Signup failed for", email, json);
      return;
    }
    const userId = json.user.id;
    
    // Link to profile
    res = await fetch(`${WORKER_URL}/api/db/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Secret': API_SECRET, 'Origin': 'http://localhost:3000' },
      body: JSON.stringify({
        query: 'INSERT INTO profiles (id, full_name, role) VALUES (?, ?, ?)',
        params: [userId, name, role]
      })
    });
    let dbRes = await res.json();
    console.log(`Account ${email} created as ${role}. DB insert:`, dbRes.success);
  } catch(e) {
    console.error("Error creating account", email, e);
  }
}

async function run() {
  await createAccount('koc@test.com', 'Test1234!', 'Koc Test', 'coach');
  await createAccount('ogrenci@test.com', 'Test1234!', 'Ogrenci Test', 'student');
}

run();
