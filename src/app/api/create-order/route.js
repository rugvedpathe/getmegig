import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getDb } from '@/lib/mongodb';

let razorpay;
function getRazorpay() {
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
}

const GIG_LISTING_PRICE = 30000; // ₹300 in paise

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { gigId } = body;

    if (!gigId) {
      return NextResponse.json({ error: 'gigId is required' }, { status: 400 });
    }

    // Verify the gig exists and belongs to this user
    const db = await getDb();
    const gig = await db.collection('gigs').findOne({ _id: gigId, venueId: userId });

    if (!gig) {
      return NextResponse.json({ error: 'Gig not found' }, { status: 404 });
    }

    if (gig.status === 'active') {
      return NextResponse.json({ error: 'Gig is already active' }, { status: 400 });
    }

    // Create Razorpay order
    const order = await getRazorpay().orders.create({
      amount: GIG_LISTING_PRICE,
      currency: 'INR',
      receipt: `gig_${gigId}`,
      notes: {
        gigId,
        clerkUserId: userId,
      },
    });

    // Save order reference to the gig
    await db.collection('gigs').updateOne(
      { _id: gigId },
      {
        $set: {
          razorpayOrderId: order.id,
          paymentStatus: 'pending',
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
