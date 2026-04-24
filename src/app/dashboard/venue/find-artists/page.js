'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const GENRES = ['All', 'Rock', 'Jazz', 'Classical', 'Bollywood', 'Folk', 'EDM', 'Metal', 'House', 'DJ', 'Stand-up Comedy', 'Improv', 'Hip-Hop', 'Acoustic', 'Sufi', 'Indie'];

export default function FindArtistsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [artists, setArtists] = useState([]);
  const [myGigs, setMyGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genre, setGenre] = useState('All');
  const [city, setCity] = useState('');
  const [inviteGigId, setInviteGigId] = useState(null); // which artist's invite dropdown is open
  const [inviting, setInviting] = useState('');

  useEffect(() => {
    if (isLoaded && user?.publicMetadata?.role !== 'venue') {
      router.push('/dashboard');
      return;
    }
    if (isLoaded) loadData();
  }, [isLoaded, user, router]);

  useEffect(() => {
    if (isLoaded) fetchArtists();
  }, [genre, city, isLoaded]);

  async function loadData() {
    await Promise.all([fetchArtists(), fetchMyGigs()]);
    setLoading(false);
  }

  async function fetchArtists() {
    const params = new URLSearchParams();
    if (genre !== 'All') params.set('genre', genre);
    if (city.trim()) params.set('city', city);
    const res = await fetch('/api/artists/browse?' + params.toString());
    if (res.ok) {
      const data = await res.json();
      setArtists(data.artists || []);
    }
  }

  async function fetchMyGigs() {
    const res = await fetch('/api/gigs');
    if (res.ok) {
      const data = await res.json();
      setMyGigs((data.gigs || []).filter(g => g.status === 'active'));
    }
  }

  async function handleInvite(artistId, gigId) {
    setInviting(artistId + gigId);
    try {
      const res = await fetch(`/api/gigs/${gigId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Invite sent!');
        setInviteGigId(null);
      } else {
        alert(data.error || 'Failed to invite');
      }
    } catch {
      alert('Network error');
    } finally {
      setInviting('');
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="dashboard-page" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <div className="onboarding-spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-welcome dashboard-welcome-venue">
        <div className="dashboard-role-badge badge-venue">🔍 DISCOVER</div>
        <h1>Find Artists</h1>
        <p>Browse artist profiles and invite them to your gigs.</p>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <select value={genre} onChange={e => setGenre(e.target.value)} className="filter-select">
          {GENRES.map(g => <option key={g} value={g}>{g === 'All' ? 'All Genres' : g}</option>)}
        </select>
        <input
          type="text"
          value={city}
          onChange={e => setCity(e.target.value)}
          placeholder="Filter by city..."
          className="filter-input"
        />
        <span className="filter-count">{artists.length} artist{artists.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Artist Grid */}
      {artists.length === 0 ? (
        <div className="dashboard-section-empty" style={{ marginTop: 20 }}>
          <span className="dashboard-empty-icon">🎸</span>
          <p>No artists found. Try different filters.</p>
        </div>
      ) : (
        <div className="card-grid">
          {artists.map(artist => (
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
                    {artist.actType && <span className="tag tag-gray">{artist.actType}{artist.actType === 'Band' && artist.bandSize ? ` (${artist.bandSize}p)` : ''}</span>}
                    {artist.city && <span className="artist-card-city">📍 {artist.city}</span>}
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="artist-card-rating">
                {'⭐'.repeat(Math.round(artist.rating || 0))}{'☆'.repeat(5 - Math.round(artist.rating || 0))}
                <span style={{ marginLeft: 6, fontSize: 12, color: '#888' }}>
                  {artist.rating ? `${artist.rating}/5` : 'New'}{artist.totalRatings ? ` (${artist.totalRatings})` : ''}
                </span>
                {artist.gigsCompleted > 0 && (
                  <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--teal)' }}>🎵 {artist.gigsCompleted} gigs</span>
                )}
              </div>

              {artist.priceRange && (
                <div className="artist-card-price">💰 {artist.priceRange}</div>
              )}

              {artist.bio && (
                <div className="artist-card-bio">
                  {artist.bio.length > 120 ? artist.bio.substring(0, 120) + '...' : artist.bio}
                </div>
              )}

              {artist.socialLink && (
                <a href={artist.socialLink} target="_blank" rel="noopener noreferrer" className="artist-card-social">
                  {artist.socialLink.includes('youtube') ? '🎬 YouTube' :
                   artist.socialLink.includes('instagram') ? '📸 Instagram' : '🔗 Profile'} →
                </a>
              )}

              {/* Invite to Gig */}
              <div className="artist-card-actions">
                {inviteGigId === artist.clerkUserId ? (
                  <div className="invite-dropdown">
                    <div className="invite-dropdown-label">Select a gig:</div>
                    {myGigs.length === 0 ? (
                      <p style={{ fontSize: 12, color: '#aaa' }}>No active gigs. Post one first.</p>
                    ) : (
                      myGigs.map(gig => (
                        <button
                          key={gig._id}
                          className="invite-dropdown-item"
                          onClick={() => handleInvite(artist.clerkUserId, gig._id)}
                          disabled={inviting === artist.clerkUserId + gig._id}
                        >
                          {gig.title} · {new Date(gig.date).toLocaleDateString('en-IN')}
                        </button>
                      ))
                    )}
                    <button className="invite-dropdown-close" onClick={() => setInviteGigId(null)}>Cancel</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link href={`/artists/${artist.clerkUserId}`} className="btn btn-outline btn-sm">👤 View Profile</Link>
                    <button className="btn btn-outline btn-sm" onClick={() => setInviteGigId(artist.clerkUserId)}>
                      📩 Invite to Gig
                    </button>
                  </div>
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
