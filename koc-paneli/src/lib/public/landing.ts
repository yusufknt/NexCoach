import { d1 } from '@/lib/cloudflare/d1'
import type { Package, Profile } from '@/types'

export async function getCoachProfile(): Promise<Profile | null> {
  const data = await d1.first<Profile>(
    "SELECT id, full_name, role, avatar_url, bio, created_at FROM profiles WHERE role = 'coach' ORDER BY created_at ASC LIMIT 1"
  )
  return data
}

export async function getActivePackages(): Promise<Package[]> {
  const data = await d1.query<any>(
    'SELECT * FROM packages WHERE is_active = 1 ORDER BY price ASC'
  )

  if (!data) {
    return []
  }

  return data.map((pkg) => {
    let features: string[] = []
    if (pkg.features) {
      try {
        features = typeof pkg.features === 'string' ? JSON.parse(pkg.features) : pkg.features
      } catch {
        features = []
      }
    }
    return {
      ...pkg,
      price: Number(pkg.price),
      features,
      is_active: Boolean(pkg.is_active),
    }
  })
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatDuration(days: number): string {
  if (days >= 30 && days % 30 === 0) {
    const months = days / 30
    return months === 1 ? '1 ay' : `${months} ay`
  }
  return days === 1 ? '1 gün' : `${days} gün`
}
