import Redis from 'ioredis';

// Don't initialize Redis in Edge Runtime
const isEdgeRuntime = process.env.NEXT_RUNTIME === 'edge';

let redis: Redis | null = null;

if (!isEdgeRuntime && process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });
}

export const cacheGet = async <T>(key: string): Promise<T | null> => {
  if (!redis) return null;
  const data = await redis.get(key);
  if (!data) return null;
  return JSON.parse(data);
};

export const cacheSet = async (
  key: string,
  value: any,
  expireSeconds?: number
): Promise<void> => {
  if (!redis) return;
  await redis.set(key, JSON.stringify(value));
  if (expireSeconds) {
    await redis.expire(key, expireSeconds);
  }
};

export const cacheDelete = async (key: string): Promise<void> => {
  if (!redis) return;
  await redis.del(key);
};

export default redis;