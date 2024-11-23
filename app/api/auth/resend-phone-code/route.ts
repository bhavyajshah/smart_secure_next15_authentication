import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/user';
import { generateOTP } from '@/lib/utils/phone';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    await connectDB();

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    const verificationCode = generateOTP();
    user.phoneVerificationCode = verificationCode;
    user.phoneVerificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // In a real application, you would integrate with an SMS service here
    console.log(`New verification code for ${user.phone}: ${verificationCode}`);

    return NextResponse.json(
      { message: 'Verification code sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Resend verification code error:', error);
    return NextResponse.json(
      { error: 'Failed to resend verification code' },
      { status: 500 }
    );
  }
}