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
        fullName: 1, stageName: 1,
        genre: 1, city: 1, priceRange: 1,
        bio: 1, socialLink: 1, photoUrl: 1,
        // New fields for richer cards
        actType: 1, bandSize: 1, instruments: 1,
        instagramHandle: 1,
        rating: 1, totalRatings: 1, gigsCompleted: 1,
        languages: 1, performanceStyles: 1,
        // Exclude email, phone, tech rider — privacy / detail page only
      })
      .sort({ rating: -1, createdAt: -1 })
      .toArray();

    return NextResponse.json({ artists });
  } catch (error) {
    console.error('Error browsing artists:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
