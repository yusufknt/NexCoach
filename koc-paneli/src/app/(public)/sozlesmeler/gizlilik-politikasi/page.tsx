import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gizlilik Politikası',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Gizlilik Politikası</h1>
      <div className="prose prose-slate max-w-none">
        <p className="text-sm text-muted-foreground mb-4">Son Güncelleme: 1 Ocak 2026</p>
        
        <p>
          NexCoach ("Biz" veya "Şirket"), kullanıcılarımızın ("Siz") gizliliğini korumaya büyük önem vermektedir. Bu Gizlilik Politikası, platformumuzu kullanırken topladığımız bilgileri nasıl işlediğimizi açıklamaktadır.
        </p>

        <h2>Toplanan Bilgiler</h2>
        <p>
          Platformumuza kayıt olurken ve kullanırken bize sağladığınız Ad, Soyad, E-posta adresi, fiziksel özellikleriniz, hedefleriniz ve platform içi etkileşimleriniz (mesajlar, programlar) tarafımızca kaydedilmektedir.
        </p>

        <h2>Bilgilerin Kullanımı</h2>
        <p>
          Topladığımız bilgiler, size daha iyi bir koçluk deneyimi sunmak, hesap güvenliğinizi sağlamak, hizmetlerimizi geliştirmek ve yasal yükümlülüklerimizi yerine getirmek amacıyla kullanılmaktadır.
        </p>

        <h2>Bilgilerin Paylaşımı</h2>
        <p>
          Kişisel verileriniz, yasal zorunluluklar haricinde hiçbir üçüncü taraf ile paylaşılmaz. Sadece hizmet aldığınız koçunuz, size özel program oluşturabilmek amacıyla profil bilgilerinize erişebilir.
        </p>

        <h2>Çerezler (Cookies)</h2>
        <p>
          Platformumuzda oturum yönetimi ve kullanıcı deneyimini iyileştirmek için çerezler kullanılmaktadır. Detaylı bilgi için <a href="/sozlesmeler/cerez-politikasi" className="text-primary hover:underline">Çerez Politikamızı</a> inceleyebilirsiniz.
        </p>

        <p className="text-sm italic text-muted-foreground mt-12 border-t pt-4">
          Bu metin örnek bir şablondur ve hukuki geçerliliği yoktur. Proje yayına girmeden önce ilgili hukuki metinlerle değiştirilmelidir.
        </p>
      </div>
    </div>
  )
}
