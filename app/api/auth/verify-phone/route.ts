import { NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/db';
import User from '@/lib/models/user';

const verifyPhoneSchema = z.object({
  code: z.string().length(6),
  token: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, token } = verifyPhoneSchema.parse(body);

    await connectDB();

    const user = await User.findOne({
      phoneVerificationCode: code,
      phoneVerificationCodeExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    user.isPhoneVerified = true;
    user.phoneVerificationCode = undefined;
    user.phoneVerificationCodeExpiry = undefined;
    await user.save();

    return NextResponse.json(
      { message: 'Phone number verified successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Phone verification error:', error);
    return NextResponse.json(
      { error: 'Phone verification failed' },
      { status: 500 }
    );
  }
}