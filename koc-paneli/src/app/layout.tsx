import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { ToastProvider } from '@/components/ui/toast-provider'
import './globals.css'

const sansFont = localFont({
  src: [
    { path: './fonts/Geist-Latin.woff2', weight: '100 900', style: 'normal' },
    { path: './fonts/Geist-Latin-Ext.woff2', weight: '100 900', style: 'normal' },
  ],
  variable: '--font-sans',
  display: 'swap',
})

const headingFont = localFont({
  src: [
    { path: './fonts/Geist-Latin.woff2', weight: '100 900', style: 'normal' },
    { path: './fonts/Geist-Latin-Ext.woff2', weight: '100 900', style: 'normal' },
  ],
  variable: '--font-heading',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'NexCoach | Online Koçluk Platformu',
    template: '%s | NexCoach',
  },
  description: 'Hedeflerinize göre şekillenen kişiselleştirilmiş online koçluk deneyimi.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" className={`${sansFont.variable} ${headingFont.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
