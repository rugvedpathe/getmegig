import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// POST: Sponsor applies to sponsor a confirmed gig
export async function POST(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gigId } = await params;
    const body = await req.json();
    const { sponsorshipType, message } = body;

    const db = await getDb();

    // Verify sponsor profile exists
    const sponsor = await db.collection('sponsors').findOne({ clerkUserId: userId });
    if (!sponsor) {
      return NextResponse.json({ error: 'Sponsor profile required' }, { status: 403 });
    }

    // Verify gig exists and is confirmed
    const gig = await db.collection('gigs').findOne({ _id: new ObjectId(gigId) });
    if (!gig) {
      return NextResponse.json({ error: 'Gig not found' }, { status: 404 });
    }
    if (gig.status !== 'confirmed') {
      return NextResponse.json({ error: 'Can only sponsor confirmed gigs' }, { status: 400 });
    }

    // Check if already applied
    const existing = (gig.sponsorApplications || []).find(a => a.sponsorId === userId);
    if (existing) {
      return NextResponse.json({ error: 'Already applied to this gig' }, { status: 409 });
    }

    // Add sponsor application
    await db.collection('gigs').updateOne(
      { _id: new ObjectId(gigId) },
      {
        $push: {
          sponsorApplications: {
            sponsorId: userId,
            brandName: sponsor.brandName,
            brandType: sponsor.brandType,
            logoUrl: sponsor.logoUrl || '',
            sponsorshipType: Array.isArray(sponsorshipType) ? sponsorshipType : [sponsorshipType],
            message: message || '',
            status: 'pending',
            appliedAt: new Date(),
          },
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error applying as sponsor:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: Get sponsor applications for a gig (venue owner only)
export async function GET(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gigId } = await params;
    const db = await getDb();

    const gig = await db.collection('gigs').findOne({ _id: new ObjectId(gigId) });
    if (!gig) {
      return NextResponse.json({ error: 'Gig not found' }, { status: 404 });
    }

    return NextResponse.json({
      sponsorApplications: gig.sponsorApplications || [],
      confirmedSponsors: gig.confirmedSponsors || [],
    });
  } catch (error) {
    console.error('Error fetching sponsor applications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Venue approves/rejects a sponsor application
export async function PATCH(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gigId } = await params;
    const body = await req.json();
    const { sponsorId, action } = body; // action: 'approve' | 'reject'

    if (!sponsorId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'sponsorId and action (approve/reject) required' }, { status: 400 });
    }

    const db = await getDb();
    const gig = await db.collection('gigs').findOne({ _id: new ObjectId(gigId) });

    if (!gig) {
      return NextResponse.json({ error: 'Gig not found' }, { status: 404 });
    }
    if (gig.venueId !== userId) {
      return NextResponse.json({ error: 'Only the venue owner can manage sponsors' }, { status: 403 });
    }

    // Update the sponsor application status
    await db.collection('gigs').updateOne(
      { _id: new ObjectId(gigId), 'sponsorApplications.sponsorId': sponsorId },
      {
        $set: { 'sponsorApplications.$.status': action === 'approve' ? 'approved' : 'rejected' },
        ...(action === 'approve' ? { $addToSet: { confirmedSponsors: sponsorId } } : {}),
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error managing sponsor:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
