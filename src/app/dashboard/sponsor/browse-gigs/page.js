'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const SPONSORSHIP_OPTIONS = [
  'Set up a stall / pop-up booth',
  'Sponsor the event (branding)',
  'Provide free samples / merch',
  'Co-host / present the event',
  'Provide prizes / giveaways',
  'Logo placement only',
];

export default function SponsorBrowseGigs() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState('');
  const [applied, setApplied] = useState(new Set());
  const [activeApply, setActiveApply] = useState(null); // gigId of open apply form
  const [applyForm, setApplyForm] = useState({ types: [], message: '' });

  useEffect(() => {
    if (isLoaded && user?.publicMetadata?.role !== 'sponsor') {
      router.push('/dashboard');
      return;
    }
    if (isLoaded) fetchGigs();
  }, [isLoaded, user, router]);

  async function fetchGigs() {
    try {
      // Fetch confirmed gigs that sponsors can apply to
      const res = await fetch('/api/gigs/browse?status=confirmed');
      if (res.ok) {
        const data = await res.json();
        setGigs(data.gigs || []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }

  function toggleType(type) {
    setApplyForm(prev => ({
      ...prev,
      types: prev.types.includes(type) ? prev.types.filter(t => t !== type) : [...prev.types, type],
    }));
  }

  async function handleApply(gigId) {
    if (applyForm.types.length === 0) {
      alert('Select at least one sponsorship type');
      return;
    }
    setApplying(gigId);
    try {
      const res = await fetch(`/api/gigs/${gigId}/sponsors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sponsorshipType: applyForm.types,
          message: applyForm.message,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setApplied(prev => new Set([...prev, gigId]));
        setActiveApply(null);
        setApplyForm({ types: [], message: '' });
      } else {
        alert(data.error || 'Failed');
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
      <div className="dashboard-welcome dashboard-welcome-sponsor">
        <div className="dashboard-role-badge badge-sponsor">🔍 DISCOVER</div>
        <h1>Browse Gigs to Sponsor</h1>
        <p>Find confirmed live events and apply to sponsor them with your brand.</p>
      </div>

      {gigs.length === 0 ? (
        <div className="dashboard-section-empty" style={{ marginTop: 20 }}>
          <span className="dashboard-empty-icon">🎵</span>
          <p>No confirmed gigs available for sponsorship right now. Check back soon!</p>
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
              </div>
              {gig.notes && (
                <div className="gig-card-notes">
                  {gig.notes.length > 100 ? gig.notes.substring(0, 100) + '...' : gig.notes}
                </div>
              )}
              <div className="gig-card-footer">
                {applied.has(gig._id) ? (
                  <span className="tag tag-amber">✓ Applied</span>
                ) : activeApply === gig._id ? (
                  <div style={{ width: '100%' }}>
                    <div className="checkbox-grid" style={{ marginBottom: 8 }}>
                      {SPONSORSHIP_OPTIONS.map(opt => (
                        <label key={opt} className={`checkbox-card ${applyForm.types.includes(opt) ? 'checkbox-card-active' : ''}`} style={{ fontSize: 11 }}>
                          <input type="checkbox" checked={applyForm.types.includes(opt)} onChange={() => toggleType(opt)} style={{ display: 'none' }} />
                          {opt}
                        </label>
                      ))}
                    </div>
                    <textarea
                      value={applyForm.message}
                      onChange={e => setApplyForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="Why your brand is a good fit for this gig..."
                      style={{ marginBottom: 8, minHeight: 60, fontSize: 12 }}
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-amber btn-sm" onClick={() => handleApply(gig._id)} disabled={applying === gig._id}>
                        {applying === gig._id ? '...' : '🏷️ Submit'}
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={() => { setActiveApply(null); setApplyForm({ types: [], message: '' }); }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button className="btn btn-amber btn-sm" onClick={() => setActiveApply(gig._id)}>
                    🏷️ Apply to Sponsor
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Link href="/dashboard/sponsor" className="btn btn-outline btn-sm">← Back to Dashboard</Link>
      </div>
    </div>
  );
}
