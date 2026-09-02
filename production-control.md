# NexCoach Production Kontrol Planı

Amaç: Projenin production'a hazır olup olmadığını küçük, bağımsız ve doğrulanabilir session'larla belirlemek; bulunan eksikleri kontrollü biçimde kapatmak.

## Kesin çalışma kuralları

1. Her yeni session'a yalnızca **bir** `PC-*` veya `FIX-*` adımı verilir.
2. Session önce ilgili `docs/*.md` dosyasını okur; tüm repo veya tüm docs taranmaz.
3. Denetim adımında gereksiz refactor yapılmaz. En fazla tek, küçük ve açıkça güvenli düzeltme uygulanabilir.
4. Birden fazla eksik bulunursa kodlamaya girişilmez; her eksik aşağıdaki tabloya ayrı `FIX-*` maddesi olarak eklenir.
5. Her `FIX-*` yalnızca bir sorun, dar dosya listesi ve tek doğrulama yöntemi içermelidir.
6. İlgisiz mevcut değişikliklere dokunulmaz. Destructive komut, production deploy veya remote migration açık kullanıcı onayı olmadan çalıştırılmaz.
7. Adım sonunda bu dosya güncellenir; kanıt olmadan `TAMAM` yazılmaz.
8. Adım tamamlanınca session kapatılır (`/clear`); sıradaki adım yeni session'da başlatılır.

## Durum değerleri

- `BEKLİYOR`: Henüz başlanmadı.
- `ÇALIŞIYOR`: Yalnızca aktif session'ın adımı.
- `BLOKE`: Dış bilgi, erişim veya karar gerekiyor.
- `SORUN VAR`: Bir veya daha fazla `FIX-*` açıldı.
- `TAMAM`: Kabul kriteri kanıtla sağlandı.

## Bilinen production engeli

`docs/current-state.md` kaydına göre remote D1 migration `0004` uygulanmalı ve ilk admin bootstrap edilmelidir. Bunlar doğrulanmadan production onayı verilemez; uygulama işlemleri yalnızca `PC-18` aşamasında, açık onayla yapılır.

## Ana kontrol sırası

