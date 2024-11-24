import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import User from '@/lib/models/user';
import { authOptions } from '@/utils/authActions';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(params.id).select('-password -twoFactorSecret -backupCodes');
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate user statistics
    const loginStats = {
      totalLogins: user.loginHistory.length,
      successfulLogins: user.loginHistory.filter((login: { success: any; }) => login.success).length,
      failedLogins: user.loginHistory.filter((login: { success: any; }) => !login.success).length,
      lastLoginAttempt: user.loginHistory[user.loginHistory.length - 1]?.timestamp,
    };

    const deviceStats = {
      totalDevices: user.devices.length,
      activeDevices: user.devices.filter((device: { lastActive: string | number | Date; }) =>
        new Date(device.lastActive).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
      ).length,
      deviceTypes: user.devices.reduce((acc: { [x: string]: any; }, device: { deviceType: string | number; }) => {
        acc[device.deviceType] = (acc[device.deviceType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    const securityStatus = {
      isVerified: user.isVerified,
      isPhoneVerified: user.isPhoneVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      failedLoginAttempts: user.failedLoginAttempts,
      isLocked: user.lockUntil ? new Date(user.lockUntil).getTime() > Date.now() : false,
    };

    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscription: user.subscription,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      stats: {
        login: loginStats,
        devices: deviceStats,
        security: securityStatus,
      },
    });
  } catch (error) {
    console.error('Get user details error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user details' },
      { status: 500 }
    );
  }
}