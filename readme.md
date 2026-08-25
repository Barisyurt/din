# İslami Rehber - Huzur ve İbadet Asistanı

Modern, hızlı, mobil ve web uyumlu web tabanlı İslami rehber uygulaması.

---

## 🚀 Ana Modüller

### 1. Zikirmatik (`/zikirmatik`)
- **Sayaç Ekranı:** Ortada büyük, modern dokunmatik sayaç düğmesi ve dinamik SVG Dairesel İlerleme Halkası (Progress Ring).
- **Hızlı Kontroller:** Sıfırla (Reset), 1 Eksilt (-1), Ses Aç/Kapat ve Titreşim Aç/Kapat butonları.
- **Hedef ve Titreşim:** 33, 99, 500, 1000 ve Sınırsız hedef seçenekleri. Hedefe ulaşıldığında melodik uyarı sesi, titreşim uyarısı (`navigator.vibrate`) ve tebrik ekranı.
- **Hazır Zikir Listesi & Özel Zikir Ekleme:** Sübhanallah, Elhamdülillah, Allahuekber, Lâ ilâhe illallâh, Estağfirullah, Salavat-ı Şerife ve özel zikir ekleme modülü.
- **Kalıcılık:** `localStorage` entegrasyonu ile son çekilen sayı ve seçili zikir saklanır.

### 2. Ezan Vakitleri (`/vakitler`)
- **Diyanet Standartı API:** Aladhan API (`method=13`) ile 6 ezan vakti (İmsak, Güneş, Öğle, İkindi, Akşam, Yatsı) ile Miladi ve Hicri takvim tarihleri.
- **Akıllı Konum Önceliği:** GPS hassas koordinatları veya 81 İl Arama Modalı.
- **"Mevcut Konumu Kullan" (GPS'e Dön) Butonu:** Tek tıkla koordinat moduna geri dönme.
- **Canlı Geri Sayım Sayacı:** Bir sonraki ezan vaktine ne kadar kaldığını anlık hesaplayan `HH : MM : SS` dijital geri sayım sayacı.
- **LocalStorage Kalıcılığı:** Seçilen şehir otomatik hafızada tutulur.

### 3. Kur'an-ı Kerim & Mealler (`/kuran`)
- **Veri Kaynağı:** Al-Quran Cloud API ile 114 Sure listesi ve canlı arama.
- **Ayet Okuma Modu:** Sağdan sola (RTL) Uthmani Arapça metin ve Türkçe Diyanet Meali.
- **Sesli Tilavet (Audio Player):** Şeyh Mişari Râşid el-Afasî (Alafasy) CDN ses akışı. Ayet bazında Çal/Durdur ve otomatik ardışık dinleme.
- **Yazı Boyutu Ölçekleme:** Arapça metin puntosunu dinamik büyütüp küçültme (A-, A+) butonları.
- **"Kaldığın Yerden Devam Et":** Ayet bazında *"Burada Kaldım"* (Yer İmi Ekle) kaydı ve ana ekranda hızlı devam et kartı.

### 4. Kıble Pusulası (`/kible`)
- **Kıble Açısı Hesaplama (Great-Circle Formülü):** Kabe koordinatlarına (`lat: 21.4225, lng: 39.8262`) göre hassas Kıble Açısı (Bearing) ve Kabe Mesafesi (KM) hesabı.
- **Cihaz Yönelim Entegrasyonu:** Mobil `DeviceOrientation` sensör desteği ve iOS Safari izin mekanizması.
- **±3° Hizalama & Titreşim Uyarısı:** Hizalanma anında dokunsal titreşim ve parlayan zümrüt *"Kıble Yönüne Hizalandınız"* rozeti.
- **Masaüstü & Sensörsüz Cihaz Fallback:** Sensörsüz cihazlar ve masaüstü bilgisayarlar için pusula simülatörü slider'ı ve derece göstergesi.

### 5. Günlük Namaz Takip ve Akıllı Hatırlatıcı (`/vakitler`)
- **5 Vakit Checklist:** Sabah, Öğle, İkindi, Akşam, Yatsı namazlarının kılındı olarak işaretlenmesi ve günlük ilerleme çubuğu (örn: 3/5 kılındı - %60).
- **Tarih Bazlı Kalıcılık:** Verilerin `localStorage` üzerinde tarih bazlı (`namaz_tracker_YYYY-MM-DD`) saklanması; her gece 00:00'da kutuların sıfırlanıp geçmişin korunması.
- **Akıllı Bildirim Sistemi:** Bir sonraki vaktin girmesine 15 dakika kala, eğer mevcut vaktin namazı kılınmadıysa `Notification API` ile kullanıcıya masaüstü/mobil hatırlatma bildirimi gönderilmesi.

---

## 🛠️ Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için:

```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirici sunucusunu başlatın
npm run dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açarak uygulamayı kullanabilirsiniz.
