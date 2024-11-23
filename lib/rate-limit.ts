import { RateLimiterMemory } from 'rate-limiter-flexible';

// Login rate limiter: 5 attempts per 15 minutes
const loginLimiter = new RateLimiterMemory({
  points: 5,
  duration: 15 * 60,
  blockDuration: 15 * 60, // Block for 15 minutes
});

// API rate limiter: 100 requests per minute
const apiLimiter = new RateLimiterMemory({
  points: 100,
  duration: 60,
});

// Password reset rate limiter: 3 attempts per hour
const resetLimiter = new RateLimiterMemory({
  points: 3,
  duration: 60 * 60,
  blockDuration: 60 * 60, // Block for 1 hour
});

// 2FA verification rate limiter: 3 attempts per 5 minutes
const totpLimiter = new RateLimiterMemory({
  points: 3,
  duration: 5 * 60,
  blockDuration: 5 * 60, // Block for 5 minutes
});

export const checkRateLimit = async (
  type: 'login' | 'api' | 'reset' | 'totp',
  key: string
): Promise<boolean> => {
  const limiter = {
    login: loginLimiter,
    api: apiLimiter,
    reset: resetLimiter,
    totp: totpLimiter,
  }[type];

  try {
    await limiter.consume(key);
    return true;
  } catch (error) {
    return false;
  }
};

export const resetRateLimit = async (
  type: 'login' | 'api' | 'reset' | 'totp',
  key: string
): Promise<void> => {
  const limiter = {
    login: loginLimiter,
    api: apiLimiter,
    reset: resetLimiter,
    totp: totpLimiter,
  }[type];

  await limiter.delete(key);
};