import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import User from '@/lib/models/user';
import { generateTOTPSecret, generateTOTPQRCode } from '@/lib/2fa';
import { generateBackupCodes } from '@/lib/utils/security';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });

    const secret = generateTOTPSecret();
    const qrCode = await generateTOTPQRCode(secret.base32);
    const backupCodes = generateBackupCodes();

    user.twoFactorSecret = secret.base32;
    user.backupCodes = backupCodes;
    await user.save();

    return NextResponse.json({
      qrCode,
      backupCodes
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json(
      { error: 'Failed to setup 2FA' },
      { status: 500 }
    );
  }
}