import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import connectDB from '@/lib/db';
import User from '@/lib/models/user';
import { createNotification } from '@/lib/utils/notifications';
import { authOptions } from '@/utils/authActions';

const updateSubscriptionSchema = z.object({
  subscription: z.enum(['free', 'premium', 'enterprise']),
});

export async function PATCH(
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

    const body = await req.json();
    const { subscription } = updateSubscriptionSchema.parse(body);

    await connectDB();

    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const oldSubscription = user.subscription;
    user.subscription = subscription;
    await user.save();

    // Create notification for the user
    await createNotification(
      user,
      'info',
      'Subscription Updated',
      `Your subscription has been updated from ${oldSubscription} to ${subscription}`
    );

    return NextResponse.json({
      message: 'Subscription updated successfully',
      subscription: user.subscription
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}