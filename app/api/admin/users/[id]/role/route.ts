import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import connectDB from '@/lib/db';
import User from '@/lib/models/user';
import { createNotification } from '@/lib/utils/notifications';
import { authOptions } from '@/utils/authActions';

const updateRoleSchema = z.object({
  role: z.enum(['user', 'admin', 'moderator']),
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
    const { role } = updateRoleSchema.parse(body);

    await connectDB();

    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent changing own role
    if (user.email === session.user.email) {
      return NextResponse.json(
        { error: 'Cannot modify your own role' },
        { status: 400 }
      );
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    // Create notification for the user
    await createNotification(
      user,
      'info',
      'Role Updated',
      `Your account role has been updated from ${oldRole} to ${role}`
    );

    return NextResponse.json({
      message: 'Role updated successfully',
      role: user.role
    });
  } catch (error) {
    console.error('Update role error:', error);
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    );
  }
}