# NexCoach Ürün, Farklılaşma ve UI/UX Analiz Raporu

**Tarih:** 31 Ağustos 2026  
**Kapsam:** Mevcut ürün mimarisi, koç ve öğrenci deneyimi, satış yüzeyi, veri modeli, güncel yerel/global rakip karşılaştırması ve önceliklendirilmiş ürün yol haritası.

> Bu rapor kaynak kod, proje dokümantasyonu ve rakiplerin güncel resmî ürün sayfaları incelenerek hazırlanmıştır. Bu oturumda canlı tarayıcı kontrolü erişilebilir olmadığı için görsel değerlendirme çalışan ekran görüntüleri yerine bileşen kodu ve tasarım token'ları üzerinden yapılmıştır. Bu nedenle uygulama öncesinde 5 koçla görev bazlı kullanılabilirlik testi önerilir.

## 1. Yönetici özeti

NexCoach'un temeli satılabilir bir ürüne yakın: koç ve öğrenci için ayrı portallar; danışan, takvim, mesaj, ödeme, paket, gelişim ölçümü, fotoğraf ve aylık rapor altyapısı mevcut. Teknik omurga da küçük ve orta ölçekli bir SaaS için yeterli görünüyor.

Ancak ürün bugün ağırlıklı olarak **bilgiyi bir araya getiren bir takip paneli**. Koçun doğrudan para veya zaman kazanmasını sağlayan temel döngüler henüz tamamlanmış değil:

- Koç paneli sayaç ve grafik gösteriyor ama **“bugün ne yapmalıyım?”** sorusunu yanıtlamıyor.
- İlerleme kaydı güçlü veri topluyor ancak **otomatik risk tespiti, check-in kuyruğu ve önerilen aksiyon** üretmiyor.
- Program teslimi PDF yükleme ile sınırlı; **şablon, yapılandırılmış antrenman, kopyalama, toplu atama ve uyum takibi** yok.
- Paket ve ödeme tabloları var fakat landing sayfasındaki satın alma butonu girişe gidiyor; **satın alma → ödeme → onboarding → program teslimi** zinciri tamamlanmamış.
- Koçun web sitesi ayarları ve referans yönetimi arayüzde “yakında” durumunda. Landing sayfasındaki referanslar sabit/veri dışı olduğu için güven ve kişiselleştirme zayıf.
- UI görsel olarak tutarlı ve modern; fakat koç ekranları **kart yoğun**, bilgi hiyerarşisi ise operasyonel öncelik yerine modül yapısını yansıtıyor.

### Ana öneri

NexCoach'u “bir başka fitness takip uygulaması” olarak değil şu vaatle konumlandırmak gerekir:

> **NexCoach, Türkçe çalışan bağımsız fitness koçlarının danışan kaybını azaltan, haftalık takibi otomatikleştiren ve tahsilatı düzenleyen koçluk işletim sistemidir.**

Ürünün ayırt edici çekirdeği dört parçadan oluşmalı:

1. **Koç Radar:** Riskli, sessiz, ödemesi gecikmiş veya check-in'i eksik danışanları önceliklendiren aksiyon merkezi.
2. **Akıllı Check-in:** Koça göre özelleştirilen haftalık form, otomatik özet ve onay gerektiren aksiyon önerileri.
3. **Türkiye iş akışı:** iyzico ile tek/tekrarlı tahsilat, ödeme takibi ve izinli WhatsApp hatırlatmaları.
4. **Koçun kendi markası:** Kişisel satış sayfası, gerçek sonuç kanıtları, başvuru formu ve uçtan uca paket satın alma akışı.

AI burada ürünün kendisi değil, koçun iş akışını hızlandıran yardımcı katman olmalıdır. Nihai program veya sağlık kararı koç onayı olmadan yayınlanmamalıdır.

## 2. İncelenen mevcut yapı

### Güçlü yönler

