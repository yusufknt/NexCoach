import type { Metadata } from 'next'
import { Inter, Montserrat } from 'next/font/google'
import { ToastProvider } from '@/components/ui/toast-provider'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-heading',
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
    <html lang="tr" className={`${inter.variable} ${montserrat.variable}`}>
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
