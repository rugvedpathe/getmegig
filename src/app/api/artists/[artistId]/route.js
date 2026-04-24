import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// GET: Public full artist profile (for the detail page)
export async function GET(req, { params }) {
  try {
    const { artistId } = await params;
    const db = await getDb();

    const artist = await db.collection('artists').findOne(
      { clerkUserId: artistId },
      {
        projection: {
          // Include everything EXCEPT internal fields
          _id: 0,
          clerkUserId: 1,
          fullName: 1, stageName: 1, genre: 1, city: 1,
          priceRange: 1, bio: 1, photoUrl: 1,
          // Media
          instagramHandle: 1, youtubeLink: 1, spotifyLink: 1,
          socialLink: 1, galleryPhotos: 1, highlightVideo: 1,
          // Act Details
          actType: 1, bandSize: 1, instruments: 1,
          performanceStyles: 1, languages: 1, setDuration: 1,
          // Tech Rider
          techRider: 1, bringsOwnSound: 1, needsBackline: 1,
          powerRequirements: 1, specialRequirements: 1,
          // Experience
          yearsActive: 1, notableVenues: 1, achievements: 1,
          rating: 1, totalRatings: 1, gigsCompleted: 1,
        },
      }
    );

    if (!artist) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
    }

    // Fetch their reviews
    const reviews = await db.collection('ratings')
      .find({ artistId })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    // Enrich reviews with venue names
    const enrichedReviews = [];
    for (const review of reviews) {
      const venue = await db.collection('venues').findOne(
        { clerkUserId: review.venueId },
        { projection: { venueName: 1 } }
      );
      enrichedReviews.push({
        rating: review.rating,
        review: review.review,
        venueName: venue?.venueName || 'Anonymous Venue',
        createdAt: review.createdAt,
      });
    }

    return NextResponse.json({ artist, reviews: enrichedReviews });
  } catch (error) {
    console.error('Error fetching public artist profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
