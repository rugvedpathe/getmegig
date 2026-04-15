'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ArtistDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [gigData, setGigData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user?.publicMetadata?.role !== 'artist') {
      router.push('/dashboard');
      return;
    }
    if (isLoaded) {
      Promise.all([fetchProfile(), fetchGigs()]).then(() => setLoading(false));
    }
  }, [isLoaded, user, router]);

  async function fetchProfile() {
    try {
      const res = await fetch('/api/artists');
      if (res.ok) {
        const data = await res.json();
        setProfile(data.artist);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  }

  async function fetchGigs() {
    try {
      const res = await fetch('/api/artists/my-gigs');
      if (res.ok) {
        const data = await res.json();
        setGigData(data);
      }
    } catch (err) {
      console.error('Error fetching gigs:', err);
    }
  }

  const appliedGigs = gigData?.appliedGigs || [];
  const invitedGigs = gigData?.invitedGigs || [];
  const confirmedGigs = gigData?.confirmedGigs || [];

  if (!isLoaded || loading) {
    return (
      <div className="dashboard-page" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <div className="onboarding-spinner" style={{ width: 32, height: 32, borderWidth: 3, borderColor: 'var(--border)', borderTopColor: 'var(--teal)' }} />
        <p style={{ color: '#888', marginTop: 16, fontSize: 14 }}>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Welcome Banner */}
      <div className="dashboard-welcome">
        <div className="dashboard-role-badge badge-artist">🎸 ARTIST</div>
        <h1>Welcome back, {profile?.fullName || user?.firstName || 'Artist'} 👋</h1>
        <p>Manage your portfolio, track gig applications, and grow your presence.</p>
      </div>

      {/* Quick Actions */}
      <div className="post-gig-banner">
        <div className="post-gig-text">
          <h3>Looking for your next gig?</h3>
          <p>Browse active gig listings and apply to the ones that match your style.</p>
        </div>
        <Link href="/dashboard/artist/browse-gigs" className="btn btn-teal post-gig-btn">
          🔍 Browse Gigs
        </Link>
      </div>

      {/* Profile Summary */}
      {profile && (
        <div className="profile-summary-card">
          <div className="profile-summary-header">
            <div className="profile-summary-left">
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt={profile.fullName} className="profile-summary-avatar" />
              ) : (
                <div className="profile-summary-avatar profile-summary-avatar-placeholder">🎸</div>
              )}
              <div>
                <div className="profile-summary-name">{profile.fullName}</div>
                <div className="profile-summary-meta">
                  {profile.genre && <span className="tag tag-teal">{profile.genre}</span>}
                  {profile.city && <span className="profile-summary-city">📍 {profile.city}</span>}
                </div>
              </div>
            </div>
            <Link href="/onboarding/artist" className="btn btn-outline btn-sm">✏️ Edit Profile</Link>
          </div>
          <div className="profile-summary-details">
            {profile.priceRange && (
              <div className="profile-detail-item">
                <span className="profile-detail-label">PRICE PER GIG</span>
                <span className="profile-detail-value">{profile.priceRange}</span>
              </div>
            )}
            {profile.bio && (
              <div className="profile-detail-item">
                <span className="profile-detail-label">BIO</span>
                <span className="profile-detail-value profile-detail-bio">{profile.bio}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {!profile && (
        <div className="profile-summary-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: '#888', marginBottom: 16 }}>You haven&apos;t set up your profile yet.</p>
          <Link href="/onboarding/artist" className="btn btn-teal">Complete Your Profile →</Link>
        </div>
      )}

      {/* Dashboard Sections */}
      <div className="dashboard-sections">
        {/* Applied Gigs */}
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">📋 Gigs You&apos;ve Applied To</h2>
            <span className="dashboard-section-count">{appliedGigs.length}</span>
          </div>
          {appliedGigs.length === 0 ? (
            <div className="dashboard-section-empty">
              <span className="dashboard-empty-icon">🔍</span>
              <p>No applications yet. Browse open gigs and apply!</p>
              <Link href="/dashboard/artist/browse-gigs" className="btn btn-outline btn-sm">Browse Gigs →</Link>
            </div>
          ) : (
            <div className="gig-list">
              {appliedGigs.map(gig => (
                <div key={gig._id} className="gig-list-item">
                  <div className="gig-list-info">
                    <div className="gig-list-title">{gig.title}</div>
                    <div className="gig-list-meta">
                      🏠 {gig.venueName} · 🎵 {gig.genre} · 📅 {new Date(gig.date).toLocaleDateString('en-IN')}
                      {gig.budget && ` · 💰 ${gig.budget}`}
                    </div>
                  </div>
                  <span className={`tag ${gig.confirmedArtist === user?.id ? 'tag-teal' : 'tag-gray'}`}>
                    {gig.confirmedArtist === user?.id ? '✅ Selected' : gig.status === 'confirmed' ? '❌ Not selected' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invites Received */}
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">📨 Invites Received</h2>
            <span className="dashboard-section-count">{invitedGigs.length}</span>
          </div>
          {invitedGigs.length === 0 ? (
            <div className="dashboard-section-empty">
              <span className="dashboard-empty-icon">📬</span>
              <p>No invites yet. Complete your profile to get discovered by venues.</p>
            </div>
          ) : (
            <div className="gig-list">
              {invitedGigs.map(gig => (
                <div key={gig._id} className="gig-list-item">
                  <div className="gig-list-info">
                    <div className="gig-list-title">{gig.title}</div>
                    <div className="gig-list-meta">
                      🏠 {gig.venueName} · 📅 {new Date(gig.date).toLocaleDateString('en-IN')}
                      {gig.budget && ` · 💰 ${gig.budget}`}
                    </div>
                  </div>
                  <span className="tag tag-blue">Invited</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirmed Gigs */}
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">🎵 Confirmed Gigs</h2>
            <span className="dashboard-section-count">{confirmedGigs.length}</span>
          </div>
          {confirmedGigs.length === 0 ? (
            <div className="dashboard-section-empty">
              <span className="dashboard-empty-icon">🎤</span>
              <p>No confirmed gigs yet. Your first gig is just around the corner!</p>
            </div>
          ) : (
            <div className="gig-list">
              {confirmedGigs.map(gig => (
                <div key={gig._id} className="gig-list-item">
                  <div className="gig-list-info">
                    <div className="gig-list-title">{gig.title}</div>
                    <div className="gig-list-meta">
                      🏠 {gig.venueName} · 📅 {new Date(gig.date).toLocaleDateString('en-IN')}
                      {gig.budget && ` · 💰 ${gig.budget}`}
                    </div>
                  </div>
                  <span className="tag tag-teal">✅ Confirmed</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
