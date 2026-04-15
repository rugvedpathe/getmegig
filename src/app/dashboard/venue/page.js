'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function VenueDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user?.publicMetadata?.role !== 'venue') {
      router.push('/dashboard');
      return;
    }
    if (isLoaded) {
      Promise.all([fetchProfile(), fetchGigs()]).then(() => setLoading(false));
    }
  }, [isLoaded, user, router]);

  async function fetchProfile() {
    try {
      const res = await fetch('/api/venues');
      if (res.ok) {
        const data = await res.json();
        setProfile(data.venue);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  }

  async function fetchGigs() {
    try {
      const res = await fetch('/api/gigs');
      if (res.ok) {
        const data = await res.json();
        setGigs(data.gigs || []);
      }
    } catch (err) {
      console.error('Error fetching gigs:', err);
    }
  }

  const freeGigsRemaining = profile?.freeGigsRemaining ?? 0;
  const activeGigs = gigs.filter(g => g.status === 'active');
  const draftGigs = gigs.filter(g => g.status === 'draft');
  const pastGigs = gigs.filter(g => g.status === 'completed' || g.status === 'expired');

  if (!isLoaded || loading) {
    return (
      <div className="dashboard-page" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <div className="onboarding-spinner" style={{ width: 32, height: 32, borderWidth: 3, borderColor: 'var(--border)', borderTopColor: 'var(--blue)' }} />
        <p style={{ color: '#888', marginTop: 16, fontSize: 14 }}>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Welcome Banner */}
      <div className="dashboard-welcome dashboard-welcome-venue">
        <div className="dashboard-role-badge badge-venue">🏠 VENUE</div>
        <h1>Welcome back, {profile?.venueName || user?.firstName || 'Venue Manager'} 👋</h1>
        <p>
          Manage your venue, post gig listings, and find the perfect artists 
          for your stage.
        </p>
      </div>

      {/* Free Gig Credits Banner */}
      {profile && (
        <div className={`free-gigs-banner ${freeGigsRemaining === 0 ? 'free-gigs-exhausted' : ''}`}>
          <div className="free-gigs-left">
            <div className="free-gigs-icon">🎫</div>
            <div>
              <div className="free-gigs-title">
                Free Gig Credits: <span className="free-gigs-count">{freeGigsRemaining}</span>/3
              </div>
              <div className="free-gigs-desc">
                {freeGigsRemaining === 3 && 'You have 3 free gig postings! Post your first gig at no cost.'}
                {freeGigsRemaining === 2 && '2 free gig postings remaining. Use them wisely!'}
                {freeGigsRemaining === 1 && '1 free gig posting left — make it count!'}
                {freeGigsRemaining === 0 && "You've used your 3 free gigs! Future listings are ₹300 each."}
              </div>
            </div>
          </div>
          <div className="free-gigs-dots">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className={`free-gig-dot ${i < freeGigsRemaining ? 'free-gig-dot-active' : 'free-gig-dot-used'}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Profile Summary */}
      {profile && (
        <div className="profile-summary-card venue-summary">
          <div className="profile-summary-header">
            <div className="profile-summary-left">
              <div className="profile-summary-avatar profile-summary-avatar-placeholder venue-avatar">
                🏠
              </div>
              <div>
                <div className="profile-summary-name">{profile.venueName}</div>
                <div className="profile-summary-meta">
                  {profile.venueType && <span className="tag tag-blue">{profile.venueType}</span>}
                  {profile.city && <span className="profile-summary-city">📍 {profile.city}</span>}
                </div>
              </div>
            </div>
            <Link href="/onboarding/venue" className="btn btn-outline btn-sm">
              ✏️ Edit Profile
            </Link>
          </div>

          <div className="profile-summary-details">
            {profile.capacity && (
              <div className="profile-detail-item">
                <span className="profile-detail-label">CAPACITY</span>
                <span className="profile-detail-value">{profile.capacity} people</span>
              </div>
            )}
            {profile.contactPerson && (
              <div className="profile-detail-item">
                <span className="profile-detail-label">CONTACT PERSON</span>
                <span className="profile-detail-value">{profile.contactPerson}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {!profile && (
        <div className="profile-summary-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: '#888', marginBottom: 16 }}>You haven&apos;t set up your venue yet.</p>
          <Link href="/onboarding/venue" className="btn btn-blue">
            Complete Venue Setup →
          </Link>
        </div>
      )}

      {/* Action Banners */}
      <div className="post-gig-banner">
        <div className="post-gig-text">
          <h3>Ready to find your next artist?</h3>
          <p>
            {freeGigsRemaining > 0
              ? `Post a gig for free! (${freeGigsRemaining} free credit${freeGigsRemaining !== 1 ? 's' : ''} remaining)`
              : 'Post a gig listing for ₹300 and start receiving applications.'
            }
          </p>
        </div>
        <Link href="/dashboard/venue/post-gig" className="btn btn-blue post-gig-btn">
          📝 Post a Gig
          {freeGigsRemaining > 0 && <span className="free-badge">FREE</span>}
          {freeGigsRemaining === 0 && <span className="price-badge">₹300</span>}
        </Link>
      </div>

      <div className="post-gig-banner" style={{ background: 'linear-gradient(135deg,rgba(29,158,117,.06),rgba(24,95,165,.04))' }}>
        <div className="post-gig-text">
          <h3>Browse artist profiles</h3>
          <p>Discover talented artists and invite them directly to your gigs.</p>
        </div>
        <Link href="/dashboard/venue/find-artists" className="btn btn-teal post-gig-btn">
          🔍 Find Artists
        </Link>
      </div>

      {/* Dashboard Sections */}
      <div className="dashboard-sections">
        {/* Active Listings */}
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">📋 Your Active Listings</h2>
            <span className="dashboard-section-count">{activeGigs.length}</span>
          </div>
          {activeGigs.length === 0 ? (
            <div className="dashboard-section-empty">
              <span className="dashboard-empty-icon">📝</span>
              <p>No active listings. Post a gig to start receiving artist applications!</p>
            </div>
          ) : (
            <div className="gig-list">
              {activeGigs.map(gig => (
                <div key={gig._id} className="gig-list-item">
                  <div className="gig-list-info">
                    <div className="gig-list-title">{gig.title}</div>
                    <div className="gig-list-meta">
                      🎵 {gig.genre} · 📅 {new Date(gig.date).toLocaleDateString('en-IN')}
                      {gig.budget && ` · 💰 ${gig.budget}`}
                      {gig.duration && ` · ⏱️ ${gig.duration}h`}
                      {gig.applicants?.length > 0 && ` · 👥 ${gig.applicants.length} applied`}
                    </div>
                  </div>
                  <div className="gig-list-status">
                    <Link href={`/dashboard/venue/gigs/${gig._id}/applicants`} className="btn btn-outline btn-sm" style={{ marginRight: 6 }}>
                      👥 Applicants
                    </Link>
                    <span className="tag tag-teal">Active</span>
                    {gig.activationMethod !== 'razorpay' && (
                      <span className="tag tag-gray" style={{ marginLeft: 4 }}>
                        {gig.activationMethod === 'free_credit' ? 'Free' : 'Promo'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Gigs */}
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">🎵 Past Gigs</h2>
            <span className="dashboard-section-count">{pastGigs.length}</span>
          </div>
          {pastGigs.length === 0 ? (
            <div className="dashboard-section-empty">
              <span className="dashboard-empty-icon">📅</span>
              <p>No past gigs yet. Your venue&apos;s gig history will appear here.</p>
            </div>
          ) : (
            <div className="gig-list">
              {pastGigs.map(gig => (
                <div key={gig._id} className="gig-list-item">
                  <div className="gig-list-info">
                    <div className="gig-list-title">{gig.title}</div>
                    <div className="gig-list-meta">
                      📍 {gig.city} · 📅 {new Date(gig.date).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                  <span className="tag tag-gray">{gig.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
