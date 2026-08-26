import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import redis from "@/lib/redis";

export const runtime = "nodejs";
// Vercel Cron bu endpoint'i her dakika çağırır
export const maxDuration = 30; // saniye

// Turkish city name normalization for Aladhan API
function normalizeCityName(city: string): string {
  return city
    .replace(/ğ/g, "g").replace(/Ğ/g, "G")
    .replace(/ü/g, "u").replace(/Ü/g, "U")
    .replace(/ş/g, "s").replace(/Ş/g, "S")
    .replace(/ı/g, "i").replace(/İ/g, "I")
    .replace(/ö/g, "o").replace(/Ö/g, "O")
    .replace(/ç/g, "c").replace(/Ç/g, "C");
}

type PrayerKey = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

const PRAYER_NAMES: Record<PrayerKey, string> = {
  fajr: "Sabah",
  dhuhr: "Öğle",
  asr: "İkindi",
  maghrib: "Akşam",
  isha: "Yatsı",
};

// Aladhan API'den şehir vakitlerini çek
async function fetchPrayerTimings(city: string): Promise<Record<string, string> | null> {
  try {
    const sanitized = normalizeCityName(city);
    const res = await fetch(
      `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(sanitized)}&country=Turkey&method=13`,
      { next: { revalidate: 3600 } } // 1 saatlik cache
    );
    const data = await res.json();
    if (data?.code === 200 && data?.data?.timings) {
      return data.data.timings;
    }
    return null;
  } catch (err) {
    console.error(`[Cron] Timing fetch error for city=${city}:`, err);
    return null;
  }
}

// HH:MM formatındaki vakit stringini saniyeye çevir
function timeStringToSeconds(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 3600 + m * 60;
}

/**
 * GET /api/cron/check-prayers
 * Her dakika Vercel Cron tarafından çağrılır.
 * Akış:
 * 1. Tüm aboneleri Redis'ten al (subscribers set)
 * 2. Her abone için şehirlerine göre vakitleri çek
 * 3. Şu anki zamandan 13–17 dakika sonra biten bir vakit varsa:
 *    - O vakit için namaz kılınmamışsa Web Push gönder
 *    - Kılınmışsa atla
 *    - Bildirim gönderildiyse tekrar gönderilmesin için Redis'e flag koy
 */
