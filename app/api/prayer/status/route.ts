import { Redis } from "@upstash/redis";

export const runtime = "nodejs";

const redis = Redis.fromEnv();

export async function POST(req: Request) {
  console.log("[/api/prayer/status] POST alindi");

  let body: {
    userId: string;
    prayerName: string;
    completed: boolean;
    date: string;
  };

  try {
    body = await req.json();
    console.log("[/api/prayer/status] Body:", body);
  } catch (e) {
    console.error("[/api/prayer/status] JSON parse hatasi:", e);
    return Response.json({ success: false, error: "Gecersiz JSON" }, { status: 400 });
  }

  const { userId, prayerName, completed, date } = body;

  if (!userId || !prayerName || typeof completed !== "boolean" || !date) {
    console.warn("[/api/prayer/status] Eksik parametre:", body);
    return Response.json(
      { success: false, error: "userId, prayerName, completed, date zorunludur" },
      { status: 400 }
    );
  }

  const key = `user:${userId}:prayers:${date}`;
  console.log(`[/api/prayer/status] hset ${key} { ${prayerName}: ${completed} }`);

  await redis.hset(key, { [prayerName]: completed });
  await redis.expire(key, 172800); // 48 saat TTL

  console.log("[/api/prayer/status] Redis yazma basarili");

  return Response.json({ success: true, key, body });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const date = searchParams.get("date");

  if (!userId || !date) {
    return Response.json({ error: "userId ve date gerekli" }, { status: 400 });
  }

  const key = `user:${userId}:prayers:${date}`;
  const data = await redis.hgetall(key);
  console.log("[/api/prayer/status] GET sonucu:", key, data);

  return Response.json({ success: true, key, data: data || {} });
}
