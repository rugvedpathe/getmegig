import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// POST — Artist applies to a gig
export async function POST(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gigId } = await params;
    const db = await getDb();

    // Verify artist profile
    const artist = await db.collection('artists').findOne({ clerkUserId: userId });
    if (!artist) {
      return NextResponse.json({ error: 'Artist profile not found' }, { status: 404 });
    }

    // Verify gig exists and is active
    const gig = await db.collection('gigs').findOne({ _id: gigId, status: 'active' });
    if (!gig) {
      return NextResponse.json({ error: 'Gig not found or not active' }, { status: 404 });
    }

    // Check if already applied
    if (gig.applicants?.includes(userId)) {
      return NextResponse.json({ error: 'Already applied to this gig' }, { status: 400 });
    }

    // Add artist to applicants
    await db.collection('gigs').updateOne(
      { _id: gigId },
      {
        $addToSet: { applicants: userId },
        $set: { updatedAt: new Date() },
      }
    );

    // Create notification for venue
    await db.collection('notifications').insertOne({
      recipientId: gig.venueId,
      type: 'new_application',
      gigId,
      gigTitle: gig.title,
      artistId: userId,
      artistName: artist.fullName,
      read: false,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error applying to gig:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
