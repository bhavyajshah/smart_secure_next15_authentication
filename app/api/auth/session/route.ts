import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '../[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    return NextResponse.json(session);
  } catch (error) {
    console.error('Session error:', error);
    return new NextResponse(null, { status: 500 });
  }
}