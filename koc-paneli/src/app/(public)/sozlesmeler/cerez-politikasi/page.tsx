import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Çerez Politikası',
}

export default function CookiePolicyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Çerez (Cookie) Politikası</h1>
      <div className="prose prose-slate max-w-none">
        <p className="text-sm text-muted-foreground mb-4">Son Güncelleme: 1 Ocak 2026</p>
        
        <p>
          NexCoach platformunda ("Platform"), size daha iyi bir kullanıcı deneyimi sunabilmek ve temel fonksiyonları sağlayabilmek adına çerezler kullanmaktayız.
        </p>

        <h2>1. Çerez Nedir?</h2>
        <p>
          Çerezler, bir web sitesini ziyaret ettiğinizde tarayıcınız veya cihazınız üzerinden cihazınıza depolanan küçük metin dosyalarıdır.
        </p>

        <h2>2. Hangi Çerezleri Kullanıyoruz?</h2>
        <p>
          <strong>Zorunlu Çerezler:</strong> Platformun çalışması, üye girişi yapabilmeniz ve oturumunuzun açık kalabilmesi (session yönetimi) için zorunlu olan çerezlerdir. Bu çerezlerin kullanımı onayınıza tabi değildir.<br />
          <strong>İşlevsellik Çerezleri:</strong> Çerez onay tercihiniz (örneğin "Çerez onay kutusunu kapattı") gibi tercihlerinizi hatırlamak için kullanılır.
        </p>

        <h2>3. Çerez Yönetimi</h2>
        <p>
          Tarayıcınızın ayarlarını değiştirerek çerezlere ilişkin tercihlerinizi kişiselleştirme imkanına sahipsiniz. Ancak zorunlu çerezleri engellemeniz durumunda platformun oturum açma gibi temel fonksiyonlarından yararlanamayabilirsiniz.
        </p>

        <p className="text-sm italic text-muted-foreground mt-12 border-t pt-4">
          Bu metin örnek bir şablondur ve hukuki geçerliliği yoktur. Proje yayına girmeden önce ilgili hukuki metinlerle değiştirilmelidir.
        </p>
      </div>
    </div>
  )
}