| Alan | Mevcut kanıt | Ürün değeri |
|---|---|---|
| İki taraflı deneyim | Ayrı koç ve öğrenci route/component ağaçları | Her rol için odaklı deneyim kurmaya uygun |
| Danışan 360° profili | Profil, onboarding, ilerleme, program ve rapor sekmeleri | Koçun bağlam kaybetmesini azaltır |
| Zengin gelişim verisi | Kilo, çevre ölçüleri, temel lift'ler, uyku, adım, enerji, diyet uyumu, fotoğraf | Risk skoru ve kaliteli check-in özeti için iyi veri tabanı |
| Gelir ve paket veri modeli | `packages`, `payments`, `coach_students.payment_status` | Tahsilat ve paket yenileme özelliklerine hazır temel |
| Cloudflare altyapısı | D1 + R2 + Workers | Maliyet kontrollü büyüme ve medya saklama için uygun |
| Tutarlı tasarım sistemi | Geist, Tailwind, shadcn tabanlı primitive'ler, ortak token'lar | UI yenilemesi sıfırdan tasarım gerektirmez |
| Raporlama | Aylık rapor ve PDF üretim akışı | Koçun hizmet değerini görünür kılma potansiyeli yüksek |

### Kritik boşluklar

| Boşluk | Koddan görülen durum | Ticari etkisi |
|---|---|---|
| Operasyon merkezi yok | Dashboard; aktif danışan, mesaj, randevu, aktivite ve grafik gösteriyor | Koç yine kiminle ilgileneceğini kendisi hesaplıyor |
| Yapılandırılmış program yok | Program akışı yalnızca PDF yükleme/indirme | Uyum, set/tekrar, progresyon, egzersiz geçmişi ve otomasyon üretilemiyor |
| Check-in iş akışı tamamlanmamış | Öğrenci veri girişi yapıyor; koç tarafında toplu inceleme/onay kuyruğu yok | Çok danışanlı koçta takip işi ölçeklenmiyor |
| Satış hunisi kopuk | Paket CTA'sı `/giris` adresine gidiyor | Ziyaretçi niyeti ödeme veya başvuruya dönüşmüyor |
| Website yönetimi placeholder | Hero, referans ve paket yönetimi “yakında” | Koç kendi markasını ve teklifini yönetemiyor |
| Referanslar güvenilir veri değil | Landing yorumları bileşen içinde sabit örnekler | Satış güvenini zedeler; gerçek sonuç kanıtı üretmez |
| Koç notları placeholder | Öğrenci detayında “Notlar” boş | Seans bağlamı mesaj veya haricî araçlarda kalır |
| Mobil günlük deneyim zayıf | Öğrenci ana ekranı kart temelli; yapılandırılmış “Bugün” akışı yok | Günlük kullanım ve bağlılık düşebilir |
| Tasarım artıkları | `globals.css` içinde mevcut sistemden farklı “new.html” yardımcıları ve neon/lime stilleri var | Görsel dilin zamanla parçalanma riski |
| Riskli sağlık verisi yönetişimi görünür değil | Ölçüm, sakatlık ve gelişim fotoğrafı tutuluyor | Açık rıza, saklama/silme ve erişim kayıtları ürün güveninin parçası olmalı |

## 3. Pazar ve rekabet çıkarımı

Global ürünlerde AI workout builder, beslenme, alışkanlık, mesaj, ödeme, takvim ve white-label artık hızla standartlaşıyor. ABC Trainerize; AI program üretimi, beslenme, alışkanlık, otomatik mesaj, grup, ödeme ve wearable entegrasyonunu tek pakette sunuyor. TrueCoach; program oluşturma, 7/30/90 günlük uyum oranı ve koçun dikkat etmesi gereken danışanı belirleme üzerine vurgu yapıyor. My PT Hub ise otomatik check-in, toplu atama, branded app, finansal analiz ve binlerce şablonla ölçeklenmeyi satıyor.

Türkiye'de de boş alan tamamen açık değil. Kocha; AI, akıllı form, mobil uygulama ve taksitli ödemeyi; WellCell ise AI plan, gelir analitiği, günlük akış ve uygulama içi paketi öne çıkarıyor. Dolayısıyla NexCoach'un yalnızca “AI ekledik” veya “her şey tek panelde” söylemiyle ayrışması zor.

### Rakiplerden çıkarılan minimum pazar beklentisi

- Yapılandırılmış workout/program builder
- Şablon ve hızlı yeniden kullanım
- Haftalık check-in ve uyum oranı
- Mobil öncelikli günlük öğrenci akışı
- Mesaj, takvim ve ödeme
- Koç markalama seçenekleri
- Otomasyon ve en azından yardımcı AI

### NexCoach için savunulabilir boşluk

NexCoach, rakiplerin özellik listesini birebir kopyalamak yerine **yerel operasyon + danışan kaybını önleme + kanıtlanabilir koçluk sonucu** üçlüsüne odaklanmalı:

