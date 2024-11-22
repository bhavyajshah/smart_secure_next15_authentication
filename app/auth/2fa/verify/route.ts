import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import User from '@/lib/models/user';
import { verifyTOTP } from '@/lib/2fa';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { code } = await req.json();
    await connectDB();
    const user = await User.findOne({ email: session.user.email });

    if (!user.twoFactorSecret) {
      return NextResponse.json(
        { error: '2FA not set up' },
        { status: 400 }
      );
    }

    const isValid = verifyTOTP(user.twoFactorSecret, code);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    user.twoFactorEnabled = true;
    await user.save();

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify 2FA code' },
      { status: 500 }
    );
  }
}