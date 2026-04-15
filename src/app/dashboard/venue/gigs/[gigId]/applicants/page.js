'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ApplicantsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const params = useParams();
  const gigId = params.gigId;

  const [gig, setGig] = useState(null);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    if (isLoaded && user?.publicMetadata?.role !== 'venue') {
      router.push('/dashboard');
      return;
    }
    if (isLoaded && gigId) fetchData();
  }, [isLoaded, user, router, gigId]);

  async function fetchData() {
    try {
      const res = await fetch(`/api/gigs/${gigId}/applicants`);
      if (res.ok) {
        const data = await res.json();
        setGig(data.gig);
        setArtists(data.artists);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(artistId, action) {
    setActionLoading(artistId + action);
    try {
      const res = await fetch(`/api/gigs/${gigId}/applicants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistId, action }),
      });
      if (res.ok) {
        await fetchData(); // Refresh
      } else {
        const data = await res.json();
        alert(data.error || 'Action failed');
      }
    } catch {
      alert('Network error');
    } finally {
      setActionLoading('');
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="dashboard-page" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <div className="onboarding-spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="dashboard-page" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <p style={{ color: '#888' }}>Gig not found.</p>
        <Link href="/dashboard/venue" className="btn btn-outline btn-sm" style={{ marginTop: 16 }}>← Dashboard</Link>
      </div>
    );
  }

  const shortlisted = artists.filter(a => a.isShortlisted);
  const others = artists.filter(a => !a.isShortlisted);
  const isConfirmed = gig.status === 'confirmed' && gig.confirmedArtist;

  return (
    <div className="dashboard-page">
      <div className="dashboard-welcome dashboard-welcome-venue">
        <div className="dashboard-role-badge badge-venue">👥 APPLICANTS</div>
        <h1>{gig.title}</h1>
        <p>
          {gig.genre} · {new Date(gig.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          {isConfirmed && ' · ✅ Artist Confirmed'}
        </p>
      </div>

      {isConfirmed && (
        <div className="confirmed-banner">
          <span className="confirmed-banner-icon">✅</span>
          <div>
            <div className="confirmed-banner-title">Artist Confirmed!</div>
            <div className="confirmed-banner-text">
              {artists.find(a => a.clerkUserId === gig.confirmedArtist)?.fullName || 'Selected artist'} has been confirmed for this gig.
            </div>
          </div>
        </div>
      )}

      {/* Shortlisted Section */}
      {shortlisted.length > 0 && (
        <>
          <h2 className="applicant-section-title">⭐ Shortlisted ({shortlisted.length})</h2>
          <div className="card-grid">
            {shortlisted.map(artist => (
              <div key={artist.clerkUserId} className="artist-card shortlisted-card">
                <div className="artist-card-top">
                  {artist.photoUrl ? (
                    <img src={artist.photoUrl} alt={artist.fullName} className="artist-card-photo" />
                  ) : (
                    <div className="artist-card-photo artist-card-photo-placeholder">🎸</div>
                  )}
                  <div className="artist-card-info">
                    <div className="artist-card-name">{artist.fullName}</div>
                    <div className="artist-card-meta">
                      {artist.genre && <span className="tag tag-teal">{artist.genre}</span>}
                      {artist.city && <span className="artist-card-city">📍 {artist.city}</span>}
                      {artist.isInvited && <span className="tag tag-blue" style={{ marginLeft: 4 }}>Invited</span>}
                    </div>
                  </div>
                </div>
                {artist.priceRange && <div className="artist-card-price">💰 {artist.priceRange}</div>}
                {artist.bio && <div className="artist-card-bio">{artist.bio.substring(0, 100)}</div>}
                {artist.socialLink && (
                  <a href={artist.socialLink} target="_blank" rel="noopener noreferrer" className="artist-card-social">
                    {artist.socialLink.includes('youtube') ? '🎬 YouTube' : '📸 Instagram'} →
                  </a>
                )}
                <div className="artist-card-actions">
                  {!isConfirmed && (
                    <>
                      <button
                        className="btn btn-teal btn-sm"
                        onClick={() => handleAction(artist.clerkUserId, 'confirm')}
                        disabled={actionLoading === artist.clerkUserId + 'confirm'}
                      >
                        ✅ Confirm Artist
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleAction(artist.clerkUserId, 'remove')}
                        disabled={actionLoading === artist.clerkUserId + 'remove'}
                      >
                        Remove
                      </button>
                    </>
                  )}
                  {gig.confirmedArtist === artist.clerkUserId && (
                    <span className="tag tag-teal" style={{ padding: '6px 12px' }}>✅ Confirmed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* All Applicants */}
      <h2 className="applicant-section-title">
        📋 {shortlisted.length > 0 ? 'Other Applicants' : 'All Applicants'} ({others.length})
      </h2>

      {others.length === 0 && shortlisted.length === 0 ? (
        <div className="dashboard-section-empty" style={{ marginTop: 8 }}>
          <span className="dashboard-empty-icon">👥</span>
          <p>No applications or invites yet. Share your gig or invite artists from the discovery page.</p>
          <Link href="/dashboard/venue/find-artists" className="btn btn-outline btn-sm">Find Artists →</Link>
        </div>
      ) : others.length === 0 ? (
        <div className="dashboard-section-empty" style={{ marginTop: 8 }}>
          <p>All applicants have been shortlisted.</p>
        </div>
      ) : (
        <div className="card-grid">
          {others.map(artist => (
            <div key={artist.clerkUserId} className="artist-card">
              <div className="artist-card-top">
                {artist.photoUrl ? (
                  <img src={artist.photoUrl} alt={artist.fullName} className="artist-card-photo" />
                ) : (
                  <div className="artist-card-photo artist-card-photo-placeholder">🎸</div>
                )}
                <div className="artist-card-info">
                  <div className="artist-card-name">{artist.fullName}</div>
                  <div className="artist-card-meta">
                    {artist.genre && <span className="tag tag-teal">{artist.genre}</span>}
                    {artist.city && <span className="artist-card-city">📍 {artist.city}</span>}
                    {artist.isApplicant && <span className="tag tag-gray" style={{ marginLeft: 4 }}>Applied</span>}
                    {artist.isInvited && <span className="tag tag-blue" style={{ marginLeft: 4 }}>Invited</span>}
                  </div>
                </div>
              </div>
              {artist.priceRange && <div className="artist-card-price">💰 {artist.priceRange}</div>}
              {artist.bio && <div className="artist-card-bio">{artist.bio.substring(0, 100)}</div>}
              <div className="artist-card-actions">
                {!isConfirmed && (
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => handleAction(artist.clerkUserId, 'shortlist')}
                    disabled={actionLoading === artist.clerkUserId + 'shortlist'}
                  >
                    ⭐ Shortlist
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Link href="/dashboard/venue" className="btn btn-outline btn-sm">← Back to Dashboard</Link>
      </div>
    </div>
  );
}
