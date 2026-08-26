import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";

// Redis istemcisi — KV_REST_API_* veya UPSTASH_REDIS_REST_* ortam değişkenlerini destekler
const redis = new Redis({
  url: (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL)!,
  token: (process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN)!,
});

type PrayerKey = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

interface PrayerStatusBody {
  clientId: string;
  date: string;       // YYYY-MM-DD
  prayer: PrayerKey;
  completed: boolean;
}

/**
 * POST /api/prayer/status
 * Namaz kılma durumunu Redis hash'e (hset) kaydeder.
 * Redis Key  : prayer:{clientId}:{YYYY-MM-DD}
 * Redis Field: fajr | dhuhr | asr | maghrib | isha
 * TTL        : 48 saat
 */
export async function POST(req: NextRequest) {
  console.log("[/api/prayer/status] POST alındı");

  let body: PrayerStatusBody;
  try {
    body = await req.json();
  } catch (parseErr) {
    console.error("[/api/prayer/status] JSON parse hatası:", parseErr);
    return NextResponse.json({ error: "Geçersiz JSON gövdesi." }, { status: 400 });
  }

  const { clientId, date, prayer, completed } = body;

  console.log("[/api/prayer/status] Gelen veri:", { clientId, date, prayer, completed });

  // Parametre doğrulama
  if (!clientId || !date || !prayer || typeof completed !== "boolean") {
    console.warn("[/api/prayer/status] Eksik parametre:", { clientId, date, prayer, completed });
    return NextResponse.json(
      { error: "Eksik parametreler: clientId, date, prayer ve completed zorunludur." },
      { status: 400 }
    );
  }

  const validPrayers: PrayerKey[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
  if (!validPrayers.includes(prayer)) {
    return NextResponse.json({ error: `Geçersiz prayer değeri: ${prayer}` }, { status: 400 });
  }

  const redisKey = `prayer:${clientId}:${date}`;

  try {
    // hset ile ilgili vakit alanını güncelle
    console.log(`[/api/prayer/status] hset ${redisKey} { ${prayer}: ${completed} }`);
    await redis.hset(redisKey, { [prayer]: completed ? "1" : "0" });

    // Mevcut tüm alanları oku
    const allFields = await redis.hgetall(redisKey);
    console.log("[/api/prayer/status] Güncel Redis hash:", allFields);

    // 48 saatlik TTL uygula (expire)
    await redis.expire(redisKey, 172800);

    const status = {
      fajr:    allFields?.fajr    === "1",
      dhuhr:   allFields?.dhuhr   === "1",
      asr:     allFields?.asr     === "1",
      maghrib: allFields?.maghrib === "1",
      isha:    allFields?.isha    === "1",
    };

    console.log("[/api/prayer/status] ✅ Başarıyla güncellendi:", status);
    return NextResponse.json({ success: true, status });
  } catch (err) {
    console.error("[/api/prayer/status] ❌ Redis hatası:", err);
    return NextResponse.json(
      { error: "Redis kayıt hatası.", detail: String(err) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/prayer/status?clientId=xxx&date=YYYY-MM-DD
 * Belirtilen tarih için kullanıcının namaz durumunu döndürür.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  const date = searchParams.get("date");

  if (!clientId || !date) {
    return NextResponse.json(
      { error: "clientId ve date parametreleri gerekli." },
      { status: 400 }
    );
  }

  try {
    const redisKey = `prayer:${clientId}:${date}`;
    const allFields = await redis.hgetall(redisKey);

    const status = {
      fajr:    allFields?.fajr    === "1",
      dhuhr:   allFields?.dhuhr   === "1",
      asr:     allFields?.asr     === "1",
      maghrib: allFields?.maghrib === "1",
      isha:    allFields?.isha    === "1",
    };

    console.log("[/api/prayer/status] GET sonucu:", { clientId, date, status });
    return NextResponse.json({ success: true, status });
  } catch (err) {
    console.error("[/api/prayer/status] ❌ GET Redis hatası:", err);
    return NextResponse.json({ error: "Redis okuma hatası.", detail: String(err) }, { status: 500 });
  }
}
