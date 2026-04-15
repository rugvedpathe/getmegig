import { SignIn } from '@clerk/nextjs';

export const metadata = {
  title: 'Sign In — GetMeGig',
  description: 'Sign in to your GetMeGig account to find gigs, manage your venue, or connect with the live music scene.',
};

export default function SignInPage() {
  return (
    <div className="auth-page">
      <SignIn
        appearance={{
          elements: {
            rootBox: { width: '100%', maxWidth: '440px' },
            card: {
              borderRadius: '20px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
              border: '1px solid #e8e8e8',
            },
          },
        }}
      />
    </div>
  );
}
