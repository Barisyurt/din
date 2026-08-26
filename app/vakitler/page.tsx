"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  MapPin,
  Navigation,
  Search,
  X,
  Clock,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Calendar,
  RefreshCw,
  AlertCircle,
  CheckSquare,
  Square,
  Bell,
  BellOff,
  Check,
  Award,
} from "lucide-react";

interface TimingsData {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string;
}

interface DateInfo {
  gregorian: string;
  hijri: string;
}

interface PrayerSlot {
  id: string;
  name: string;
  time: string;
  icon: typeof Sun;
}

interface PrayerTrackerState {
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
}

const TURKEY_CITIES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya",
  "Ardahan", "Artvin", "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik",
  "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum",
  "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir",
  "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Iğdır", "Isparta", "İstanbul",
  "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kırıkkale",
  "Kırklareli", "Kırşehir", "Kilis", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa",
  "Mardin", "Mersin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Osmaniye",
  "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Şanlıurfa", "Şırnak",
  "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak"
];

const POPULAR_CITIES = ["İstanbul", "Ankara", "İzmir", "Bursa", "Konya", "Antalya", "Gaziantep", "Adana"];

// Kalıcı clientId üret (localStorage)
function getOrCreateClientId(): string {
  if (typeof window === "undefined") return "";
  const existing = localStorage.getItem("din_client_id");
  if (existing) return existing;
  const newId = `cid_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem("din_client_id", newId);
  return newId;
}

// VAPID public key'i Uint8Array'e çevir
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function VakitlerPage() {
  const [locationMode, setLocationMode] = useState<"GPS" | "MANUAL">("MANUAL");
  const [selectedCity, setSelectedCity] = useState<string>("İstanbul");
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [timings, setTimings] = useState<TimingsData | null>(null);
  const [dateInfo, setDateInfo] = useState<DateInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [showCityModal, setShowCityModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [nextPrayerIndex, setNextPrayerIndex] = useState<number>(0);
  const [timeRemainingText, setTimeRemainingText] = useState<string>("00 : 00 : 00");

  const todayDateKey = useMemo(() => new Date().toISOString().split("T")[0], []);

  const [prayerTracker, setPrayerTracker] = useState<PrayerTrackerState>({
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false,
  });

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");
  const [isPushSubscribed, setIsPushSubscribed] = useState<boolean>(false);
  const [pushLoading, setPushLoading] = useState<boolean>(false);
  const hasNotified15MinRef = useRef<Record<string, boolean>>({});

  // ─── Yardımcı: Mevcut push subscription durumunu kontrol et ─────────────
  const checkPushSubscription = useCallback(async () => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setIsPushSubscribed(!!sub);
    } catch {}
  }, []);

  // ─── Başlangıç: LocalStorage yükle ──────────────────────────────────────
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem("vakit_location_mode") as "GPS" | "MANUAL" | null;
      const savedCity = localStorage.getItem("vakit_selected_city");
      const savedTracker = localStorage.getItem(`namaz_tracker_${todayDateKey}`);

      if (savedCity) setSelectedCity(savedCity);
      if (savedTracker) setPrayerTracker(JSON.parse(savedTracker));

      if (typeof window !== "undefined" && "Notification" in window) {
        setNotificationPermission(Notification.permission);
      }

      checkPushSubscription();

      if (savedMode === "GPS") {
        requestGPSLocation();
      } else {
        setLocationMode("MANUAL");
        fetchTimingsByCity(savedCity || "İstanbul");
      }
    } catch (e) {
      console.error("LocalStorage load error:", e);
      fetchTimingsByCity("İstanbul");
    }
  }, [todayDateKey, checkPushSubscription]);

  // ─── Namaz vakti işaretleme ────────────────────────────────
  const handleTogglePrayerCheck = useCallback(async (id: keyof PrayerTrackerState) => {
    const newValue = !prayerTracker[id];
    const updated = { ...prayerTracker, [id]: newValue };

    // 1. Anında UI güncelle
    setPrayerTracker(updated);

    // 2. LocalStorage güncelle
    try {
      localStorage.setItem(`namaz_tracker_${todayDateKey}`, JSON.stringify(updated));
    } catch (e) {
      console.error("[Prayer] LocalStorage kayit hatasi:", e);
    }

    // 3. clientId al
    let clientId = "";
    try { clientId = getOrCreateClientId(); } catch (e) {
      console.error("[Prayer] clientId olusturulamadi:", e);
    }

    console.log("[Prayer] API istegi gonderiliyor ->", { clientId, date: todayDateKey, prayer: id, completed: newValue });

    if (!clientId) {
      console.warn("[Prayer] clientId bos, API istegi atlaniyor.");
      return;
    }

    // 4. API üzerinden Redis'e kaydet
    try {
      const res = await fetch("/api/prayer/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, date: todayDateKey, prayer: id, completed: newValue }),
      });
      const data = await res.json();
      if (res.ok) {
        console.log("[Prayer] API basarili ->", data);
      } else {
        console.error("[Prayer] API hata ->", res.status, data);
      }
    } catch (err) {
      console.error("[Prayer] Fetch hatasi:", err);
    }
  }, [prayerTracker, todayDateKey]);

  // ─── Web Push Aboneliği ───────────────────────────────────────────────────
  const handleTogglePushNotification = useCallback(async () => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("Bu tarayıcı Web Push bildirimlerini desteklemiyor.");
      return;
    }

    setPushLoading(true);

    try {
      // Bildirim izni iste
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission !== "granted") {
        alert("Bildirim izni verilmedi. Tarayıcı ayarlarından izin verebilirsiniz.");
        setPushLoading(false);
        return;
      }

      const reg = await navigator.serviceWorker.ready;

      if (isPushSubscribed) {
        // ─── Aboneliği İptal Et ───────────────────────────────────────────
        const existingSub = await reg.pushManager.getSubscription();
        if (existingSub) {
          await existingSub.unsubscribe();
        }
        const clientId = getOrCreateClientId();
        if (clientId) {
          await fetch("/api/push/subscribe", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clientId }),
          });
        }
        setIsPushSubscribed(false);
        setNotificationPermission("default");
      } else {
        // ─── Yeni Abonelik Oluştur ────────────────────────────────────────
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidKey) {
          console.error("NEXT_PUBLIC_VAPID_PUBLIC_KEY eksik!");
          alert("Bildirim yapılandırması eksik. Lütfen daha sonra tekrar deneyin.");
          setPushLoading(false);
          return;
        }

        const subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey).buffer as ArrayBuffer,
        });

        const clientId = getOrCreateClientId();
        const subJson = subscription.toJSON();

        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientId,
            subscription: {
              endpoint: subJson.endpoint,
              keys: subJson.keys,
            },
            city: selectedCity,
          }),
        });

        setIsPushSubscribed(true);

        // Başarı bildirimi
        if (reg.showNotification) {
          await reg.showNotification("Ezan Hatırlatıcı Etkinleştirildi 🔔", {
            body: "Vaktin çıkmasına 15 dakika kala namazınızı kılmadıysanız kilit ekranına bildirim alacaksınız.",
            icon: "/icons/icon-192x192.png",
          });
        }
      }
    } catch (err) {
      console.error("Push subscription error:", err);
      alert("Bildirim etkinleştirilirken bir hata oluştu.");
    } finally {
      setPushLoading(false);
    }
  }, [isPushSubscribed, selectedCity]);

  // ─── Şehir değiştirildiğinde subscription'ı güncelle ────────────────────
  const updateSubscriptionCity = useCallback(async (newCity: string) => {
    if (!isPushSubscribed) return;
    const clientId = getOrCreateClientId();
    if (!clientId) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (!sub) return;
      const subJson = sub.toJSON();
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          subscription: { endpoint: subJson.endpoint, keys: subJson.keys },
          city: newCity,
        }),
      });
    } catch (err) {
      console.warn("[Push] Şehir güncelleme hatası:", err);
    }
  }, [isPushSubscribed]);

  // ─── API Çağrıları ────────────────────────────────────────────────────────
  const fetchTimingsByCity = async (cityName: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const sanitizedCity = cityName
        .replace(/ğ/g, "g").replace(/Ğ/g, "G")
        .replace(/ü/g, "u").replace(/Ü/g, "U")
        .replace(/ş/g, "s").replace(/Ş/g, "S")
        .replace(/ı/g, "i").replace(/İ/g, "I")
        .replace(/ö/g, "o").replace(/Ö/g, "O")
        .replace(/ç/g, "c").replace(/Ç/g, "C");

      const response = await fetch(
        `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(sanitizedCity)}&country=Turkey&method=13`
      );
      const data = await response.json();

      if (data && data.code === 200 && data.data) {
        setTimings(data.data.timings);
        const gDate = data.data.date.readable || "";
        const hDate = `${data.data.date.hijri.day} ${data.data.date.hijri.month.tr || data.data.date.hijri.month.en} ${data.data.date.hijri.year}`;
        setDateInfo({ gregorian: gDate, hijri: hDate });
      } else {
        throw new Error("Vakit verisi alınamadı");
      }
    } catch (err) {
      console.error("API error:", err);
      setErrorMsg("Ezan vakitleri yüklenirken bir sorun oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTimingsByCoords = async (lat: number, lng: number) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch(
        `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=13`
      );
      const data = await response.json();

      if (data && data.code === 200 && data.data) {
        setTimings(data.data.timings);
        const gDate = data.data.date.readable || "";
        const hDate = `${data.data.date.hijri.day} ${data.data.date.hijri.month.tr || data.data.date.hijri.month.en} ${data.data.date.hijri.year}`;
        setDateInfo({ gregorian: gDate, hijri: hDate });
      } else {
        throw new Error("Koordinat vakit verisi alınamadı");
      }
    } catch (err) {
      console.error("API Coords error:", err);
      setErrorMsg("Konum bazlı vakitler alınamadı. Manuel şehir vakitleri gösteriliyor.");
      fetchTimingsByCity(selectedCity);
    } finally {
      setIsLoading(false);
    }
  };

  const requestGPSLocation = () => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserCoords({ lat, lng });
          setLocationMode("GPS");
          localStorage.setItem("vakit_location_mode", "GPS");
          fetchTimingsByCoords(lat, lng);
        },
        (error) => {
          console.warn("GPS Permission denied or error:", error);
          setLocationMode("MANUAL");
          localStorage.setItem("vakit_location_mode", "MANUAL");
          fetchTimingsByCity(selectedCity);
        },
        { timeout: 10000 }
      );
    } else {
      setLocationMode("MANUAL");
      fetchTimingsByCity(selectedCity);
    }
  };

  const handleSelectCity = (cityName: string) => {
    setSelectedCity(cityName);
    setLocationMode("MANUAL");
    localStorage.setItem("vakit_selected_city", cityName);
    localStorage.setItem("vakit_location_mode", "MANUAL");
    setShowCityModal(false);
    fetchTimingsByCity(cityName);
    updateSubscriptionCity(cityName);
  };

  // ─── Prayer Slots & Checklist ─────────────────────────────────────────────
  const prayerSlots: PrayerSlot[] = useMemo(() => {
    if (!timings) return [];
    return [
      { id: "fajr", name: "İmsak", time: timings.Fajr, icon: Moon },
      { id: "sunrise", name: "Güneş", time: timings.Sunrise, icon: Sunrise },
      { id: "dhuhr", name: "Öğle", time: timings.Dhuhr, icon: Sun },
      { id: "asr", name: "İkindi", time: timings.Asr, icon: Sun },
      { id: "maghrib", name: "Akşam", time: timings.Maghrib, icon: Sunset },
      { id: "isha", name: "Yatsı", time: timings.Isha, icon: Moon },
    ];
  }, [timings]);

  const checklistItems = useMemo(() => {
    if (!timings) return [];
    return [
      { id: "fajr" as keyof PrayerTrackerState, name: "Sabah", time: timings.Fajr },
      { id: "dhuhr" as keyof PrayerTrackerState, name: "Öğle", time: timings.Dhuhr },
      { id: "asr" as keyof PrayerTrackerState, name: "İkindi", time: timings.Asr },
      { id: "maghrib" as keyof PrayerTrackerState, name: "Akşam", time: timings.Maghrib },
      { id: "isha" as keyof PrayerTrackerState, name: "Yatsı", time: timings.Isha },
    ];
  }, [timings]);

  const completedCount = useMemo(() => Object.values(prayerTracker).filter(Boolean).length, [prayerTracker]);
  const trackerProgressPercent = Math.round((completedCount / 5) * 100);

  // ─── Countdown Timer ──────────────────────────────────────────────────────
  const updateCountdown = useCallback(() => {
    if (!prayerSlots || prayerSlots.length === 0) return;

    const now = new Date();
    const currentTotalSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

    const slotsInSec = prayerSlots.map((slot) => {
      const [h, m] = slot.time.split(":").map((v) => parseInt(v, 10));
      return h * 3600 + m * 60;
    });

    let foundNextIdx = -1;
    let secondsDiff = 0;

    for (let i = 0; i < slotsInSec.length; i++) {
      if (slotsInSec[i] > currentTotalSec) {
        foundNextIdx = i;
        secondsDiff = slotsInSec[i] - currentTotalSec;
        break;
      }
    }

    if (foundNextIdx === -1) {
      foundNextIdx = 0;
      const secondsUntilMidnight = 86400 - currentTotalSec;
      secondsDiff = secondsUntilMidnight + slotsInSec[0];
    }

    setNextPrayerIndex(foundNextIdx);

    const hrs = Math.floor(secondsDiff / 3600);
    const mins = Math.floor((secondsDiff % 3600) / 60);
    const secs = secondsDiff % 60;

    setTimeRemainingText(
      `${hrs.toString().padStart(2, "0")} : ${mins.toString().padStart(2, "0")} : ${secs.toString().padStart(2, "0")}`
    );

    // Yedek: Push bildirim sistemi yoksa tarayıcı Notification API ile hatırlat
    if (secondsDiff <= 900 && secondsDiff > 840) {
      const nextPrayerSlot = prayerSlots[foundNextIdx];
      const trackerKey = nextPrayerSlot.id as keyof PrayerTrackerState;

      if (
        trackerKey &&
        !prayerTracker[trackerKey] &&
        !hasNotified15MinRef.current[nextPrayerSlot.id] &&
        notificationPermission === "granted" &&
        !isPushSubscribed
      ) {
        hasNotified15MinRef.current[nextPrayerSlot.id] = true;
        try {
          new Notification("Ezan Vakti Yaklaşıyor! 🕌", {
            body: `Henüz ${nextPrayerSlot.name} vakti namazınızı kılmadınız. Vaktin girmesine 15 dakika kaldı!`,
            icon: "/icons/icon-192x192.png",
          });
        } catch (err) {
          console.warn("Notification trigger error:", err);
        }
      }
    }
  }, [prayerSlots, prayerTracker, notificationPermission, isPushSubscribed]);

  useEffect(() => {
    updateCountdown();
    const timerId = setInterval(updateCountdown, 1000);
    return () => clearInterval(timerId);
  }, [updateCountdown]);

  const filteredCities = TURKEY_CITIES.filter((c) =>
    c.toLocaleLowerCase("tr").includes(searchQuery.toLocaleLowerCase("tr"))
  );

  const nextPrayer = prayerSlots[nextPrayerIndex] || { name: "İmsak", time: "--:--" };

  // Bildirim butonu durumu
  const notifButtonClass = isPushSubscribed
    ? "btn-notification-toggle enabled"
    : notificationPermission === "granted"
    ? "btn-notification-toggle"
    : "btn-notification-toggle";

  return (
    <div className="vakitler-wrapper">
      {/* Location Bar & City Selector Header */}
      <div className="location-bar-card">
        <div className="location-info-left">
          <div className="location-icon-bg">
            <MapPin size={22} />
          </div>
          <div>
            <div className="location-city-name">
              <span>{locationMode === "GPS" ? "Mevcut Konum" : selectedCity}</span>
            </div>
            <div className="location-status-tag">
              <span className="live-dot" style={{ width: "5px", height: "5px" }}></span>
              <span>{locationMode === "GPS" ? "GPS Hassas Konum" : "Türkiye / Diyanet"}</span>
            </div>
          </div>
        </div>

        <div className="location-actions-right">
          {locationMode === "MANUAL" ? (
            <button
              className="btn-location-action gps-btn"
              onClick={requestGPSLocation}
              title="GPS Konumumu Kullan"
              id="btn-use-gps"
            >
              <Navigation size={15} />
              <span>GPS</span>
            </button>
          ) : null}

          <button
            className="btn-location-action"
            onClick={() => setShowCityModal(true)}
            id="btn-open-city-modal"
          >
            <span>Şehir Değiştir</span>
          </button>
        </div>
      </div>

      {/* Countdown Hero Card */}
      <div className="countdown-hero-card">
        <div className="next-prayer-badge">
          <Clock size={14} />
          <span>Sıradaki Vakit</span>
        </div>
        <div className="next-prayer-name">
          {nextPrayer.name} ({nextPrayer.time})
        </div>
        <div className="timer-digits-wrapper">{timeRemainingText}</div>

        {dateInfo && (
          <div className="date-info-footer">
            <Calendar size={14} />
            <span>{dateInfo.gregorian}</span>
            <span>•</span>
            <span>{dateInfo.hijri}</span>
          </div>
        )}
      </div>

      {/* ─── GÜNLÜK NAMAZ TAKİP VE AKILLI HATIRLATICI KARTI ─── */}
      <div className="namaz-tracker-card" id="card-namaz-tracker">
        <div className="tracker-header-row">
          <div className="tracker-title-box">
            <div className="tracker-icon-badge">
              <Award size={22} />
            </div>
            <div>
              <h3 className="tracker-main-title">Günlük Namaz Takibi</h3>
              <p className="tracker-subtitle">Bugünün Namaz Çetelesi</p>
            </div>
          </div>

          <button
            className={notifButtonClass}
            onClick={handleTogglePushNotification}
            id="btn-toggle-notifications"
            disabled={pushLoading}
            title={isPushSubscribed ? "Kilit Ekranı Bildirimlerini Kapat" : "Kilit Ekranı Bildirimi Etkinleştir"}
          >
            {pushLoading ? (
              <>
                <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} />
                <span>Yükleniyor...</span>
              </>
            ) : isPushSubscribed ? (
              <>
                <Bell size={14} />
                <span>Push Bildirim Açık</span>
              </>
            ) : (
              <>
                <BellOff size={14} />
                <span>Push Bildirim Aç</span>
              </>
            )}
          </button>
        </div>

        {/* Push Bildirim Açıklama Etiketi */}
        {isPushSubscribed && (
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--emerald-light)",
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              borderRadius: "8px",
              padding: "6px 10px",
              marginTop: "-4px",
              marginBottom: "4px",
            }}
          >
            🔔 Kilit ekranı bildirimleri aktif — vaktin çıkmasına 15 dk kala kılınmamış namazlar için uyarı alacaksınız.
          </div>
        )}

        {/* Daily Progress Bar */}
        <div className="tracker-progress-container">
          <div className="progress-info-row">
            <span className="progress-label-text">Bugünkü İlerleme</span>
            <span className="progress-percent-text">
              {completedCount} / 5 Kılındı (%{trackerProgressPercent})
            </span>
          </div>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${trackerProgressPercent}%` }}
            />
          </div>
        </div>

        {/* 5 Prayers Checklist Grid */}
        <div className="checklist-prayers-grid">
          {checklistItems.map((item) => {
            const isChecked = prayerTracker[item.id];
            return (
              <div
                key={item.id}
                className={`prayer-check-item ${isChecked ? "checked" : ""}`}
                onClick={() => handleTogglePrayerCheck(item.id)}
                id={`check-prayer-${item.id}`}
              >
                <div className="custom-checkbox-box">
                  {isChecked && <Check size={14} strokeWidth={3} />}
                </div>
                <span className="check-prayer-name">{item.name}</span>
                <span className="check-prayer-time">{item.time}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error / Loading Indicators */}
      {isLoading ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            color: "var(--text-secondary)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <RefreshCw size={28} className="spin-icon" style={{ animation: "spin 1.5s linear infinite" }} />
          <span>Ezan vakitleri güncelleniyor...</span>
        </div>
      ) : errorMsg ? (
        <div
          style={{
            padding: "16px 20px",
            borderRadius: "var(--radius-md)",
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#F87171",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "0.9rem",
          }}
        >
          <AlertCircle size={20} />
          <span>{errorMsg}</span>
        </div>
      ) : (
        /* Prayer Times 6 Slots Cards List */
        <div className="prayer-cards-list">
          {prayerSlots.map((slot, index) => {
            const isNext = index === nextPrayerIndex;
            const Icon = slot.icon;

            return (
              <div
                key={slot.id}
                className={`prayer-time-card ${isNext ? "active-next" : ""}`}
                id={`prayer-slot-${slot.id}`}
              >
                <div className="prayer-card-left">
                  <div className="prayer-icon-box">
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="prayer-name-text">{slot.name}</div>
                    {isNext && <div className="prayer-status-label">• Ezan Vakti Yaklaşıyor</div>}
                  </div>
                </div>

                <div className="prayer-time-value">{slot.time}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* City Selector Modal */}
      {showCityModal && (
        <div className="modal-overlay">
          <div className="city-modal-card">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h3 className="modal-title" style={{ fontSize: "1.25rem" }}>
                Şehir Seçimi
              </h3>
              <button
                onClick={() => setShowCityModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Field */}
            <div className="search-box-wrapper">
              <Search size={18} className="search-icon-inside" />
              <input
                type="text"
                className="search-input-field"
                placeholder="Şehir ara (Örn: Bursa, Konya...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>

            {/* Popular Cities Quick Chips */}
            <div>
              <div className="popular-cities-label">Popüler Şehirler</div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {POPULAR_CITIES.map((city) => (
                  <button
                    key={city}
                    className={`chip-btn ${selectedCity === city && locationMode === "MANUAL" ? "active" : ""}`}
                    onClick={() => handleSelectCity(city)}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable 81 Cities Grid */}
            <div>
              <div className="popular-cities-label">Tüm İller (81 İl)</div>
              <div className="cities-scroll-grid">
                {filteredCities.map((city) => {
                  const isSelected = selectedCity === city && locationMode === "MANUAL";
                  return (
                    <button
                      key={city}
                      className={`city-item-btn ${isSelected ? "selected" : ""}`}
                      onClick={() => handleSelectCity(city)}
                      id={`city-btn-${city.toLowerCase()}`}
                    >
                      {city}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
