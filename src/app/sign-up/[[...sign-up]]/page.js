import { SignUp } from '@clerk/nextjs';

export const metadata = {
  title: 'Sign Up — GetMeGig',
  description: 'Create your GetMeGig account as an artist or venue and join India\'s live music culture platform.',
};

export default function SignUpPage() {
  return (
    <div className="auth-page">
      <SignUp
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
