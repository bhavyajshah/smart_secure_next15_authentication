import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import User from '@/lib/models/user';
import { cacheGet, cacheSet } from '@/lib/redis';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Try to get stats from cache
    const cacheKey = 'dashboard:stats';
    const cachedStats = await cacheGet(cacheKey);

    if (cachedStats) {
      return NextResponse.json(cachedStats);
    }

    // Calculate real-time statistics
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const usersBySubscription = await User.aggregate([
      { $group: { _id: '$subscription', count: { $sum: 1 } } }
    ]);

    const recentLogins = await User.aggregate([
      { $unwind: '$loginHistory' },
      { $sort: { 'loginHistory.timestamp': -1 } },
      { $limit: 10 },
      {
        $project: {
          email: 1,
          timestamp: '$loginHistory.timestamp',
          success: '$loginHistory.success',
          location: '$loginHistory.location'
        }
      }
    ]);

    const stats = {
      totalUsers,
      verifiedUsers,
      activeUsers,
      usersByRole: Object.fromEntries(
        usersByRole.map(({ _id, count }) => [_id, count])
      ),
      usersBySubscription: Object.fromEntries(
        usersBySubscription.map(({ _id, count }) => [_id, count])
      ),
      recentLogins
    };

    // Cache the results for 5 minutes
    await cacheSet(cacheKey, stats, 300);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}