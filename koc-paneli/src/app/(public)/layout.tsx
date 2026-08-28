import { PublicHeader } from '@/components/layout/public-header'

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="public-shell min-h-screen bg-[#0b0d14] text-white">
      <PublicHeader />
      <main>{children}</main>
    </div>
  )
}
