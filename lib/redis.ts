import { Redis } from "@upstash/redis";

// Upstash Redis istemcisi — Vercel KV ve Upstash env değişkenlerini fallback olarak destekler
const url =
  process.env.KV_REST_API_URL ||
  process.env.UPSTASH_REDIS_REST_URL;

const token =
  process.env.KV_REST_API_TOKEN ||
  process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  console.error(
    "[Redis] HATA: Upstash Redis ortam değişkenleri eksik!\n" +
    "  UPSTASH_REDIS_REST_URL veya KV_REST_API_URL gereklidir.\n" +
    "  UPSTASH_REDIS_REST_TOKEN veya KV_REST_API_TOKEN gereklidir."
  );
}

const redis = new Redis({ url: url!, token: token! });

export default redis;
