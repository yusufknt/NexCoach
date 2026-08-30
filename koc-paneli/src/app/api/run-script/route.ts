import { NextResponse } from 'next/server';

const WORKER_URL = process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL || 'https://nexcoach-api.yusufk6509.workers.dev';
const API_SECRET = 'nexcoach_prod_sec_2026_cf';

async function runQuery(endpoint: string, query: string, params: any[] = []) {
  const res = await fetch(`${WORKER_URL}/api/db/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Secret': API_SECRET,
    },
    body: JSON.stringify({ query, params }),
  });
  return res.json();
}

export async function GET() {
  try {
    const users = await runQuery('query', 'SELECT * FROM user');
    const kocId = users.data?.find((u: any) => u.email === 'koc@test.com')?.id;
    const ogrenciId = users.data?.find((u: any) => u.email === 'ogrenci@test.com')?.id;
    
    let result = { kocId, ogrenciId, linked: false, message: '' };

    if (kocId && ogrenciId) {
      const existing = await runQuery('first', 'SELECT * FROM coach_students WHERE coach_id = ? AND student_id = ?', [kocId, ogrenciId]);
      if (!existing.data) {
        await runQuery('run', 'INSERT INTO coach_students (coach_id, student_id, start_date, status, payment_status) VALUES (?, ?, ?, ?, ?)', [kocId, ogrenciId, new Date().toISOString(), 'active', 'paid']);
        result.linked = true;
        result.message = 'Linked successfully!';
      } else {
        result.linked = true;
        result.message = 'Already linked';
      }
    } else {
      result.message = 'User not found';
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
