import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kullanıcı Sözleşmesi',
}

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Kullanıcı Sözleşmesi</h1>
      <div className="prose prose-slate max-w-none">
        <p className="text-sm text-muted-foreground mb-4">Son Güncelleme: 1 Ocak 2026</p>
        
        <h2>1. Taraflar</h2>
        <p>
          İşbu Kullanıcı Sözleşmesi ("Sözleşme"), NexCoach platformunu ("Platform") kullanan kullanıcılar ("Kullanıcı") ile NexCoach ("Şirket") arasında, Kullanıcı'nın Platform'a kayıt olması anında elektronik ortamda akdedilmiştir.
        </p>

        <h2>2. Konu</h2>
        <p>
          İşbu Sözleşme'nin konusu, Kullanıcı'nın Platform'dan faydalanma şartlarının ve tarafların hak ve yükümlülüklerinin belirlenmesidir.
        </p>

        <h2>3. Kullanıcının Hak ve Yükümlülükleri</h2>
        <p>
          3.1. Kullanıcı, Platform'a kayıt olurken verdiği bilgilerin doğru ve güncel olduğunu kabul eder.<br />
          3.2. Kullanıcı, Platform'u yasalara ve işbu Sözleşme şartlarına uygun olarak kullanmayı kabul eder.<br />
          3.3. Kullanıcı, hesabına ait şifrenin güvenliğinden kendisi sorumludur.
        </p>

        <h2>4. Şirketin Hak ve Yükümlülükleri</h2>
        <p>
          4.1. Şirket, Platform'un kesintisiz ve hatasız çalışması için makul çabayı gösterecektir.<br />
          4.2. Şirket, dilediği zaman Platform'un içeriğini ve hizmetlerini değiştirme hakkını saklı tutar.
        </p>

        <h2>5. Gizlilik ve Kişisel Veriler</h2>
        <p>
          Kullanıcı'nın kişisel verilerinin işlenmesine ilişkin detaylar <a href="/sozlesmeler/gizlilik-politikasi" className="text-primary hover:underline">Gizlilik Politikası</a>'nda ve <a href="/sozlesmeler/aydinlatma-metni" className="text-primary hover:underline">Aydınlatma Metni</a>'nde yer almaktadır.
        </p>

        <p className="text-sm italic text-muted-foreground mt-12 border-t pt-4">
          Bu metin örnek bir şablondur ve hukuki geçerliliği yoktur. Proje yayına girmeden önce ilgili hukuki metinlerle değiştirilmelidir.
        </p>
      </div>
    </div>
  )
}
