import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'KVKK Aydınlatma Metni',
}

export default function ClarificationTextPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">KVKK Aydınlatma Metni</h1>
      <div className="prose prose-slate max-w-none">
        <p className="text-sm text-muted-foreground mb-4">Son Güncelleme: 1 Ocak 2026</p>
        
        <p>
          6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, veri sorumlusu sıfatıyla NexCoach ("Şirket") olarak, kişisel verilerinizin işlenmesi, korunması ve haklarınız hakkında sizi bilgilendirmek istiyoruz.
        </p>

        <h2>1. Hangi Kişisel Verileriniz İşleniyor?</h2>
        <p>
          Ad-soyad, iletişim bilgileri, antrenman hedefleri, yaş, boy, kilo gibi sağlık ve performans verileriniz uygulamanın amacı doğrultusunda işlenmektedir.
        </p>

        <h2>2. Kişisel Verilerinizin İşlenme Amacı</h2>
        <p>
          Verileriniz; size uygun antrenman/beslenme programlarının oluşturulması, platform üzerinden hizmet alabilmeniz ve koçunuz ile iletişimin sağlanması amacıyla işlenmektedir.
        </p>

        <h2>3. Kişisel Verilerinizin Aktarımı</h2>
        <p>
          Kişisel verileriniz, kanuni yükümlülüklerimizin yerine getirilmesi amacıyla yetkili kamu kurumlarıyla ve sadece hizmet aldığınız koçunuzla paylaşılmaktadır. Üçüncü şahıslara ticari amaçla veri aktarımı yapılmaz.
        </p>

        <h2>4. İlgili Kişi Olarak Haklarınız</h2>
        <p>
          KVKK'nın 11. maddesi uyarınca; verilerinizin işlenip işlenmediğini öğrenme, işlenme amacına uygun kullanılıp kullanılmadığını bilme, eksik/yanlış ise düzeltilmesini ve silinmesini talep etme hakkına sahipsiniz.
        </p>

        <p className="text-sm italic text-muted-foreground mt-12 border-t pt-4">
          Bu metin örnek bir şablondur ve hukuki geçerliliği yoktur. Proje yayına girmeden önce ilgili hukuki metinlerle değiştirilmelidir.
        </p>
      </div>
    </div>
  )
}
