import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// GET: Public venue profile (for the detail page)
export async function GET(req, { params }) {
  try {
    const { venueId } = await params;
    const db = await getDb();

    const venue = await db.collection('venues').findOne(
      { clerkUserId: venueId },
      {
        projection: {
          _id: 0,
          clerkUserId: 1,
          venueName: 1, city: 1, venueType: 1, capacity: 1,
          // Media
          venueDescription: 1, venuePhotos: 1,
          instagramHandle: 1, websiteUrl: 1, operatingHours: 1,
          // Stage & Sound
          stageType: 1, stageDimensions: 1, soundSystem: 1,
          soundSystemDetails: 1, hasBackline: 1, backlineDetails: 1,
          lightingSetup: 1, lightingDetails: 1,
          microphoneCount: 1, monitorCount: 1,
          // Logistics (hide address — only for confirmed artists)
          parkingAvailable: 1, greenRoomAvailable: 1,
          soundCheckPolicy: 1, paymentTerms: 1,
          ageRestriction: 1, foodDrinkForArtists: 1,
          // Preferences
          preferredGenres: 1, pastArtists: 1, averageBudget: 1,
          // Exclude: address, googleMapsLink, contactPerson (private)
        },
      }
    );

    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    // Fetch active gigs by this venue
    const activeGigs = await db.collection('gigs')
      .find({ venueId, status: 'active' })
      .project({ title: 1, date: 1, genre: 1, budget: 1, duration: 1 })
      .sort({ date: 1 })
      .limit(5)
      .toArray();

    return NextResponse.json({ venue, activeGigs });
  } catch (error) {
    console.error('Error fetching public venue profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
