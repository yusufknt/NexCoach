'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Calendar,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  Users,
} from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/coach/dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
  { href: '/coach/ogrenciler', label: 'Öğrencilerim', icon: Users },
  { href: '/coach/mesajlar', label: 'Mesajlar', icon: MessageSquare },
  { href: '/coach/takvim', label: 'Takvim', icon: Calendar },
  { href: '/coach/ayarlar', label: 'Ayarlar', icon: Settings },
]

export function CoachSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    await authClient.signOut()
    window.location.href = '/giris'
  }

  function handlePrefetch(href: string) {
    router.prefetch(href)
  }

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-border/80 bg-card text-card-foreground md:h-screen md:sticky md:top-0 md:w-64 md:border-b-0 md:border-r">
      {/* Brand Header */}
      <div className="flex items-center justify-between border-b border-border/70 px-5 py-4.5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-xs">
            <svg
              className="h-5 w-5 fill-none stroke-current stroke-[2.2]"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 3a9 9 0 0 1 9 9" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </div>
          <div>
            <span className="block text-sm font-bold tracking-tight text-foreground">
              NexCoach
            </span>
            <span className="text-[11px] font-medium text-muted-foreground">
              Koçluk Paneli
            </span>
          </div>
        </div>
        <span className="hidden rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-primary md:inline-block">
          Pro
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex flex-1 gap-1 overflow-x-auto p-3 md:flex-col md:overflow-y-auto">
        <div className="hidden px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 md:block">
          Menü
        </div>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/coach/dashboard' && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              onMouseEnter={() => handlePrefetch(item.href)}
              onFocus={() => handlePrefetch(item.href)}
              className={cn(
                'flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary/10 text-primary font-semibold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              />
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer Profile / Logout */}
      <div className="border-t border-border/70 p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2.5 rounded-xl text-muted-foreground transition-all duration-150 hover:bg-muted/70 hover:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm font-medium">Çıkış Yap</span>
        </Button>
      </div>
    </aside>
  )
}
