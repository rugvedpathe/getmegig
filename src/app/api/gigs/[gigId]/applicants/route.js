import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// GET — View all applicants and invited artists for a gig
export async function GET(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gigId } = await params;
    const db = await getDb();

    const gig = await db.collection('gigs').findOne({ _id: gigId, venueId: userId });
    if (!gig) {
      return NextResponse.json({ error: 'Gig not found' }, { status: 404 });
    }

    // Get all unique artist IDs (applicants + invited)
    const allArtistIds = [...new Set([
      ...(gig.applicants || []),
      ...(gig.invitedArtists || []),
    ])];

    // Fetch artist profiles
    const artists = allArtistIds.length > 0
      ? await db.collection('artists')
          .find({ clerkUserId: { $in: allArtistIds } })
          .project({ clerkUserId: 1, fullName: 1, genre: 1, city: 1, priceRange: 1, bio: 1, socialLink: 1, photoUrl: 1 })
          .toArray()
      : [];

    // Tag each artist with their source
    const result = artists.map(artist => ({
      ...artist,
      isApplicant: gig.applicants?.includes(artist.clerkUserId) || false,
      isInvited: gig.invitedArtists?.includes(artist.clerkUserId) || false,
      isShortlisted: gig.shortlist?.includes(artist.clerkUserId) || false,
    }));

    return NextResponse.json({
      gig: {
        _id: gig._id,
        title: gig.title,
        genre: gig.genre,
        date: gig.date,
        status: gig.status,
        confirmedArtist: gig.confirmedArtist,
        shortlist: gig.shortlist || [],
      },
      artists: result,
    });
  } catch (error) {
    console.error('Error fetching applicants:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST — Update shortlist / confirm artist
export async function POST(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gigId } = await params;
    const body = await req.json();
    const { artistId, action } = body; // action: 'shortlist' | 'remove' | 'confirm'

    if (!artistId || !action) {
      return NextResponse.json({ error: 'artistId and action required' }, { status: 400 });
    }

    const db = await getDb();
    const gig = await db.collection('gigs').findOne({ _id: gigId, venueId: userId });
    if (!gig) {
      return NextResponse.json({ error: 'Gig not found' }, { status: 404 });
    }

    if (action === 'shortlist') {
      await db.collection('gigs').updateOne(
        { _id: gigId },
        { $addToSet: { shortlist: artistId }, $set: { updatedAt: new Date() } }
      );
    } else if (action === 'remove') {
      await db.collection('gigs').updateOne(
        { _id: gigId },
        { $pull: { shortlist: artistId }, $set: { updatedAt: new Date() } }
      );
    } else if (action === 'confirm') {
      await db.collection('gigs').updateOne(
        { _id: gigId },
        {
          $set: {
            confirmedArtist: artistId,
            status: 'confirmed',
            updatedAt: new Date(),
          },
        }
      );

      // Notify confirmed artist
      const venue = await db.collection('venues').findOne({ clerkUserId: userId });
      await db.collection('notifications').insertOne({
        recipientId: artistId,
        type: 'gig_confirmed',
        gigId,
        gigTitle: gig.title,
        venueName: venue?.venueName || 'A venue',
        read: false,
        createdAt: new Date(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating applicants:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
