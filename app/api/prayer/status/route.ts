import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const redis = Redis.fromEnv();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, prayerName, completed, date } = body;

    if (!userId || !prayerName || !date) {
      return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });
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