| ID | Kontrol | İlgili doküman | Kabul kriteri | Durum |
|---|---|---|---|---|
| PC-00 | Başlangıç fotoğrafı | `docs/current-state.md` | Branch/çalışma ağacı, mevcut deploy ortamları ve bilinen engeller kısa biçimde kaydedildi; kod değişmedi. | BEKLİYOR |
| PC-01 | Frontend kalite kapıları | `docs/architecture.md` | `koc-paneli` içinde type-check, lint ve production build geçiyor; hatalar ayrı `FIX-*` oldu. | BEKLİYOR |
| PC-02 | Worker kalite kapıları | `docs/backend.md` | `cloudflare` type-check geçiyor; Worker config ile kaynak uyuşmazlıkları kaydedildi. | BEKLİYOR |
| PC-03 | Bağımlılık ve lockfile | `docs/architecture.md` | Her iki pakette temiz kurulum tekrarlanabilir; production bağımlılıklarındaki yüksek/kritik açıklar yok veya risk kararı kayıtlı. | BEKLİYOR |
| PC-04 | Ortam değişkenleri ve domainler | `docs/backend.md`, `docs/auth.md` | Frontend/Worker değişken matrisi çıkarıldı; prod URL, CORS, auth callback ve gerekli secret'larda eksik yok. Secret değerleri dosyaya yazılmadı. | BEKLİYOR |
| PC-05 | D1 migration güvenliği | `docs/database.md` | Migration sırası ve remote uygulama durumu doğrulandı; yedek ve geri dönüş yöntemi yazıldı. Bu adım remote DB'yi değiştirmez. | BEKLİYOR |
| PC-06 | Auth ve route koruması | `docs/auth.md` | Misafir/admin/coach/student erişim matrisi test edildi; yetki yükseltme veya korumasız route yok. | BEKLİYOR |
| PC-07 | API güvenliği | `docs/backend.md` | API/cron uçlarında auth, rol kontrolü, input validation, hata sızıntısı, CORS ve rate-limit denetlendi. | BEKLİYOR |
| PC-08 | R2 dosya güvenliği | `docs/backend.md` | Dört bucket için upload türü/boyutu, sahiplik, imzalı URL süresi ve yetkisiz erişim kontrolleri geçti. | BEKLİYOR |
| PC-09 | Admin kritik akışları | `docs/features.md`, `docs/auth.md` | İlk admin, coach daveti, tek kullanımlı link, erişim süresi ve askıya alma akışları geçti. | BEKLİYOR |
| PC-10 | Coach kritik akışları | `docs/features.md` | Giriş, öğrenci işlemleri, program, takvim, mesaj ve rapor için kısa smoke testi geçti. | BEKLİYOR |
| PC-11 | Student kritik akışları | `docs/features.md` | Kayıt/onboarding, dashboard, ilerleme, program, takvim, mesaj ve rapor smoke testi geçti. | BEKLİYOR |
| PC-12 | E-posta teslimatı | `docs/backend.md` | Gönderen domain doğrulandı; davet ve kritik e-postalar prod-benzeri ortamda ulaşıyor, hata yolu güvenli. | BEKLİYOR |
| PC-13 | UI dayanıklılığı | `docs/frontend.md` | Kritik ekranlarda mobil görünüm, loading/empty/error durumları ve temel klavye erişimi kontrol edildi. | BEKLİYOR |
| PC-14 | Gözlemlenebilirlik ve gizlilik | `docs/backend.md` | Sentry/logging prod ayarları, health endpoint ve source map davranışı doğrulandı; loglarda secret/PII yok. | BEKLİYOR |
| PC-15 | Performans kontrolü | `docs/frontend.md` | Landing, login ve birer portal ana ekranında temel Web Vitals/bundle sorunları ölçüldü; ciddi regresyon yok. | BEKLİYOR |
| PC-16 | Operasyon ve geri dönüş | `docs/architecture.md`, `docs/database.md` | Frontend/Worker rollback, D1 backup/restore, R2 koruma ve sorumlu kişi içeren kısa runbook hazır. | BEKLİYOR |
| PC-17 | Staging final provası | `docs/current-state.md` | Production ile aynı config sınıfında tüm migration ve rol bazlı uçtan uca smoke testleri geçti. | BEKLİYOR |
| PC-18 | Canlıya çıkış kapısı | Bu dosya | Tüm `PC-*` ve `FIX-*` tamam; onayla backup, remote migration, admin bootstrap, Worker/frontend deploy ve canlı smoke sırasıyla uygulandı. | BEKLİYOR |

## Dinamik düzeltme listesi

Denetimde sorun bulununca bir satır ekle. Bir satır bir session'dan büyükse daha da böl.

| ID | Kaynak | Tek sorun / hedef | İzinli dosyalar | Doğrulama | Durum |
|---|---|---|---|---|---|
| FIX-001 | - | - | - | - | BEKLİYOR |

Boş örnek satır, ilk gerçek bulgu eklenirken değiştirilir.

## Her session için giriş metni

```text
production-control.md içindeki yalnızca [ADIM_ID] adımını uygula.
Önce adımda yazan ilgili docs dosyasını oku; tüm repoyu tarama.
Kapsamı büyütme ve ilgisiz refactor yapma.
Birden fazla sorun bulursan her biri için atomik FIX maddesi aç; hepsini aynı session'da düzeltme.
Yalnızca ilgili testleri çalıştır. Sonunda production-control.md durumunu ve kısa kanıt/not kaydını güncelle, sonra dur.
Remote migration/deploy/veri değiştiren işlem için benden açık onay almadan ilerleme.
```

## Adım sonucu kayıtları

Her session bitince en üste değil, buraya tek kısa satır eklenir:

| Tarih | Adım | Sonuç | Kanıt / açılan FIX / blocker |
|---|---|---|---|

## Production onay koşulu

Production'a hazır kararı yalnızca şu koşullarda verilir:

- `PC-00`–`PC-18` satırlarının tamamı `TAMAM`.
- Açık `FIX-*`, yüksek/kritik güvenlik açığı veya belirsiz migration yok.
- Backup/rollback yöntemi prova edilmiş.
- Admin, coach ve student akışları production-benzeri ortamda geçmiş.
- Gerçek canlıya çıkış için kullanıcı açıkça onay vermiş.
