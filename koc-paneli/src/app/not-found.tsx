import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <FileQuestion className="h-10 w-10 text-primary" />
      </div>
      <h1 className="mb-4 text-6xl font-bold tracking-tighter text-foreground">404</h1>
      <h2 className="mb-2 text-2xl font-semibold text-foreground">Sayfa Bulunamadı</h2>
      <p className="text-muted-foreground max-w-md mx-auto mb-8">
        Aradığınız sayfa silinmiş, adı değiştirilmiş veya geçici olarak kullanılamıyor olabilir.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/">
          <Button variant="outline" className="w-full sm:w-auto">
            Ana Sayfaya Dön
          </Button>
        </Link>
        <Link href="/giris">
        <Button className="w-full sm:w-auto">
            Panele Git
          </Button>
        </Link>
      </div>
    </div>
  )
}
