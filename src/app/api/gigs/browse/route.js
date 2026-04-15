import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// GET — Browse all active gigs (public, filtered)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const genre = searchParams.get('genre');
    const city = searchParams.get('city');
    const budgetMin = searchParams.get('budgetMin');
    const dateFrom = searchParams.get('dateFrom');

    const db = await getDb();
    const filter = { status: 'active' };

    if (genre && genre !== 'All') filter.genre = genre;
    if (city) filter.venueCity = { $regex: city, $options: 'i' };
    if (dateFrom) filter.date = { $gte: new Date(dateFrom) };

    const gigs = await db.collection('gigs')
      .find(filter)
      .project({
        gigId: 1,
        title: 1,
        date: 1,
        genre: 1,
        budget: 1,
        duration: 1,
        notes: 1,
        venueName: 1,
        venueCity: 1,
        applicants: 1,
        status: 1,
        // Exclude venue contact details
      })
      .sort({ date: 1 })
      .toArray();

    return NextResponse.json({ gigs });
  } catch (error) {
    console.error('Error browsing gigs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
