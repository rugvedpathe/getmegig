import { NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { getDb } from '@/lib/mongodb';

// Disable body parsing — we need the raw body for signature verification
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    const expectedSignature = createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Razorpay webhook: invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);
    const { event: eventType, payload } = event;

    // Handle payment.captured event
    if (eventType === 'payment.captured') {
      const payment = payload.payment.entity;
      const orderId = payment.order_id;
      const gigId = payment.notes?.gigId;
      const clerkUserId = payment.notes?.clerkUserId;

      if (!gigId) {
        console.error('Razorpay webhook: no gigId in payment notes');
        return NextResponse.json({ error: 'No gigId in notes' }, { status: 400 });
      }

      const db = await getDb();

      // Update gig status from draft to active
      const result = await db.collection('gigs').updateOne(
        {
          _id: gigId,
          razorpayOrderId: orderId,
        },
        {
          $set: {
            status: 'active',
            paymentStatus: 'captured',
            razorpayPaymentId: payment.id,
            paidAt: new Date(),
            updatedAt: new Date(),
          },
        }
      );

      if (result.matchedCount === 0) {
        console.error(`Razorpay webhook: gig not found for orderId ${orderId}`);
        return NextResponse.json({ error: 'Gig not found' }, { status: 404 });
      }

      console.log(`✅ Gig ${gigId} activated after payment ${payment.id}`);

      // Log the payment
      await db.collection('payments').insertOne({
        clerkUserId,
        gigId,
        razorpayOrderId: orderId,
        razorpayPaymentId: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: 'captured',
        method: payment.method,
        createdAt: new Date(),
      });
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