- Koçun dikkatini en doğru danışana yönlendirmek
- Haftalık check-in'i 2–3 dakikaya indirmek
- Program değişikliğinin nedenini veriyle açıklamak
- Ödeme ve yenilemeyi yerel yöntemlerle otomatikleştirmek
- Öğrenci sonucunu izinli biçimde referans/vaka çalışmasına dönüştürmek

## 4. Önerilen ürün omurgası

### 4.1 Koç Radar — birinci farklılaştırıcı

Dashboard'un ilk ekranı grafiklerden önce aksiyon kuyruğu göstermeli.

Örnek kartlar:

- “3 danışan bu hafta check-in göndermedi”
- “Ayşe'nin uyum skoru son iki haftada %82 → %54 düştü”
- “Mehmet'in paketi 5 gün sonra bitiyor; yenileme teklifi gönder”
- “2 ödeme gecikmiş”
- “Zeynep üç gündür mesaj bekliyor”
- “Ali'nin ağrı/sakatlık yanıtı inceleme gerektiriyor”

Her radar öğesinde tek tıklık eylem olmalı: **İncele, mesaj taslağı oluştur, randevu planla, programı güncelle, yenileme teklifi gönder**.

#### Basit ilk risk skoru

İlk sürümde makine öğrenmesi gerekmiyor. Açıklanabilir kurallar yeterli:

| Sinyal | Örnek puan |
|---|---:|
| Haftalık check-in gecikmesi | +25 |
| Son 7 günde giriş/aktivite yok | +20 |
| Antrenman uyumu <%60 | +20 |
| Enerji iki kayıt boyunca ≤4/10 | +15 |
| Okunmamış/yanıtsız mesaj >48 saat | +10 |
| Paket bitişi ≤7 gün | +10 |

0–29 sağlıklı, 30–59 dikkat, 60+ kritik olarak gösterilebilir. Skorun yanında nedenleri mutlaka yazılmalı; kara kutu puan gösterilmemeli.

### 4.2 Akıllı haftalık check-in

Mevcut gelişim formu bu özellik için güçlü bir başlangıçtır. Eksik olan, veriyi operasyonel bir sürece dönüştürmektir.

Önerilen akış:

1. Koç form şablonunu oluşturur veya hazır şablondan seçer.
2. Sistem seçilen gün/saatte danışana uygulama içi ve izin varsa WhatsApp hatırlatması yollar.
3. Danışan mobilde 2–3 dakikalık, koşullu alanlara sahip formu doldurur.
4. Sistem son 4 haftayla karşılaştırmalı kısa özet üretir.
5. Riskli değişimleri ve eksik alanları işaretler.
6. AI, koçun üslubunda yanıt ve olası aksiyon taslağı sunar.
7. Koç düzenler/onaylar; danışana hiçbir kritik öneri otomatik yayınlanmaz.

Bu özellik tek başına “haftada danışan başına kaç dakika kazandırıyor?” metriğiyle satılabilir.

### 4.3 Program Builder Lite

PDF desteği korunmalı ama ana deneyim olmaktan çıkarılmalı. İlk sürüm için 8.000 egzersiz veya karmaşık periodizasyon gerekmez.

MVP kapsamı:

- Egzersiz kütüphanesi: ad, video/görsel, kas grubu, ekipman, koç notu
- Antrenman: egzersiz, set, tekrar/aralık, RPE/RIR, dinlenme, tempo, açıklama
- Haftalık takvim ve tamamlandı/atlanmış durumu
- Programı şablon olarak kaydetme, çoğaltma ve danışana göre düzenleme
- Önceki performansı aynı ekranda gösterme
- Danışan yorum/video ekleme
- Koç için gerçek uyum yüzdesi

AI daha sonra koçun taslağını yapılandırılmış programa dönüştürmeli; otomatik yayınlamamalı.

### 4.4 Satış ve tahsilat döngüsü

Mevcut `packages` ve `payments` tabloları bu alan için avantajdır. Tamamlanması gereken akış:

`Koçun satış sayfası → kısa uygunluk formu → paket seçimi → ödeme → sözleşme/onay → onboarding → başlangıç programı → otomatik check-in`

Öncelikli parçalar:

