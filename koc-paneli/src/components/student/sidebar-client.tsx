'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Calendar,
  Home,
  LineChart,
  LogOut,
  MessageSquare,
  FileText,
  User,
  ClipboardList,
} from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { SidebarBadges } from '@/lib/student/types'

const navItems = [
  { href: '/student/dashboard', label: 'Ana Sayfa', icon: Home },
  { href: '/student/programlar', label: 'Programlarım', icon: FileText, badgeKey: 'program' as const },
  { href: '/student/ilerleme', label: 'İlerlemem', icon: LineChart },
  { href: '/student/raporlar', label: 'Raporlarım', icon: ClipboardList },
  { href: '/student/mesajlar', label: 'Mesajlar', icon: MessageSquare, badgeKey: 'message' as const },
  { href: '/student/takvim', label: 'Takvim', icon: Calendar },
  { href: '/student/profil', label: 'Profilim', icon: User },
]

type StudentSidebarClientProps = {
  badges: SidebarBadges
}

export function StudentSidebarClient({ badges }: StudentSidebarClientProps) {
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
    <aside className="flex w-full shrink-0 flex-col border-b border-border/80 bg-card text-card-foreground md:min-h-screen md:w-64 md:border-b-0 md:border-r">
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
              Danışan Portalı
            </span>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 gap-1 overflow-x-auto p-3 md:flex-col md:overflow-visible">
        <div className="hidden px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 md:block">
          Menü
        </div>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/student/dashboard' && pathname.startsWith(item.href))
          const Icon = item.icon

          // Badge logic
          let showBadge = false
          let badgeCount = 0
          if (item.badgeKey === 'message' && badges.unreadMessages > 0) {
            showBadge = true
            badgeCount = badges.unreadMessages
          }
          if (item.badgeKey === 'program' && badges.hasNewProgram) {
            showBadge = true
          }

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
              <span className="whitespace-nowrap md:flex-1">{item.label}</span>
              {showBadge && badgeCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
                  {badgeCount}
                </span>
              )}
              {showBadge && badgeCount === 0 && (
                <span className="h-2 w-2 rounded-full bg-primary" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Coach info card */}
      <div className="hidden border-t border-border/70 p-3 md:block">
        <div className="rounded-xl border border-border/80 bg-muted/40 p-3">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8 border border-border">
              {badges.coachAvatarUrl && <AvatarImage src={badges.coachAvatarUrl} />}
              <AvatarFallback className="bg-muted text-xs font-semibold text-foreground">
                {badges.coachName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground">{badges.coachName}</p>
              <p className="text-[10px] text-muted-foreground">Koçun</p>
            </div>
          </div>
          <Link href="/student/mesajlar">
            <Button
              size="sm"
              variant="outline"
              className="mt-2 w-full justify-center gap-1.5 text-xs text-primary border-primary/20 hover:bg-primary/10"
            >
              <MessageSquare className="h-3 w-3" />
              Mesaj Gönder
            </Button>
          </Link>
        </div>
      </div>

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