export async function GET(req: NextRequest) {
  // İsteğe bağlı: Cron Secret ile güvenlik
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
    }
  }

  // VAPID yapılandırması
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@example.com";

  if (!vapidPublicKey || !vapidPrivateKey) {
    console.error("[Cron] VAPID anahtarları eksik!");
    return NextResponse.json({ error: "VAPID yapılandırması eksik." }, { status: 500 });
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  const now = new Date();
  // Türkiye saatini (UTC+3) kullan
  const turkeyNow = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const currentSeconds =
    turkeyNow.getUTCHours() * 3600 +
    turkeyNow.getUTCMinutes() * 60 +
    turkeyNow.getUTCSeconds();
  const todayStr = turkeyNow.toISOString().split("T")[0];

  // Tüm abone clientId'lerini al
  const subscriberIds = await redis.smembers("subscribers");
  if (!subscriberIds || subscriberIds.length === 0) {
    return NextResponse.json({ message: "Kayıtlı abone yok.", checked: 0 });
  }

  // Şehir bazlı vakit cache (aynı şehir için tekrar API çağrısı yapma)
  const timingsCache: Map<string, Record<string, string> | null> = new Map();

  let notifiedCount = 0;
  let checkedCount = 0;

  for (const clientId of subscriberIds) {
    checkedCount++;
    try {
      // Abone bilgilerini al
      const subRaw = await redis.get<string>(`sub:${clientId}`);
      if (!subRaw) continue;

      const sub: {
        endpoint: string;
        keys: { p256dh: string; auth: string };
        city: string;
      } = typeof subRaw === "string" ? JSON.parse(subRaw) : subRaw;

      if (!sub.endpoint || !sub.keys) continue;

      // Şehir vakitlerini al (cache kullan)
      if (!timingsCache.has(sub.city)) {
        const timings = await fetchPrayerTimings(sub.city);
        timingsCache.set(sub.city, timings);
      }
      const timings = timingsCache.get(sub.city);
      if (!timings) continue;

      // 5 Farz Namazı kontrol et (Sabah, Öğle, İkindi, Akşam, Yatsı)
      const farzPrayers: Array<{ key: PrayerKey; apiKey: string }> = [
        { key: "fajr", apiKey: "Fajr" },
        { key: "dhuhr", apiKey: "Dhuhr" },
        { key: "asr", apiKey: "Asr" },
        { key: "maghrib", apiKey: "Maghrib" },
        { key: "isha", apiKey: "Isha" },
      ];

      // Kullanıcının günlük namaz durumunu al
      const prayerStatusRaw = await redis.get<string>(`prayer:${clientId}:${todayStr}`);
      let prayerStatus: Record<PrayerKey, boolean> = {
        fajr: false,
        dhuhr: false,
        asr: false,
        maghrib: false,
        isha: false,
      };
      if (prayerStatusRaw) {
        try {
          const parsed = typeof prayerStatusRaw === "string"
            ? JSON.parse(prayerStatusRaw)
            : prayerStatusRaw;
          prayerStatus = { ...prayerStatus, ...parsed };
        } catch {}
      }

      for (const { key, apiKey } of farzPrayers) {
        const timeStr = timings[apiKey];
        if (!timeStr) continue;

        // Vaktin bitmesine kaç saniye kaldı = bir sonraki vakit zamanı - şimdiki zaman
        // 15 dakika (900 sn) kala bildirim gönder (pencere: 780–900 sn = 13-15 dk)
        // Not: API verilerindeki bitiş vakti = bir sonraki namazın başlangıcı

        // Bu farz namazın başladığı zamanı (saniye) bul
        const prayerStartSec = timeStringToSeconds(timeStr);

        // Bir sonraki farz namazı bul (bu vakitten sonraki ilk vakit)
        const currentPrayerIndex = farzPrayers.findIndex((p) => p.key === key);
        const nextPrayerIndex = (currentPrayerIndex + 1) % farzPrayers.length;
        const nextPrayer = farzPrayers[nextPrayerIndex];
        const nextPrayerTimeStr = timings[nextPrayer.apiKey];
        if (!nextPrayerTimeStr) continue;

        let nextPrayerSec = timeStringToSeconds(nextPrayerTimeStr);
        // Gece yarısı geçişi için düzelt
        if (nextPrayerSec < prayerStartSec) {
          nextPrayerSec += 86400;
        }

        // Bu namazın çıkmasına kaç saniye kaldı
        let secondsUntilEnd: number;
        if (currentSeconds <= prayerStartSec) {
          // Vakit henüz girmedi, bu namaza ait değil
          continue;
        }

        secondsUntilEnd = nextPrayerSec - currentSeconds;
        if (nextPrayerSec < currentSeconds) {
          // Gece yarısı senaryosu
          secondsUntilEnd = nextPrayerSec + 86400 - currentSeconds;
        }

        // 13-17 dakika penceresi (780–1020 sn) içinde mi?
        if (secondsUntilEnd < 780 || secondsUntilEnd > 1020) continue;

        // Bu vakit kılındı mı?
        if (prayerStatus[key] === true) continue;

        // Bu bildirim daha önce gönderildi mi? (30 dk TTL flag)
        const notifiedKey = `notified:${clientId}:${key}:${todayStr}`;
        const alreadyNotified = await redis.get(notifiedKey);
        if (alreadyNotified) continue;

        // Web Push Bildirimi Gönder
        const pushPayload = JSON.stringify({
          title: `⚠️ ${PRAYER_NAMES[key]} Vakti Bitiyor!`,
          body: `${PRAYER_NAMES[key]} vaktinin çıkmasına 15 dakika kaldı. Namazınızı kılmayı unutmayın! 🕌`,
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-192x192.png",
          data: {
            url: "/vakitler",
            prayerKey: key,
          },
        });

        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: sub.keys,
            },
            pushPayload
          );

          // Gönderildi flag'ini kaydet (TTL: 30 dk = 1800 sn)
          await redis.set(notifiedKey, "1", { ex: 1800 });
          notifiedCount++;
          console.log(`[Cron] Bildirim gönderildi: clientId=${clientId}, prayer=${key}`);
        } catch (pushErr: unknown) {
          // Geçersiz subscription (örn. kullanıcı izni iptal etti) → Redis'ten sil
          if (
            typeof pushErr === "object" &&
            pushErr !== null &&
            "statusCode" in pushErr &&
            ((pushErr as { statusCode: number }).statusCode === 410 ||
              (pushErr as { statusCode: number }).statusCode === 404)
          ) {
            console.warn(`[Cron] Geçersiz subscription, siliniyor: clientId=${clientId}`);
            await redis.del(`sub:${clientId}`);
            await redis.srem("subscribers", clientId);
          } else {
            console.error(`[Cron] Push gönderme hatası (clientId=${clientId}):`, pushErr);
          }
        }
      }
    } catch (err) {
      console.error(`[Cron] Abone işleme hatası (clientId=${clientId}):`, err);
    }
  }

  return NextResponse.json({
    success: true,
    checked: checkedCount,
    notified: notifiedCount,
    timestamp: now.toISOString(),
  });
}
