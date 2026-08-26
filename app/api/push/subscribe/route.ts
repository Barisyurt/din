import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";

export const runtime = "nodejs";

interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

interface SubscribeBody {
  clientId: string;
  subscription: {
    endpoint: string;
    keys: PushSubscriptionKeys;
  };
  city: string;
}

/**
 * POST /api/push/subscribe
 * Kullanıcının Web Push subscription bilgilerini ve seçtiği şehri Redis'e kaydeder.
 * Redis Key: sub:{clientId}
 */
export async function POST(req: NextRequest) {
  console.log("[/api/push/subscribe] POST isteği alındı");

  try {
    let body: SubscribeBody;
    try {
      body = await req.json();
    } catch (parseErr) {
      console.error("[/api/push/subscribe] JSON parse hatası:", parseErr);
      return NextResponse.json({ error: "Geçersiz JSON gövdesi." }, { status: 400 });
    }

    const { clientId, subscription, city } = body;

    console.log("[/api/push/subscribe] Gelen veri:", {
      clientId,
      city,
      endpointPrefix: subscription?.endpoint?.slice(0, 60),
      hasKeys: !!subscription?.keys,
    });

    if (!clientId || !subscription?.endpoint || !subscription?.keys || !city) {
      console.warn("[/api/push/subscribe] Eksik parametreler:", { clientId, city, hasEndpoint: !!subscription?.endpoint, hasKeys: !!subscription?.keys });
      return NextResponse.json(
        { error: "Eksik parametreler: clientId, subscription, city zorunludur." },
        { status: 400 }
      );
    }

    const payload = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      city,
      updatedAt: new Date().toISOString(),
    };

    // Redis'e kaydet — TTL yok (kalıcı subscription)
    console.log("[/api/push/subscribe] Redis'e yazılıyor: sub:", clientId);
    await redis.set(`sub:${clientId}`, JSON.stringify(payload));

    // Kolay tarama için üye seti güncelle
    await redis.sadd("subscribers", clientId);

    console.log("[/api/push/subscribe] ✅ Başarıyla kaydedildi. clientId:", clientId, "city:", city);
    return NextResponse.json({ success: true, clientId });
  } catch (err) {
    console.error("[/api/push/subscribe] ❌ Sunucu hatası:", err);
    return NextResponse.json(
      { error: "Sunucu hatası oluştu.", detail: String(err) },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/push/subscribe
 * Kullanıcının push aboneliğini Redis'ten siler (bildirim kapatma).
 */
export async function DELETE(req: NextRequest) {
  console.log("[/api/push/subscribe] DELETE isteği alındı");
  try {
    const { clientId } = await req.json();
    if (!clientId) {
      return NextResponse.json({ error: "clientId gerekli." }, { status: 400 });
    }

    await redis.del(`sub:${clientId}`);
    await redis.srem("subscribers", clientId);

    console.log("[/api/push/subscribe] ✅ Abonelik silindi. clientId:", clientId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/push/subscribe] ❌ DELETE Sunucu hatası:", err);
    return NextResponse.json({ error: "Sunucu hatası.", detail: String(err) }, { status: 500 });
  }
}
