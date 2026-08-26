import { NextResponse } from "next/server";
import webpush from "web-push";
import { Redis } from "@upstash/redis";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/push/test",
    description: "Web Push Test Endpoint — POST { userId } to trigger test push notification",
  });
}

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "userId parametresi eksik" }, { status: 400 });
    }

    const subject = process.env.VAPID_SUBJECT || "mailto:info@domain.com";
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;

    if (!publicKey || !privateKey) {
      return NextResponse.json({ error: "VAPID anahtarları eksik" }, { status: 500 });
    }

    webpush.setVapidDetails(subject, publicKey, privateKey);

    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

    if (!url || !token) {
      return NextResponse.json({ error: "Redis ortam değişkenleri eksik" }, { status: 500 });
    }

    const redis = new Redis({ url, token });

    // 1. Önce user:${userId}:subscription dene
    let subData = await redis.get(`user:${userId}:subscription`);
    
    // 2. Bulunamadıysa sub:${userId} dene
    if (!subData) {
      subData = await redis.get(`sub:${userId}`);
    }

    if (!subData) {
      return NextResponse.json({ error: `Bu kullanıcı (${userId}) için abonelik bulunamadı` }, { status: 404 });
    }

    const subscription = typeof subData === "string" ? JSON.parse(subData) : subData;

    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: "Din Asistanı",
        body: "Namaz vakti bildirimleri başarıyla aktif edildi! 🔔",
        url: "/vakitler",
      })
    );

    return NextResponse.json({ success: true, message: "Test bildirimi gönderildi" });
  } catch (err: unknown) {
    console.error("Push test hatası:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
