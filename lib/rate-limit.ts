import { RateLimiterRedis } from 'rate-limiter-flexible';
import redis from './redis';

// Login rate limiter: 5 attempts per 15 minutes
export const loginLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'login_limit',
  points: 5,
  duration: 15 * 60,
});

// API rate limiter: 100 requests per minute
export const apiLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'api_limit',
  points: 100,
  duration: 60,
});

// Password reset rate limiter: 3 attempts per hour
export const resetLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'reset_limit',
  points: 3,
  duration: 60 * 60,
});

export const checkRateLimit = async (
  limiter: RateLimiterRedis,
  key: string
): Promise<boolean> => {
  try {
    await limiter.consume(key);
    return true;
  } catch (error) {
    return false;
  }
};