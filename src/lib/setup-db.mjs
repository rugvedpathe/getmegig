/**
 * MongoDB Collection Setup Script
 * Run once: node src/lib/setup-db.mjs
 * 
 * Creates indexes for:
 *   - artists.clerkUserId (unique)
 *   - venues.clerkUserId (unique)
 */

import { MongoClient } from 'mongodb';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import dns from 'dns';

// Force Google DNS (fixes Jio/Reliance ISP blocking SRV lookups)
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Load .env.local
const envPath = resolve(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
});

const uri = envVars.MONGODB_URI;
if (!uri) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

async function setup() {
  console.log('🔌 Connecting to MongoDB...');
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('getmegig');

  console.log('📦 Setting up collections and indexes...\n');

  // ── Artists Collection ──
  const artists = db.collection('artists');
  await artists.createIndex({ clerkUserId: 1 }, { unique: true });
  await artists.createIndex({ city: 1 });
  await artists.createIndex({ genre: 1 });
  console.log('✅ artists collection');
  console.log('   → unique index on clerkUserId');
  console.log('   → index on city');
  console.log('   → index on genre');

  // ── Venues Collection ──
  const venues = db.collection('venues');
  await venues.createIndex({ clerkUserId: 1 }, { unique: true });
  await venues.createIndex({ city: 1 });
  await venues.createIndex({ venueType: 1 });
  console.log('✅ venues collection');
  console.log('   → unique index on clerkUserId');
  console.log('   → index on city');
  console.log('   → index on venueType');

  // ── Gigs Collection ──
  const gigs = db.collection('gigs');
  await gigs.createIndex({ clerkUserId: 1 });
  await gigs.createIndex({ status: 1 });
  await gigs.createIndex({ city: 1 });
  await gigs.createIndex({ genreNeed: 1 });
  await gigs.createIndex({ createdAt: -1 });
  await gigs.createIndex({ razorpayOrderId: 1 });
  console.log('✅ gigs collection');
  console.log('   → index on clerkUserId');
  console.log('   → index on status');
  console.log('   → index on city, genreNeed');
  console.log('   → index on createdAt (desc)');
  console.log('   → index on razorpayOrderId');

  // ── Payments Collection ──
  const payments = db.collection('payments');
  await payments.createIndex({ clerkUserId: 1 });
  await payments.createIndex({ gigId: 1 });
  await payments.createIndex({ razorpayPaymentId: 1 }, { unique: true });
  console.log('✅ payments collection');
  console.log('   → index on clerkUserId');
  console.log('   → index on gigId');
  console.log('   → unique index on razorpayPaymentId');

  // ── Discount Codes Collection ──
  const discountCodes = db.collection('discountCodes');
  await discountCodes.createIndex({ code: 1 }, { unique: true });
  await discountCodes.createIndex({ isActive: 1 });
  console.log('✅ discountCodes collection');
  console.log('   → unique index on code');
  console.log('   → index on isActive');

  // Seed GETMEAGIG100 launch code
  const existingCode = await discountCodes.findOne({ code: 'GETMEAGIG100' });
  if (!existingCode) {
    await discountCodes.insertOne({
      code: 'GETMEAGIG100',
      discountPercent: 100,
      usageLimit: null, // unlimited
      usedCount: 0,
      expiryDate: null, // no expiry — admin controlled
      isActive: true,
      description: 'Launch promo — 100% off gig listing',
      createdAt: new Date(),
    });
    console.log('   → seeded GETMEAGIG100 (100% off, unlimited)');
  } else {
    console.log('   → GETMEAGIG100 already exists');
  }

  // ── Discount Usage Collection ──
  const discountUsage = db.collection('discountUsage');
  await discountUsage.createIndex({ clerkUserId: 1 });
  await discountUsage.createIndex({ codeId: 1 });
  console.log('✅ discountUsage collection');
  console.log('   → index on clerkUserId');
  console.log('   → index on codeId');

  console.log('\n🎉 Database setup complete!');
  
  // Show current state
  const collections = await db.listCollections().toArray();
  console.log(`\n📋 Collections in "getmegig" database:`);
  for (const col of collections) {
    const count = await db.collection(col.name).countDocuments();
    console.log(`   • ${col.name} (${count} documents)`);
  }

  await client.close();
}

setup().catch(err => {
  console.error('❌ Setup failed:', err.message);
  process.exit(1);
});
