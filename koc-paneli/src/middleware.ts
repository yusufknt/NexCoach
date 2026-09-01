import { type NextRequest, NextResponse } from 'next/server'
import { getDashboardPath, resolveUserRole } from '@/lib/auth'

const coachRoutes = ['/coach']
const studentRoutes = ['/student']
const adminRoutes = ['/admin']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isCoachRoute = coachRoutes.some((route) => pathname.startsWith(route))
  const isStudentRoute = studentRoutes.some((route) => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))
  const isLoginRoute = pathname.startsWith('/giris')
  const isRegisterRoute = pathname.startsWith('/kayit')

  const response = NextResponse.next({ request })

  // Only run session verification on protected routes or login/register
  if (!isCoachRoute && !isStudentRoute && !isAdminRoute && !isLoginRoute && !isRegisterRoute) {
    return response
  }

  const RAW_WORKER_URL = process.env.CLOUDFLARE_WORKER_URL || process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL || 'https://nexcoach-api.yusufk6509.workers.dev'
  const WORKER_URL = RAW_WORKER_URL.replace(/\/+$/, '')
  const API_SECRET = process.env.CLOUDFLARE_API_SECRET?.trim() || ''

  
  // Get session from Better Auth worker
  let user = null;
  try {
    const authUrl = `${WORKER_URL}/api/auth/get-session`;
    let cookie = request.headers.get('cookie') || '';
    if (cookie && !cookie.includes('__Secure-better-auth.session_token=')) {
      const match = cookie.match(/(?:^|;\s*)better-auth\.session_token=([^;]+)/);
      if (match) {
        cookie = `${cookie}; __Secure-better-auth.session_token=${match[1]}`;
      }
    }
    const res = await fetch(authUrl, {
      headers: {
        cookie,
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.user) {
        user = data.user;
      }
    }
  } catch (e) {
    console.error("Better Auth fetch error:", e instanceof Error ? e.message : e);
  }

  // Get user role from DB if logged in
  let role = null;
  if (user) {
    try {
      const res = await fetch(`${WORKER_URL}/api/db/first`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Secret': API_SECRET,
        },
        body: JSON.stringify({
          query: `SELECT CASE
            WHEN EXISTS (SELECT 1 FROM admins WHERE user_id = ?) THEN 'admin'
            ELSE (SELECT role FROM profiles WHERE id = ? LIMIT 1)
          END AS role`,
          params: [user.id, user.id],
        }),
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          role = resolveUserRole(json.data.role, null);
        } else if (!json.success) {
          console.error("DB Role Fetch returned error:", json.error);
        }
      } else {
        console.error("DB Role Fetch HTTP Error:", res.status, await res.text());
      }
    } catch (e) {
      console.error("DB Role Fetch Exception:", e instanceof Error ? e.message : e);
    }
  }

  if (isLoginRoute || isRegisterRoute) {
    if (user) {
      const destination = getDashboardPath(role)
      if (pathname === destination || pathname.startsWith(destination) || destination === '/giris') {
        return response
      }
      return NextResponse.redirect(new URL(destination, request.url))
    }
    return response
  }

  if (!isCoachRoute && !isStudentRoute && !isAdminRoute) {
    return response
  }

  if (!user) {
    return NextResponse.redirect(new URL('/giris', request.url))
  }

  const expectedRole = isAdminRoute ? 'admin' : isCoachRoute ? 'coach' : 'student'
  if (role !== expectedRole) {
    return NextResponse.redirect(new URL(getDashboardPath(role), request.url))
  }

  if (isCoachRoute) {
    const isAccessRoute = pathname.startsWith('/coach/uyelik')
    let hasActiveAccess = false
    try {
      const res = await fetch(`${WORKER_URL}/api/db/first`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Secret': API_SECRET,
        },
        body: JSON.stringify({
          query: 'SELECT status, starts_at, ends_at FROM coach_access WHERE coach_id = ? LIMIT 1',
          params: [user.id],
        }),
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      })
      if (res.ok) {
        const json = await res.json()
        const access = json?.data as { status?: string; starts_at?: string | null; ends_at?: string | null } | null
        hasActiveAccess = access?.status === 'active'
          && (!access.starts_at || new Date(access.starts_at) <= new Date())
          && (!access.ends_at || new Date(access.ends_at) > new Date())
      }
    } catch {}

    if (!hasActiveAccess && !isAccessRoute) {
      return NextResponse.redirect(new URL('/coach/uyelik', request.url))
    }
    if (hasActiveAccess && isAccessRoute) {
      return NextResponse.redirect(new URL('/coach/dashboard', request.url))
    }
  }

  if (isStudentRoute) {
    if (role !== 'student') {
      if (isCoachRoute) return response;
      return NextResponse.redirect(new URL('/coach/dashboard', request.url))
    }

    const isAccessRoute = pathname.startsWith('/student/uyelik')
    let hasActiveAccess = false
    try {
      const res = await fetch(`${WORKER_URL}/api/db/first`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Secret': API_SECRET,
        },
        body: JSON.stringify({
          query: `SELECT EXISTS (
            SELECT 1 FROM coach_students cs
            JOIN coach_access ca ON ca.coach_id = cs.coach_id
            WHERE cs.student_id = ?
              AND cs.status = 'active'
              AND (cs.end_date IS NULL OR date(cs.end_date) >= date('now'))
              AND ca.status = 'active'
              AND (ca.starts_at IS NULL OR datetime(ca.starts_at) <= datetime('now'))
              AND (ca.ends_at IS NULL OR datetime(ca.ends_at) > datetime('now'))
          ) AS has_access`,
          params: [user.id],
        }),
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      })
      if (res.ok) {
        const json = await res.json()
        hasActiveAccess = Boolean(json?.data?.has_access)
      }
    } catch {}

    if (!hasActiveAccess && !isAccessRoute) {
      return NextResponse.redirect(new URL('/student/uyelik', request.url))
    }
    if (hasActiveAccess && isAccessRoute) {
      return NextResponse.redirect(new URL('/student/dashboard', request.url))
    }

    const isOnboardingRoute = pathname.startsWith('/student/onboarding')
    let completed = false
    try {
      const res = await fetch(`${WORKER_URL}/api/db/first`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Secret': API_SECRET,
        },
        body: JSON.stringify({
          query: 'SELECT onboarding_completed FROM student_profiles WHERE student_id = ?',
          params: [user.id],
        }),
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      })
      if (res.ok) {
        const json = await res.json()
        completed = Boolean(json?.data?.onboarding_completed)
      }
    } catch {}

    if (!completed && !isOnboardingRoute) {
      return NextResponse.redirect(new URL('/student/onboarding', request.url))
    }
    if (completed && isOnboardingRoute) {
      return NextResponse.redirect(new URL('/student/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/coach/:path*',
    '/student/:path*',
    '/admin/:path*',
    '/giris',
    '/kayit',
  ],
}