- Her koça özel paylaşılabilir URL ve QR kod
- Paket detayında sonuç, kapsam, iletişim sınırı ve SSS
- “Hemen satın al” yanında “Ön görüşme iste” seçeneği
- iyzico tek çekim/tekrarlı ödeme ve webhook ile durum güncelleme
- Başarısız ödeme/yenileme kuyruğu
- Paket bitişinden 14/7/3 gün önce koça uyarı
- Gerçek öğrenci onayıyla vaka çalışması ve önce/sonra sonucu

iyzico'nun resmî dokümantasyonu tekrarlı plan, deneme süresi ve webhook akışını desteklediğini gösteriyor; entegrasyon öncesinde işletme hesabı ve ürün koşulları doğrulanmalıdır.

### 4.5 WhatsApp yardımcı katmanı

Koçların alışkanlığını zorla değiştirmek yerine NexCoach içindeki olayı WhatsApp'a kontrollü taşıyan bir köprü daha satılabilir olabilir.

İlk kullanım alanları:

- Check-in hatırlatması
- Randevu hatırlatması
- Ödeme/yenileme bildirimi
- Koçun onayladığı kişisel mesaj

WhatsApp Business Platform'da işletmenin başlattığı konuşmalar onaylı şablon gerektirir; 24 saatlik müşteri hizmeti penceresi ve insan desteğine geçiş kuralları ürün tasarımına baştan eklenmelidir. Açık izin, frekans kontrolü ve “WhatsApp'tan çık” seçeneği zorunlu ürün gereksinimi kabul edilmelidir.

### 4.6 Sonuç Kanıtı Motoru

NexCoach raporlama özelliğini yalnızca PDF indirme olarak bırakmamalı. Koçun değerini hem mevcut öğrenciye hem yeni müşteriye kanıtlayan bir sisteme çevirmeli.

- Aylık “ne değişti / neden / sonraki adım” özeti
- Koç ve öğrenci için ayrı dil seviyesi
- İzinli paylaşılabilir sonuç kartı
- Kişisel verileri gizleyen sosyal medya görseli
- Referans isteği ve yayın onayı
- Landing sayfasında doğrulanmış sonuç/vaka çalışması

Bu alan mevcut rapor, gelişim fotoğrafı ve ölçüm altyapısından yararlanacağı için görece düşük maliyetli ve yüksek satış etkili bir fırsattır.

## 5. UI/UX değerlendirmesi

### Mevcut görsel yön doğru mu?

Evet. Açık gri zemin, beyaz kartlar, kobalt vurgu ve Geist tipografisi profesyonel SaaS hissi veriyor. Yeni bir tasarım sistemi kurmak gereksiz olur. Gerekli olan **görsel makyaj değil, bilgi mimarisi ve görev akışı yenilemesi**.

### Koç paneli

Mevcut sıra: başlık/arama → 4 KPI → hızlı aksiyonlar → gelir/büyüme grafikleri → alt widget'lar.

Önerilen sıra:

1. **Bugün:** randevu, bekleyen yanıt, geciken check-in, ödeme ve yenileme
2. **Koç Radar:** kritik/dikkat/sağlıklı danışanlar
3. **Hızlı işlem:** check-in incele, program oluştur, toplu mesaj, danışan davet et
4. **Portföy görünümü:** tablo; son check-in, uyum, risk, ödeme, paket bitişi
5. **İşletme özeti:** gelir ve büyüme grafikleri

Gelir grafiği önemli ancak günlük operasyonun önüne geçmemeli. “Son aktiviteler” sayacı karar üretmediği için KPI kartından çıkarılabilir.

### Öğrenci paneli

Öğrenci paneli “profil özeti” yerine **Bugün** ekranı olmalı:

- Bugünün antrenmanı veya dinlenme görevi
- Günlük 3–5 alışkanlık
- Koçtan son mesaj/geri bildirim
- Yaklaşan randevu
- Check-in son tarihi
- Tek bir birincil CTA

Başlangıç fiziksel profilinin altı ayrı kutuyla sürekli gösterilmesi günlük değeri düşük. Bu bilgi profil/ilerleme alanında kalmalı; ana ekran alanı bugünkü davranışa ayrılmalı.

### Danışan listesi

Liste “öğrenci adı” odaklı olmaktan çıkıp bir operasyon tablosu olmalı:

| Danışan | Risk | Son check-in | Uyum | Son mesaj | Ödeme | Paket bitişi | Aksiyon |
|---|---|---|---:|---|---|---|---|

