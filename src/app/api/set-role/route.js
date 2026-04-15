import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const VALID_ROLES = ['artist', 'venue'];

export async function POST(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { role } = body;

    if (!role || !VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be "artist" or "venue".' },
        { status: 400 }
      );
    }

    // Update the user's public metadata with their role
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role,
        onboardingComplete: true,
      },
    });

    return NextResponse.json({ success: true, role });
  } catch (error) {
    console.error('Error setting role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
