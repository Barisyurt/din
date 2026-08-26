import { Redis } from "@upstash/redis";

// Singleton Upstash Redis istemcisi
// UPSTASH_REDIS_REST_URL ve UPSTASH_REDIS_REST_TOKEN ortam değişkenleri gereklidir
const redis = Redis.fromEnv();

export default redis;
