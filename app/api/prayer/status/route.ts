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
  try {
    const body: PrayerStatusBody = await req.json();
    const { clientId, date, prayer, completed } = body;

    if (!clientId || !date || !prayer || typeof completed !== "boolean") {
      return NextResponse.json(
        {
          error:
            "Eksik parametreler: clientId, date, prayer ve completed zorunludur.",
        },
        { status: 400 }
      );
    }

    const redisKey = `prayer:${clientId}:${date}`;

    // Mevcut durumu oku (varsa)
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
          typeof existing === "string" ? JSON.parse(existing) : existing;
      } catch {
        // Varsayılan hali kullan
      }
    }

    // İlgili vakit durumunu güncelle
    currentStatus[prayer] = completed;

    // Redis'e kaydet (TTL: 48 saat)
    await redis.set(redisKey, JSON.stringify(currentStatus), { ex: 172800 });

    return NextResponse.json({ success: true, status: currentStatus });
  } catch (err) {
    console.error("[/api/prayer/status] Error:", err);
    return NextResponse.json(
      { error: "Sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/prayer/status?clientId=xxx&date=YYYY-MM-DD
 * Belirtilen tarih için kullanıcının namaz durumunu döndürür.
 */
export async function GET(req: NextRequest) {
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
    return NextResponse.json(status);
  } catch (err) {
    console.error("[/api/prayer/status] GET Error:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
