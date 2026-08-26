import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getRedisClient(): Redis | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;
  return new Redis({ url, token });
}

export async function POST(req: NextRequest) {
  console.log("[/api/push/subscribe] POST isteği alındı");

  try {
    const body = await req.json();
    const userId = body.userId || body.clientId;
    const { subscription, city } = body;

    if (!userId || !subscription?.endpoint || !subscription?.keys) {
      return NextResponse.json(
        { error: "Eksik parametreler: userId/clientId ve subscription zorunludur." },
        { status: 400 }
      );
    }

    const payload = {
      userId,
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      city: city || "İstanbul",
      updatedAt: new Date().toISOString(),
    };

    const redis = getRedisClient();
    if (redis) {
      // 1. Anahtar: user:${userId}:subscription
      await redis.set(`user:${userId}:subscription`, JSON.stringify(payload));

      // 2. Anahtar: sub:${userId} (Cron uyumluluğu için)
      await redis.set(`sub:${userId}`, JSON.stringify(payload));

      // 3. Genel liste: subscriptions (SET formatında JSON)
      await redis.sadd("subscriptions", JSON.stringify(payload));

      // 4. Genel liste: subscribers (SET formatında userId)
      await redis.sadd("subscribers", userId);

      console.log("[/api/push/subscribe] ✅ Redis'e kaydedildi:", userId);
    } else {
      console.warn("[/api/push/subscribe] Redis bağlantısı yok, env değişkenlerini kontrol edin.");
    }

    return NextResponse.json({ success: true, userId, payload });
  } catch (err) {
    console.error("[/api/push/subscribe] ❌ Hata:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId || body.clientId;

    if (!userId) {
      return NextResponse.json({ error: "userId/clientId gerekli." }, { status: 400 });
    }

    const redis = getRedisClient();
    if (redis) {
      await redis.del(`user:${userId}:subscription`);
      await redis.del(`sub:${userId}`);
      await redis.srem("subscribers", userId);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
