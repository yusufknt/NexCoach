import { CoachSidebar } from '@/components/layout/coach-sidebar'

export default function CoachLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FB] text-foreground md:flex-row">
      <CoachSidebar />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  )
}
