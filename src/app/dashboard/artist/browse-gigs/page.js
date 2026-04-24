'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const GENRES = ['All', 'Rock', 'Jazz', 'Classical', 'Bollywood', 'Folk', 'EDM', 'Metal', 'House', 'DJ', 'Stand-up Comedy', 'Improv', 'Hip-Hop', 'Acoustic', 'Sufi', 'Indie', 'Any'];

export default function BrowseGigsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genre, setGenre] = useState('All');
  const [city, setCity] = useState('');
  const [applying, setApplying] = useState('');
  const [applied, setApplied] = useState(new Set());

  useEffect(() => {
    if (isLoaded && user?.publicMetadata?.role !== 'artist') {
      router.push('/dashboard');
      return;
    }
    if (isLoaded) loadData();
  }, [isLoaded, user, router]);

  useEffect(() => {
    if (isLoaded) fetchGigs();
  }, [genre, city, isLoaded]);

  async function loadData() {
    await Promise.all([fetchGigs(), fetchMyApplications()]);
    setLoading(false);
  }

  async function fetchGigs() {
    const params = new URLSearchParams();
    if (genre !== 'All') params.set('genre', genre);
    if (city.trim()) params.set('city', city);
    const res = await fetch('/api/gigs/browse?' + params.toString());
    if (res.ok) {
      const data = await res.json();
      setGigs(data.gigs || []);
    }
  }

  async function fetchMyApplications() {
    const res = await fetch('/api/artists/my-gigs');
    if (res.ok) {
      const data = await res.json();
      const ids = new Set((data.appliedGigs || []).map(g => g._id));
      setApplied(ids);
    }
  }

  async function handleApply(gigId) {
    setApplying(gigId);
    try {
      const res = await fetch(`/api/gigs/${gigId}/apply`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setApplied(prev => new Set([...prev, gigId]));
      } else {
        alert(data.error || 'Failed to apply');
      }
    } catch {
      alert('Network error');
    } finally {
      setApplying('');
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
      <div className="dashboard-welcome">
        <div className="dashboard-role-badge badge-artist">🔍 DISCOVER</div>
        <h1>Browse Gigs</h1>
        <p>Find live performance opportunities and apply to gigs that match your style.</p>
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
        <span className="filter-count">{gigs.length} gig{gigs.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Gig Grid */}
      {gigs.length === 0 ? (
        <div className="dashboard-section-empty" style={{ marginTop: 20 }}>
          <span className="dashboard-empty-icon">🎵</span>
          <p>No active gigs found. Check back soon or try different filters.</p>
        </div>
      ) : (
        <div className="card-grid">
          {gigs.map(gig => (
            <div key={gig._id} className="gig-card">
              <div className="gig-card-top">
                <div className="gig-card-venue">{gig.venueName}</div>
                <span className="tag tag-teal">{gig.genre}</span>
              </div>

              <div className="gig-card-title">{gig.title}</div>

              <div className="gig-card-details">
                <span>📅 {new Date(gig.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                {gig.venueCity && <span>📍 {gig.venueCity}</span>}
                {gig.budget && <span>💰 {gig.budget}</span>}
                {gig.duration && <span>⏱️ {gig.duration}h</span>}
              </div>

              {gig.notes && (
                <div className="gig-card-notes">
                  {gig.notes.length > 100 ? gig.notes.substring(0, 100) + '...' : gig.notes}
                </div>
              )}

              <div className="gig-card-footer">
                <span className="gig-card-applicants">
                  👥 {gig.applicants?.length || 0} applied
                </span>
                {applied.has(gig._id) ? (
                  <span className="tag tag-teal">✓ Applied</span>
                ) : (
                  <button
                    className="btn btn-teal btn-sm"
                    onClick={() => handleApply(gig._id)}
                    disabled={applying === gig._id}
                  >
                    {applying === gig._id ? '...' : '🎤 Apply'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Link href="/dashboard/artist" className="btn btn-outline btn-sm">← Back to Dashboard</Link>
      </div>
    </div>
  );
}
