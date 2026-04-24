'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardRouter() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const role = user?.publicMetadata?.role;
    const profileComplete = user?.publicMetadata?.profileComplete;

    if (!role) {
      // No role selected yet — go to role selection
      router.push('/onboarding');
    } else if (!profileComplete) {
      // Role selected but profile form not submitted — go to profile form
      router.push(`/onboarding/${role}`);
    } else if (role === 'artist') {
      router.push('/dashboard/artist');
    } else if (role === 'venue') {
      router.push('/dashboard/venue');
    } else if (role === 'sponsor') {
      router.push('/dashboard/sponsor');
    } else {
      router.push('/onboarding');
    }
  }, [isLoaded, user, router]);

  return (
    <div className="dashboard-page" style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <div className="onboarding-spinner" style={{ width: 32, height: 32, borderWidth: 3, borderColor: 'var(--border)', borderTopColor: 'var(--teal)' }} />
      <p style={{ color: '#888', marginTop: 16, fontSize: 14 }}>Loading your dashboard...</p>
    </div>
  );
}
