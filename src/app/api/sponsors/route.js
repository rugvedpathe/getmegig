import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      brandName, brandType, city, description, logoUrl,
      websiteUrl, instagramHandle, contactPerson, contactEmail,
      budget, sponsorshipTypes,
    } = body;

    if (!brandName || !brandType || !city) {
      return NextResponse.json(
        { error: 'Brand name, type, and city are required.' },
        { status: 400 }
      );
    }

    const db = await getDb();

    const profileData = {
      brandName,
      brandType,
      city,
      description: description || '',
      logoUrl: logoUrl || '',
      websiteUrl: websiteUrl || '',
      instagramHandle: instagramHandle || '',
      contactPerson: contactPerson || '',
      contactEmail: contactEmail || '',
      budget: budget || '',
      sponsorshipTypes: Array.isArray(sponsorshipTypes) ? sponsorshipTypes : [],
      updatedAt: new Date(),
    };

    const existing = await db.collection('sponsors').findOne({ clerkUserId: userId });
    if (existing) {
      await db.collection('sponsors').updateOne(
        { clerkUserId: userId },
        { $set: profileData }
      );
      return NextResponse.json({ success: true, updated: true });
    }

    const sponsor = {
      clerkUserId: userId,
      ...profileData,
      createdAt: new Date(),
    };

    await db.collection('sponsors').insertOne(sponsor);

    // Mark profile as complete in Clerk metadata
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role: 'sponsor', profileComplete: true },
    });

    return NextResponse.json({ success: true, sponsor });
  } catch (error) {
    console.error('Error creating sponsor profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const sponsor = await db.collection('sponsors').findOne({ clerkUserId: userId });

    if (!sponsor) {
      return NextResponse.json({ error: 'Sponsor profile not found' }, { status: 404 });
    }

    return NextResponse.json({ sponsor });
  } catch (error) {
    console.error('Error fetching sponsor profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
