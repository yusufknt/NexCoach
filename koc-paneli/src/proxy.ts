import { type NextRequest, NextResponse } from 'next/server'
import { getDashboardPath, resolveUserRole } from '@/lib/auth'

const coachRoutes = ['/coach']
const studentRoutes = ['/student']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isCoachRoute = coachRoutes.some((route) => pathname.startsWith(route))
  const isStudentRoute = studentRoutes.some((route) => pathname.startsWith(route))
  const isLoginRoute = pathname.startsWith('/giris')
  const isRegisterRoute = pathname.startsWith('/kayit')

  const response = NextResponse.next({ request })

  const WORKER_URL = process.env.CLOUDFLARE_WORKER_URL || process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL || 'https://nexcoach-api.yusufk6509.workers.dev'
  const API_SECRET = process.env.CLOUDFLARE_API_SECRET || 'nexcoach_prod_sec_2026_cf'
  
  // Get session from Better Auth worker
  let user = null;
  let session = null;
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
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.user) {
        user = data.user;
        session = data.session;
      }
    }
  } catch (e) {
    console.error("Better Auth fetch error", e);
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
          query: 'SELECT role FROM profiles WHERE id = ?',
          params: [user.id],
        }),
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          role = resolveUserRole(json.data.role, null);
        }
      }
    } catch (e) {}
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

  if (!isCoachRoute && !isStudentRoute) {
    return response
  }

  if (!user) {
    return NextResponse.redirect(new URL('/giris', request.url))
  }

  if (isCoachRoute && role !== 'coach') {
    if (isStudentRoute) return response;
    return NextResponse.redirect(new URL('/student/dashboard', request.url))
  }

  if (isStudentRoute) {
    if (role !== 'student') {
      if (isCoachRoute) return response;
      return NextResponse.redirect(new URL('/coach/dashboard', request.url))
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
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
