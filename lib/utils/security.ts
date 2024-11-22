import crypto from 'crypto';
import { authenticator } from 'otplib';
import geoip from 'geoip-lite';
import UAParser from 'ua-parser-js';

export const generateOTP = () => {
  return authenticator.generate(crypto.randomBytes(32).toString('hex'));
};

export const verifyOTP = (token: string, secret: string) => {
  return authenticator.verify({ token, secret });
};

export const generateBackupCodes = (count: number = 10): string[] => {
  return Array.from({ length: count }, () =>
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );
};

export const getDeviceInfo = (userAgent: string, ip: string) => {
  const parser = new UAParser(userAgent);
  const geo = geoip.lookup(ip);

  return {
    deviceType: parser.getDevice().type || 'desktop',
    browser: `${parser.getBrowser().name} ${parser.getBrowser().version}`,
    os: `${parser.getOS().name} ${parser.getOS().version}`,
    ip,
    location: geo ? `${geo.city}, ${geo.country}` : undefined,
  };
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = crypto.randomBytes(16).toString('hex');
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      resolve(salt + ':' + derivedKey.toString('hex'));
    });
  });
};

export const verifyPassword = async (
  storedPassword: string,
  suppliedPassword: string
): Promise<boolean> => {
  const [salt, hash] = storedPassword.split(':');
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(suppliedPassword, salt, 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      resolve(hash === derivedKey.toString('hex'));
    });
  });
};