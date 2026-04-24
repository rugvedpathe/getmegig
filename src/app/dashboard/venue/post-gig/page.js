'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const GENRES = ['Rock', 'Jazz', 'Classical', 'Bollywood', 'Folk', 'EDM', 'Metal', 'House', 'DJ', 'Stand-up Comedy', 'Improv', 'Hip-Hop', 'Acoustic', 'Sufi', 'Indie', 'Any'];

export default function PostGigPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [form, setForm] = useState({
    title: '',
    date: '',
    genre: '',
    budget: '',
    duration: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [venue, setVenue] = useState(null);

  // Discount code state
  const [discountCode, setDiscountCode] = useState('');
  const [discountResult, setDiscountResult] = useState(null);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountError, setDiscountError] = useState('');

  useEffect(() => {
    if (isLoaded && user?.publicMetadata?.role !== 'venue') {
      router.push('/dashboard');
      return;
    }
    if (isLoaded) {
      fetchVenue();
    }
  }, [isLoaded, user, router]);

  async function fetchVenue() {
    const res = await fetch('/api/venues');
    if (res.ok) {
      const data = await res.json();
      setVenue(data.venue);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleApplyDiscount() {
    if (!discountCode.trim()) return;
    setDiscountLoading(true);
    setDiscountError('');
    setDiscountResult(null);

    try {
      const res = await fetch('/api/validate-discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDiscountError(data.error || 'Invalid code');
      } else {
        setDiscountResult(data);
      }
    } catch {
      setDiscountError('Network error');
    } finally {
      setDiscountLoading(false);
    }
  }

  function handleRemoveDiscount() {
    setDiscountCode('');
    setDiscountResult(null);
    setDiscountError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.date || !form.genre) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = { ...form };
      if (discountResult) {
        payload.discountCode = discountResult.code;
      }

      const res = await fetch('/api/gigs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      if (data.requiresPayment) {
        router.push('/dashboard/venue?payment=required&gigId=' + data.gig._id);
      } else {
        router.push('/dashboard/venue?posted=true');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  const freeGigsRemaining = venue?.freeGigsRemaining ?? 0;
  const needsPayment = freeGigsRemaining === 0;
  const effectivePrice = discountResult ? discountResult.discountedPrice : 300;
  const isFree = freeGigsRemaining > 0 || (discountResult?.discountPercent >= 100);

  if (!isLoaded) {
    return (
      <div className="profile-setup-page">
        <div className="onboarding-spinner" />
      </div>
    );
  }

  return (
    <div className="profile-setup-page">
      <div className="profile-setup-container" style={{ maxWidth: 620 }}>
        <div className="profile-setup-header">
          {freeGigsRemaining > 0 ? (
            <span className="profile-setup-step" style={{ background: 'var(--tealL)', color: 'var(--teal)' }}>
              🎫 FREE GIG CREDIT ({freeGigsRemaining} remaining)
            </span>
          ) : discountResult?.discountPercent >= 100 ? (
            <span className="profile-setup-step" style={{ background: 'var(--tealL)', color: 'var(--teal)' }}>
              🎉 100% DISCOUNT APPLIED — FREE!
            </span>
          ) : discountResult ? (
            <span className="profile-setup-step" style={{ background: 'var(--amberL)', color: 'var(--amber)' }}>
              🏷️ {discountResult.discountPercent}% OFF — ₹{effectivePrice}
            </span>
          ) : (
            <span className="profile-setup-step" style={{ background: 'var(--amberL)', color: 'var(--amber)' }}>
              💳 PAID LISTING — ₹300
            </span>
          )}
          <h1 className="profile-setup-title">Post a Gig</h1>
          <p className="profile-setup-subtitle">
            Describe the gig and what kind of artist you&apos;re looking for.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="profile-setup-form">
          {/* Gig Title */}
          <div className="form-group">
            <label className="form-label">Gig Title *</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Saturday Night Live Jazz"
              className="form-input"
              required
            />
          </div>

          {/* Date + Genre Row */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date & Time *</label>
              <input
                type="datetime-local"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Genre Needed *</label>
              <select
                name="genre"
                value={form.genre}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Select genre</option>
                {GENRES.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Budget + Duration Row */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Budget Offered (₹)</label>
              <input
                type="text"
                name="budget"
                value={form.budget}
                onChange={handleChange}
                placeholder="e.g. ₹5,000"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Gig Duration (hours)</label>
              <input
                type="text"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                placeholder="e.g. 2"
                className="form-input"
              />
            </div>
          </div>

          {/* Additional Notes */}
          <div className="form-group">
            <label className="form-label">Additional Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Sound system details, dress code, special requirements, audience info..."
              className="form-input form-textarea"
              rows={4}
            />
          </div>

          {/* Discount Code Section — only show when payment is needed */}
          {needsPayment && (
            <div className="discount-section">
              <div className="discount-header">🏷️ Have a discount code?</div>
              {!discountResult ? (
                <div className="discount-input-row">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="form-input discount-input"
                    style={{ textTransform: 'uppercase' }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyDiscount}
                    className="btn btn-teal btn-sm"
                    disabled={discountLoading || !discountCode.trim()}
                  >
                    {discountLoading ? '...' : 'Apply'}
                  </button>
                </div>
              ) : (
                <div className="discount-applied">
                  <div className="discount-applied-info">
                    <span className="discount-applied-code">{discountResult.code}</span>
                    <span className="discount-applied-detail">
                      {discountResult.discountPercent}% off
                      {discountResult.discountPercent >= 100
                        ? ' — FREE!'
                        : ` — ₹${discountResult.discountedPrice} (was ₹300)`
                      }
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveDiscount}
                    className="discount-remove"
                  >
                    ✕
                  </button>
                </div>
              )}
              {discountError && <div className="discount-error">{discountError}</div>}
            </div>
          )}

          {error && <div className="profile-setup-error">{error}</div>}

          <button
            type="submit"
            className={`profile-setup-submit ${isFree ? '' : 'venue-submit'}`}
            disabled={loading}
          >
            {loading && <span className="onboarding-spinner" />}
            {loading
              ? 'Publishing...'
              : isFree
                ? freeGigsRemaining > 0
                  ? '🎫 Post Gig (Free Credit) →'
                  : '🎉 Post Gig (100% Discount) →'
                : effectivePrice > 0
                  ? `💳 Post Gig & Pay ₹${effectivePrice} →`
                  : '🎉 Post Gig (Free) →'
            }
          </button>
        </form>
      </div>
    </div>
  );
}
