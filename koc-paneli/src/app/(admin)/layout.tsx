import { AdminSidebar } from '@/components/admin/admin-sidebar'

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground md:flex-row">
      <AdminSidebar />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  )
}
