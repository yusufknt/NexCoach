'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Globe, Palette, MessageSquareQuote, Package } from 'lucide-react'

export function WebsiteTab() {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="surface-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <Globe className="h-4 w-4 text-primary" />
            Hero Bölümü
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 p-8 text-center">
            <div>
              <Palette className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium text-foreground">
                Website düzenleme modülü
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Hero başlık, slogan ve görsel düzenlemeleri yakında aktif olacak.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testimonials */}
      <Card className="surface-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <MessageSquareQuote className="h-4 w-4 text-primary" />
            Referanslar (Testimonial)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 p-8 text-center">
            <div>
              <MessageSquareQuote className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium text-foreground">
                Referans yönetimi
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Öğrenci yorumlarını ekle, düzenle ve sırala. Yakında aktif.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Packages */}
      <Card className="surface-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <Package className="h-4 w-4 text-primary" />
            Paket Yönetimi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 p-8 text-center">
            <div>
              <Package className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium text-foreground">
                Paketleri düzenle
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Mevcut paketleri düzenle, yeni paket ekle, aktif/pasif toggle. Yakında aktif.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
