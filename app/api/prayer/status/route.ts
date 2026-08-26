import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getRedisClient(): Redis | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  return new Redis({ url, token });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") || "test_user";
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

  const redis = getRedisClient();
  if (!redis) {
    return NextResponse.json({
      status: "ok",
      endpoint: "/api/prayer/status",
      notice: "Upstash Redis environment variables (UPSTASH_REDIS_REST_URL/TOKEN or KV_REST_API_URL/TOKEN) are not set yet.",
    });
  }

  try {
    const key = `user:${userId}:prayers:${date}`;
    const data = await redis.hgetall(key);
    return NextResponse.json({
      status: "ok",
      endpoint: "/api/prayer/status",
      key,
      data: data || {},
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, prayerName, completed, date } = body;

    if (!userId || !prayerName || !date) {
      return NextResponse.json({ error: "Eksik parametre: userId, prayerName, date zorunludur." }, { status: 400 });
    }

    const redis = getRedisClient();
    if (!redis) {
      return NextResponse.json(
        {
          error: "Redis ortam değişkenleri (UPSTASH_REDIS_REST_URL/TOKEN veya KV_REST_API_URL/TOKEN) Vercel'de tanımlanmamış.",
        },
        { status: 500 }
      );
    }

    const key = `user:${userId}:prayers:${date}`;
    await redis.hset(key, { [prayerName]: completed ? "1" : "0" });
    await redis.expire(key, 172800); // 48 saat

    return NextResponse.json({ success: true, key, body });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
