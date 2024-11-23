import { parsePhoneNumberFromString } from 'libphonenumber-js';
import crypto from 'crypto';

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneNumber = parsePhoneNumberFromString(phone);
  return phoneNumber ? phoneNumber.isValid() : false;
};

export const formatPhoneNumber = (phone: string): string => {
  const phoneNumber = parsePhoneNumberFromString(phone);
  return phoneNumber ? phoneNumber.formatInternational() : phone;
};

export const maskPhoneNumber = (phone: string): string => {
  const phoneNumber = parsePhoneNumberFromString(phone);
  if (!phoneNumber) return phone;

  const national = phoneNumber.formatNational();
  const parts = national.split(' ');
  const lastPart = parts[parts.length - 1];
  return national.replace(lastPart, '*'.repeat(lastPart.length));
};