Filtreler: kritik risk, check-in bekleyen, yenileme yaklaşan, ödeme gecikmiş, yeni başlayan, sessiz danışan. Koçların 30+ danışanı yönetebilmesi için bu ekran kart görünümünden daha yoğun bir masaüstü tabloyu desteklemeli; mobilde kart görünümüne dönebilir.

### Öğrenci detay ekranı

Sekmeler korunabilir; üst kısma kalıcı bir öğrenci özeti eklenmeli:

- Risk durumu ve nedenleri
- Bu haftanın uyumu
- Son check-in / sonraki check-in
- Paket ve ödeme durumu
- Son koç teması
- “Mesaj gönder”, “programı düzenle”, “not ekle” aksiyonları

Boş “Notlar” sekmesi hızlıca tamamlanmalı. Notlarda zaman damgası, etiket, yalnızca koça görünürlük ve sonraki görüşmede hatırlat seçeneği olmalı.

### Landing ve koç sitesi

Mevcut hero metni öğrenciye hitap ediyor ama ürünün somut sonucunu veya koçun kanıtını göstermiyor. Ayrıca gerçek ekran yerine koç fotoğrafı ağırlıklı kullanılıyor.

Önerilen hero yapısı:

- Sonuç odaklı başlık: “Program almak değil, her hafta ilerlemek için.”
- Koçun uzmanlığı ve hedef kitlesi
- Gerçek uygulama ekranı/sonuç kartı
- Tekincil CTA: “Ücretsiz ön görüşme” veya “Uygunluk formunu doldur”
- İkincil CTA: “Paketleri gör”
- Güven sinyali: doğrulanmış danışan sayısı, ortalama devam süresi, gerçek yorumlar

“Gerçek deneyimler” alanında sahte/örnek izlenimi veren sabit isimler yayın ortamında kullanılmamalı. Veri yoksa alan gizlenmeli veya açıkça demo içerik olarak etiketlenmeli.

### Tasarım sistemi temizliği

- `globals.css` içindeki `new.html`, lime glow ve materyal yardımcıları mevcut kobalt/light SaaS sistemiyle karışıyor; gerçekten kullanılmıyorsa ayrı bir temaya taşınmalı veya kaldırılmalı.
- Kart köşe yarıçapı, gölge ve iç boşluk için 2–3 seviye tanımlanmalı; her alanın kart içine alınması önlenmeli.
- Durumlar sadece renkle anlatılmamalı; ikon + metin + renk birlikte kullanılmalı.
- Kritik listelerde 11–12 px metin kullanımını azaltıp en az 14 px hedeflenmeli.
- Mobilde alt navigasyon, sabit birincil aksiyon ve tek elle check-in girişi test edilmeli.
- Boş durumlar yalnızca “yakında” dememeli; kullanıcıya alternatif eylem vermeli veya özellik tamamlanana kadar navigasyondan saklanmalı.

## 6. Önceliklendirilmiş yol haritası

### Faz 0 — doğrulama ve ölçüm (1–2 hafta)

Amaç: yanlış özelliği geliştirme riskini azaltmak.

- 5 bağımsız koçla 45 dakikalık görüşme
- Her koçtan bir haftalık gerçek iş akışını göstermesini isteme
- Ölçülecek başlangıç değerleri: danışan başına haftalık yönetim süresi, check-in tamamlama oranı, yenileme oranı, geciken ödeme, haftalık aktif öğrenci
- Figma/HTML prototipiyle Koç Radar ve check-in kuyruğu testi
- Analitik olay sözlüğü oluşturma

**Çıkış kriteri:** En az 3 koç radar/check-in çözümünü ücret ödeme veya pilot kullanma niyetiyle doğrulamalı.

### Faz 1 — satılabilir çekirdek (0–30 gün)

1. Koç Radar v1 ve “Bugün” dashboard'u
2. Haftalık check-in şablonu, son tarih ve koç inceleme kuyruğu
3. Danışan listesine risk/son check-in/ödeme/paket kolonları
4. Koç notları
5. Website ayarlarında gerçek paket ve referans yönetimi
6. Landing CTA'sını başvuru veya ödeme başlangıcına bağlama
7. Olay analitiği ve temel hata izleme

**Neden önce:** Mevcut veri modelinden yararlanır, koçun günlük acısını çözer ve ürün demosunda kolayca gösterilir.

### Faz 2 — gelir ve bağlılık (31–60 gün)

