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
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Discount code is required' }, { status: 400 });
    }

    const db = await getDb();
    const discountCode = await db.collection('discountCodes').findOne({
      code: code.toUpperCase().trim(),
      isActive: true,
    });

    if (!discountCode) {
      return NextResponse.json({ error: 'Invalid discount code' }, { status: 404 });
    }

    // Check expiry
    if (discountCode.expiryDate && new Date(discountCode.expiryDate) < new Date()) {
      return NextResponse.json({ error: 'This discount code has expired' }, { status: 400 });
    }

    // Check usage limit
    if (discountCode.usageLimit !== null && discountCode.usedCount >= discountCode.usageLimit) {
      return NextResponse.json({ error: 'This discount code has reached its usage limit' }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      code: discountCode.code,
      discountPercent: discountCode.discountPercent,
      // Calculate the discounted price (₹300 base)
      originalPrice: 300,
      discountedPrice: Math.round(300 * (1 - discountCode.discountPercent / 100)),
    });
  } catch (error) {
    console.error('Error validating discount code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
