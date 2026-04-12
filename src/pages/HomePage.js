import { C } from '../data/defaults';
import GigCard from '../components/GigCard';
import { getYtThumbnail } from '../utils';

function ArtistMiniCard({ a, onClick }) {
  const portfolio = a.portfolio || [];
  const firstVid = portfolio[0];
  const ytThumb = firstVid ? getYtThumbnail(firstVid.url) : null;
  const hasVids = portfolio.length > 0;
  return (
    <div className="community-card" onClick={onClick}>
      {hasVids && ytThumb && (
        <div className="vid-thumb-wrap">
          <img src={ytThumb} alt={firstVid.title} loading="lazy" />
          <div className="vid-thumb-overlay"><div className="play-btn">▶</div></div>
          {portfolio.length > 1 && <div className="vid-thumb-count">+{portfolio.length - 1} more</div>}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.tealL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🎸</div>
        <div><div style={{ fontWeight: 500, fontSize: 13 }}>{a.name}</div><div style={{ fontSize: 11, color: '#aaa' }}>{a.city}</div></div>
      </div>
      <div className="tag tag-teal">{a.genre}</div>
      <div style={{ fontSize: 12, color: '#888', lineHeight: 1.5, marginTop: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.bio || ''}</div>
      {hasVids && <div style={{ marginTop: 8, fontSize: 11, color: C.teal }}>▶ {portfolio.length} video{portfolio.length > 1 ? 's' : ''}</div>}
    </div>
  );
}

export default function HomePage({ gigs, artists, appliedGigs, setPage, onApply, onOpenArtist }) {
  const parties = [
    { icon: '🎸', t: 'Artists', d: 'Register free. Build a portfolio with videos & photos. Apply with AI-written pitches.', p: 'artist', c: C.teal },
    { icon: '🏠', t: 'Venues', d: 'Create a full profile — sound system, tech, space. Post gig needs. Screen artist portfolios.', p: 'venue', c: C.blue },
    { icon: '🏷️', t: 'Sponsors', d: 'Find the right crowd at the right gig. From Red Bull to local streetwear.', p: 'sponsor', c: C.amber },
    { icon: '🛍️', t: 'Cultural Partners', d: 'Tattoo studios, vinyl sellers, zines — activate at events that are your exact audience.', p: 'sponsor', c: '#993C1D' },
  ];
  return (
    <div className="page">
      <div style={{ minHeight: '90vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem 0 2rem' }}>
        <div className="label label-teal" style={{ marginBottom: 24 }}>🎵 INDIA'S LIVE MUSIC CULTURE PLATFORM</div>
        <h1 style={{ fontSize: 'clamp(36px,7vw,72px)', fontWeight: 400, lineHeight: 1.1, margin: '0 0 24px', letterSpacing: -1 }}>
          We're bringing<br /><span style={{ color: C.teal }}>the scene back.</span>
        </h1>
        <p style={{ fontSize: 17, color: '#888', maxWidth: 480, margin: '0 0 36px', lineHeight: 1.8 }}>Artists find gigs. Venues find talent. Brands find their crowd. Culture finds a home.</p>
        <div className="flex-row">
          <button className="btn btn-teal" onClick={() => setPage('browse')}>Browse open gigs</button>
          <button className="btn btn-outline" onClick={() => setPage('artist')}>Join as artist</button>
          <button className="btn btn-outline" onClick={() => setPage('venue')}>List your venue</button>
        </div>
        <div style={{ marginTop: 16, fontSize: 11, color: '#bbb', letterSpacing: 1 }}>ALWAYS FREE FOR ARTISTS · LAUNCHING BANGALORE</div>
        <div className="stat-grid">
          {[['Free','FOR ARTISTS'],['₹299','PER GIG POST'],['4','PARTIES'],['3','LAUNCH CITIES']].map(([n,l]) => (
            <div key={l} className="stat-cell"><div className="stat-n">{n}</div><div className="stat-l">{l}</div></div>
          ))}
        </div>
      </div>

      <div style={{ padding: '1rem 0 2.5rem' }}>
        <div className="label" style={{ marginBottom: 24 }}>FOUR PARTIES. ONE ECOSYSTEM.</div>
        <div className="grid-2">
          {parties.map(cc => (
            <div key={cc.t} className="card" style={{ cursor: 'pointer' }} onClick={() => setPage(cc.p)}>
              <div style={{ fontSize: 22, marginBottom: 10 }}>{cc.icon}</div>
              <div style={{ fontWeight: 500, fontSize: 13, color: cc.c, marginBottom: 8, letterSpacing: .5 }}>{cc.t.toUpperCase()}</div>
              <div style={{ fontSize: 13, color: '#888', lineHeight: 1.7 }}>{cc.d}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 0 2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="label">OPEN GIGS RIGHT NOW</div>
          <span onClick={() => setPage('browse')} style={{ fontSize: 12, color: C.teal, cursor: 'pointer' }}>SEE ALL →</span>
        </div>
        {gigs.slice(0, 2).map(g => <GigCard key={g.id} g={g} appliedGigs={appliedGigs} onApply={onApply} />)}
      </div>

      <div style={{ padding: '0 0 2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="label">ARTISTS IN THE SCENE</div>
          <span onClick={() => setPage('community')} style={{ fontSize: 12, color: C.teal, cursor: 'pointer' }}>SEE ALL →</span>
        </div>
        <div className="community-grid">
          {artists.slice(0, 4).map(a => <ArtistMiniCard key={a.id} a={a} onClick={() => onOpenArtist(a.id)} />)}
          {artists.length === 0 && (
            <div style={{ fontSize: 13, color: '#ccc', gridColumn: '1/-1', padding: '1.5rem', textAlign: 'center', border: '1px dashed #e8e8e8', borderRadius: 10 }}>
              Be the first artist in the scene — <span style={{ color: C.teal, cursor: 'pointer' }} onClick={() => setPage('artist')}>register now →</span>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem', marginBottom: '2rem' }}>
        <div className="label" style={{ marginBottom: 20 }}>THE MISSION</div>
        <div style={{ fontSize: 'clamp(18px,3.5vw,26px)', fontWeight: 500, lineHeight: 1.5, marginBottom: 16 }}>
          "India has the music.<br /><span style={{ color: C.teal }}>We're building the culture around it."</span>
        </div>
        <p style={{ fontSize: 14, color: '#888', maxWidth: 440, margin: '0 auto 24px', lineHeight: 1.8 }}>Every gig we power is a scene being rebuilt. A college band getting their first real paycheque. A tattoo studio finding its crowd.</p>
        <button className="btn btn-outline" onClick={() => setPage('deck')} style={{ letterSpacing: .5 }}>VIEW PITCH DECK →</button>
      </div>
    </div>
  );
}
