'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SponsorDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user?.publicMetadata?.role !== 'sponsor') {
      router.push('/dashboard');
      return;
    }
    if (isLoaded) fetchProfile();
  }, [isLoaded, user, router]);

  async function fetchProfile() {
    try {
      const res = await fetch('/api/sponsors');
      if (res.ok) {
        const data = await res.json();
        setProfile(data.sponsor);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="dashboard-page" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <div className="onboarding-spinner" style={{ width: 32, height: 32, borderWidth: 3, borderColor: 'var(--border)', borderTopColor: 'var(--amber)' }} />
        <p style={{ color: '#888', marginTop: 16, fontSize: 14 }}>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Welcome Banner */}
      <div className="dashboard-welcome dashboard-welcome-sponsor">
        <div className="dashboard-role-badge badge-sponsor">🏷️ SPONSOR</div>
        <h1>Welcome, {profile?.brandName || user?.firstName || 'Brand'} 👋</h1>
        <p>Discover confirmed gigs to sponsor and grow your brand presence at live events.</p>
      </div>

      {/* Quick Actions */}
      <div className="post-gig-banner" style={{ borderColor: 'rgba(186,117,23,.15)', background: 'linear-gradient(135deg,rgba(186,117,23,.06),rgba(24,95,165,.04))' }}>
        <div className="post-gig-text">
          <h3>Find gigs to sponsor</h3>
          <p>Browse confirmed gigs in your city and apply to sponsor them with your brand.</p>
        </div>
        <Link href="/dashboard/sponsor/browse-gigs" className="btn btn-amber post-gig-btn">
          🔍 Browse Gigs
        </Link>
      </div>

      {/* Profile Summary */}
      {profile ? (
        <div className="profile-summary-card">
          <div className="profile-summary-header">
            <div className="profile-summary-left">
              {profile.logoUrl ? (
                <img src={profile.logoUrl} alt={profile.brandName} className="profile-summary-avatar" />
              ) : (
                <div className="profile-summary-avatar profile-summary-avatar-placeholder">🏷️</div>
              )}
              <div>
                <div className="profile-summary-name">{profile.brandName}</div>
                <div className="profile-summary-meta">
                  <span className="tag tag-amber">{profile.brandType}</span>
                  {profile.city && <span className="profile-summary-city">📍 {profile.city}</span>}
                </div>
              </div>
            </div>
            <Link href="/onboarding/sponsor" className="btn btn-outline btn-sm">✏️ Edit Profile</Link>
          </div>
          {profile.description && (
            <div className="profile-summary-details">
              <div className="profile-detail-item">
                <span className="profile-detail-label">ABOUT</span>
                <span className="profile-detail-value profile-detail-bio">{profile.description}</span>
              </div>
            </div>
          )}
          {profile.sponsorshipTypes?.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {profile.sponsorshipTypes.map(t => (
                <span key={t} className="tag tag-amber" style={{ fontSize: 10 }}>{t}</span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="profile-summary-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: '#888', marginBottom: 16 }}>You haven&apos;t set up your profile yet.</p>
          <Link href="/onboarding/sponsor" className="btn btn-amber">Complete Your Profile →</Link>
        </div>
      )}
    </div>
  );
}
