'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, LogOut, ShieldCheck, Users } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin/dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
  { href: '/admin/koclar', label: 'Koçlar', icon: Users },
]

export function AdminSidebar() {
  const pathname = usePathname()

  async function handleSignOut() {
    await authClient.signOut()
    window.location.href = '/giris'
  }

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-border/80 bg-card md:sticky md:top-0 md:h-screen md:w-64 md:border-b-0 md:border-r">
      <div className="flex items-center gap-3 border-b border-border/70 px-5 py-4.5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-slate-950 text-white">
          <ShieldCheck className="size-5" />
        </div>
        <div>
          <span className="block text-sm font-bold tracking-tight">NexCoach</span>
          <span className="text-[11px] font-medium text-muted-foreground">Yönetim Paneli</span>
        </div>
      </div>
      <nav className="flex flex-1 gap-1 overflow-x-auto p-3 md:flex-col">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active ? 'bg-primary/10 font-semibold text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-border/70 p-3">
        <Button variant="ghost" className="w-full justify-start gap-2.5 text-muted-foreground hover:text-destructive" onClick={handleSignOut}>
          <LogOut className="size-4" />
          Çıkış Yap
        </Button>
      </div>
    </aside>
  )
}
