import { PublicHeader } from '@/components/layout/public-header'

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="dark min-h-screen bg-background text-foreground" data-public-shell>
      <PublicHeader />
      <main>{children}</main>
    </div>
  )
}
