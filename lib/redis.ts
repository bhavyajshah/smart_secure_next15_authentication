import Redis from 'ioredis';

// Don't initialize Redis in Edge Runtime
const isEdgeRuntime = process.env.NEXT_RUNTIME === 'edge';

let redis: Redis | null = null;

// Only try to connect to Redis if REDIS_URL is provided
if (!isEdgeRuntime && process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });
} else {
  // Fallback functions when Redis is not available
}

export const cacheGet = async <T>(key: string): Promise<T | null> => {
  if (!redis) return null;
  try {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
};

export const cacheSet = async (
  key: string,
  value: any,
  expireSeconds?: number
): Promise<void> => {
  if (!redis) return;
  try {
    await redis.set(key, JSON.stringify(value));
    if (expireSeconds) {
      await redis.expire(key, expireSeconds);
    }
  } catch (error) {
    console.error('Redis set error:', error);
  }
};

export const cacheDelete = async (key: string): Promise<void> => {
  if (!redis) return;
  try {
    await redis.del(key);
  } catch (error) {
    console.error('Redis delete error:', error);
  }
};

export default redis;