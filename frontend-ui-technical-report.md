# Teknik Rapor: Arayüz (UI) Renk Tutarlılığı ve En İyi Frontend Pratikleri

Bu rapor, NexCoach projesinde sayfalar arası renk tutarsızlığının kök nedenlerini analiz etmekte ve gelecekte en iyi Frontend UI (Kullanıcı Arayüzü) mimarisinin nasıl kurulması gerektiğine dair teknik bir yol haritası sunmaktadır. Raporda mevcut kodlara müdahale edilmemiş, sadece araştırma ve çözüm stratejileri listelenmiştir.

## 1. Mevcut Durum Analizi (Sorunun Kaynağı)

Proje incelendiğinde, "her sayfada farklı renkler kullanılıyor" probleminin temelinde yatan birkaç mimari sorun tespit edilmiştir:

*   **Farklı Tema Kapsamları (Scope Overrides):** `globals.css` dosyasında ana proje için `:root` (açık tema) ve `.dark` (koyu tema) değişkenleri tanımlanmışken, public (açık/pazarlama) sayfalar için ayrı bir `.public-shell` sınıfı oluşturulmuştur. Bu sınıf `--primary` rengini `#0066ff` (Cobalt Blue) yerine `#7482ff` (Açık Mor/Mavi) olarak eziyor ve arka planı `#0b0d14` yapıyor.
*   **Hardcoded (Sabit) Renk Değerleri:** Kodlar incelendiğinde, Tailwind'in semantik sınıfları (`bg-background`, `text-primary`) yerine doğrudan hex kodlarının kullanıldığı görülmüştür. Örneğin: `(coach)/layout.tsx` içerisinde `bg-[#F8F9FB]`, `(public)/layout.tsx` içerisinde `bg-[#0b0d14]` sınıfları doğrudan yazılmıştır.
*   **Parçalı CSS Sınıfları:** Tailwind CSS mantığına aykırı olarak, bazı bileşenler için CSS dosyasında geleneksel sınıflar (`.public-primary-button`, `.coach-card`, vb.) tanımlanmış ve içlerinde `!important` ve farklı hex kodları kullanılmıştır. Bu durum Tailwind'in sunduğu merkezi tema yönetimini devre dışı bırakmaktadır.

## 2. Renk Tutarlılığını Sağlama Stratejisi

Tüm sayfalarda aynı renk paletini kullanmak ve "Premium SaaS" görünümünü korumak için aşağıdaki adımlar izlenmelidir:

### A. Tek Bir Renk Paleti (Single Source of Truth) Belirleme
Eğer projenin marka rengi `#0066FF` ise, public sayfalarda veya iç sayfalarda bu renk değişmemelidir. Public sayfalar koyu (dark mode) tasarımı kullanacaksa bile, bu durum `.public-shell` gibi yeni bir tema yaratarak değil, mevcut `.dark` temasının kuralları kullanılarak yapılmalıdır.

### B. Semantik (Anlamsal) Değişken Kullanımı
Hex kodları (`#F8F9FB`, `#0066FF` vb.) HTML veya TSX dosyalarında asla kullanılmamalıdır. Bunun yerine, Tailwind ve Shadcn/ui standartlarına uygun değişkenler kullanılmalıdır:
*   Arka planlar için: `bg-background`
*   Kartlar için: `bg-card`
*   Ana vurgular ve butonlar için: `bg-primary`, `text-primary`
*   Yazılar için: `text-foreground`, `text-muted-foreground`

## 3. En İyi Frontend UI Mimarisi (Best Practices)

Mevcut projeyi endüstri standartlarına (Best Practices) taşımak için uygulanması gereken mimari kurallar şunlardır:

### Kural 1: Shadcn/ui ve Tailwind Standartlarına Tam Uyum
Projede hali hazırda `shadcn/ui` kullanıldığı görülmektedir. Ancak özel butonlar (`.btn-primary-glow`, `.public-primary-button`) CSS dosyasında tanımlanmıştır. Doğru olan yaklaşım, bu tarz özel stilleri `components/ui/button.tsx` altındaki `cva` (Class Variance Authority) varyantları içerisine Tailwind sınıfları olarak eklemektir. CSS dosyasındaki `.public-primary-button` gibi özelleştirmeler silinmelidir.

### Kural 2: Tema (Theme) Yönetimi
Next.js projelerinde Dark/Light mod geçişi ve sayfa bazlı tema zorunlulukları `next-themes` kütüphanesi ile yönetilmelidir.
Eğer Pazarlama (Public) sayfaları zorunlu olarak koyu renk olacaksa, bu `<body>` etiketine veya Layout'a zorla `class="dark"` verilerek yapılmalıdır; `.public-shell` gibi custom bir override sınıfı ile değil.

### Kural 3: Tailwind v4 "@theme" Bloğunu Etkili Kullanma
`globals.css` içerisinde yer alan `@theme inline` bloğu çok güçlü bir özelliktir. Tüm spacing, radius ve color token'ları burada tanımlıdır. Tasarım sistemindeki tüm gölgeler (shadow), fontlar ve renkler bu blok içerisinden türetilmeli ve React component'leri sadece Tailwind utility sınıflarını (ör: `shadow-md`, `rounded-2xl`) çağırmalıdır.

### Kural 4: Layout Dosyalarının Temizlenmesi
Uygulamadaki tüm `layout.tsx` dosyaları (coach, student, public) şu şekilde standartlaştırılmalıdır:
```tsx
// Yanlış (Mevcut Durum):
<div className="flex min-h-screen flex-col bg-[#F8F9FB] text-foreground">

// Doğru (Olması Gereken):
<div className="flex min-h-screen flex-col bg-background text-foreground">
```
Bu değişiklik yapıldığında, `globals.css` içindeki `--background` değişkeni ne ise, tüm proje otomatik olarak o rengi alacak ve her sayfada kusursuz bir renk tutarlılığı sağlanacaktır.

## Özet

Projedeki renk tutarsızlığının temel sebebi **tasarım tokenlarının (design tokens) merkezi olarak kullanılmaması** ve bazı sayfalar için **"hardcoded" CSS ezmelerinin (override)** yapılmasıdır. 

Uygulamanın arayüz kalitesini (Linear/Stripe SaaS kalitesi) artırmak için:
1. CSS dosyasındaki gereksiz custom class'lar temizlenmeli,
2. React bileşenlerinde sadece Tailwind'in semantik sınıfları (`bg-background`, `text-primary` vb.) kullanılmalı,
3. Tüm renk tanımları sadece `globals.css` içindeki `:root` ve `.dark` bloklarında tutulmalıdır.
