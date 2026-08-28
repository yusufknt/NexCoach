import { NextResponse } from 'next/server'
import { d1 } from '@/lib/cloudflare/d1'

export async function GET() {
  try {
    const packages = await d1.query(
      'SELECT id, name, description, price, duration_days, features, is_active FROM packages WHERE is_active = 1 ORDER BY price ASC'
    )
    return NextResponse.json(packages)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 })
  }
}
