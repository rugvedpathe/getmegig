'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminPanel() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('codes');

  // New code form
  const [newCode, setNewCode] = useState({ code: '', discountPercent: '100', usageLimit: '', expiryDate: '', description: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isLoaded) fetchData();
  }, [isLoaded]);

  async function fetchData() {
    try {
      const res = await fetch('/api/admin');
      if (res.status === 403) {
        router.push('/dashboard');
        return;
      }
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleCode(code, currentActive) {
    await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_code', codeId: code, isActive: !currentActive }),
    });
    fetchData();
  }

  async function handleCreateCode(e) {
    e.preventDefault();
    setCreating(true);
    await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_code', ...newCode }),
    });
    setNewCode({ code: '', discountPercent: '100', usageLimit: '', expiryDate: '', description: '' });
    setCreating(false);
    fetchData();
  }

  async function handleAdjustCredits(venueUserId, current) {
    const val = prompt(`Adjust free gig credits for this venue (current: ${current}):`, current);
    if (val === null) return;
    await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'adjust_credits', venueUserId, freeGigsRemaining: val }),
    });
    fetchData();
  }

  if (!isLoaded || loading) {
    return (
      <div className="dashboard-page" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <div className="onboarding-spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
        <p style={{ color: '#888', marginTop: 16 }}>Loading admin panel...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="dashboard-page" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <p style={{ color: '#888' }}>Access denied.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-welcome" style={{ background: 'linear-gradient(135deg,rgba(128,0,128,.06),rgba(128,0,128,.02))', borderColor: 'rgba(128,0,128,.15)' }}>
        <div className="dashboard-role-badge" style={{ background: 'rgba(128,0,128,.08)', color: '#800080' }}>👑 ADMIN</div>
        <h1>Admin Panel</h1>
        <p>Manage discount codes, venue credits, and gig activations.</p>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'codes' ? 'admin-tab-active' : ''}`} onClick={() => setTab('codes')}>
          🏷️ Discount Codes ({data.codes.length})
        </button>
        <button className={`admin-tab ${tab === 'venues' ? 'admin-tab-active' : ''}`} onClick={() => setTab('venues')}>
          🏠 Venues ({data.venues.length})
        </button>
        <button className={`admin-tab ${tab === 'gigs' ? 'admin-tab-active' : ''}`} onClick={() => setTab('gigs')}>
          🎵 Gig Activations ({data.gigs.length})
        </button>
      </div>

      {/* Discount Codes Tab */}
      {tab === 'codes' && (
        <div className="admin-section">
          {/* Create New Code */}
          <div className="admin-card">
            <h3 className="admin-card-title">Create New Code</h3>
            <form onSubmit={handleCreateCode} className="admin-form">
              <div className="form-row">
                <input type="text" placeholder="CODE" value={newCode.code} onChange={e => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })} className="form-input" style={{ textTransform: 'uppercase', fontWeight: 600 }} required />
                <input type="number" placeholder="Discount %" value={newCode.discountPercent} onChange={e => setNewCode({ ...newCode, discountPercent: e.target.value })} className="form-input" style={{ maxWidth: 100 }} required />
              </div>
              <div className="form-row">
                <input type="number" placeholder="Usage limit (empty=unlimited)" value={newCode.usageLimit} onChange={e => setNewCode({ ...newCode, usageLimit: e.target.value })} className="form-input" />
                <input type="date" placeholder="Expiry" value={newCode.expiryDate} onChange={e => setNewCode({ ...newCode, expiryDate: e.target.value })} className="form-input" />
              </div>
              <input type="text" placeholder="Description" value={newCode.description} onChange={e => setNewCode({ ...newCode, description: e.target.value })} className="form-input" />
              <button type="submit" className="btn btn-teal btn-sm" disabled={creating} style={{ marginTop: 8 }}>
                {creating ? 'Creating...' : '+ Create Code'}
              </button>
            </form>
          </div>

          {/* Existing Codes */}
          {data.codes.map(code => (
            <div key={code._id} className={`admin-card ${!code.isActive ? 'admin-card-inactive' : ''}`}>
              <div className="admin-card-row">
                <div>
                  <span className="admin-code-name">{code.code}</span>
                  <span className="tag" style={{ marginLeft: 8, background: code.isActive ? 'var(--tealL)' : 'var(--border)', color: code.isActive ? 'var(--teal)' : '#aaa' }}>
                    {code.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => handleToggleCode(code.code, code.isActive)}>
                  {code.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
              <div className="admin-card-details">
                <span>{code.discountPercent}% off</span>
                <span>Used: {code.usedCount}{code.usageLimit ? `/${code.usageLimit}` : ' (unlimited)'}</span>
                <span>{code.expiryDate ? `Expires: ${new Date(code.expiryDate).toLocaleDateString()}` : 'No expiry'}</span>
                {code.description && <span style={{ color: '#aaa' }}>{code.description}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Venues Tab */}
      {tab === 'venues' && (
        <div className="admin-section">
          {data.venues.map(venue => (
            <div key={venue._id} className="admin-card">
              <div className="admin-card-row">
                <div>
                  <span style={{ fontWeight: 600 }}>{venue.venueName}</span>
                  <span style={{ color: '#888', marginLeft: 8, fontSize: 12 }}>📍 {venue.city}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="tag tag-teal">🎫 {venue.freeGigsRemaining ?? 0} credits</span>
                  <button className="btn btn-outline btn-sm" onClick={() => handleAdjustCredits(venue.clerkUserId, venue.freeGigsRemaining ?? 0)}>
                    Adjust
                  </button>
                </div>
              </div>
            </div>
          ))}
          {data.venues.length === 0 && (
            <div className="dashboard-section-empty"><p>No venues yet.</p></div>
          )}
        </div>
      )}

      {/* Gig Activations Tab */}
      {tab === 'gigs' && (
        <div className="admin-section">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Gig</th>
                  <th>Venue</th>
                  <th>Status</th>
                  <th>Activation</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.gigs.map(gig => (
                  <tr key={gig._id}>
                    <td style={{ fontWeight: 500 }}>{gig.title}</td>
                    <td>{gig.venueName}</td>
                    <td>
                      <span className={`tag ${gig.status === 'active' ? 'tag-teal' : gig.status === 'confirmed' ? 'tag-blue' : 'tag-gray'}`}>
                        {gig.status}
                      </span>
                    </td>
                    <td>
                      <span className={`tag ${gig.activationMethod === 'free_credit' ? 'tag-teal' : gig.activationMethod === 'discount_code' ? 'tag-blue' : 'tag-gray'}`}>
                        {gig.activationMethod === 'free_credit' ? '🎫 Free' : gig.activationMethod === 'discount_code' ? '🏷️ Promo' : '💳 Paid'}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: '#888' }}>{new Date(gig.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.gigs.length === 0 && (
            <div className="dashboard-section-empty"><p>No gigs yet.</p></div>
          )}
        </div>
      )}
    </div>
  );
}
