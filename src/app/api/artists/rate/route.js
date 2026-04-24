import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// POST: Venue rates an artist after a completed gig
export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { artistId, gigId, rating, review } = body;

    if (!artistId || !gigId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Artist ID, gig ID, and rating (1-5) are required.' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Verify the gig exists and this venue owns it
    const gig = await db.collection('gigs').findOne({ _id: new ObjectId(gigId) });
    if (!gig) {
      return NextResponse.json({ error: 'Gig not found' }, { status: 404 });
    }
    if (gig.venueId !== userId) {
      return NextResponse.json({ error: 'Only the gig owner can rate' }, { status: 403 });
    }
    if (gig.confirmedArtist !== artistId) {
      return NextResponse.json({ error: 'Artist was not confirmed for this gig' }, { status: 400 });
    }

    // Check if already rated
    const existingRating = await db.collection('ratings').findOne({ gigId, artistId, venueId: userId });
    if (existingRating) {
      return NextResponse.json({ error: 'Already rated for this gig' }, { status: 409 });
    }

    // Save the rating
    await db.collection('ratings').insertOne({
      artistId,
      venueId: userId,
      gigId,
      rating: Number(rating),
      review: review || '',
      createdAt: new Date(),
    });

    // Update the artist's average rating
    const allRatings = await db.collection('ratings').find({ artistId }).toArray();
    const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;

    await db.collection('artists').updateOne(
      { clerkUserId: artistId },
      {
        $set: {
          rating: Math.round(avgRating * 10) / 10,
          totalRatings: allRatings.length,
        },
      }
    );

    return NextResponse.json({ success: true, averageRating: avgRating });
  } catch (error) {
    console.error('Error rating artist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
