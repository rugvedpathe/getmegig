import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      date,
      genre,
      budget,
      duration,
      notes,
      discountCode,
    } = body;

    // Validation
    if (!title || !date || !genre) {
      return NextResponse.json(
        { error: 'Title, date, and genre are required.' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Verify venue profile exists
    const venue = await db.collection('venues').findOne({ clerkUserId: userId });
    if (!venue) {
      return NextResponse.json({ error: 'Venue profile not found' }, { status: 404 });
    }

    const freeGigsRemaining = venue.freeGigsRemaining ?? 0;
    const useFreeCredit = freeGigsRemaining > 0;

    // Check discount code if provided and no free credits
    let discountApplied = null;
    let skipPayment = useFreeCredit;
    let activationMethod = useFreeCredit ? 'free_credit' : 'razorpay';

    if (!useFreeCredit && discountCode) {
      const code = await db.collection('discountCodes').findOne({
        code: discountCode.toUpperCase().trim(),
        isActive: true,
      });

      if (code) {
        const notExpired = !code.expiryDate || new Date(code.expiryDate) >= new Date();
        const withinLimit = code.usageLimit === null || code.usedCount < code.usageLimit;

        if (notExpired && withinLimit) {
          discountApplied = {
            code: code.code,
            discountPercent: code.discountPercent,
            originalPrice: 300,
            discountedPrice: Math.round(300 * (1 - code.discountPercent / 100)),
          };

          if (code.discountPercent >= 100) {
            skipPayment = true;
            activationMethod = 'discount_code';
          }

          // Record usage
          await db.collection('discountCodes').updateOne(
            { _id: code._id },
            { $inc: { usedCount: 1 } }
          );

          await db.collection('discountUsage').insertOne({
            codeId: code._id,
            code: code.code,
            clerkUserId: userId,
            discountPercent: code.discountPercent,
            usedAt: new Date(),
          });
        }
      }
    }

    // Create gig — Task 5 structure
    const gigId = new ObjectId().toString();
    const gig = {
      _id: gigId,
      gigId,
      venueId: userId,                    // Clerk user ID of venue
      venueObjectId: venue._id,           // MongoDB _id of venue doc
      venueName: venue.venueName,
      venueCity: venue.city,
      title,
      date: new Date(date),
      genre,
      budget: budget || '',
      duration: duration || '',
      notes: notes || '',
      status: skipPayment ? 'active' : 'draft',
      applicants: [],                     // artist IDs who applied
      invitedArtists: [],                 // artist IDs venue invited
      shortlist: [],                      // artist IDs venue shortlisted
      confirmedArtist: null,              // single artist ID once selected
      paymentId: null,                    // Razorpay payment ID
      activationMethod: skipPayment ? activationMethod : 'razorpay',
      discountApplied,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('gigs').insertOne(gig);

    // If using free credit, deduct it
    if (useFreeCredit) {
      await db.collection('venues').updateOne(
        { clerkUserId: userId },
        {
          $inc: { freeGigsRemaining: -1 },
          $set: { updatedAt: new Date() },
        }
      );
    }

    return NextResponse.json({
      success: true,
      gig,
      usedFreeCredit: useFreeCredit,
      freeGigsRemaining: useFreeCredit ? freeGigsRemaining - 1 : freeGigsRemaining,
      requiresPayment: !skipPayment,
      discountApplied,
    });
  } catch (error) {
    console.error('Error creating gig:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET — fetch gigs for the authenticated user (venue or artist)
export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const gigs = await db.collection('gigs')
      .find({ venueId: userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ gigs });
  } catch (error) {
    console.error('Error fetching gigs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
