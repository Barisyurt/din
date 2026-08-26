import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";

export const runtime = "nodejs";

interface PrayerStatusBody {
  clientId: string;
  date: string; // YYYY-MM-DD
  prayer: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
  completed: boolean;
}

/**
 * POST /api/prayer/status
 * Kullanıcının belirtilen tarih ve vakit için namaz kılma durumunu günceller.
 * Redis Key: prayer:{clientId}:{YYYY-MM-DD}
 * TTL: 48 saat (172800 saniye)
 */
export async function POST(req: NextRequest) {
  console.log("[/api/prayer/status] POST isteği alındı");

  try {
    let body: PrayerStatusBody;
    try {
      body = await req.json();
    } catch (parseErr) {
      console.error("[/api/prayer/status] JSON parse hatası:", parseErr);
      return NextResponse.json({ error: "Geçersiz JSON gövdesi." }, { status: 400 });
    }

    const { clientId, date, prayer, completed } = body;

    console.log("[/api/prayer/status] Gelen veri:", { clientId, date, prayer, completed });

    if (!clientId || !date || !prayer || typeof completed !== "boolean") {
      console.warn("[/api/prayer/status] Eksik parametreler:", { clientId, date, prayer, completed });
      return NextResponse.json(
        { error: "Eksik parametreler: clientId, date, prayer ve completed zorunludur." },
        { status: 400 }
      );
    }

    const redisKey = `prayer:${clientId}:${date}`;

    // Mevcut durumu oku (varsa)
    console.log("[/api/prayer/status] Redis'ten okunuyor:", redisKey);
    const existing = await redis.get<string>(redisKey);
    let currentStatus: Record<string, boolean> = {
      fajr: false,
      dhuhr: false,
      asr: false,
      maghrib: false,
      isha: false,
    };

    if (existing) {
      try {
        currentStatus =
          typeof existing === "string" ? JSON.parse(existing) : (existing as Record<string, boolean>);
        console.log("[/api/prayer/status] Mevcut durum okundu:", currentStatus);
      } catch (parseErr) {
        console.warn("[/api/prayer/status] Mevcut durum parse edilemedi, sıfırlanıyor:", parseErr);
      }
    } else {
      console.log("[/api/prayer/status] Mevcut kayıt yok, yeni oluşturuluyor.");
    }

    // İlgili vakit durumunu güncelle
    currentStatus[prayer] = completed;

    // Redis'e kaydet (TTL: 48 saat)
    console.log("[/api/prayer/status] Redis'e yazılıyor:", redisKey, "->", currentStatus);
    await redis.set(redisKey, JSON.stringify(currentStatus), { ex: 172800 });

    console.log("[/api/prayer/status] ✅ Başarıyla güncellendi. prayer:", prayer, "completed:", completed);
    return NextResponse.json({ success: true, status: currentStatus });
  } catch (err) {
    console.error("[/api/prayer/status] ❌ Sunucu hatası:", err);
    return NextResponse.json(
      { error: "Sunucu hatası oluştu.", detail: String(err) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/prayer/status?clientId=xxx&date=YYYY-MM-DD
 * Belirtilen tarih için kullanıcının namaz durumunu döndürür.
 */
export async function GET(req: NextRequest) {
  console.log("[/api/prayer/status] GET isteği alındı");

  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");
    const date = searchParams.get("date");

    if (!clientId || !date) {
      return NextResponse.json(
        { error: "clientId ve date parametreleri gerekli." },
        { status: 400 }
      );
    }

    const redisKey = `prayer:${clientId}:${date}`;
    const existing = await redis.get<string>(redisKey);

    if (!existing) {
      return NextResponse.json({
        fajr: false,
        dhuhr: false,
        asr: false,
        maghrib: false,
        isha: false,
      });
    }

    const status =
      typeof existing === "string" ? JSON.parse(existing) : existing;
    console.log("[/api/prayer/status] GET sonucu:", status);
    return NextResponse.json(status);
  } catch (err) {
    console.error("[/api/prayer/status] ❌ GET Sunucu hatası:", err);
    return NextResponse.json({ error: "Sunucu hatası.", detail: String(err) }, { status: 500 });
  }
}
