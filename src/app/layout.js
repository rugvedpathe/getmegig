import { ClerkProvider, SignInButton, SignUpButton, UserButton, Show } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata = {
  title: 'GetMeGig — India\'s Live Music Culture Platform',
  description: 'Connect artists with venues, sponsors, and the live music scene across India. Find gigs, build your portfolio, and grow the culture.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable}`}>
        <ClerkProvider>
          <nav className="gmg-nav">
            <Link href="/" className="nav-logo">
              getmea<span>gig</span><span style={{ fontSize: 11 }}>.co.in</span>
            </Link>
            <div className="nav-links">
              <Show when="signed-out">
                <Link href="/sign-in" className="nav-btn">SIGN IN</Link>
                <Link href="/sign-up" className="nav-btn nav-btn-primary">SIGN UP</Link>
              </Show>
              <Show when="signed-in">
                <Link href="/dashboard" className="nav-btn">DASHBOARD</Link>
                <UserButton afterSignOutUrl="/" />
              </Show>
            </div>
          </nav>
          <main>{children}</main>
        </ClerkProvider>
      </body>
    </html>
  );
}

