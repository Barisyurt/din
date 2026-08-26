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
  try {
    const body: SubscribeBody = await req.json();
    const { clientId, subscription, city } = body;

    if (!clientId || !subscription?.endpoint || !subscription?.keys || !city) {
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
    await redis.set(`sub:${clientId}`, JSON.stringify(payload));

    // Kolay tarama için üye indexi güncelle
    await redis.sadd("subscribers", clientId);

    return NextResponse.json({ success: true, clientId });
  } catch (err) {
    console.error("[/api/push/subscribe] Error:", err);
    return NextResponse.json(
      { error: "Sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/push/subscribe
 * Kullanıcının push aboneliğini Redis'ten siler (bildirim kapatma).
 */
export async function DELETE(req: NextRequest) {
  try {
    const { clientId } = await req.json();
    if (!clientId) {
      return NextResponse.json({ error: "clientId gerekli." }, { status: 400 });
    }

    await redis.del(`sub:${clientId}`);
    await redis.srem("subscribers", clientId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/push/subscribe] DELETE Error:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