1. iyzico ödeme ve webhook durum senkronizasyonu
2. Paket yenileme/başarısız ödeme kuyruğu
3. WhatsApp izin ve şablon altyapısı; check-in/randevu hatırlatmaları
4. Öğrenci “Bugün” ekranı
5. Sonuç kartı, referans isteme ve yayın onayı
6. Check-in karşılaştırması ve koç onaylı AI özet/mesaj taslağı

### Faz 3 — ölçeklenebilir hizmet üretimi (61–90 gün)

1. Program Builder Lite
2. Program şablonları, çoğaltma ve toplu atama
3. Antrenman tamamlama ve gerçek uyum skoru
4. Egzersiz video kütüphanesi başlangıcı
5. Koçun kendi içeriğinden AI taslak oluşturma
6. Gruplar veya challenge için yalnızca pilot talebi güçlüyse keşif

### P2 / daha sonra

- Apple Health, Google Health Connect ve wearable entegrasyonu
- Çoklu koç/stüdyo rolleri
- White-label native uygulama
- Topluluk ve leaderboard
- Gelişmiş besin veri tabanı/barkod
- Marketplace

Bu özellikler rekabet için değerlidir ancak erken aşamada ürün odağını ve geliştirme kapasitesini dağıtabilir.

## 7. Kod ve mimari etki haritası

Bu bölüm uygulama sırasında nereye dokunulacağını yaklaşık olarak gösterir; kesin teknik tasarım değildir.

| İnisiyatif | Mevcut başlangıç noktaları | Muhtemel yeni gereksinim |
|---|---|---|
| Koç Radar | `components/coach/dashboard-*`, `lib/coach/dashboard.server.ts` | Risk query/service, açıklanabilir neden modeli, aksiyon durumu |
| Check-in kuyruğu | `components/student/progress/`, `lib/student/progress-actions.ts`, `progress_entries.custom_metrics` | Form şablonu, atama, son tarih, inceleme durumu tabloları |
| Program Builder | `components/coach/student/programs/`, `lib/coach/program-actions.ts` | Exercise/workout/block/set/log tabloları ve medya modeli |
| Tahsilat | `packages`, `payments`, `coach_students.payment_status` | Subscription/customer/provider event idempotency ve webhook route'ları |
| Koç sitesi | `components/public/`, `components/coach/settings/website-tab.tsx`, `lib/public/landing.ts` | Site ayarları, referans/onay, başvuru ve slug modeli |
| WhatsApp | Bildirim tercihleri ve mesaj altyapısı | İzin kaydı, template mapping, delivery status, opt-out |
| Sonuç kartı | Aylık rapor ve PDF bileşenleri | Paylaşılabilir görsel, anonimleştirme ve yayın onayı |

Mimari notlar:

- Risk skorunu ilk aşamada SQL + saf TypeScript kuralları olarak tutmak, test edilebilirlik ve açıklanabilirlik sağlar.
- AI çıktıları sağlık kararı değil taslak olarak saklanmalı; koç onayı ve değişiklik geçmişi bulunmalıdır.
- Ödeme ve mesaj webhook'larında idempotency zorunludur.
- Fotoğraf, sakatlık ve vücut ölçüsü gibi hassas veriler için açık rıza, erişim yetkisi, silme/indirme ve saklama süresi ürün gereksinimi olmalıdır.
- `custom_metrics` kısa vadede deney için kullanılabilir; kalıcı ve sorgulanacak check-in alanları ayrı şemaya taşınmalıdır.

## 8. Ticari paketleme önerisi

Fiyat rakamı müşteri görüşmesi olmadan kesinleştirilmemeli; değer metriği **aktif danışan sayısı** veya **koç/ekip kapasitesi** olabilir.

### Starter

- 10 aktif danışan
- Temel takip, mesaj, takvim, PDF program
- Basit satış sayfası

### Pro — ana plan

- 50 aktif danışan
- Koç Radar
- Otomatik check-in
- Ödeme/yenileme takibi
- WhatsApp yardımcı akışları
- Sonuç kartları ve gelişmiş rapor

### Studio

- Birden çok koç ve rol
- Ortak şablon kütüphanesi
- Takım performansı ve gelir analizi
- Gelişmiş markalama

Ürün demosunda özellik saymak yerine şu üç sonuç gösterilmelidir:

1. “Bu sabah ilgilenmen gereken 6 kişiyi 10 saniyede gör.”
2. “30 danışanın check-in'ini tek kuyruktan incele.”
3. “Paket bitmeden yenileme ve ödeme takibini kaçırma.”

