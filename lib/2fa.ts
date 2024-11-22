import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export const generateTOTPSecret = () => {
  return speakeasy.generateSecret({
    name: process.env.NEXT_PUBLIC_APP_URL || 'SecureAuth',
  });
};

export const generateTOTPQRCode = async (secret: string): Promise<string> => {
  const otpauthUrl = speakeasy.otpauthURL({
    secret,
    label: process.env.NEXT_PUBLIC_APP_URL || 'SecureAuth',
    algorithm: 'sha1',
  });

  return QRCode.toDataURL(otpauthUrl);
};

export const verifyTOTP = (secret: string, token: string): boolean => {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 1,
  });
};