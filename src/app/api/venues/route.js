import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      // Basic info
      venueName, city, venueType, capacity, contactPerson,
      // New: Identity & Media
      venueDescription, address, googleMapsLink,
      venuePhotos, instagramHandle, websiteUrl, operatingHours,
      // New: Stage & Sound
      stageType, stageDimensions, soundSystem, soundSystemDetails,
      hasBackline, backlineDetails, lightingSetup, lightingDetails,
      microphoneCount, monitorCount,
      // New: Logistics
      parkingAvailable, greenRoomAvailable, loadInAccess,
      soundCheckPolicy, paymentTerms, cancellationPolicy,
      ageRestriction, dresscode, foodDrinkForArtists,
      // New: Preferences
      preferredGenres, pastArtists, averageBudget,
    } = body;

    // Validation — only name, city, type required
    if (!venueName || !city || !venueType) {
      return NextResponse.json(
        { error: 'Venue name, city, and venue type are required.' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Build profile data
    const profileData = {
      venueName,
      city,
      venueType,
      capacity: capacity ? parseInt(capacity, 10) : null,
      contactPerson: contactPerson || '',
      // Identity & Media
      venueDescription: venueDescription || '',
      address: address || '',
      googleMapsLink: googleMapsLink || '',
      venuePhotos: Array.isArray(venuePhotos) ? venuePhotos.slice(0, 8) : [],
      instagramHandle: instagramHandle || '',
      websiteUrl: websiteUrl || '',
      operatingHours: operatingHours || '',
      // Stage & Sound
      stageType: stageType || '',
      stageDimensions: stageDimensions || '',
      soundSystem: soundSystem || '',
      soundSystemDetails: soundSystemDetails || '',
      hasBackline: !!hasBackline,
      backlineDetails: backlineDetails || '',
      lightingSetup: lightingSetup || '',
      lightingDetails: lightingDetails || '',
      microphoneCount: parseInt(microphoneCount, 10) || 0,
      monitorCount: parseInt(monitorCount, 10) || 0,
      // Logistics
      parkingAvailable: !!parkingAvailable,
      greenRoomAvailable: !!greenRoomAvailable,
      loadInAccess: loadInAccess || '',
      soundCheckPolicy: soundCheckPolicy || '',
      paymentTerms: paymentTerms || 'Same Day',
      cancellationPolicy: cancellationPolicy || '',
      ageRestriction: ageRestriction || 'All Ages',
      dresscode: dresscode || '',
      foodDrinkForArtists: !!foodDrinkForArtists,
      // Preferences
      preferredGenres: Array.isArray(preferredGenres) ? preferredGenres : [],
      pastArtists: Array.isArray(pastArtists) ? pastArtists : [],
      averageBudget: averageBudget || '',
      updatedAt: new Date(),
    };

    // Check if venue already exists
    const existing = await db.collection('venues').findOne({ clerkUserId: userId });
    if (existing) {
      await db.collection('venues').updateOne(
        { clerkUserId: userId },
        { $set: profileData }
      );
      return NextResponse.json({ success: true, updated: true });
    }

    // Create new — every new venue gets 3 free gig credits
    const venue = {
      clerkUserId: userId,
      ...profileData,
      freeGigsRemaining: 3,
      createdAt: new Date(),
    };

    await db.collection('venues').insertOne(venue);

    // Mark profile as complete in Clerk metadata
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role: 'venue', profileComplete: true },
    });

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
