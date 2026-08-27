# 🌙 Din & İbadet Asistanı Web & Mobil Uygulaması

Modern, hafif ve kullanıcı odaklı bir İslami yaşam asistanı. İlk etapta responsive bir Progressive Web App (PWA) olarak geliştirilip, ardından mobil uygulama mağazalarına (Google Play Store) taşınması hedeflenmektedir.

---

## 📌 Proje Genel Bakış

* **Hedef Platformlar:** Web (Öncelikli PWA) ➔ Android (Play Store - TWA/Capacitor/React Native)
* **Temel Felsefe:** Offline-first (çevrimdışı çalışabilirlik), sade ve modern arayüz, düşük kaynak tüketimi.

---

## 🛠️ Önerilen Teknoloji Yığını

* **Frontend:** React.js / Next.js (TypeScript ile)
* **Styling:** Tailwind CSS + Shadcn UI / Material UI
* **State Management:** Zustand veya React Context API
* **Yerel Depolama:** `localStorage` / `IndexedDB` (Kuran metinleri ve zikir sayaçları için)
* **PWA & Mobil Paketleme:** Service Workers, Workbox, Capacitor.js (veya Android TWA)

---

## 📱 Modüller ve Detaylı Fonksiyonel Gereksinimler

### 1. Zikirmatik (Dijital Tesbihat)
* **Temel Sayaç:** Ekrana dokunma ile artan sayaç, sıfırlama ve azaltma butonları.
* **Haptik/Sesli Geri Bildirim:** Her dokunuşta opsiyonel hafif titreşim (`navigator.vibrate`) ve yumuşak tıklama sesi.
* **Hedef Belirleme:** 33, 99 veya özel hedef sayı belirleme; hedefe ulaşıldığında uzun titreşim/bildirim.
* **Hazır Zikir Listesi:** Subhanallah, Elhamdülillah, Allahuekber, Kelime-i Tevhid vb. anlamları ve faziletleriyle hazır şablonlar.
* **Yerel Kayıt:** Sayfa yenilense bile verilerin kaybolmaması (`localStorage` / `IndexedDB`).
* **Özel Zikir Ekleme:** Kullanıcının kendi belirlediği zikirleri ve hedefleri kaydedebilme alanı.

---

### 2. Ezan & Namaz Vakitleri
* **Konum Tespiti:**
  * Tarayıcı Geolocation API (`navigator.geolocation`) ile otomatik enlem/boylam alma.
  * Manuel il/ilçe seçimi (offline ve izin verilmeyen durumlar için fallback).
* **Veri Entegrasyonu:**
  * Aladhan API veya Diyanet API entegrasyonu.
  * Günlük/Aylık vakitlerin IndexedDB'ye önbelleğe alınması (offline çalışma).
* **Arayüz Elemanları:**
  * Bir sonraki vakte kalan süreyi gösteren dinamik geri sayım sayacı.
  * Günün 5 vakti + İmsak / Güneş / Kerahat göstergesi.
  * Hicri ve Miladi takvim görünümü.
* **Bildirimler:** Vakit girdiğinde Web Notification API ile sesli/sessiz bildirim desteği.

---

### 3. Kur'an-ı Kerim & Mealler
* **Ayet & Sure Listesi:** 114 surenin iniş sırası, ayet sayısı, nüzul yeri (Mekki/Medeni) ile listelenmesi.
* **Görünüm Modları:**
  * Arapça Orijinal Metin (Uthmani hat fontu desteği).
  * Türkçe Okunuş (Transkripsiyon).
  * Türkçe Mealler (Diyanet, Elmalılı Hamdi Yazır vb. meal seçimi imkanı).
* **Arama & Filtreleme:** Sure adı, cüz numarası veya meal metni içinde tam metin arama.
* **Kaldığım Yer (Bookmark):** Son okunan sure, ayet ve cüzün otomatik kaydedilmesi; favori ayet listesi.
* **Sesli Dinleme (Opsiyonel/Sonraki Aşama):** Belirli hafızlardan ayet veya sure bazlı ses çalma (Audio Player).

---

### 4. Kıble Pusulası (Qibla Direction)
* **Hesaplama Algoritması:**
  * Kabe Koordinatları: `Enlem: 21.4225° N, Boylam: 39.8262° E`
  * Kullanıcının koordinatları ile Kabe arasındaki büyük daire (Great-Circle / Haversine) yön açısının hesaplanması:
    $$\theta = \text{atan2}(\sin(\Delta \lambda) \cdot \cos(\phi_2), \cos(\phi_1) \cdot \sin(\phi_2) - \sin(\phi_1) \cdot \cos(\phi_2) \cdot \cos(\Delta \lambda))$$
* **Pusula Mekanizması:**
  * **Mobil Tarayıcılar:** `DeviceOrientationEvent` / `AbsoluteOrientationSensor` API ile cihazın baktığı açıya göre pusula iğnesinin dönmesi.
  * **Masaüstü / Sensörsüz Cihazlar:** Harita (Leaflet / Google Maps) üzerinde kullanıcının konumu ile Kabe arasına çekilen statik yön çizgisi.
* **Kalibrasyon Uyarısı:** Manyetik sapma durumunda 8 çizerek kalibrasyon yapma rehberi.

---

## 📂 Önerilen Dosya ve Proje Mimarisi

```text
din-app/
├── public/
│   ├── data/
│   │   ├── quran-ar.json
│   │   └── quran-tr-meal.json
│   ├── icons/
│   │   └── compass-needle.svg
│   ├── manifest.json
│   └── sw.js
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── BottomNavigation.tsx
│   │   ├── zikirmatik/
│   │   │   ├── Counter.tsx
│   │   │   └── PresetList.tsx
│   │   ├── prayer-times/
│   │   │   ├── CountdownCard.tsx
│   │   │   └── TimesTable.tsx
│   │   ├── quran/
│   │   │   ├── SurahList.tsx
│   │   │   └── AyahViewer.tsx
│   │   └── qibla/
│   │       ├── CompassDial.tsx
│   │       └── FallbackMap.tsx
│   ├── hooks/
│   │   ├── useCompass.ts
│   │   ├── useGeolocation.ts
│   │   └── useLocalStorage.ts
│   ├── services/
│   │   ├── prayerTimesApi.ts
│   │   └── qiblaCalculator.ts
│   ├── pages/ (veya app/)
│   │   ├── zikirmatik/
│   │   ├── vakitler/
│   │   ├── kuran/
│   │   └── kible/
│   └── types/
│       └── index.ts
├── package.json
└── README.md