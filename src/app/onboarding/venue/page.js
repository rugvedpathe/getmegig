'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const VENUE_TYPES = ['Bar', 'Cafe', 'Restaurant', 'Event Space', 'Club', 'Other'];

export default function VenueProfileSetup() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [form, setForm] = useState({
    venueName: '',
    city: '',
    venueType: '',
    capacity: '',
    contactPerson: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if user doesn't have venue role
  if (isLoaded && user?.publicMetadata?.role !== 'venue') {
    router.push('/onboarding');
    return null;
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.venueName || !form.city || !form.venueType) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/venues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      await user.reload();
      router.push('/dashboard/venue');
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  if (!isLoaded) {
    return (
      <div className="onboarding-page">
        <div className="onboarding-spinner" />
      </div>
    );
  }

  return (
    <div className="profile-setup-page">
      <div className="profile-setup-container">
        <div className="profile-setup-header">
          <span className="profile-setup-step">Step 2 of 2</span>
          <h1 className="profile-setup-title">Set up your venue</h1>
          <p className="profile-setup-subtitle">
            Help artists know what to expect at your space. 🏠
          </p>
        </div>

        <form onSubmit={handleSubmit} className="profile-setup-form">
          {/* Venue Name */}
          <div className="form-group">
            <label className="form-label">Venue Name *</label>
            <input
              type="text"
              name="venueName"
              value={form.venueName}
              onChange={handleChange}
              placeholder="e.g. The Humming Tree"
              className="form-input"
              required
            />
          </div>

          {/* City + Type row */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">City *</label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="e.g. Bangalore"
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Venue Type *</label>
              <select
                name="venueType"
                value={form.venueType}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Select type</option>
                {VENUE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Capacity */}
          <div className="form-group">
            <label className="form-label">Capacity (number of people)</label>
            <input
              type="number"
              name="capacity"
              value={form.capacity}
              onChange={handleChange}
              placeholder="e.g. 200"
              className="form-input"
              min="1"
            />
          </div>

          {/* Contact Person */}
          <div className="form-group">
            <label className="form-label">Contact Person Name</label>
            <input
              type="text"
              name="contactPerson"
              value={form.contactPerson}
              onChange={handleChange}
              placeholder="e.g. Rahul Sharma"
              className="form-input"
            />
          </div>

          {error && <div className="profile-setup-error">{error}</div>}

          <button
            type="submit"
            className="profile-setup-submit venue-submit"
            disabled={loading}
          >
            {loading && <span className="onboarding-spinner" />}
            {loading ? 'Saving...' : 'Complete Setup →'}
          </button>
        </form>
      </div>
    </div>
  );
}
