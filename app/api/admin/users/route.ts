import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import User from '@/lib/models/user';
import { cacheGet, cacheSet } from '@/lib/redis';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Try to get users from cache
    const cacheKey = 'admin:users:list';
    const cachedUsers = await cacheGet(cacheKey);

    if (cachedUsers) {
      return NextResponse.json({ users: cachedUsers });
    }

    const users = await User.find({})
      .select('email name role isVerified subscription lastLogin')
      .sort({ createdAt: -1 });

    // Cache the results for 5 minutes
    await cacheSet(cacheKey, users, 300);

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}