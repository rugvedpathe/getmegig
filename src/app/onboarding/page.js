'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If user already has a role, redirect to dashboard
  if (isLoaded && user?.publicMetadata?.role) {
    router.push('/dashboard');
    return null;
  }

  async function handleContinue() {
    if (!selectedRole) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      // Force a session refresh to pick up new metadata
      await user.reload();

      // Redirect to profile setup form
      router.push(`/onboarding/${selectedRole}`);
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
    <div className="onboarding-page">
      <h1 className="onboarding-title">Welcome to GetMeGig</h1>
      <p className="onboarding-subtitle">
        Tell us who you are so we can set up the perfect experience for you.
      </p>

      <div className="role-cards">
        <div
          className={`role-card role-card-artist ${selectedRole === 'artist' ? 'selected-artist' : ''}`}
          onClick={() => setSelectedRole('artist')}
        >
          <span className="role-emoji">🎸</span>
          <div className="role-label">I&apos;m an Artist</div>
          <div className="role-desc">
            Build your portfolio, apply to gigs, get discovered by venues across India.
          </div>
        </div>

        <div
          className={`role-card role-card-venue ${selectedRole === 'venue' ? 'selected-venue' : ''}`}
          onClick={() => setSelectedRole('venue')}
        >
          <span className="role-emoji">🏠</span>
          <div className="role-label">I&apos;m a Venue</div>
          <div className="role-desc">
            Post gigs, screen artists, fill your stage with the best talent in your city.
          </div>
        </div>
      </div>

      <button
        className={`onboarding-btn ${
          selectedRole === 'artist'
            ? 'onboarding-btn-artist'
            : selectedRole === 'venue'
            ? 'onboarding-btn-venue'
            : ''
        }`}
        disabled={!selectedRole || loading}
        onClick={handleContinue}
      >
        {loading && <span className="onboarding-spinner" />}
        {loading ? 'Setting up...' : 'Continue →'}
      </button>

      {error && <div className="onboarding-error">{error}</div>}
    </div>
  );
}
