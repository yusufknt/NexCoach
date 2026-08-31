# Production Readiness Plan

## Bu Güvenlik Turu

- [x] Better Auth sign-in/sign-up için Worker Rate Limiting binding'i ve endpoint limitleri
- [x] Cloudflare güvenilir IP başlığı (`cf-connecting-ip`)
- [x] Hassas R2 nesneleri için süreli HMAC imzalı URL ve private cache politikası
- [x] R2 write/delete/list/sign uçlarında fail-closed internal secret kontrolü
- [x] Kaynak kod ve tarayıcı bundle'ındaki sabit API sırrının kaldırılması
- [x] D1 Hono isteklerinde Zod şeması, boyut/adet ve SQL işlem tipi sınırları
- [x] Koç ayarları, mesaj, takvim ve hızlı ilerleme mutasyonlarında oturum/yetki doğrulaması
- [x] Korumasız test veri endpoint'i `/api/run-script` kaldırıldı
- [x] Production'da erişilebilen test e-posta endpoint'leri kaldırıldı
- [x] Cron endpoint'i `CRON_SECRET` yokken de kapalı kalacak şekilde fail-closed yapıldı
- [x] Vercel preview alan adları Better Auth güvenilir origin listesine eklendi

## Deploy Öncesi P0

1. Sohbette paylaşılmış eski `API_SECRET` değerini kullanma. Worker `API_SECRET` ve Vercel `CLOUDFLARE_API_SECRET` değerini aynı yeni, rastgele değerle ayarla; değeri kaynak koda veya GitHub'a koyma.
2. Ayrı bir rastgele `URL_SIGNING_SECRET` oluşturup yalnızca Worker secret olarak ayarla. Bu iki sır aynı olmamalı.
3. Tarayıcı istekleri Vercel'deki same-origin auth proxy üzerinden geçtiği için Worker CORS varsayılan olarak kapalıdır. İleride doğrudan browser-to-Worker erişimi eklenirse yalnızca gerçek production origin'ini tanımla; wildcard kullanma.
4. Dört R2 bucket için `r2.dev` public development URL ve varsa public custom domain erişimini Dashboard/API üzerinden kapalı olduğunu doğrula.
5. `AUTH_RATE_LIMITER` namespace ID `1001` değerinin hesapta başka limiter ile paylaşılmadığını doğrula.
6. Vercel proje Root Directory değerinin `koc-paneli` olduğunu doğrula. Production ortamında `CLOUDFLARE_API_SECRET` ve `CRON_SECRET`; e-posta kullanılacaksa `RESEND_API_KEY` tanımlı olmalı.
7. Worker'ı ayrıca deploy et. GitHub push yalnızca bağlı Vercel projesini deploy eder; `cloudflare/` Worker'ını otomatik deploy etmez.
8. Secret değişikliğinden sonra yeni bir Vercel deployment başlat. Çıplak hassas dosya URL'sinin `403`, geçerli imzanın `200`, süresi geçen imzanın `403` döndürdüğünü smoke test et.

## Deploy Sırası

1. Cloudflare hesabında yeni `API_SECRET` ve ayrı `URL_SIGNING_SECRET` oluştur.
2. Aynı yeni API değerini Vercel Production ve gerekiyorsa Preview ortamlarında `CLOUDFLARE_API_SECRET` olarak ekle.
3. `cloudflare/` dizinindeki Worker'ı deploy et.
4. GitHub `main` dalına push ederek Vercel deployment'ını başlat.
5. Giriş, kayıt, dosya yükleme/görüntüleme ve cron yetkilendirme smoke testlerini çalıştır.

## Production Sonrası P1

1. Cloudflare zone üzerinde `/api/auth/sign-in/email` ve `/api/auth/sign-up/email` için WAF rate-limit kuralını ikinci savunma katmanı olarak ekle.
2. Genel `/api/db/*` SQL köprüsünü domain bazlı Worker endpoint'leri veya Cloudflare service binding ile aşamalı olarak değiştir; sonrasında generic SQL uçlarını kaldır.
3. Kalan tüm Server Action/form girişlerini Zod şemalarına geçir; maksimum metin, sayı aralığı, enum, tarih ve sahiplik kontrollerini ortak bir kontrol listesiyle denetle.
4. 401/403/413/429 olayları için yapılandırılmış Worker logları ve alarm eşikleri oluştur.
5. Secret rotasyonu, R2 erişim reddi ve rate-limit davranışını CI/staging entegrasyon testlerine ekle.
