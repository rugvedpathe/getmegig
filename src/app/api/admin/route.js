import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || '').split(',').map(s => s.trim()).filter(Boolean);

function isAdmin(userId) {
  return ADMIN_USER_IDS.includes(userId);
}

// GET — Admin: list all discount codes
export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId || !isAdmin(userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const db = await getDb();
    const codes = await db.collection('discountCodes').find().sort({ createdAt: -1 }).toArray();
    const venues = await db.collection('venues')
      .find()
      .project({ clerkUserId: 1, venueName: 1, city: 1, freeGigsRemaining: 1 })
      .toArray();
    const gigs = await db.collection('gigs')
      .find()
      .project({ gigId: 1, title: 1, venueId: 1, venueName: 1, status: 1, activationMethod: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({ codes, venues, gigs });
  } catch (error) {
    console.error('Admin GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST — Admin: create or update discount codes, adjust credits
export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId || !isAdmin(userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;
    const db = await getDb();

    if (action === 'create_code') {
      const { code, discountPercent, usageLimit, expiryDate, description } = body;
      if (!code || !discountPercent) {
        return NextResponse.json({ error: 'code and discountPercent required' }, { status: 400 });
      }
      await db.collection('discountCodes').insertOne({
        code: code.toUpperCase().trim(),
        discountPercent: parseInt(discountPercent),
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        usedCount: 0,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        isActive: true,
        description: description || '',
        createdAt: new Date(),
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'toggle_code') {
      const { codeId, isActive } = body;
      await db.collection('discountCodes').updateOne(
        { code: codeId },
        { $set: { isActive: !!isActive } }
      );
      return NextResponse.json({ success: true });
    }

    if (action === 'adjust_credits') {
      const { venueUserId, freeGigsRemaining } = body;
      await db.collection('venues').updateOne(
        { clerkUserId: venueUserId },
        { $set: { freeGigsRemaining: parseInt(freeGigsRemaining), updatedAt: new Date() } }
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Admin POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
