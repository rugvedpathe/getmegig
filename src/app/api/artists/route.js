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
    const { fullName, genre, city, priceRange, bio, socialLink, photoUrl } = body;

    // Validation
    if (!fullName || !genre || !city) {
      return NextResponse.json(
        { error: 'Full name, genre, and city are required.' },
        { status: 400 }
      );
    }

    const validGenres = ['Rock', 'Jazz', 'Classical', 'Bollywood', 'Folk', 'EDM', 'Other'];
    if (!validGenres.includes(genre)) {
      return NextResponse.json(
        { error: 'Invalid genre.' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Check if artist profile already exists for this user
    const existing = await db.collection('artists').findOne({ clerkUserId: userId });
    if (existing) {
      // Update existing profile
      await db.collection('artists').updateOne(
        { clerkUserId: userId },
        {
          $set: {
            fullName,
            genre,
            city,
            priceRange: priceRange || '',
            bio: bio || '',
            socialLink: socialLink || '',
            photoUrl: photoUrl || '',
            updatedAt: new Date(),
          },
        }
      );
      return NextResponse.json({ success: true, updated: true });
    }

    // Create new artist profile
    const artist = {
      clerkUserId: userId,
      fullName,
      genre,
      city,
      priceRange: priceRange || '',
      bio: bio || '',
      socialLink: socialLink || '',
      photoUrl: photoUrl || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('artists').insertOne(artist);

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
