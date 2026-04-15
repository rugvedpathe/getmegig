import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// GET — Browse all artist profiles (public, filtered)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const genre = searchParams.get('genre');
    const city = searchParams.get('city');
    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');

    const db = await getDb();
    const filter = {};

    if (genre && genre !== 'All') filter.genre = genre;
    if (city) filter.city = { $regex: city, $options: 'i' };

    const artists = await db.collection('artists')
      .find(filter)
      .project({
        clerkUserId: 1,
        fullName: 1,
        genre: 1,
        city: 1,
        priceRange: 1,
        bio: 1,
        socialLink: 1,
        photoUrl: 1,
        // Exclude email, phone — privacy
      })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ artists });
  } catch (error) {
    console.error('Error browsing artists:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
