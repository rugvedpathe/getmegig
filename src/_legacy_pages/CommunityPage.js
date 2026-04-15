import { useState } from 'react';
import { C } from '../data/defaults';
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
      <span className="tag tag-teal">{a.genre}</span>
      <div style={{ fontSize: 12, color: '#888', lineHeight: 1.5, marginTop: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.bio || ''}</div>
      {hasVids && <div style={{ marginTop: 8, fontSize: 11, color: C.teal }}>▶ {portfolio.length} video{portfolio.length > 1 ? 's' : ''}</div>}
    </div>
  );
}

function VenueMiniCard({ v, onClick }) {
  const photos = v.photos || [];
  return (
    <div className="community-card" onClick={onClick}>
      {photos.length > 0 && (
        <div className="venue-photo-row">
          {photos.slice(0, 3).map((p, i) => (
            <img key={i} src={p.src || p} alt="" loading="lazy" onError={e => e.target.parentElement.removeChild(e.target)} />
          ))}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.blueL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🏠</div>
        <div><div style={{ fontWeight: 500, fontSize: 13 }}>{v.name}</div><div style={{ fontSize: 11, color: '#aaa' }}>{v.area ? v.area + ' · ' : ''}{v.city}</div></div>
      </div>
      <span className="tag tag-blue">{v.type || 'Venue'}</span>
      <div style={{ fontSize: 12, color: '#888', lineHeight: 1.5, marginTop: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{v.about || ''}</div>
      {v.pa && <div style={{ marginTop: 8, fontSize: 11, color: C.blue }}>🔊 {v.pa}</div>}
    </div>
  );
}

export default function CommunityPage({ artists, venues, setPage, onOpenArtist, onOpenVenue }) {
  const [tab, setTab] = useState('artists');
  return (
    <div className="page">
      <h2 style={{ fontSize: 22, fontWeight: 500, margin: '0 0 6px' }}>The Scene</h2>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 24, lineHeight: 1.6 }}>Artists and venues building India's live music infrastructure.</p>
      <div className="tab-bar">
        {[['artists','🎸 Artists'],['venues','🏠 Venues']].map(([k,l]) => (
          <button key={k} className={`tab-btn${tab===k?' active':''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      {tab === 'artists' && (
        <div className="community-grid">
          {artists.length > 0
            ? artists.map(a => <ArtistMiniCard key={a.id} a={a} onClick={() => onOpenArtist(a.id)} />)
            : <div style={{ fontSize: 13, color: '#ccc', gridColumn: '1/-1', padding: '2rem', textAlign: 'center', border: '1px dashed #e8e8e8', borderRadius: 10 }}>
                No artists yet — <span style={{ color: C.teal, cursor: 'pointer' }} onClick={() => setPage('artist')}>be the first →</span>
              </div>
          }
        </div>
      )}
      {tab === 'venues' && (
        <div className="community-grid">
          {venues.length > 0
            ? venues.map(v => <VenueMiniCard key={v.id} v={v} onClick={() => onOpenVenue(v.id)} />)
            : <div style={{ fontSize: 13, color: '#ccc', gridColumn: '1/-1', padding: '2rem', textAlign: 'center', border: '1px dashed #e8e8e8', borderRadius: 10 }}>
                No venues yet — <span style={{ color: C.blue, cursor: 'pointer' }} onClick={() => setPage('venue')}>list your venue →</span>
              </div>
          }
        </div>
      )}
    </div>
  );
}
