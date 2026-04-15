import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { venueName, city, venueType, capacity, contactPerson } = body;

    // Validation
    if (!venueName || !city || !venueType) {
      return NextResponse.json(
        { error: 'Venue name, city, and venue type are required.' },
        { status: 400 }
      );
    }

    const validTypes = ['Bar', 'Cafe', 'Restaurant', 'Event Space', 'Club', 'Other'];
    if (!validTypes.includes(venueType)) {
      return NextResponse.json(
        { error: 'Invalid venue type.' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Check if venue profile already exists for this user
    const existing = await db.collection('venues').findOne({ clerkUserId: userId });
    if (existing) {
      // Update existing profile
      await db.collection('venues').updateOne(
        { clerkUserId: userId },
        {
          $set: {
            venueName,
            city,
            venueType,
            capacity: capacity ? parseInt(capacity, 10) : null,
            contactPerson: contactPerson || '',
            updatedAt: new Date(),
          },
        }
      );
      return NextResponse.json({ success: true, updated: true });
    }

    // Create new venue profile — every new venue gets 3 free gig credits
    const venue = {
      clerkUserId: userId,
      venueName,
      city,
      venueType,
      capacity: capacity ? parseInt(capacity, 10) : null,
      contactPerson: contactPerson || '',
      freeGigsRemaining: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('venues').insertOne(venue);

    return NextResponse.json({ success: true, venue });
  } catch (error) {
    console.error('Error creating venue profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const venue = await db.collection('venues').findOne({ clerkUserId: userId });

    if (!venue) {
      return NextResponse.json({ error: 'Venue profile not found' }, { status: 404 });
    }

    return NextResponse.json({ venue });
  } catch (error) {
    console.error('Error fetching venue profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
