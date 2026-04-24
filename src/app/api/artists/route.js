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
      fullName, genre, city, priceRange, bio, socialLink, photoUrl,
      // New: Identity & Media
      stageName, instagramHandle, youtubeLink, spotifyLink,
      galleryPhotos, highlightVideo,
      // New: Act Details
      actType, bandSize, instruments, performanceStyles,
      languages, setDuration,
      // New: Tech Rider
      techRider, bringsOwnSound, needsBackline,
      powerRequirements, specialRequirements,
      // New: Experience
      yearsActive, notableVenues, achievements,
    } = body;

    // Validation — only name, genre, city are required
    if (!fullName || !genre || !city) {
      return NextResponse.json(
        { error: 'Full name, genre, and city are required.' },
        { status: 400 }
      );
    }

    if (genre.length > 50) {
      return NextResponse.json(
        { error: 'Genre name is too long.' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Build the profile data object
    const profileData = {
      fullName,
      genre,
      city,
      priceRange: priceRange || '',
      bio: bio || '',
      socialLink: socialLink || '',
      photoUrl: photoUrl || '',
      // Identity & Media
      stageName: stageName || '',
      instagramHandle: instagramHandle || '',
      youtubeLink: youtubeLink || '',
      spotifyLink: spotifyLink || '',
      galleryPhotos: Array.isArray(galleryPhotos) ? galleryPhotos.slice(0, 6) : [],
      highlightVideo: highlightVideo || '',
      // Act Details
      actType: actType || 'Solo',
      bandSize: actType === 'Band' ? (parseInt(bandSize, 10) || 0) : 0,
      instruments: Array.isArray(instruments) ? instruments : [],
      performanceStyles: Array.isArray(performanceStyles) ? performanceStyles : [],
      languages: Array.isArray(languages) ? languages : [],
      setDuration: setDuration || '',
      // Tech Rider
      techRider: techRider || '',
      bringsOwnSound: !!bringsOwnSound,
      needsBackline: !!needsBackline,
      powerRequirements: powerRequirements || '',
      specialRequirements: specialRequirements || '',
      // Experience
      yearsActive: parseInt(yearsActive, 10) || 0,
      notableVenues: Array.isArray(notableVenues) ? notableVenues : [],
      achievements: achievements || '',
      updatedAt: new Date(),
    };

    // Check if artist profile already exists for this user
    const existing = await db.collection('artists').findOne({ clerkUserId: userId });
    if (existing) {
      await db.collection('artists').updateOne(
        { clerkUserId: userId },
        { $set: profileData }
      );
      return NextResponse.json({ success: true, updated: true });
    }

    // Create new artist profile
    const artist = {
      clerkUserId: userId,
      ...profileData,
      rating: 0,
      totalRatings: 0,
      gigsCompleted: 0,
      createdAt: new Date(),
    };

    await db.collection('artists').insertOne(artist);

    // Mark profile as complete in Clerk metadata
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role: 'artist', profileComplete: true },
    });

    return NextResponse.json({ success: true, artist });
  } catch (error) {
    console.error('Error creating artist profile:', error);
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
    const artist = await db.collection('artists').findOne({ clerkUserId: userId });

    if (!artist) {
      return NextResponse.json({ error: 'Artist profile not found' }, { status: 404 });
    }

    return NextResponse.json({ artist });
  } catch (error) {
    console.error('Error fetching artist profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
