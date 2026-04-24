import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// GET: Returns top-rated artist (Artist of the Month) + top 5 leaderboard
export async function GET() {
  try {
    const db = await getDb();

    // Artists with at least 1 rating, sorted by rating then gigsCompleted
    const topArtists = await db.collection('artists')
      .find({ totalRatings: { $gte: 1 } })
      .sort({ rating: -1, gigsCompleted: -1 })
      .limit(5)
      .project({
        clerkUserId: 1, fullName: 1, genre: 1, city: 1,
        photoUrl: 1, rating: 1, totalRatings: 1, gigsCompleted: 1,
        actType: 1, instagramHandle: 1,
      })
      .toArray();

    // Fallback: if no rated artists, return newest
    if (topArtists.length === 0) {
      const newestArtists = await db.collection('artists')
        .find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .project({
          clerkUserId: 1, fullName: 1, genre: 1, city: 1,
          photoUrl: 1, rating: 1, totalRatings: 1, gigsCompleted: 1,
          actType: 1, instagramHandle: 1,
        })
        .toArray();

      return NextResponse.json({
        artistOfTheMonth: newestArtists[0] || null,
        leaderboard: newestArtists,
        source: 'newest',
      });
    }

    return NextResponse.json({
      artistOfTheMonth: topArtists[0],
      leaderboard: topArtists,
      source: 'ratings',
    });
  } catch (error) {
    console.error('Error fetching top artists:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
