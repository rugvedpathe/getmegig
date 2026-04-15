import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="landing-hero">
      <div className="landing-badge">🎵 India&apos;s Live Music Platform</div>

      <h1 className="landing-title">
        We&apos;re bringing<br />the <span>scene</span> back.
      </h1>

      <p className="landing-subtitle">
        Connect artists with venues, sponsors with crowds, and culture with every gig.
        No middlemen. No WhatsApp chaos. One platform.
      </p>

      <div className="landing-cta-row">
        <Link href="/sign-up" className="landing-cta landing-cta-primary">
          Get Started →
        </Link>
        <Link href="/sign-in" className="landing-cta landing-cta-secondary">
          Sign In
        </Link>
      </div>

      <div className="landing-stats">
        <div className="landing-stat">
          <div className="landing-stat-n">50,000+</div>
          <div className="landing-stat-l">ARTISTS</div>
        </div>
        <div className="landing-stat">
          <div className="landing-stat-n">12,000+</div>
          <div className="landing-stat-l">VENUES</div>
        </div>
        <div className="landing-stat">
          <div className="landing-stat-n">₹4,200 Cr</div>
          <div className="landing-stat-l">MARKET</div>
        </div>
        <div className="landing-stat">
          <div className="landing-stat-n">0</div>
          <div className="landing-stat-l">COMPETITORS</div>
        </div>
      </div>

      <div className="landing-parties">
        <div className="landing-party">
          <div className="landing-party-icon">🎸</div>
          <div className="landing-party-label">Artist</div>
          <div className="landing-party-desc">Build a portfolio. Apply to gigs. Get paid.</div>
        </div>
        <div className="landing-party">
          <div className="landing-party-icon">🏠</div>
          <div className="landing-party-label">Venue</div>
          <div className="landing-party-desc">Post needs. Screen artists. Fill your stage.</div>
        </div>
        <div className="landing-party">
          <div className="landing-party-icon">🏷️</div>
          <div className="landing-party-label">Sponsor</div>
          <div className="landing-party-desc">Reach the right crowd at the right gig.</div>
        </div>
        <div className="landing-party">
          <div className="landing-party-icon">🛍️</div>
          <div className="landing-party-label">Culture</div>
          <div className="landing-party-desc">Tattoo, streetwear, vinyl — activate at events.</div>
        </div>
      </div>
    </div>
  );
}
