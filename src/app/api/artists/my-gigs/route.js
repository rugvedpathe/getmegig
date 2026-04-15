import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// GET — Fetch artist's applied gigs
export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();

    // Find gigs where this artist is in applicants or invitedArtists
    const appliedGigs = await db.collection('gigs')
      .find({ applicants: userId })
      .project({ gigId: 1, title: 1, date: 1, genre: 1, budget: 1, venueName: 1, venueCity: 1, status: 1, confirmedArtist: 1 })
      .sort({ date: 1 })
      .toArray();

    const invitedGigs = await db.collection('gigs')
      .find({ invitedArtists: userId })
      .project({ gigId: 1, title: 1, date: 1, genre: 1, budget: 1, venueName: 1, venueCity: 1, status: 1, confirmedArtist: 1 })
      .sort({ date: 1 })
      .toArray();

    const confirmedGigs = await db.collection('gigs')
      .find({ confirmedArtist: userId })
      .project({ gigId: 1, title: 1, date: 1, genre: 1, budget: 1, venueName: 1, venueCity: 1, status: 1 })
      .sort({ date: 1 })
      .toArray();

    return NextResponse.json({ appliedGigs, invitedGigs, confirmedGigs });
  } catch (error) {
    console.error('Error fetching artist gigs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
