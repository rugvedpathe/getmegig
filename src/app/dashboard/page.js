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

    if (!role) {
      // User hasn't completed onboarding
      router.push('/onboarding');
    } else if (role === 'artist') {
      router.push('/dashboard/artist');
    } else if (role === 'venue') {
      router.push('/dashboard/venue');
    } else if (role === 'sponsor') {
      router.push('/dashboard/sponsor');
    } else {
      // Unknown role, send to onboarding
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
