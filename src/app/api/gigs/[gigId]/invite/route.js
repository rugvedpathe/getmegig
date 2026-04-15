import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// POST — Venue invites an artist to a gig
export async function POST(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gigId } = await params;
    const body = await req.json();
    const { artistId } = body;

    if (!artistId) {
      return NextResponse.json({ error: 'artistId is required' }, { status: 400 });
    }

    const db = await getDb();

    // Verify gig belongs to this venue
    const gig = await db.collection('gigs').findOne({ _id: gigId, venueId: userId });
    if (!gig) {
      return NextResponse.json({ error: 'Gig not found' }, { status: 404 });
    }

    // Check if already invited
    if (gig.invitedArtists?.includes(artistId)) {
      return NextResponse.json({ error: 'Artist already invited' }, { status: 400 });
    }

    // Add to invitedArtists
    await db.collection('gigs').updateOne(
      { _id: gigId },
      {
        $addToSet: { invitedArtists: artistId },
        $set: { updatedAt: new Date() },
      }
    );

    // Create notification for artist
    const venue = await db.collection('venues').findOne({ clerkUserId: userId });
    await db.collection('notifications').insertOne({
      recipientId: artistId,
      type: 'gig_invite',
      gigId,
      gigTitle: gig.title,
      venueName: venue?.venueName || 'A venue',
      read: false,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error inviting artist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
