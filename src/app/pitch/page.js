'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PitchDeckPage() {
  const [topData, setTopData] = useState(null);

  useEffect(() => {
    fetch('/api/artists/top')
      .then(res => res.ok ? res.json() : null)
      .then(data => setTopData(data))
      .catch(() => {});
  }, []);

  const artistOfMonth = topData?.artistOfTheMonth;

  return (
    <div className="pitch-page">
      {/* Hero */}
      <section className="pitch-hero">
        <div className="landing-badge">📋 PITCH DECK</div>
        <h1 className="landing-title" style={{ maxWidth: 800 }}>
          The Platform for India&apos;s<br />
          Live <span>Entertainment</span> Scene
        </h1>
        <p className="landing-subtitle">
          A unified marketplace connecting musicians, comedians, DJs, and performers
          with the venues that need them. No middlemen. No chaos.
        </p>
      </section>

      <div className="pitch-container">
        {/* The Problem */}
        <section className="pitch-section">
          <div className="pitch-section-badge">❌ THE PROBLEM</div>
          <h2 className="pitch-heading">Booking talent in India is broken.</h2>
          <div className="pitch-grid">
            <div className="pitch-card">
              <div className="pitch-card-icon">🎸</div>
              <h3>For Artists & Comedians</h3>
              <ul className="pitch-list">
                <li>Relying on Instagram DMs and WhatsApp groups</li>
                <li>Getting underpaid, delayed payments, or ghosted</li>
                <li>No centralized portfolio or credibility system</li>
                <li>No way to discover gigs outside existing networks</li>
              </ul>
            </div>
            <div className="pitch-card">
              <div className="pitch-card-icon">🏠</div>
              <h3>For Venues</h3>
              <ul className="pitch-list">
                <li>Messaging 50+ artists to fill one slot</li>
                <li>No way to verify quality or reliability</li>
                <li>Booking is a full-time headache</li>
                <li>Last-minute cancellations with no backup plan</li>
              </ul>
            </div>
          </div>
        </section>

        {/* The Solution */}
        <section className="pitch-section">
          <div className="pitch-section-badge pitch-badge-teal">✅ THE SOLUTION</div>
          <h2 className="pitch-heading">GetMeGig — One platform. Every gig.</h2>
          <p className="pitch-text">
            GetMeGig connects performers directly with venues through a structured,
            transparent marketplace. Venues post gig slots with budgets. Artists apply
            or get invited. Venues shortlist, confirm, and the gig is locked in.
          </p>
          <div className="pitch-grid pitch-grid-3">
            <div className="pitch-feature">
              <span className="pitch-feature-icon">📝</span>
              <h4>Post a Gig</h4>
              <p>Venues describe what they need — genre, date, budget — and it goes live instantly.</p>
            </div>
            <div className="pitch-feature">
              <span className="pitch-feature-icon">🔍</span>
              <h4>Discover & Apply</h4>
              <p>Artists browse opportunities, filter by genre, city, and budget, and apply in one click.</p>
            </div>
            <div className="pitch-feature">
              <span className="pitch-feature-icon">✅</span>
              <h4>Shortlist & Confirm</h4>
              <p>Venues review applicants, shortlist favorites, and lock in the confirmed artist.</p>
            </div>
            <div className="pitch-feature">
              <span className="pitch-feature-icon">⭐</span>
              <h4>Ratings & Reviews</h4>
              <p>After every gig, venues rate the artist — building trust and rewarding quality.</p>
            </div>
            <div className="pitch-feature">
              <span className="pitch-feature-icon">🏆</span>
              <h4>Artist of the Month</h4>
              <p>Top-rated performers get featured — driving more bookings to great artists.</p>
            </div>
            <div className="pitch-feature">
              <span className="pitch-feature-icon">🏷️</span>
              <h4>Sponsor Marketplace</h4>
              <p>Brands can sponsor confirmed gigs — stalls, samples, co-hosting, and branding.</p>
            </div>
          </div>
        </section>

        {/* Artist of the Month */}
        {artistOfMonth && (
          <section className="pitch-section">
            <div className="pitch-section-badge pitch-badge-amber">🏆 ARTIST OF THE MONTH</div>
            <div className="aotm-card">
              <div>
                {artistOfMonth.photoUrl ? (
                  <img src={artistOfMonth.photoUrl} alt={artistOfMonth.fullName} className="aotm-photo" />
                ) : (
                  <div className="aotm-photo aotm-photo-placeholder">🎸</div>
                )}
              </div>
              <div>
                <h3 className="aotm-name">{artistOfMonth.fullName}</h3>
                <div className="aotm-meta">
                  {artistOfMonth.genre && <span className="tag tag-teal">{artistOfMonth.genre}</span>}
                  {artistOfMonth.actType && <span className="tag tag-gray">{artistOfMonth.actType}</span>}
                  {artistOfMonth.city && <span style={{ color: '#888', fontSize: 13 }}>📍 {artistOfMonth.city}</span>}
                </div>
                <div className="aotm-rating">
                  {'⭐'.repeat(Math.round(artistOfMonth.rating || 0))}
                  {'☆'.repeat(5 - Math.round(artistOfMonth.rating || 0))}
                  <span> {artistOfMonth.rating || 0}/5</span>
                  {artistOfMonth.totalRatings > 0 && <span> · {artistOfMonth.totalRatings} reviews</span>}
                </div>
                <p className="aotm-desc">
                  {topData?.source === 'newest'
                    ? 'Our newest member — be one of the first to book them!'
                    : 'This month\'s highest-rated performer on the platform.'}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Market */}
        <section className="pitch-section">
          <div className="pitch-section-badge pitch-badge-blue">📊 THE MARKET</div>
          <h2 className="pitch-heading">A massive, untapped opportunity.</h2>
          <div className="pitch-stats">
            <div className="pitch-stat">
              <div className="pitch-stat-n">₹4,200 Cr</div>
              <div className="pitch-stat-l">India&apos;s live entertainment market</div>
            </div>
            <div className="pitch-stat">
              <div className="pitch-stat-n">50,000+</div>
              <div className="pitch-stat-l">Independent performing artists</div>
            </div>
            <div className="pitch-stat">
              <div className="pitch-stat-n">12,000+</div>
              <div className="pitch-stat-l">Venues looking for talent</div>
            </div>
            <div className="pitch-stat">
              <div className="pitch-stat-n">0</div>
              <div className="pitch-stat-l">Direct competitors</div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="pitch-section">
          <div className="pitch-section-badge">⚙️ HOW IT WORKS</div>
          <h2 className="pitch-heading">Three steps. Zero complexity.</h2>
          <div className="pitch-steps">
            <div className="pitch-step">
              <div className="pitch-step-num">1</div>
              <h4>Venue Posts a Gig</h4>
              <p>Set the date, genre, budget, and requirements. The gig goes live to all relevant artists.</p>
            </div>
            <div className="pitch-step-arrow">→</div>
            <div className="pitch-step">
              <div className="pitch-step-num">2</div>
              <h4>Artists Apply</h4>
              <p>Matching artists see the gig, check details, and apply with one click. No DMs needed.</p>
            </div>
            <div className="pitch-step-arrow">→</div>
            <div className="pitch-step">
              <div className="pitch-step-num">3</div>
              <h4>Confirm & Perform</h4>
              <p>Venue shortlists, confirms one artist, and the gig is locked. After the show, they rate the artist.</p>
            </div>
          </div>
        </section>

        {/* Revenue Model */}
        <section className="pitch-section">
          <div className="pitch-section-badge pitch-badge-amber">💰 REVENUE MODEL</div>
          <h2 className="pitch-heading">Simple monetization from day one.</h2>
          <div className="pitch-grid">
            <div className="pitch-card">
              <div className="pitch-card-icon">🎟️</div>
              <h3>Pay-per-listing</h3>
              <p>Venues pay ₹300 per gig listing via Razorpay. First 3 posts are free to drive adoption.</p>
            </div>
            <div className="pitch-card">
              <div className="pitch-card-icon">🏷️</div>
              <h3>Sponsor Marketplace</h3>
              <p>Brands pay to sponsor confirmed gigs — stalls, samples, branding. Revenue share with venues.</p>
            </div>
            <div className="pitch-card">
              <div className="pitch-card-icon">📈</div>
              <h3>Future Revenue</h3>
              <p>Premium artist profiles, featured listings, commission on bookings, event ticketing.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pitch-cta-section">
          <h2 className="pitch-heading">Ready to bring the scene back?</h2>
          <p className="pitch-text" style={{ maxWidth: 500, margin: '0 auto 24px' }}>
            Whether you&apos;re an artist, a venue, or a brand — GetMeGig is your platform.
          </p>
          <div className="landing-cta-row">
            <Link href="/sign-up" className="landing-cta landing-cta-primary">
              Join GetMeGig →
            </Link>
            <Link href="/" className="landing-cta landing-cta-secondary">
              Back to Home
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
