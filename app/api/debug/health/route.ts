import { NextResponse } from "next/server";
import redis from "@/lib/redis";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/debug/health
 * Redis bağlantısını ve ortam değişkenlerini kontrol eder.
 * Sadece geliştirme/hata ayıklama için kullanın.
 */
export async function GET() {
  const checks: Record<string, unknown> = {};

  // 1. Ortam değişkeni kontrolleri
  checks.env = {
    hasUpstashUrl: !!process.env.UPSTASH_REDIS_REST_URL,
    hasUpstashToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
    hasKvUrl: !!process.env.KV_REST_API_URL,
    hasKvToken: !!process.env.KV_REST_API_TOKEN,
    hasVapidPublic: !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    hasVapidPrivate: !!process.env.VAPID_PRIVATE_KEY,
    hasVapidSubject: !!process.env.VAPID_SUBJECT,
    effectiveUrl:
      (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "").slice(0, 40) + "...",
  };

  // 2. Redis ping testi
  try {
    const pingResult = await redis.ping();
    checks.redis = { status: "OK", ping: pingResult };

    // 3. Redis yazma/okuma testi
    const testKey = `health_check_${Date.now()}`;
    await redis.set(testKey, "ok", { ex: 60 });
    const readBack = await redis.get(testKey);
    await redis.del(testKey);
    checks.redisReadWrite = { status: readBack === "ok" ? "OK" : "FAIL", readBack };

    // 4. Kayıtlı abone sayısı
    const subscriberCount = await redis.scard("subscribers");
    checks.subscriberCount = subscriberCount;
  } catch (err) {
    checks.redis = { status: "ERROR", error: String(err) };
  }

  const allOk =
    (checks.env as Record<string, unknown>).hasUpstashUrl ||
    (checks.env as Record<string, unknown>).hasKvUrl;

  return NextResponse.json(
    { ok: allOk, timestamp: new Date().toISOString(), checks },
    { status: 200 }
  );
}
