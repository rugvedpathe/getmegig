import { C } from '../data/defaults';
import PortfolioFeed from './PortfolioFeed';

export default function ArtistModal({ artist, onClose }) {
  if (!artist) return null;
  const a = artist;
  const hasMedia = (a.portfolio||[]).length > 0 || (a.photos||[]).length > 0;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 480, padding: '1.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="label label-teal">ARTIST PROFILE</div>
          <button onClick={onClose} className="btn btn-outline btn-sm">✕</button>
        </div>

        {/* Bio card */}
        <div className="profile-hero" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
            <div className="profile-avatar" style={{ background: C.tealL }}>🎸</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 3 }}>{a.name}</div>
              <div style={{ fontSize: 12, color: '#666' }}>
                {a.genre} · {a.city} · {a.members === '1' ? 'Solo' : a.members + '-piece band'}
              </div>
              {a.exp && <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{a.exp} yrs gigging</div>}
              {a.instruments && (
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 6 }}>
                  {a.instruments.split(',').map((t, i) => (
                    <span key={i} className="tag tag-gray" style={{ fontSize: 10 }}>{t.trim()}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
          {a.bio && <p style={{ fontSize: 13, color: '#555', lineHeight: 1.7, marginBottom: 10 }}>{a.bio}</p>}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {a.instagram && (
              <a href={`https://instagram.com/${a.instagram.replace('@','')}`} target="_blank" rel="noreferrer"
                style={{ fontSize: 12, color: C.teal, textDecoration: 'none' }}>📷 {a.instagram}</a>
            )}
            {a.yt && (
              <a href={a.yt} target="_blank" rel="noreferrer"
                style={{ fontSize: 12, color: C.teal, textDecoration: 'none' }}>▶ Listen / Watch</a>
            )}
          </div>
        </div>

        {/* Portfolio feed */}
        {hasMedia ? (
          <>
            <div className="section-title" style={{ marginTop: 0, marginBottom: 10 }}>
              PORTFOLIO — {(a.portfolio||[]).length} VIDEO{(a.portfolio||[]).length !== 1 ? 'S' : ''} · {(a.photos||[]).length} PHOTO{(a.photos||[]).length !== 1 ? 'S' : ''}
            </div>
            <div className="modal-feed-wrap">
              <PortfolioFeed
                portfolio={a.portfolio || []}
                photos={a.photos || []}
                isOwner={false}
              />
            </div>
            <div style={{ fontSize: 11, color: '#bbb', textAlign: 'center', marginTop: 8 }}>
              Scroll up/down to browse · tap video to play
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: '#ccc', fontSize: 13, border: '1px dashed #e8e8e8', borderRadius: 12 }}>
            No portfolio items yet
          </div>
        )}
      </div>
    </div>
  );
}