## 9. Başarı metrikleri

### Kuzey yıldızı

**Haftalık koç tarafından yanıtlanmış tamamlanmış check-in sayısı.**

Bu metrik öğrenci katılımını, koç davranışını ve ürünün temel değer döngüsünü birlikte ölçer.

### Destek metrikleri

| Alan | Metrik | İlk hedef önerisi |
|---|---|---:|
| Aktivasyon | İlk danışan daveti + ilk check-in şablonu | Kayıttan sonraki 24 saat |
| Öğrenci bağlılığı | Haftalık check-in tamamlama oranı | ≥ %75 |
| Koç hızı | Check-in başına inceleme süresi | < 3 dakika |
| Risk yönetimi | Kritik radar öğesine ilk aksiyon süresi | < 24 saat |
| Gelir | Zamanında tahsilat oranı | ≥ %90 |
| Retention | 8. haftada aktif koç oranı | Kohort bazında izlenmeli |
| Sonuç | Paket yenileme oranı | Koç ve paket türüne göre izlenmeli |

Hedef değerler pilot verisiyle yeniden kalibre edilmelidir.

## 10. Yapılmaması gerekenler

- Sırf rakiplerde var diye ilk iş native white-label uygulama geliştirmek
- Koç onayı olmadan AI'ın program/sağlık önerisi yayınlaması
- Yapılandırılmış programa geçmeden büyük egzersiz kütüphanesine yatırım yapmak
- Dashboard'a daha fazla grafik ekleyip aksiyon sorununu çözülmüş saymak
- “Yakında” placeholder'larını ücretli planın görünen navigasyonunda bırakmak
- Gerçek izin/onay olmadan öğrenci fotoğrafı veya yorumunu pazarlamada kullanmak
- Her özelliği tek fiyat planına koyup değer metriğini belirsiz bırakmak

## 11. Net karar

**Projede UI güncellemesi yapılmalı, ancak kapsamlı bir rebrand veya görsel yeniden yazım yapılmamalı.** Mevcut tasarım sistemi korunmalı; önce bilgi mimarisi ve ana iş akışları değiştirilmelidir.

En yüksek yatırım getirisi sırası:

1. Koç Radar + check-in inceleme kuyruğu
2. Satış sayfası + başvuru/ödeme/onboarding zinciri
3. Türkiye uyumlu tahsilat ve kontrollü WhatsApp hatırlatmaları
4. Öğrenci “Bugün” ekranı
5. Program Builder Lite
6. AI yardımcı katmanı

Bu sırayla NexCoach, genel amaçlı bir panelden koçların her gün açacağı, gelirini ve danışan devamlılığını yöneten bir ürüne dönüşebilir.

## 12. Kaynaklar

- Proje içi: `docs/features.md`, `docs/frontend.md`, `docs/architecture.md`, `docs/current-state.md`, `docs/database.md` ve raporda adı geçen ilgili bileşen/server/migration dosyaları.
- [ABC Trainerize özellikleri](https://www.trainerize.com/features/) — AI workout builder, beslenme, alışkanlık, iletişim, ödeme, otomasyon ve entegrasyonlar.
- [TrueCoach ürün sayfası](https://truecoach.co/) — program builder, uyum oranları, ödeme ve koç dashboard konumlandırması.
- [My PT Hub özellikleri](https://www.mypthub.net/features/) — otomatik check-in, şablonlar, toplu atama, markalama, ödeme ve wearable entegrasyonları.
- [Everfit AI](https://everfit.io/ai/) — metinden yapılandırılmış antrenman oluşturma ve AI'ın ürün içindeki konumu.
- [Kocha](https://www.kocha.co/) — Türkiye pazarında AI, akıllı form, ödeme ve mobil uygulama konumlandırması.
- [WellCell](https://www.wellcell.app/) — Türkiye pazarında günlük akış, AI plan, gelir analitiği ve mobil deneyim.
- [iyzico abonelik entegrasyonu](https://docs.iyzico.com/urunler/abonelik/abonelik-entegrasyonu) ve [ödeme planı API'si](https://docs.iyzico.com/on-hazirliklar/api-reference-beta/abonelik/odeme-plani) — tekrarlı ödeme ve webhook yetenekleri.
- [WhatsApp Business Policy](https://whatsappbusiness.com/policy/) — mesaj şablonu, 24 saat penceresi ve otomasyon/insana geçiş gereklilikleri.
