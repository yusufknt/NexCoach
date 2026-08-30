const WORKER_URL = 'https://nexcoach-api.yusufk6509.workers.dev';
const API_SECRET = 'nexcoach_prod_sec_2026_cf';

async function runQuery(endpoint, query, params) {
  const res = await fetch(`${WORKER_URL}/api/db/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Secret': API_SECRET,
    },
    body: JSON.stringify({ query, params }),
  });
  const json = await res.json();
  console.log(JSON.stringify(json, null, 2));
  return json;
}

async function main() {
  const users = await runQuery('all', 'SELECT * FROM user', []);
  console.log('USERS:', users.data.map(u => ({ id: u.id, email: u.email })));
  
  const kocId = users.data.find(u => u.email === 'koc@test.com')?.id;
  const ogrenciId = users.data.find(u => u.email === 'ogrenci@test.com')?.id;
  
  console.log({ kocId, ogrenciId });

  if (kocId && ogrenciId) {
    // Check if already linked
    const existing = await runQuery('first', 'SELECT * FROM coach_students WHERE coach_id = ? AND student_id = ?', [kocId, ogrenciId]);
    if (!existing.data) {
       console.log('Linking...');
       await runQuery('execute', 'INSERT INTO coach_students (coach_id, student_id, start_date, status, payment_status) VALUES (?, ?, ?, ?, ?)', [kocId, ogrenciId, new Date().toISOString(), 'active', 'paid']);
       console.log('Linked successfully!');
    } else {
       console.log('Already linked:', existing.data);
    }
  }
}

main().catch(console.error);
